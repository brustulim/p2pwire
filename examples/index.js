const wrtc = require('wrtc')
// use from npm
// const P2PWire = require('p2pwire')
// use from source code
const P2PWire = require('../index.js')

try {
  startNetwork()
} catch (error) {
  console.log(`error`, error)
}

function startNetwork () {
  var p2pwire = new P2PWire({
    wrtc,
    consoleLogLevel: 'info'
  })

  p2pwire.on('created', nodeAddress => {
    console.log(`Created - my nodeAddress: `, nodeAddress)
  })

  p2pwire.on('nodeConnected', (nodeAddress, nodeData) => {
    console.log(`Connected to node: `, {
      nodeAddress,
      nodeData
    })

    // send a message to remote node
    const dt = new Date()
    const message = {
      title: 'Hello from ' + p2pwire.nodeAddress,
      from: p2pwire.nodeAddress,
      dt
    }
    p2pwire.sendMessage(nodeAddress, message)
  })

  p2pwire.on('nodeDisconnected', nodeAddress => {
    console.log(`Disconnected from node: `, {
      nodeAddress
    })
  })

  p2pwire.on('linksUpdate', links => {
    console.log(`Links update received: `, links)
  })

  p2pwire.on('receiveMessage', (remoteNodeAddress, message) => {
    console.log('Received a message from: ', remoteNodeAddress)
    console.log('Message: ', JSON.stringify(message, null, 2))
  })
}
