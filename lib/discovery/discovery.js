'use strict'
const { EventEmitter } = require('events')
const BTTracker = require('./btTracker')
const { messageType } = require('../constants')
const PeerConnection = require('../peerConnection')

class Discovery extends EventEmitter {
  constructor (tw, nodeAddress, wrtc) {
    super()
    this.wrtc = wrtc
    this._checkWebRTCSupport(this.wrtc)

    this.mainAddress = '910cf6d078a53472b6454446e121b256569f0000'
    this.conn = tw.conn
    this.nodeAddress = nodeAddress
    this.btTracker = new BTTracker(this.nodeAddress, this.wrtc)
    this.btTracker.on('discover', peer => this.onDiscover(peer))
  }

  _checkWebRTCSupport (wrtc) {
    if (!PeerConnection.WEBRTC_SUPPORT && !wrtc) {
      throw new Error(
        'WebRTC is unsupported on this platform. For non browser platforms you must import the "wrtc" package and pass in "opts" param of p2pWire.'
      )
    }
  }

  connectToNetwork () {
    console.log('DISCOVERY - trying to connect to TWNetwork')
    this.btTracker.search(this.mainAddress)
  }

  onDiscover (peer) {
    this.createConnection(peer)
  }

  stop () {
    this.btTracker.stop()
  }

  createConnection (peer) {
    console.log(
      'DISCOVERY - createConnection -> is peer initiator',
      peer.initiator
    )

    const peerConn = new PeerConnection({
      initiator: peer.initiator,
      objectMode: true,
      trickle: false,
      wrtc: this.wrtc
    })

    peerConn.on('signal', data => {
      console.log('DISCOVERY - createConnection - ON peerConn signal: ', data)
      peer.send(
        JSON.stringify({ t: messageType.SIGNAL, a: this.nodeAddress, data })
      )
    })

    peer.on('data', data => {
      try {
        const objData = JSON.parse(data.toString())

        if (typeof objData === 'object' && objData.t === messageType.SIGNAL) {
          console.log(
            'DISCOVERY - createConnection - ON Peer data - objData VALID: ',
            {
              a: objData.a,
              data: objData.data
            }
          )

          peerConn.remoteNodeAddress = objData.a
          if (this.conn.isConnectedTo(peerConn.remoteNodeAddress)) {
            console.log(
              'DISCOVERY - createConnection - ON Peer data - REJECTING - already connected to: ',
              peerConn.remoteNodeAddress
            )
            peerConn.destroy(
              new Error(
                'Cannot connect - already connected to: ' +
                  peerConn.remoteNodeAddress
              )
            )
          } else {
            console.log(
              'DISCOVERY - createConnection - ON Peer data - PROCESSING signal from: ',
              peerConn.remoteNodeAddress
            )

            peerConn.signal(JSON.stringify(objData.data))
          }
        } else {
          console.log(
            'DISCOVERY - createConnection - ON Peer data - objData <INVALID>: ',
            objData
          )
        }
      } catch (error) {
        console.log(
          'DISCOVERY - createConnection - ON Peer data - PARSE ERROR: ',
          error
        )
      }
    })

    peerConn.on('connect', () => {
      this.btTracker.setConnected()
      console.warn(
        'DISCOVERY - createConnection - ON peerConn connect - remote address: ',
        peerConn.remoteNodeAddress,
        peerConn
      )
      this.emit('connection', peerConn)
    })
  }
}

module.exports = Discovery
