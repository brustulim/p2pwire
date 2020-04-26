"use strict";
const WebTorrent = require("webtorrent");
const { box } = require("tweetnacl");
const { encode } = require("bs58check");
const { EventEmitter } = require("events");
const { showDebug } = require("./util");
const Club = require("./club");

class Conn extends EventEmitter {
  constructor(opts = {}) {
    super();

    this.announceServers = opts.announceServers || [
      "wss://tracker.openwebtorrent.com",
      "wss://tracker.btorrent.xyz/",
    ];
    this.debugPrefix = "conn";
    this.keyPair = box.keyPair();
    this.address = encode(Buffer.from(this.keyPair.publicKey));
    showDebug(this.debugPrefix, `address:`, this.address);
    showDebug(this.debugPrefix, `keyPair:`, this.keyPair);

    this.masterAddress = "lolo xibiu sabugão";
    showDebug(this.debugPrefix, `masterAddress:`, this.masterAddress);

    this.webTorrent =
      opts.webTorrent || new WebTorrent({ peerId: this.keyPair.publicKey }); //{ peerId: this.keyPair.publicKey });

    this.webTorrent.on("error", (error) => {
      showDebug(this.debugPrefix, `WebTorrent ERROR:`, error);
    });
  }

  start() {
    this.masterClub = new Club(this, this.masterAddress, "Master Club");
  }
}

module.exports = Conn;
