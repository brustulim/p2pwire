'use strict'
const { pipe, get } = require('lodash/fp')
const EventBus = require('./eventBus')
const { config } = require('./constants')

class LinksShareManager {
  constructor () {
    if (!LinksShareManager.instance) {
      LinksShareManager.instance = this

      this.timers = new Map()

      EventBus.on('peerConnected', peerConnection =>
        this._startLinksShare(peerConnection)
      )
      EventBus.on('peerDisconnected', peerConnection =>
        this._stopLinksShare(peerConnection)
      )
    }

    return LinksShareManager.instance
  }

  forceStartShare (peerConnection) {
    this._startLinksShare(peerConnection)
  }

  forceStopShare (peerConnection) {
    this._stopLinksShare(peerConnection)
  }

  _startLinksShare (peerConnection) {
    this._validateNewTimer(peerConnection)
    this._addTimer(peerConnection)
  }

  _stopLinksShare (peerConnection) {
    const { remoteNodeAddress } = peerConnection
    const shareLinksTimer = pipe(
      this._validateRemoteAddress,
      this._getTimer.bind(this),
      this._validatedTimerExistence
    )(remoteNodeAddress)

    console.log('SHARE_LINKS -> _stopLinksShare with: ', remoteNodeAddress)

    clearInterval(shareLinksTimer)
    this.timers.delete(remoteNodeAddress)
  }

  _validateNewTimer (peerConnection) {
    pipe(
      get('remoteNodeAddress'),
      this._validateRemoteAddress,
      this._getTimer.bind(this),
      this._validatedDuplicatedTimers
    )(peerConnection)
  }

  _validateRemoteAddress (remoteNodeAddress) {
    if (!remoteNodeAddress) {
      throw new Error(
        'Cannot manage links share. The remote node address is missing'
      )
    }
    return remoteNodeAddress
  }

  _validatedDuplicatedTimers (shareLinksTimer) {
    if (shareLinksTimer) {
      throw new Error(
        'Cannot start links share. The remote node address is already registered'
      )
    }
    return shareLinksTimer
  }

  _validatedTimerExistence (shareLinksTimer) {
    if (!shareLinksTimer) {
      throw new Error(
        'Cannot manage links share. There is no timer active for this node address'
      )
    }
    return shareLinksTimer
  }

  _getTimer (remoteNodeAddress) {
    return this.timers.get(remoteNodeAddress)
  }

  _addTimer (peerConnection) {
    const { remoteNodeAddress } = peerConnection
    const shareLinksTimer = setInterval(
      () => EventBus.emit('shareLinksTimerElapsed', peerConnection),
      config.SHARE_LINKS_INTERVAL_SECONDS * 1000
    )

    this.timers.set(remoteNodeAddress, shareLinksTimer)
  }
}

const instance = new LinksShareManager()
Object.freeze(instance)
module.exports = instance
