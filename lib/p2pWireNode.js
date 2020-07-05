'use strict'
const { EventEmitter } = require('events')
const { box } = require('tweetnacl')
const Crypto = require('./crypto')
const Discovery = require('./discovery/discovery')

class P2PWireNode extends EventEmitter {
  constructor ({ tw, nodeCredentials, wrtc }) {
    super()

    this.tw = tw
    this.conn = this.tw.conn
    this.credentials = nodeCredentials || box.keyPair()
    this.nodeAddress = Crypto.extractNodeAddress(this.credentials)
    this.discovery = new Discovery(this.tw, this.nodeAddress, wrtc)
    this.discovery.on('connection', peerConn =>
      this.onConnectedToNetwork(peerConn)
    )

    process.nextTick(() => {
      this.emit('created', this.nodeAddress)
    })
  }

  connectToTWNetwork () {
    this.discovery.connectToNetwork()
  }

  onConnectedToNetwork (peerConn) {
    console.log('TWNode -> onConnectedToNetwork -> peerConn', peerConn)
    this.conn.addNode(this.nodeAddress, peerConn.remoteNodeAddress, peerConn)
    // this.discovery.stop()
  }
}

module.exports = P2PWireNode
