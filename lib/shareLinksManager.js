'use strict'
import { EventEmitter } from 'events'
import { config } from './constants'

class ShareLinksManager extends EventEmitter {
  constructor (peerConnection) {
    super()

    this.peerConnection = peerConnection
    this.shareLinksTimer = undefined

    this.peerConnection.on('connect', this._startLinksShare.bind(this))
    this.peerConnection.on('disconnected', this._stopLinksShare.bind(this))
  }

  forceStartShare () {
    this._startLinksShare()
  }

  forceStopShare () {
    this._stopLinksShare()
  }

  _startLinksShare () {
    if (!this.shareLinksTimer) {
      console.log('SHARE_LINKS -> _startLinksShare')

      this.shareLinksTimer = setInterval(this._shareLinks.bind(this),
        config.SHARE_LINKS_INTERVAL_SECONDS * 1000
      )
    }
  }

  _stopLinksShare () {
    if (this.shareLinksTimer) {
      console.log('SHARE_LINKS -> _stopLinksShare')

      clearInterval(this.shareLinksTimer)
    }
  }

  _shareLinks () {
    console.log(
      'SHARE_LINKS -> SHARING LINKS !!!',
      this.peerConnection.remoteNodeAddress
    )
    this.emit('doShareLinks')
  }
}

export default ShareLinksManager
