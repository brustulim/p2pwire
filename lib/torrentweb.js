"use strict";
const { EventEmitter } = require('events')

class TorrentWeb extends EventEmitter {
  constructor(opts = {}) {
    super();

    this.debugMode = opts.debugMode || false;
    this.running = true
    this.showDebug('TorrentWeb started!')
  }

  showDebug(message) {
    if (this.debugMode) console.log(message);
  }

  calc(num1, num2) {
    this.showDebug("Calculating the sum of: ", num1, " and ", num2);
    return num1 + num2;
  }
}

module.exports = TorrentWeb;
