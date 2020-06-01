'use strict'
import Peer from 'simple-peer'

class PeerConnection extends Peer {
  constructor (opts) {
    super(opts)
    this.remoteNodeAddress = ''
  }

  destroy (error) {
    console.warn('PC - destroy: ', this.remoteNodeAddress, ' -- ', error)
    super.destroy(error)
    this.emit('disconnected', this)
  }
}

export default PeerConnection
