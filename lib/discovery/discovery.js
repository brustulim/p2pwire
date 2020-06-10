import { EventEmitter } from 'events'
import BTTracker from './btTracker'
import { messageType } from '../constants'
import PeerConnection from '../peerConnection'

class Discovery extends EventEmitter {
  constructor (tw, nodeAddress) {
    super()

    this.mainAddress = '910cf6d078a53472b6454446e121b256569f0000'
    this.conn = tw.conn
    this.nodeAddress = nodeAddress
    this.btTracker = new BTTracker(this.nodeAddress)
    this.btTracker.on('discover', (peer) => this.onDiscover(peer))
  }

  connectToNetwork () {
    console.log(
      'DISCOVERY - trying to connect to TWNetwork'
    )
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
      trickle: false
    })

    peerConn.on('signal', (data) => {
      console.log(
        'DISCOVERY - createConnection - ON peerConn signal: ',
        data
      )
      peer.send(JSON.stringify({ t: messageType.SIGNAL, a: this.nodeAddress, data }))
    })

    peer.on('data', (data) => {
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

export default Discovery
