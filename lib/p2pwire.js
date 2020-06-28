'use strict'
import { EventEmitter } from 'events'
import Crypto from './crypto'
import ConnectionManager from './connectionManager'
import p2pWireNode from './twNode'

class p2pWire extends EventEmitter {
  constructor (opts = {}) {
    super()

    this.conn = new ConnectionManager(this)
    this.nodeAddress = 'NA'
    this.nodeCredentials =
      validateNodeCredentials(opts.nodeCredentials) || Crypto.createKeyPair()
    this.twNode = new p2pWireNode({
      tw: this,
      nodeCredentials: this.nodeCredentials
    })

    this.twNode.on('created', (nodeAddress) => {
      this.nodeAddress = nodeAddress
      this.emit('created', nodeAddress)
    })

    this.twNode.connectToTWNetwork()

    // this.conn.on('nodeUpdate', (nodes) => {
    //   this.emit('nodeUpdate', nodes)
    // })
    this.conn.on('nodeConnected', (nodeAddress, nodeData) => {
      this.emit('nodeConnected', nodeAddress, nodeData)
    })

    this.conn.on('nodeDisconnected', (nodeAddress) => {
      this.emit('nodeDisconnected', nodeAddress)
    })

    this.conn.on('receiveMessage', (remoteNodeAddress, message) => {
      this.emit('message', remoteNodeAddress, message)
    })

    this.conn.on('linksUpdate', (links) => {
      this.emit('linksUpdate', links)
    })
  }

  sendMessage (nodeAddress, message) {
    this.conn.sendMessage(nodeAddress, message)
  }
}

function validateNodeCredentials (keyPair) {
  // TODO: validate if given keyPair are valid private and public keys
  // MAYBE: try to crypt and decrypt text
  return keyPair
}

module.exports = p2pWire
