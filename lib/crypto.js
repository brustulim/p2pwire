'use strict'
import { box } from 'tweetnacl'
import { encode } from 'bs58check'

const NODE_ADDRESS_SIZE = 2

function createKeyPair () {
  return box.keyPair()
}

function extractNodeAddress (nodeCredentials) {
  return encode(Buffer.from(nodeCredentials.publicKey)).substring(
    0,
    NODE_ADDRESS_SIZE
  )
}

export default { createKeyPair, extractNodeAddress }
