'use strict'
const { EventEmitter } = require('events')
const reemit = require('re-emitter')
const EventBus = require('./lib/eventBus')
const LinksShareManager = require('./lib/linksShareManager')
const Crypto = require('./lib/crypto')
const Store = require('./lib/store')
const ConnectionManager = require('./lib/connectionManager')
const P2PWireNode = require('./lib/p2pWireNode')

class P2PWire extends EventEmitter {
  constructor (opts = {}) {
    super()

    Store.consoleLogLevel = opts.consoleLogLevel || 'none'
    Store.eventLogLevel = opts.eventLogLevel || 'none'

    this.wrtc = opts.wrtc
    this.LinksShareManager = LinksShareManager
    this.conn = new ConnectionManager()
    this.nodeAddress = 'NA'
    this.nodeCredentials =
      validateNodeCredentials(opts.nodeCredentials) || Crypto.createKeyPair()

    this._registerEvents()
    this._initialize()
  }

  _initialize () {
    EventBus.on('created', nodeAddress => {
      Store.nodeAddress = this.nodeAddress = nodeAddress
    })

    this.node = new P2PWireNode({
      tw: this,
      nodeCredentials: this.nodeCredentials,
      wrtc: this.wrtc
    })
    this.node.connectToTWNetwork()
  }

  sendMessage (nodeAddress, message) {
    this.conn.sendMessage(nodeAddress, message)
  }

  _registerEvents () {
    reemit(EventBus, this, [
      'created',
      'ready',
      'receiveMessage',
      'nodeConnected',
      'nodeDisconnected',
      'nodesListUpdated',
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
