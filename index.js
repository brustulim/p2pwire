'use strict'
const { EventEmitter } = require('events')
const reemit = require('re-emitter')
const LinksShareManager = require('./lib/managers/linksShareManager')
const ConnectionManager = require('./lib/managers/connectionManager')
const EventBus = require('./lib/eventBus')
const Crypto = require('./lib/crypto')
const Store = require('./lib/store')
const P2PWireNode = require('./lib/p2pWireNode')

/**
 * p2pwire library.
 *
 * Connect to the p2pWire network and provide all the necessary tools to communicate.
 *
 * @param {Object} opts                          options object
 * @param {number} opts.wrtc                     webrtc library (required to run in node.js)
 * @param {string} opts.consoleLogLevel          define the level of logging to console. ['none', 'error','warning','info', 'debug']
 * @param {string} opts.eventLogLevel            define the level of logging to be dispatched to event "log". ['none', 'error','warning','info', 'debug']
 */
class P2PWire extends EventEmitter {
  constructor (opts = {}) {
    super()

    Store.consoleLogLevel = opts.consoleLogLevel || 'none'
    Store.eventLogLevel = opts.eventLogLevel || 'none'

    this.wrtc = opts.wrtc
    this.LinksShareManager = LinksShareManager
    this.connection = new ConnectionManager()
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
      connection: this.connection,
      nodeCredentials: this.nodeCredentials,
      wrtc: this.wrtc
    })
    this.node.joinNetwork()
  }

  sendMessage (nodeAddress, message) {
    this.connection.sendMessage(nodeAddress, message)
  }

  _registerEvents () {
    reemit(EventBus, this, [
      'created',
      'ready',
      'receiveMessage',
      'nodeConnected',
      'nodeDisconnected',
      'nodesListUpdated',
      'linksUpdate',
      'linksTableChanged'
    ])
  }
}

function validateNodeCredentials (keyPair) {
  // TODO: validate if given keyPair are valid private and public keys
  // MAYBE: try to crypt and decrypt text
  return keyPair
}

module.exports = P2PWire
