'use strict'
const { EventEmitter } = require('events')

class EventBus extends EventEmitter {
  constructor () {
    if (!EventBus.instance) {
      super()
      EventBus.instance = this
    }

    return EventBus.instance
  }
}

const instance = new EventBus()
module.exports = instance
