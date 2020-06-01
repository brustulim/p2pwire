'use strict'
import { EventEmitter } from 'events'

class Store extends EventEmitter {
  constructor (opts = {}) {
    super()
    this.nodes = new Map()
  }

  addNode (address, peerConn) {
    const node = this.nodes.get(address) || { peerConn }
    this.nodes.set(address, { ...node, t: Date.now() })
  }

  getNode (nodeAddress) {
    return this.nodes.get(nodeAddress)
  }

  removeNode (nodeAddress) {
    return this.nodes.delete(nodeAddress)
  }
}

module.exports = Store
