"use strict";
import { EventEmitter } from "events";
import reemit from "re-emitter";
import Crypto from "./lib/crypto";
import ConnectionManager from "./lib/connectionManager";
import P2PWireNode from "./lib/p2pWireNode";

class P2PWire extends EventEmitter {
  constructor(opts = {}) {
    super();

    this.conn = new ConnectionManager(this);
    this._registerConnEvents();
    this.nodeAddress = "NA";
    this.nodeCredentials =
      validateNodeCredentials(opts.nodeCredentials) || Crypto.createKeyPair();
    this.node = new P2PWireNode({
      tw: this,
      nodeCredentials: this.nodeCredentials,
    });

    this.node.on("created", (nodeAddress) => {
      this.nodeAddress = nodeAddress;
      this.emit("created", nodeAddress);
    });

    this.node.connectToTWNetwork();

    this.conn.on("receiveMessage", (remoteNodeAddress, message) => {
      this.emit("message", remoteNodeAddress, message);
    });
    // this.conn.on("nodeConnected", (nodeAddress, nodeData) => {
    //   this.emit("nodeConnected", nodeAddress, nodeData);
    // });

    // this.conn.on("nodeDisconnected", (nodeAddress) => {
    //   this.emit("nodeDisconnected", nodeAddress);
    // });

    // this.conn.on("linksUpdate", (links) => {
    //   this.emit("linksUpdate", links);
    // });
  }

  sendMessage(nodeAddress, message) {
    this.conn.sendMessage(nodeAddress, message);
  }

  _registerConnEvents() {
    reemit(this.conn, this, [
      "nodeConnected",
      "nodeDisconnected",
      "receiveMessage",
      "linksUpdate",
    ]);
  }
}

function validateNodeCredentials(keyPair) {
  // TODO: validate if given keyPair are valid private and public keys
  // MAYBE: try to crypt and decrypt text
  return keyPair;
}

module.exports = P2PWire;
