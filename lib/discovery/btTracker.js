'use strict'
import { EventEmitter } from 'events'
import { box } from 'tweetnacl'
import { encode, decode } from 'bs58check'
var Client = require('bittorrent-tracker')
var wrtc = require('wrtc')
/**
 * Connect to a peer through a Bit Torrent tracker
 */
class BTTracker extends EventEmitter {
  constructor (peerAddress, opts = {}) {
    super()

    if (!peerAddress) { throw new Error('peerAddress must be provided.') }

    this.peerAddress = peerAddress
    console.log('btTracker -> constructor -> peerAddress', peerAddress)
  }

  stop () {
    this.client.stop()
    console.log('bttracker topped!')
  }

  search (infoHash) {
    if (!infoHash) {
      throw new Error('infoHash must be provided.')
    }

    var requiredOpts = {
      // infoHash: Buffer.from('012345678901234567890'),
      // peerId: Buffer.from(this.peerAddress),
      // infoHash: decode(infoHash),
      infoHash,
      peerId: this.peerAddress,
      announce: [
        'wss://tracker.openwebtorrent.com',
        // 'wss://tracker.btorrent.xyz/',
        'udp://tracker.empire-js.us',
        'udp://explodie.org'
      ]
    }

    // trying on nodeJS
    /*
    var requiredOpts = {
      infoHash,
      peerId: this.peerAddress,
      announce: [
        'wss://tracker.openwebtorrent.com',
        'wss://tracker.btorrent.xyz/',
        'udp://exodus.desync.com',
        'udp://tracker.coppersurfer.tk',
        // "udp://tracker.internetwarriors.net",
        // "udp://tracker.leechers-paradise.org",
        // "udp://tracker.openbittorrent.com",
        'udp://tracker.empire-js.us',
        'udp://explodie.org'
        // "udp://",
      ],
      port: 6881, // torrent client port, (in browser, optional)
      wrtc: wrtc
    }
    */

    console.log('search -> requiredOpts', requiredOpts)

    this.client = new Client(requiredOpts)

    this.client.on('error', function (err) {
      console.log('ERROR: ', err)
    })

    this.client.on('warning', function (err) {
      // if (err.message && err.message.toString().contains('Unsupported tracker protocol')) {
      //   console.log('WARNING->> ', err.message)
      // }
      console.log('WARNING->> ', err)
    })

    // start getting peers from the tracker
    this.client.start()

    this.client.on('update', function (data) {
      console.log('TWClient -> constructor -> data', data)
      console.log('got an announce response from tracker: ' + data.announce)
      console.log('number of seeders in the swarm: ' + data.complete)
      console.log('number of leechers in the swarm: ' + data.incomplete)
    })

    // this.client.on('')

    this.client.on('peer', (peer) => this.onPeer(peer))

    // force a tracker announce. will trigger more 'update' events and maybe more 'peer' events
    this.client.update()
    // console.log('search -> this.client', this.client)
  }

  onPeer (peer) {
    if (!peer) {
      console.log('NOT peer')
      return
    }
    // console.log('found a peer: ', typeof peer, JSON.parse(JSON.stringify(peer))) // 85.10.239.191:48623
    console.log('found a peer: ', peer) // 85.10.239.191:48623

    peer.on('error', (err) => console.log('peer - error', err))

    peer.on('signal', (data) => {
      console.log('peer - SIGNAL: ', JSON.stringify(data))
    })

    peer.on('connect', () => {
      // peer.send('Hey Pal! Here ' + this.peerAddress + ' contacting you!')
      this.emit('discover', peer)
      // this.client.stop()
    })

    peer.on('data', (data) => {
      console.log('peer - DATA: ' + data)
    })
  }
}

export default BTTracker
