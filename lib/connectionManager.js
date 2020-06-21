'use strict'
import { concat, pipe, filter } from 'lodash/fp'
import { EventEmitter } from 'events'
import Store from './store'
import Message from './message'

const store = Store
class ConnectionManager extends EventEmitter {
  constructor (tw) {
    super()
    this.tw = tw
  }

  async addNode (nodeAddress, remoteNodeAddress, peerConn) {
    await this._checkForDuplicatedConnection(remoteNodeAddress, peerConn)
    await this._registerNodeListeners(peerConn)
    store.nodes.set(remoteNodeAddress, { peerConn, t: Date.now() })
    console.log(
      'ADD -> ADD -> ADD -> ADD -> ADD -> ADD -> addNode -> NEW ITEM',
      { a: nodeAddress, l: [nodeAddress, remoteNodeAddress] }
    )
    console.log(
      'ADD -> ADD -> ADD -> ADD -> ADD -> ADD -> addNode -> this.links ANTES',
      store.links
    )

    store.addLink({ a: nodeAddress, l: [nodeAddress, remoteNodeAddress] })
    console.log(
      'ADD -> ADD -> ADD -> ADD -> ADD -> ADD -> addNode -> this.links DEPOIS',
      store.links
    )
    this._updateLinksSimplified()
    this.emit('nodeConnected', remoteNodeAddress, peerConn.basicData)
    this._emitNodeUpdate()
  }

  getNode (nodeAddress) {
    return store.nodes.get(nodeAddress)
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

    store.links = store.links.filter(link =>
      link.a !== remoteNodeAddress || (link.a === nodeAddress && link.l.includes(remoteNodeAddress))
    )
    this._updateLinksSimplified()

    if (remoteNodeAddress && store.nodes.delete(remoteNodeAddress)) {
      console.warn(
        'CONNECTION_MANAGER - _removeNode - disconnect -> DELETED: ',
        remoteNodeAddress
      )
      this.emit('nodeDisconnected', remoteNodeAddress)
      this._emitNodeUpdate()
    }
  }

  _emitNodeUpdate () {
    this.emit('nodeUpdate', store.nodes)
  }

  _shareLinks (peerConn) {
    console.warn(
      'CONNECTION_MANAGER - SHARING WITH: ',
      peerConn.remoteNodeAddress,
      ' --> ',
      store.linksSimplified
    )

    Message.sendConnectionsList(peerConn, store.linksSimplified)
  }

  _receiveLinks (remoteNodeAddress, receivedLinks) {
    const preparedLinks = receivedLinks.map(link => ({ a: remoteNodeAddress, l: link }))
    console.log(
      'CONNECTION_MANAGER - LINKS RECEIVED -> preparedLinks',
      preparedLinks
    )
    store.links = pipe(
      filter((it) => it.a !== remoteNodeAddress),
      concat(preparedLinks)
    )(store.links)

    console.log(
      'CONNECTION_MANAGER - LINKS RECEIVED -> this.links',
      typeof store.links,
      store.links
    )

    this._updateLinksSimplified()

    console.log(
      'CONNECTION_MANAGER - LINKS RECEIVED -> this.linksSimplified',
      store.linksSimplified
    )
  }

  _updateLinksSimplified () {
    store.updateLinksSimplified()
    this.emit('linksUpdate', store.linksSimplified)
  }
}

module.exports = ConnectionManager
