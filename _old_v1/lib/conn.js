'use strict'
import WebTorrent from 'webtorrent'
import { box } from 'tweetnacl'
import { encode } from 'bs58check'
import { EventEmitter } from 'events'
import { showDebug } from './util'
import Store from './store'
import Club from './club'

class Conn extends EventEmitter {
  constructor (opts = {}) {
    super()

    this.store = new Store()
    this.announceServers = opts.announceServers || [
      'wss://tracker.openwebtorrent.com',
      'wss://tracker.btorrent.xyz/'
    ]
    this.debugPrefix = 'conn'
    console.log('Conn -> constructor -> this.debugPrefix', this.debugPrefix)
    this.keyPair = box.keyPair()
    this.address = encode(Buffer.from(this.keyPair.publicKey))
    // this.peerId = this.keyPair.publicKey;
    this.peerId = encode(Buffer.from(this.keyPair.publicKey)).substring(0, 20)

    showDebug(this.debugPrefix, 'peerId:', this.peerId)
    showDebug(this.debugPrefix, 'address:', this.address)
    showDebug(this.debugPrefix, 'keyPair:', this.keyPair)

    this.masterAddress = 'lolo xibiu sabugão'
    showDebug(this.debugPrefix, 'masterAddress:', this.masterAddress)

    this.webTorrent =
      opts.webTorrent || new WebTorrent({ peerId: this.peerId })
      // { peerId: this.keyPair.publicKey });

    this.webTorrent.on('error', (error) => {
      showDebug(this.debugPrefix, 'WebTorrent ERROR:', error)
    })
  }

  start () {
    this.masterClub = new Club(this, this.masterAddress, 'Master Club')
    this.masterClub.on('nodeUpdate', (nodes) => {
      this.emit('nodeUpdate', nodes)

      console.log('MASTERCLUB -> nodeUpdated', nodes)
    })
  }
}

module.exports = Conn
