'use strict'
const EventBus = require('./eventBus')
const { box } = require('tweetnacl')
const Crypto = require('./crypto')
const Discovery = require('./discovery/discovery')

class P2PWireNode {
  constructor({ connection, nodeCredentials, wrtc }) {
    this.connection = connection
    this.credentials = nodeCredentials || box.keyPair()
    this.nodeAddress = Crypto.extractNodeAddress(this.credentials)
    this.discovery = new Discovery(this.connection, this.nodeAddress, wrtc)

    EventBus.on('connectedToNetwork', peerConn =>
      this.onConnectedToNetwork(peerConn)
    )

    process.nextTick(() => {
      EventBus.emit('created', this.nodeAddress)
    })
  }

  joinNetwork () {
    this.discovery.connectToNetwork()
  }

  onConnectedToNetwork (peerConn) {
    this.connection.addNode(this.nodeAddress, peerConn.remoteNodeAddress, peerConn)
    EventBus.emit('ready', this.nodeAddress)

    // this.discovery.stop()
  }
}

module.exports = P2PWireNode
