'use strict'

const VALID_MESSAGE_TYPES = ['m', 'x']

function sendMessage (peerConn, message) {
  validateMessage(message)
  console.log('MESSAGE -> sendMessage -> peerConn', peerConn)
  const msg = { t: 'm', d: peerConn.destinationNodeAddress, m: message }
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
  try {
    if (!event.data) {
      throw new Error('invalid message event received from remote peer: ', event)
    }

    const msg = JSON.parse(event.data.toString())
    console.log('MESSAGE - message received: ', msg)

    if (typeof msg !== 'object') {
      throw new Error('invalid message received from remote peer: ', msg)
    }

    if (!msg.t || !VALID_MESSAGE_TYPES.includes(msg.t)) {
      throw new Error('Invalid message type received from remote peer: ' + msg)
    }
    return msg
  } catch (error) {
    console.log('MESSAGE - receive message - PARSE ERROR: ', error)
    throw new Error('Invalid message received. Error parsing data: ' + error)
  }
}

export default { sendMessage, processReceivedMessage }
