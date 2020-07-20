'use strict'
const EventBus = require('./eventBus')
const { box } = require('tweetnacl')
const Crypto = require('./crypto')
const Discovery = require('./discovery/discovery')

class P2PWireNode {
  constructor ({ tw, nodeCredentials, wrtc }) {
    this.tw = tw
    this.conn = this.tw.conn
    this.credentials = nodeCredentials || box.keyPair()
    this.nodeAddress = Crypto.extractNodeAddress(this.credentials)
    this.discovery = new Discovery(this.tw, this.nodeAddress, wrtc)

    EventBus.on('connectedToNetwork', peerConn =>
      this.onConnectedToNetwork(peerConn)
    )
  }

  connectToTWNetwork () {
    this.discovery.connectToNetwork()
  }

  onConnectedToNetwork (peerConn) {
    this.conn.addNode(this.nodeAddress, peerConn.remoteNodeAddress, peerConn)
    EventBus.emit('ready', this.nodeAddress)

    // this.discovery.stop()
  }
}

module.exports = P2PWireNode
