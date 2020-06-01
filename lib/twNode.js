'use strict'
import { EventEmitter } from 'events'
import { box } from 'tweetnacl'
import Crypto from './crypto'
import Discovery from './discovery/discovery'

class TWNode extends EventEmitter {
  constructor ({ tw, nodeCredentials }) {
    super()

    this.tw = tw
    this.conn = this.tw.conn
    this.credentials = nodeCredentials || box.keyPair()
    this.nodeAddress = Crypto.extractNodeAddress(this.credentials)
    this.discovery = new Discovery(this.tw, this.nodeAddress)
    this.discovery.on('connection', (peerConn) => this.onConnectedToNetwork(peerConn))

    process.nextTick(() => {
      this.emit('created', this.nodeAddress)
    })
  }

  connectToTWNetwork () {
    this.discovery.connectToNetwork()
  }

  onConnectedToNetwork (peerConn) {
    console.log('TWNode -> onConnectedToNetwork -> peerConn', peerConn)
    this.conn.addNode(peerConn.remoteNodeAddress, peerConn)
    // this.discovery.stop()
  }
}

export default TWNode
