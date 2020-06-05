'use strict'
import Peer from 'simple-peer'
import Message from './message'

class PeerConnection extends Peer {
  constructor (opts) {
    super(opts)
    this.remoteNodeAddress = ''
  }

  get basicData () {
    const { remoteNodeAddress, channelName } = this
    return { remoteNodeAddress, channelName }
  }

  destroy (error) {
    console.warn('PC - destroy: ', this.remoteNodeAddress, ' -- ', error)
    super.destroy(error)
    this.emit('disconnected', this)
  }

  _onChannelMessage (event) {
    console.log('PC - onChannelMessage: ', event)
    super._onChannelMessage(event)
    const message = Message.processReceivedMessage(event)
    if (message.t === 'm') { this.emit('receiveMessage', this.remoteNodeAddress, message.m) }
  }
}

export default PeerConnection
