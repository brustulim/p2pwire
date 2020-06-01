import { EventEmitter } from 'events'
import BTTracker from './btTracker'
import TWPeer from '../twPeer'

class Discovery extends EventEmitter {
  constructor () {
    super()
    // this.mainAddress = 'A28qimnfJYoRjs6Fxon4fWfjGmjvKED5CxboyUEbuxdvtNRqe'
    this.mainAddress = '910cf6d078a53472b6454446e121b256569f0000'
  }

  connectToNetwork (peerId) {
    this.address = peerId
    this.discByBTTracker = new BTTracker(peerId)
    this.discByBTTracker.on('discover', (peer) => this.onDiscover(peer))

    this.discByBTTracker.search(this.mainAddress)

    console.log('Discovery -> connectToNetwork -> node: ', peerId)
  }

  onDiscover (peer) {
    this.createConnection(peer)
    // this.emit("connection", peer);
    console.log('DISCOVERY - new peer discovered')
    // this.discByBTTracker.stop()
  }

  stop () {
    this.discByBTTracker.stop()
  }

  createConnection (peer) {
    console.log(
      'Discovery -> createConnection -> peer initiator',
      peer.initiator
    )
    // const twPeer = new TWPeer({
    //   initiator: peer.initiator,
    //   objectMode: true,
    //   trickle: false,
    // });
    const twPeer = new TWPeer({
      initiator: peer.initiator,
      objectMode: true
    })

    twPeer.on('signal', (data) => {
      console.log('Discovery -> createConnection -> twPeer ON SIGNAL', data)
      peer.send(JSON.stringify({ t: 'twSignal', a: this.address, data }))
    })

    peer.on('data', (data) => {
      console.log('Discovery -> createConnection -> TYPE OF data', typeof data)
      console.log('Discovery -> createConnection -> data', data)
      console.log('Discovery -> createConnection -> data.t', data.t)
      console.log('Discovery -> createConnection -> data.data', data.data)
      // const objData = data.toJSON()
      try {
        const objData = JSON.parse(data.toString())
        console.log('PARSED - Discovery -> createConnection -> objData', objData)
        // console.log('Discovery -> createConnection -> data.toString()', data.toString())
        if (typeof objData === 'object' && objData.t === 'twSignal') {
          console.log(
            'PARSED - IS SIGNAL! - Discovery -> createConnection -> objData',
            objData.data
          )

          twPeer.remotePeerAddress = objData.a
          twPeer.signal(JSON.stringify(objData.data))
        }
      } catch (error) {
        console.log('ERRRRROOORRRR - Discovery -> createConnection -> error', error)
      }
    })

    twPeer.on('connect', () => {
      console.warn('NEW TWPEER to : ', twPeer.remotePeerAddress)
      this.emit('connection', twPeer)
    })
  }
}

export default Discovery
