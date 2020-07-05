'use strict'
const { objectHasValue } = require('./util')
const { messageType } = require('./constants')

function sendMessage (peerConn, message) {
  validateMessage(message)
  console.log('MESSAGE -> sendMessage -> peerConn', peerConn)
  const msg = {
    t: messageType.CONSUMER_MESSAGE,
    d: peerConn.destinationNodeAddress,
    m: message
  }
  peerConn.send(JSON.stringify(msg))
}

function sendConnectionsList (peerConn, links) {
  const msg = {
    t: messageType.LINKS_LIST,
    d: peerConn.destinationNodeAddress,
    m: links
  }
  peerConn.send(JSON.stringify(msg))
}

function validateMessage (message) {
  if (!message) {
    throw new Error('the param "message" is required')
  }
  if (typeof message !== 'object') {
    throw new Error('the param "message" must be an object')
  }
}

function processReceivedMessage (event) {
  const message = _parseMessage(event)

  if (typeof message !== 'object') {
    throw new Error(
      'invalid message received from remote peer - type: ',
      typeof message,
      ' - message: ' + JSON.stringify(message, null, 2)
    )
  }

  if (!message.t || !objectHasValue(messageType, message.t)) {
    throw new Error(
      'Invalid message type received from remote peer: ' +
        JSON.stringify(message, null, 2)
    )
  }
  return message
}

function _parseMessage (event) {
  try {
    if (!event.data) {
      throw new Error(
        'invalid message event received from remote peer: ',
        JSON.stringify(event, null, 2)
      )
    }

    return JSON.parse(event.data.toString())
  } catch (error) {
    console.log('MESSAGE - receive message - PARSE ERROR: ', error)
    throw new Error('Invalid message received. Error parsing data: ' + error)
  }
}

module.exports = { sendMessage, sendConnectionsList, processReceivedMessage }
