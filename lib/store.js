'use strict'
// import { encode } from 'bs58check'
import { EventEmitter } from 'events'
// import { showDebug } from './util'
// import Club from './club'

class Store extends EventEmitter {
  constructor (opts = {}) {
    super()

    this.nodes = new Map()
    // this.clubs = new Crud()
  }

  addNode (address, peerId, club) {
    const node = this.nodes.get(address) || { peerId }
    this.nodes.set(address, { ...node, t: Date.now() })
  }
}

module.exports = Store
