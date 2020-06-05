'use strict'
import { EventEmitter } from 'events'
import Message from './message'

class ConnectionManager extends EventEmitter {
  constructor (tw) {
    super()
    this.tw = tw
    this.nodes = new Map()
  }

  addNode (address, peerConn) {
    peerConn.on('disconnected', (peerConn) => this._removeNode(peerConn))
    peerConn.on('receiveMessage', (remoteNodeAddress, message) => {
      console.log(
        'CONNECTION_MANAGER -> receiveMessage -> message',
        remoteNodeAddress,
        message
      )
      this.emit('receiveMessage', remoteNodeAddress, message)
    }
    )

    this.nodes.set(address, { peerConn, t: Date.now() })

    this.emit('nodeConnected', address, peerConn.basicData)
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
    const nodeAddress = peerConn.remoteNodeAddress
    if (nodeAddress && this.nodes.delete(nodeAddress)) {
      console.warn(
        'CONNECTION_MANAGER - _removeNode - disconnect -> DELETED: ',
        nodeAddress
      )
      this.emit('nodeDisconnected', nodeAddress)
      this._emitNodeUpdate()
    }
  }

  _emitNodeUpdate () {
    this.emit('nodeUpdate', this.nodes)
  }
}

module.exports = ConnectionManager
