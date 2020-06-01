'use strict'
import { EventEmitter } from 'events'

class ConnectionManager extends EventEmitter {
  constructor (tw) {
    super()
    this.tw = tw
    this.nodes = new Map()
  }

  addNode (address, peerConn) {
    peerConn.on('disconnected', (peerConn) => this._removeNode(peerConn))

    this.nodes.set(address, { peerConn, t: Date.now() })
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
      this._emitNodeUpdate()
    }
  }

  _emitNodeUpdate () {
    this.emit('nodeUpdate', this.nodes)
  }
}

module.exports = ConnectionManager
