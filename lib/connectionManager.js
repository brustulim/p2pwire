'use strict'
import { union, concat, uniqWith, get, pipe, filter, map, isEqual } from 'lodash/fp'
import { EventEmitter } from 'events'
import Message from './message'

class ConnectionManager extends EventEmitter {
  constructor (tw) {
    super()
    this.tw = tw
    this.nodes = new Map()
    this.links = []
    this.linksSimplified = []
  }

  async addNode (nodeAddress, remoteNodeAddress, peerConn) {
    await this._checkForDuplicatedConnection(remoteNodeAddress, peerConn)
    await this._registerNodeListeners(peerConn)
    this.nodes.set(remoteNodeAddress, { peerConn, t: Date.now() })
    console.log(
      'ADD -> ADD -> ADD -> ADD -> ADD -> ADD -> addNode -> NEW ITEM',
      { a: nodeAddress, l: [nodeAddress, remoteNodeAddress] }
    )
    console.log(
      'ADD -> ADD -> ADD -> ADD -> ADD -> ADD -> addNode -> this.links ANTES',
      this.links
    )

    this.links = union(this.links, [{ a: nodeAddress, l: [nodeAddress, remoteNodeAddress] }])
    console.log(
      'ADD -> ADD -> ADD -> ADD -> ADD -> ADD -> addNode -> this.links DEPOIS',
      this.links
    )
    this._updateLinksSimplified()
    this.emit('nodeConnected', remoteNodeAddress, peerConn.basicData)
    this._emitNodeUpdate()
  }

  getNode (nodeAddress) {
    return this.nodes.get(nodeAddress)
  }

  isConnectedTo (nodeAddress) {
    const node = this.getNode(nodeAddress)
    console.log('CONNECTION_MANAGER - isConnectedTo -> node', node)
    if (node && node.peerConn && typeof node.peerConn === 'object') {
      console.log('CONNECTION_MANAGER - isConnectedTo -> TRUE')

      return true
    }
    return false
  }

  sendMessage (nodeAddress, message) {
    const peerConn = this._validateNodeAddress(nodeAddress)
    Message.sendMessage(peerConn, message)
  }

  async _checkForDuplicatedConnection (address, peerConn) {
    if (this.getNode(address)) {
      peerConn.destroy()
      throw new Error(
        'Duplicated node connection detected! disconnecting second instance of: ' +
          address
      )
    }
  }

  async _registerNodeListeners (peerConn) {
    peerConn.on('doShareLinks', (peerConn) => this._shareLinks(peerConn))
    peerConn.on('receiveLinks', (nodeAddress, links) =>
      this._receiveLinks(nodeAddress, links)
    )
    peerConn.on('disconnected', (peerConn) => this._removeNode(peerConn))
    peerConn.on('receiveMessage', (remoteNodeAddress, message) => {
      console.log(
        'CONNECTION_MANAGER -> receiveMessage -> message',
        remoteNodeAddress,
        message
      )
      this.emit('receiveMessage', remoteNodeAddress, message)
    })
  }

  _validateNodeAddress (nodeAddress) {
    if (!nodeAddress) {
      throw new Error('the param "nodeAddress" is required')
    }
    const node = this.getNode(nodeAddress)
    if (!node.peerConn) {
      throw new Error('Not connected to node: ' + nodeAddress)
    }
    return node.peerConn
  }

  _removeNode (peerConn) {
    console.log(
      'CONNECTION_MANAGER - _removeNode - disconnect event -> peerConn: ',
      peerConn.remoteNodeAddress
    )
    const remoteNodeAddress = peerConn.remoteNodeAddress
    const nodeAddress = this.tw.nodeAddress

    this.links = this.links.filter(link =>
      link.a !== remoteNodeAddress || (link.a === nodeAddress && link.l.includes(remoteNodeAddress))
    )
    this._updateLinksSimplified()

    if (remoteNodeAddress && this.nodes.delete(remoteNodeAddress)) {
      console.warn(
        'CONNECTION_MANAGER - _removeNode - disconnect -> DELETED: ',
        remoteNodeAddress
      )
      this.emit('nodeDisconnected', remoteNodeAddress)
      this._emitNodeUpdate()
    }
  }

  _emitNodeUpdate () {
    this.emit('nodeUpdate', this.nodes)
  }

  _shareLinks (peerConn) {
    console.warn(
      'CONNECTION_MANAGER - SHARING WITH: ',
      peerConn.remoteNodeAddress,
      ' --> ',
      this.linksSimplified
    )

    Message.sendConnectionsList(peerConn, this.linksSimplified)
  }

  _receiveLinks (remoteNodeAddress, receivedLinks) {
    const preparedLinks = receivedLinks.map(link => ({ a: remoteNodeAddress, l: link }))
    console.log(
      'CONNECTION_MANAGER - LINKS RECEIVED -> preparedLinks',
      preparedLinks
    )
    this.links = pipe(
      filter((it) => it.a !== remoteNodeAddress),
      concat(preparedLinks)
    )(this.links)

    console.log(
      'CONNECTION_MANAGER - LINKS RECEIVED -> this.links', typeof this.links,
      this.links
    )

    this._updateLinksSimplified()

    console.log(
      'CONNECTION_MANAGER - LINKS RECEIVED -> this.linksSimplified',
      this.linksSimplified
    )
  }

  _updateLinksSimplified () {
    this.linksSimplified = pipe(
      map((it) => get('l', it).sort()),
      uniqWith(isEqual)
    )(this.links)
    this.emit('linksUpdate', this.linksSimplified)
  }
}

module.exports = ConnectionManager
