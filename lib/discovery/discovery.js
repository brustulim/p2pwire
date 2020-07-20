'use strict'
const EventBus = require('../eventBus')
const LogManager = require('../logManager')
const BTTracker = require('./btTracker')
const { messageType } = require('../constants')
const PeerConnection = require('../peerConnection')

class Discovery {
  constructor (tw, nodeAddress, wrtc) {
    this.wrtc = wrtc
    this._checkWebRTCSupport(this.wrtc)

    this.mainAddress = '910cf6d078a53472b6454446e121b256569f0000'
    this.conn = tw.conn
    this.nodeAddress = nodeAddress
    this.btTracker = new BTTracker(this.nodeAddress, this.wrtc)
    EventBus.on('peerDiscovered', peer => this._onPeerDiscovered(peer))
  }

  _checkWebRTCSupport (wrtc) {
    if (!PeerConnection.WEBRTC_SUPPORT && !wrtc) {
      throw new Error(
        'WebRTC is unsupported on this platform. For non browser platforms you must import the "wrtc" package and pass in "opts" param of p2pWire.'
      )
    }
  }

  connectToNetwork () {
    LogManager.logDebug('DISCOVERY - trying to connect to p2pwire network')
    this.btTracker.search(this.mainAddress)
  }

  _onPeerDiscovered (peer) {
    this.createConnection(peer)
  }

  stop () {
    this.btTracker.stop()
  }

  createConnection (peer) {
    LogManager.logDebug(
      'DISCOVERY - createConnection -> is peer initiator: ',
      peer.initiator
    )

    const peerConn = new PeerConnection({
      initiator: peer.initiator,
      objectMode: true,
      trickle: false,
      wrtc: this.wrtc
    })

    peerConn.on('signal', data => {
      LogManager.logDebug(
        'DISCOVERY - createConnection - ON peerConn signal: ',
        data
      )
      peer.send(
        JSON.stringify({ t: messageType.SIGNAL, a: this.nodeAddress, data })
      )
    })

    peer.on('data', data => {
      try {
        const objData = JSON.parse(data.toString())

        if (typeof objData === 'object' && objData.t === messageType.SIGNAL) {
          LogManager.logDebug(
            'DISCOVERY - createConnection - ON Peer data - objData VALID: ',
            {
              a: objData.a,
              data: objData.data
            }
          )

          peerConn.remoteNodeAddress = objData.a
          if (this.conn.isConnectedTo(peerConn.remoteNodeAddress)) {
            LogManager.logInfo(
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
            LogManager.logDebug(
              'DISCOVERY - createConnection - ON Peer data - PROCESSING signal from: ',
              peerConn.remoteNodeAddress
            )

            peerConn.signal(JSON.stringify(objData.data))
          }
        } else {
          LogManager.logInfo(
            'DISCOVERY - createConnection - ON Peer data - objData <INVALID>: ',
            objData
          )
        }
      } catch (error) {
        LogManager.logInfo(
          'DISCOVERY - createConnection - ON Peer data - PARSE ERROR: ',
          error
        )
      }
    })

    peerConn.on('connect', () => {
      this.btTracker.setConnected()
      EventBus.emit('connectedToNetwork', peerConn)
    })
  }
}

module.exports = Discovery
