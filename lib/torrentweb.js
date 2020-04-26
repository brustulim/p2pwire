"use strict";
const { EventEmitter } = require('events')
const {showDebug} = require ('./util')
const Conn = require ('./conn')
const Club = require ('./club')

class TorrentWeb extends EventEmitter {
  constructor(opts = {}) {
    super();
    this.debugPrefix = 'TorrentWeb'
    this.conn = new Conn()
    this.conn.start()
    this.running = true
    showDebug(this.debugPrefix, 'TorrentWeb started!')

    const club = new Club(this.conn, 'club louco', 'doido' ,{})
  }

  calc(num1, num2) {
    showDebug(this.debugPrefix, `Calculating the sum of: ${num1} and ${num2}`);
    return num1 + num2;
  }
}

module.exports = TorrentWeb;