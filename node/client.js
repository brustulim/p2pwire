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

// /Users/brustulim/projects/torrentweb/index.html

(async function () {
  async function launchChrome () {
    return chromeLauncher.launch({
      chromeFlags: ['--disable-gpu', '--headless'],
      // chromeFlags: ['--disable-gpu'],
      logLevel: 'verbose'
    })
  }
  const chrome = await launchChrome()
  console.log(`Chrome debugging port running on ${chrome.port}`)

  const protocol = await CDP({
    port: chrome.port
  })
  // ALL FOLLOWING CODE SNIPPETS HERE

  const { DOM, Page, Emulation, Runtime, Console } = protocol
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
    // url: 'https://en.wikipedia.org/wiki/SitePoint'
    url: 'file:///Users/brustulim/projects/torrentweb/index.html'
  })

  // Page.loadEventFired(async () => {
  //   const script1 = "document.querySelector('p').textContent"
  //   // Evaluate script1
  //   const result = await Runtime.evaluate({
  //     expression: script1
  //   })
  //   console.log('result:', result.result.value)

  //   protocol.close()
  //   chrome.kill()
  // })
  Page.loadEventFired(console.log)
})()
