'use strict'
import Peer from 'simple-peer'

class TWPeer extends Peer {
  constructor (opts) {
    super(opts)
    // this.connected = false
    this.remotePeerAddress = ''
    // this.peerId =peerId ||
  }
}

// const generatePeerId = (keyPair) => {
//   return encode(Buffer.from(this.keyPair.publicKey)).substring(0, 20)
// }
export default TWPeer
