'use strict'
const Peer = require('simple-peer')
const EventBus = require('./eventBus')
const LogManager = require('./logManager')
const LinksShareManager = require('./linksShareManager')
const { messageType } = require('./constants')
const Message = require('./message')

class PeerConnection extends Peer {
  constructor (opts) {
    super(opts)
    this.remoteNodeAddress = ''

    super.on('connect', () => EventBus.emit('peerConnected', this))
  }

  get basicData () {
    const { remoteNodeAddress, channelName } = this
    return { remoteNodeAddress, channelName }
  }

  forceStartShareLinks () {
    LinksShareManager.forceStartShare(this)
  }

  forceStopShareLinks () {
    LinksShareManager.forceStopShare(this)
  }

  destroy (error) {
    LogManager.logInfo(
      'PC - destroy connection: ',
      this.remoteNodeAddress,
      ' -- ',
      error
    )
    super.destroy(error)
    EventBus.emit('peerDisconnected', this)
  }

  _onChannelMessage (event) {
    super._onChannelMessage(event)
    const message = Message.processReceivedMessage(event)
    // TODO: Apply strategy pattern here
    if (message.t === messageType.CONSUMER_MESSAGE) {
      EventBus.emit('receiveMessage', this.remoteNodeAddress, message.m)
    } else if (message.t === messageType.LINKS_LIST) {
      EventBus.emit('receiveLinks', this.remoteNodeAddress, message.m)
    } else {
      LogManager.logInfo('PC - onChannelMessage unrecognized: ', event)
    }
  }
}

module.exports = PeerConnection
