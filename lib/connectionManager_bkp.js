'use strict'
const { concat, pipe, filter } = require('lodash/fp')
const EventBus = require('./eventBus')
const LogManager = require('./logManager')
const Store = require('./store')
const Message = require('./message')

const store = Store
class ConnectionManager {
  constructor () {
    this._registerListeners()
  }

  async addNode (nodeAddress, remoteNodeAddress, peerConn) {
    await this._checkForDuplicatedConnection(remoteNodeAddress, peerConn)
    store.nodes.set(remoteNodeAddress, { peerConn, t: Date.now() })

    store.addLink({ a: nodeAddress, l: [nodeAddress, remoteNodeAddress] })
    EventBus.emit('nodeConnected', remoteNodeAddress, peerConn.basicData)
    this._emitNodeUpdate()
    this._updateLinksSimplified()
  }

  getNode (nodeAddress) {
    return store.nodes.get(nodeAddress)
  }

  isConnectedTo (nodeAddress) {
    const node = this.getNode(nodeAddress)
    return node && node.peerConn && typeof node.peerConn === 'object'
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

  _registerListeners () {
    EventBus.on('shareLinksTimerElapsed', peerConn => {
      this._shareLinks(peerConn)
    })
    EventBus.on('receiveLinks', (nodeAddress, links) => {
      // console.log(`Receive links from <${nodeAddress}>: `)
      // console.table(links)
      this._receiveLinks(nodeAddress, links)
    })
    EventBus.on('peerDisconnected', peerConn => this._removeNode(peerConn))
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
    const { remoteNodeAddress } = peerConn
    const { nodeAddress } = Store

    store.links = store.links.filter(
      link =>
        link.a !== remoteNodeAddress ||
        (link.a === nodeAddress && link.l.includes(remoteNodeAddress))
    )
    this._updateLinksSimplified()

    if (remoteNodeAddress && store.nodes.delete(remoteNodeAddress)) {
      EventBus.emit('nodeDisconnected', remoteNodeAddress)
      this._emitNodeUpdate()
    }
  }

  _emitNodeUpdate () {
    EventBus.emit('nodesListUpdated', store.parsedNodes)
  }

  _shareLinks (peerConn) {
    LogManager.logDebug(
      'CONNECTION_MANAGER - SHARING Links with: ',
      peerConn.remoteNodeAddress,
      ' --> ',
      store.linksSimplified
    )

    Message.sendConnectionsList(peerConn, store.linksSimplified)
  }

  _receiveLinks (remoteNodeAddress, receivedLinks) {
    const preparedLinks = receivedLinks.map(link => ({
      a: remoteNodeAddress,
      l: link
    }))

    store.links = pipe(
      filter(it => it.a !== remoteNodeAddress),
      concat(preparedLinks)
    )(store.links)

    this._updateLinksSimplified()

    LogManager.logDebug(
      'CONNECTION_MANAGER - LINKS RECEIVED -> this.linksSimplified',
      store.linksSimplified
    )
  }

  _updateLinksSimplified () {
    store.updateLinksSimplified()
    EventBus.emit('linksUpdate', store.linksSimplified)
  }
}

module.exports = ConnectionManager
