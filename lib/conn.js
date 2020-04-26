'use strict'
import WebTorrent from 'webtorrent'
import { box } from 'tweetnacl'
import { encode } from 'bs58check'
import { EventEmitter } from 'events'
import { showDebug } from './util'
import Club from './club'

class Conn extends EventEmitter {
  constructor (opts = {}) {
    super()

    this.announceServers = opts.announceServers || [
      'wss://tracker.openwebtorrent.com',
      'wss://tracker.btorrent.xyz/'
    ]
    this.debugPrefix = 'conn'
    this.keyPair = box.keyPair()
    this.address = encode(Buffer.from(this.keyPair.publicKey))
    showDebug(this.debugPrefix, 'address:', this.address)
    showDebug(this.debugPrefix, 'keyPair:', this.keyPair)

    this.masterAddress = 'lolo xibiu sabugão'
    showDebug(this.debugPrefix, 'masterAddress:', this.masterAddress)

    this.webTorrent =
      opts.webTorrent || new WebTorrent({ peerId: this.keyPair.publicKey })
      // { peerId: this.keyPair.publicKey });

    this.webTorrent.on('error', (error) => {
      showDebug(this.debugPrefix, 'WebTorrent ERROR:', error)
    })
  }

  start () {
    this.masterClub = new Club(this, this.masterAddress, 'Master Club')
  }
}

module.exports = Conn
