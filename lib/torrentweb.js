'use strict'
import { showDebug } from './util'
import Conn from './conn'
import Club from './club'
import TWClient from './twClient'
import TWNode from './twNode'
// import { EventEmitter } from 'events'
var EventEmitter = require('events').EventEmitter

class TorrentWeb extends EventEmitter {
  constructor (opts = {}) {
    super()

    this.isRootNode = opts.isRootNode
    this.twNode = new TWNode({ isRootNode: this.isRootNode })
    console.log('TorrentWeb -> constructor -> this.twNode', this.twNode.address)
    this.twNode.connectToTWNetwork()

    // this.twClient = new TWClient();

    /*
    this.debugPrefix = 'TorrentWeb'
    console.log('TorrentWeb -> constructor -> this.debugPrefix', this.debugPrefix)
    this.conn = new Conn()
    this.conn.start()
    this.running = true
    showDebug(this.debugPrefix, 'TorrentWeb started!')
*/
    /*
    const club = new Club(this.conn, 'club louco', 'doido', {})
    club.on('nodeUpdate', (nodes) => {
      this.emit('nodeUpdate', nodes)
      console.log('CLUB DOIDO TorrentWeb -> constructor -> nodes', nodes)
    })
    console.log('TorrentWeb -> constructor -> club', club)
    */
  }

  calc (num1, num2) {
    showDebug(this.debugPrefix, `Calculating the sum of: ${num1} and ${num2}`)
    return num1 + num2
  }
}

module.exports = TorrentWeb
