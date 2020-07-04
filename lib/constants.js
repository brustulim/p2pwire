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

module.exports = { config, messageType };
