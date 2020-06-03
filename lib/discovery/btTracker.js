'use strict'
import { EventEmitter } from 'events'
var Client = require('bittorrent-tracker')
/**
 * Connect to a peer through a Bit Torrent tracker
 */

class BTTracker extends EventEmitter {
  constructor (nodeAddress, opts = {}) {
    super()
    if (!nodeAddress) { throw new Error('nodeAddress must be provided.') }

    this.nodeAddress = nodeAddress
  }

  stop () {
    this.client.stop()
    console.log('BT_TRACKER - stopped!')
  }

  search (infoHash) {
    if (!infoHash) {
      throw new Error('infoHash must be provided.')
    }

    var requiredOpts = {
      infoHash,
      peerId: this.nodeAddress,
      announce: [
        'wss://tracker.openwebtorrent.com'
        // 'wss://tracker.btorrent.xyz/'
      ]
    }

    this.client = new Client(requiredOpts)

    this.client.on('error', function (err) {
      console.log('BT_TRACKER - ERROR: ', err)
    })

    this.client.on('warning', function (err) {
      console.log('BT_TRACKER - WARNING: ', err)
    })

    // start getting peers from the tracker
    this.client.start()

    this.client.on('update', function (data) {
      console.log('BTTracker - ON update - announce: ', data.announce, data)
      console.log(
        'BT_TRACKER - Swarm status: < seeders | leachers > - < ' +
          data.complete +
          ' | ' +
          data.incomplete +
          ' >'
      )
    })

    this.client.on('peer', (peer) => this.onPeer(peer))

    // force a tracker announce. will trigger more 'update' events and maybe more 'peer' events
    this.client.update()
  }

  onPeer (peer) {
    if (!peer) {
      console.log('BT_TRACKER - ON peer - NOT peer')
      return
    }

    peer.on('error', (err) => console.log('BT_TRACKER - ON peer - error', err))

    peer.on('signal', (data) => {
      console.log('BT_TRACKER - PEER - ON signal: ', JSON.stringify(data))
    })

    peer.on('connect', () => {
      console.warn('BT_TRACKER - PEER - ON connect')
      // peer.send('Hey Pal! Here ' + this.nodeAddress + ' contacting you!')
      this.emit('discover', peer)
      // this.client.stop()
    })

    peer.on('data', (data) => {
      console.log('BT_TRACKER - PEER - ON data : ' + data)
    })
  }

  setConnected () {
    console.log('BT_TRACKER - SET connected!')
    this.client.complete()
  }
}

export default BTTracker
