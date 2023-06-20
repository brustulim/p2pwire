'use strict'
const EventBus = require('../eventBus')
const LogManager = require('../managers/logManager')
const Client = require('bittorrent-tracker')

/**
 * Connect to a peer through a Bit Torrent tracker
 */

const status = {
  CREATED: 'created',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  STOPPED: 'stopped',
  ERROR: 'error'
}
class BTTracker {
  constructor (nodeAddress, wrtc) {
    if (!nodeAddress) {
      throw new Error('nodeAddress must be provided.')
    }

    this.wrtc = wrtc

    this.nodeAddress = nodeAddress
    this.status = status.CREATED
  }

  stop () {
    this.client.stop()
    this.status = status.STOPPED

    LogManager.logDebug('BT_TRACKER - stopped!')
  }

  search (infoHash) {
    if (!infoHash) {
      throw new Error('infoHash must be provided.')
    }

    var requiredOpts = {
      infoHash,
      peerId: Buffer.from(this.nodeAddress),
      announce: [
        'wss://tracker.openwebtorrent.com'
        // 'wss://tracker.btorrent.xyz/',
        // "udp://tracker.empire-js.us",
        // "udp://explodie.org",
        // "udp://exodus.desync.com",
        // "udp://tracker.coppersurfer.tk",
        // "udp://tracker.opentrackr.org",
      ],
      port: 6881, // not used when running on the browser
      wrtc: this.wrtc // not used when running on the browser
    }

    this.client = new Client(requiredOpts)

    this.client.on('error', function (err) {
      LogManager.logInfo('BT_TRACKER - ERROR: ', err)
    })

    this.client.on('warning', function (err) {
      LogManager.logDebug('BT_TRACKER - WARNING: ', err)
    })

    this.client.on('update', function (data) {
      this.status = status.CONNECTING
      LogManager.logDebug(
        'BT_Tracker - ON update - announce: ',
        data.announce,
        data
      )
      LogManager.logInfo(
        'BT_TRACKER - Swarm status: < seeders | leachers > - < ' +
          data.complete +
          ' | ' +
          data.incomplete +
          ' >'
      )
    })

    this.client.on('peer', peer => this.onPeer(peer))
    // start getting peers from the tracker
    this.client.start()
    // force a tracker announce. will trigger more 'update' events and maybe more 'peer' events
    // this.client.update()
    // setTimeout(() => {
    //   if (this.status === status.CREATED) {
    //     LogManager.logDebug('BTTracker - forcing update.')
    //     this.client.update()
    //   }
    // }, 5000)
  }

  onPeer (peer) {
    if (!peer) {
      LogManager.logDebug('BT_TRACKER - ON peer - NOT peer')
      return
    }

    peer.on('error', err =>
      LogManager.logInfo('BT_TRACKER - ON peer - error', err)
    )

    peer.on('signal', data => {
      LogManager.logDebug(
        'BT_TRACKER - PEER - ON signal: ',
        JSON.stringify(data)
      )
    })

    peer.on('connect', () => {
      this.status = status.CONNECTED

      LogManager.logDebug('BT_TRACKER - PEER - ON connect')
      // peer.send('Hey Pal! Here ' + this.nodeAddress + ' contacting you!')
      EventBus.emit('peerDiscovered', peer)
      this.setConnected()
      // this.client.stop()
    })

    peer.on('data', data => {
      LogManager.logDebug('BT_TRACKER - PEER - ON data : ', data)
    })
  }

  setConnected () {
    // LogManager.logDebug('BT_TRACKER - SET connected!')
    this.client.complete()
  }
}

module.exports = BTTracker
