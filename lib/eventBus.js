'use strict'
const { EventEmitter } = require('events')
const { get } = require('lodash/fp')

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
Object.freeze(instance)
module.exports = instance
