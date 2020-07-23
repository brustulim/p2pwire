'use strict'

const config = {
  SHARE_LINKS_INTERVAL_SECONDS: 60
}

const messageType = {
  SIGNAL: 's',
  CONSUMER_MESSAGE: 'm',
  CONSUMER_MESSAGE_ASYNC_SEND: 'a',
  CONSUMER_MESSAGE_ASYNC_RESPONSE: 'r',
  LINKS_LIST: 'l'
}

const logLevel = {
  DEBUG: { key: 'debug', value: 1 },
  INFO: { key: 'info', value: 2 },
  WARNING: { key: 'warning', value: 3 },
  ERROR: { key: 'error', value: 4 },
  NONE: { key: 'none', value: 5 }
}

module.exports = { config, messageType, logLevel }
