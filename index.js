"use strict"
const TorrentWeb = require('./lib/torrentweb')

var torrentWeb = new TorrentWeb({ debugMode: true })
var result =  torrentWeb.calc(2,5)

document.getElementById('response').innerHTML = `The result is: ${result}`;