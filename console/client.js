/*
Trying to run direct from node, but cannot connect to bittorrent tracker through webrtc
// import TorrentWeb from '../lib/torrentweb'
var TorrentWeb = require('../lib/torrentweb')

var torrentWeb = new TorrentWeb({
  debugMode: true

})
console.log('torrentWeb', torrentWeb)
*/
const chromeLauncher = require('chrome-launcher')
const CDP = require('chrome-remote-interface');

(async function () {
  async function launchChrome () {
    return chromeLauncher.launch({
      chromeFlags: ['--disable-gpu', '--headless'],
      logLevel: 'verbose'
    })
  }
  const chrome = await launchChrome()
  console.log(`Chrome debugging port running on ${chrome.port}`)

  const protocol = await CDP({
    port: chrome.port
  })

  const { DOM, Page, Runtime, Console } = protocol
  await Promise.all([
    Page.enable(),
    Runtime.enable(),
    DOM.enable(),
    Console.enable()
  ])

  Console.messageAdded((result) => {
    console.log(result.message.level + ' - ' + result.message.text)
  })

  Page.navigate({
    url: 'file:///Users/brustulim/projects/torrentweb/index.html'
  })

  Page.loadEventFired(console.log)
})()
