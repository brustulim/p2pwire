'use strict'
const { pipe, filter, first } = require('lodash/fp')
const { logLevel } = require('./constants')

class Store {
  constructor () {
    if (!Store.instance) {
      Store.instance = this

      this.nodeAddress = ''
      this._consoleLogLevel = logLevel.NONE
      this._eventLogLevel = logLevel.NONE
      this.nodes = new Map()
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

  get parsedNodes () {
    return Array.from(this.nodes).map(node => {
      const {
        peerConn: { remoteNodeAddress, channelName, remoteAddress }
      } = node[1]

      return { remoteNodeAddress, channelName, remoteAddress }
    })
  }

  get directNodesConnected () {
    return [...this.nodes.keys()]
  }
}

const instance = new Store()
module.exports = instance
