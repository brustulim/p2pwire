'use strict'
import Peer from 'simple-peer'
import { messageType } from './constants'
import Message from './message'
import ShareLinksManager from './shareLinksManager'

class PeerConnection extends Peer {
  constructor (opts) {
    super(opts)
    this.remoteNodeAddress = ''
    this.shareLinksManager = new ShareLinksManager(this)
    this.shareLinksManager.on('doShareLinks', () => {
      this.emit(
        'doShareLinks', this
      )
    })
  }

  get basicData () {
    const { remoteNodeAddress, channelName } = this
    return { remoteNodeAddress, channelName }
  }

  forceStartShareLinks () {
    this.shareLinksManager.forceStartShare()
  }

  forceStopShareLinks () {
    this.shareLinksManager.forceStopShare()
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
    // TODO: Apply strategy pattern here
    if (message.t === messageType.CONSUMER_MESSAGE) {
      this.emit('receiveMessage', this.remoteNodeAddress, message.m)
    }
    if (message.t === messageType.LINKS_LIST) {
      this.emit('receiveLinks', this.remoteNodeAddress, message.m)
    }
  }
}

export default PeerConnection
