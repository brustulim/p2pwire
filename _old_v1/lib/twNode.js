'use strict'
import { box } from 'tweetnacl'
import { encode } from 'bs58check'
import Discovery from './discovery/discovery'

class TWNode {
  constructor ({ keyPair, isRootNode = false }) {
    // super()

    this.isRootNode = isRootNode
    this.keyPair = keyPair || box.keyPair()
    this.address = generatePeerId(this.keyPair)
    this.peers = []
    this.discovery = new Discovery()
    this.discovery.on('connection', (peer) => this.onConnectedToNetwork(peer))

  }

  connectToTWNetwork () {
    // const discovery = new Discovery()
    this.discovery.connectToNetwork(this.address)
  }

  onConnectedToNetwork (peer) {
    console.log('TWNode -> onConnectedToNetwork -> peer', peer)
    this.discovery.stop()
  }
}

const generatePeerId = (keyPair) => {
  return encode(Buffer.from(keyPair.publicKey)).substring(0, 20)
}
export default TWNode
