'use strict'
const { EventEmitter } = require('events')
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
class BTTracker extends EventEmitter {
  constructor (nodeAddress, wrtc) {
    super()

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

    console.log('BT_TRACKER - stopped!')
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
      console.log('BT_TRACKER - ERROR: ', err)
    })

    this.client.on('warning', function (err) {
      console.log('BT_TRACKER - WARNING: ', err)
    })

    this.client.on('update', function (data) {
      this.status = status.CONNECTING
      console.log('BTTracker - ON update - announce: ', data.announce, data)
      console.log(
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
    //     console.log('BTTracker - forcing update.')
    //     this.client.update()
    //   }
    // }, 5000)
  }

  onPeer (peer) {
    if (!peer) {
      console.log('BT_TRACKER - ON peer - NOT peer')
      return
    }

    peer.on('error', err => console.log('BT_TRACKER - ON peer - error', err))

    peer.on('signal', data => {
      console.log('BT_TRACKER - PEER - ON signal: ', JSON.stringify(data))
    })

    peer.on('connect', () => {
      this.status = status.CONNECTED

      console.warn('BT_TRACKER - PEER - ON connect')
      // peer.send('Hey Pal! Here ' + this.nodeAddress + ' contacting you!')
      this.emit('discover', peer)
      // this.client.stop()
    })

    peer.on('data', data => {
      console.log('BT_TRACKER - PEER - ON data : ' + data)
    })
  }

  setConnected () {
    console.log('BT_TRACKER - SET connected!')
    this.client.complete()
  }
}

module.exports = BTTracker
