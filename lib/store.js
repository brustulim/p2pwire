'use strict'
const { get, pipe, filter, first } = require('lodash/fp')
const { logLevel } = require('./constants')

class Store {
  constructor () {
    if (!Store.instance) {
      Store.instance = this

      this.nodeAddress = ''
      this._consoleLogLevel = logLevel.NONE
      this._eventLogLevel = logLevel.NONE
      this.nodes = new Map()
      this.links = []
      this.linksSimplified = []
    }

    return Store.instance
  }

  set consoleLogLevel (key) {
    this._consoleLogLevel = this._getLogLevelByKey(key)
  }

  get consoleLogLevel () {
    return this._consoleLogLevel
  }

  set eventLogLevel (key) {
    this._eventLogLevel = this._getLogLevelByKey(key)
  }

  get eventLogLevel () {
    return this._eventLogLevel
  }

  _getLogLevelByKey (key) {
    const level = pipe(
      Object.values,
      filter(item => item.key === key),
      this._validateLogLevelExistence,
      first
    )(logLevel)

    return level
  }

  _validateLogLevelExistence (levels) {
    if (levels.length === 0) {
      throw new Error(
        `Invalid log level! inform "none", "error", "warning", "info" or "debug"`
      )
    }
    return levels
  }

  addLink (link) {
    if (!this.links.includes(link)) {
      this.links.push(link)
    }
    // this.links = union(this.links, [link])
  }

  get parsedNodes () {
    return Array.from(this.nodes).map(node => {
      const {
        peerConn: { remoteNodeAddress, channelName, remoteAddress }
      } = node[1]

      return { remoteNodeAddress, channelName, remoteAddress }
    })
  }

  updateLinksSimplified () {
    this.links.map(it => {
      const link = get('l', it).sort()
      if (!this.linksSimplified.includes(link)) {
        this.linksSimplified.push(link)
      }
    })

    // this.linksSimplified = pipe(
    //   map((it) => get('l', it).sort()),
    //   uniqWith(isEqual)
    // )(this.links)
  }

  /*
  add - adiciona um item
  delete -  remove um item

  */
  // addNode (address, peerId, club) {
  //   const node = this.nodes.get(address) || { peerId }
  //   this.nodes.set(address, { ...node, t: Date.now() })
  // }
}

const instance = new Store()
// Object.freeze(instance)
module.exports = instance
