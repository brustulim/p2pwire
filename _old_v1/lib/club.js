'use strict'
import { showDebug } from './util'
import { EventEmitter } from 'events'
import Conn from './conn'
import tw_pex from './tw_ext'

class Club extends EventEmitter {
  constructor (conn = new Conn(), address, nick, opts = {}) {
    super()
    this.conn = conn
    this.store = conn.store

    this.address = address
    this.nick = nick || address
    this.debugPrefix = `club -> ${this.nick}: `
    showDebug(this.debugPrefix, 'conn.announceServers:', conn.announceServers)

    // const buffer = new Buffer.from(this.address)
    const buffer = Buffer.from(this.address)
    buffer.name = this.address
    const torrentOpts = { name: this.address, announce: conn.announceServers }
    this.conn.webTorrent.seed(buffer, torrentOpts, (torrent) =>
      this.onTorrent(torrent)
    )
  }

  onTorrent (torrent) {
    showDebug(this.debugPrefix, 'torrent name:', torrent.name)
    showDebug(this.debugPrefix, 'torrent infoHash:', torrent.infoHash)
    showDebug(this.debugPrefix, `address: ${this.address}`)

    torrent.on('wire', (wire, addr) => this.onWireOpen(wire, addr))
    torrent.on('error', (error) => this.onError(error))
    torrent.on('done', () => this.onDone())
    torrent.on('trackerUpdate', (update) => this.onTrackerUpdate(update))
    torrent.on('trackerAnnounce', (announce) =>
      this.onTrackerAnnounce(announce)
    )

    torrent.discovery.on('trackerAnnounce', (announce) => {
      showDebug(this.debugPrefix, 'discovery.on(trackerAnnounce)', announce)
    })

    if (torrent.discovery.tracker) {
      showDebug(this.debugPrefix, 'discovery.tracker : TRUE')
      torrent.discovery.tracker.on('update', (update) => {
        showDebug(this.debugPrefix, 'discovery.tracker.on(update):', update)
      })
    } else {
      showDebug(this.debugPrefix, 'discovery.tracker : FALSE')
    }

    torrent.on('metadata', (value) => {
      console.log('metadata')
      console.log(value)
    })
  }

  onError (error) {
    showDebug(this.debugPrefix, 'onError:', error)
  }

  onDone () {
    showDebug(this.debugPrefix, 'onDone')
  }

  onWireOpen (wire, addr) {
    // showDebug( this.debugPrefix, `onWire addr:`, wire.remoteAddress );
    showDebug(this.debugPrefix, 'onWire addr:', addr)
    showDebug(this.debugPrefix, 'onWire peerId:', wire.peerId)
    showDebug(this.debugPrefix, 'onWire wire:', wire)

    if (addr) {
      this.store.addNode(addr, wire.peerId, this.address)
      console.log('onWireOpen -> this.store', this.store.nodes)
      this.emit('nodeUpdate', this.store.nodes)
    }
    /*
    wire.use(tw_pex(this))
    wire.tw_pex.start()
    wire.tw_pex.on('peer', function (peer) {
      console.log('onWireOpen -> peer', peer)
      // got a peer
      // probably add it to peer connections queue
    })
*/

    wire.handshake(
      new Buffer.from(this.conn.address.substring(0, 20)),
      new Buffer.from(this.conn.address.substring(0, 20))
    )

    // TODO: emitir evento wire connectado / salvar na lista de peers
    wire.on('handshake', (infoHash, peerId, extensions) => {
      console.log('Club -> onWireOpen -> handshake extensions', extensions)
      console.log('Club -> onWireOpen -> handshake peerId', peerId)
      console.log('Club -> onWireOpen -> handshake infoHash', infoHash)

      // wire.handshake(new Buffer.from('my info hash'), new Buffer.from('my peer id'))
    })
    wire.on('close', (wire) => this.onWireClose(wire))
  }

  onWireClose (wire) {
    showDebug(this.debugPrefix, 'onWireClose wire:', wire)
    // TODO: emitir evento - tirar peer da lista
  }

  onTrackerUpdate (update) {
    showDebug(this.debugPrefix, 'onTrackerUpdate:', update)
  }

  onTrackerAnnounce (announce) {
    showDebug(this.debugPrefix, 'onTrackerAnnounce:', announce)
    // update statistics
  }
}

module.exports = Club