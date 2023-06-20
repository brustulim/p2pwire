'use strict'
const EventBus = require('../eventBus')
const Store = require('../store')
const { logLevel } = require('../constants')

class LogManager {
  constructor () {
    if (!LogManager.instance) {
      LogManager.instance = this
    }

    return LogManager.instance
  }

  logError () {
    this.log(logLevel.ERROR, ...arguments)
  }

  logWarning () {
    this.log(logLevel.WARNING, ...arguments)
  }

  logInfo () {
    this.log(logLevel.INFO, ...arguments)
  }

  logDebug () {
    this.log(logLevel.DEBUG, ...arguments)
  }

  log (level = logLevel.INFO) {
    const args = this._extractArguments(arguments)
    this._logToConsole(level, args)
    this._logToEvent(level, args)
  }

  _extractArguments (args) {
    if (args.length < 2) {
      throw new Error('You must provide at least a message param to the log')
    }
    // extract first element that is the logLevel
    return [...args].splice(1, args.length - 1)
  }

  _logToConsole (level, args) {
    if (level.value >= Store.consoleLogLevel.value) {
      switch (level) {
        case logLevel.ERROR:
          console.error(...args)
          break
        case logLevel.WARNING:
          console.warn(...args)
          break
        default:
          console.log(...args)
      }
    }
  }

  _logToEvent (level, args) {
    if (level.value >= Store.eventLogLevel.value) {
      EventBus.emit('log', level.key, ...args)
    }
  }
}

const instance = new LogManager()
Object.freeze(instance)
module.exports = instance
