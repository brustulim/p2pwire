'use strict'
const EventBus = require('../eventBus')
const LogManager = require('./logManager')
const MeshManager = require('./meshManager')
const Store = require('../store')
const Message = require('../message')

class ConnectionManager {
  constructor () {
    this._registerListeners()
  }

  async addNode (nodeAddress, remoteNodeAddress, peerConn) {
    await this._checkForDuplicatedConnection(remoteNodeAddress, peerConn)
    Store.nodes.set(remoteNodeAddress, { peerConn, t: Date.now() })
    MeshManager.registerLinks(nodeAddress, [nodeAddress, remoteNodeAddress])
    EventBus.emit('nodeConnected', remoteNodeAddress, peerConn.basicData)
    this._emitNodeUpdate()
  }

  getNode (nodeAddress) {
    return Store.nodes.get(nodeAddress)
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
    EventBus.on('receiveLinks', (remoteNodeAddress, links) => {
      MeshManager.updateRemoteLinks(remoteNodeAddress, links)
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

    if (remoteNodeAddress && Store.nodes.delete(remoteNodeAddress)) {
      MeshManager.removeAllLinksRelatedTo(remoteNodeAddress)
      EventBus.emit('nodeDisconnected', remoteNodeAddress)
      this._emitNodeUpdate()
    }
  }

  _emitNodeUpdate () {
    EventBus.emit('nodesListUpdated', Store.parsedNodes)
  }

  _shareLinks (peerConn) {
    const links = MeshManager.getFlatLinksToShare(peerConn.remoteNodeAddress)

    LogManager.logDebug(
      'CONNECTION_MANAGER - SHARING Links with: ',
      peerConn.remoteNodeAddress,
      ' --> ',
      links
    )

    if (links.length > 0) {
      Message.sendConnectionsList(peerConn, links)
    }
  }
}

module.exports = ConnectionManager
