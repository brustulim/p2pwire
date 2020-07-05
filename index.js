'use strict'
const { EventEmitter } = require('events')
const reemit = require('re-emitter')
const Crypto = require('./lib/crypto')
const Store = require('./lib/store')
const ConnectionManager = require('./lib/connectionManager')
const P2PWireNode = require('./lib/p2pWireNode')

class P2PWire extends EventEmitter {
  constructor (opts = {}) {
    super()

    this.wrtc = opts.wrtc
    this.conn = new ConnectionManager()
    this._registerConnEvents()

    this.nodeAddress = 'NA'
    this.nodeCredentials =
      validateNodeCredentials(opts.nodeCredentials) || Crypto.createKeyPair()

    this.node = new P2PWireNode({
      tw: this,
      nodeCredentials: this.nodeCredentials,
      wrtc: this.wrtc
    })

    this.node.on('created', nodeAddress => {
      Store.nodeAddress = this.nodeAddress = nodeAddress
      this.emit('created', nodeAddress)
    })

    this.node.connectToTWNetwork()
  }

  sendMessage (nodeAddress, message) {
    this.conn.sendMessage(nodeAddress, message)
  }

  _registerConnEvents () {
    reemit(this.conn, this, [
      'nodeConnected',
      'nodeDisconnected',
      'receiveMessage',
      'linksUpdate'
    ])
  }
}

function validateNodeCredentials (keyPair) {
  // TODO: validate if given keyPair are valid private and public keys
  // MAYBE: try to crypt and decrypt text
  return keyPair
}

module.exports = P2PWire
