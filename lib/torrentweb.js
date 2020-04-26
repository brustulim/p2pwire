"use strict";
import { EventEmitter } from 'events';
import { showDebug } from './util';
import Conn from './conn';
import Club from './club';

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

module.exports = TorrentWeb