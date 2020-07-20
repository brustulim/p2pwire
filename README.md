# p2pwire

> I know a guy who knows a guy...

## WIP - A distributed and anonymous network running directly in your browser (and nodejs)

YES! no installation, no plugins, no manual operations... just enter an address in your browser and navigate!

Click here to view a running example: [https://brustulim.github.io/p2pwire-playground](https://brustulim.github.io/p2pwire-playground/)

## Important!

This is a WIP project, many parts will be changed and some are just ideas at this moment. Do not use this library in a production or serious project/product.
The unit tests are not implemented yet because it is a draft. When the core functionalities are stable the unit tests will be created.

## How p2pWire (will) work?

The p2pWire library create a overlay network above the internet through WebRTC. The library is responsible for connect the browsers creating a distributed network where resources like websites, web services, file sharing, realtime video and audio could be hosted and consumed by any node.

// TODO: Add details about nodes discovering, resources database, swarms, two hand anonymous access, key pair security, distributed hosting, etc.

## What is WebRTC?

https://webrtc.org/

// TODO: add a description of webRTC here

## Installation

There are 3 ways to install p2pWire:

#### Local file in your project:

Download the file [p2pwire.min.js](https://github.com/brustulim/p2pwire/blob/master/p2pwire.min.js), add it to your project folder and add a script tag into your html pointing to p2pwire:

```html
<script src="p2pwire.min.js"></script>
```

#### Hosted in a CDN:

[![](https://data.jsdelivr.com/v1/package/npm/p2pwire/badge)](https://www.jsdelivr.com/package/npm/p2pwire)

Just add a script tag pointing to a CDN :

```html
<script src="https://cdn.jsdelivr.net/npm/p2pwire@latest/p2pwire.min.js"></script>
```

#### Install as a npm dependency:

```bash
npm install p2pwire --save
```

## Usage example

#### html/js:

As described above, you can import from a CDN, download the p2pwire.min.js or build it locally from the source code.

```html
<html>
  <head>
    <title>p2pWire - Simple example of use</title>
    <!-- use from cdn -->
    <script src="https://cdn.jsdelivr.net/npm/p2pwire@latest/p2pwire.min.js"></script>
    <!-- use from local p2pWire.min.js  -->
    <!-- <script src="../p2pwire.min.js"></script> -->

    <script>
      var p2pwire = new P2PWire();

      p2pwire.on("created", (nodeAddress) => {
        document.querySelector(".myAddress").innerHTML =
          "<h2>My address: " + nodeAddress + "</h2>";
      });

      p2pwire.on("nodeConnected", (nodeAddress, nodeData) => {
        console.log("Connected to node: ", { nodeAddress, nodeData });

        // send a message to remote node
        const dt = new Date();
        const message = {
          title: "Hello from " + p2pwire.nodeAddress,
          from: p2pwire.nodeAddress,
          dt,
        };
        p2pwire.sendMessage(nodeAddress, message);
      });

      p2pwire.on("nodeDisconnected", (nodeAddress) => {
        console.log("Disconnected from node: ", { nodeAddress });
      });

      p2pwire.on("receiveMessage", (remoteNodeAddress, message) => {
        let newParagraph = document.createElement("p");
        newParagraph.innerHTML =
          "Received a message from - <B>" +
          remoteNodeAddress +
          "</B>: <br>" +
          JSON.stringify(message, null, 2);
        document.querySelector(".messages").appendChild(newParagraph);
      });

      p2pwire.on("linksUpdate", (links) => {
        const linksTable = links.map(
          (link) => link[0] + " -> " + link[1] + "<br>"
        );
        document.querySelector(".linksTable").innerHTML = linksTable;
      });
    </script>
  </head>

  <body>
    <div>
      <h2>Welcome to the p2pWire network</h2>
      <div class="myAddress"></div>
      <br />
      <h2>Links</h2>
      <div class="linksTable"></div>
      <br />
      <br />
      <h2>Messages</h2>
      <div class="messages"></div>
    </div>
  </body>
</html>
```

#### node js:

To use p2pWire in nodejs you must install the 'wrtc' library and inform it as a parameter to P2PWire constructor.

> The WebRTC was developed to be used in browsers, but the package [wrtc](https://www.npmjs.com/package/wrtc) brings this functionality to nodejs applications.
> The package was not added directly into p2pWire dependencies to keep the package as smaller as possible and because it is necessary only outside of the web browser.
> For more details check the project page: https://www.npmjs.com/package/wrtc

first, install dependencies:

```bash
npm install p2pwire --save
npm install wrtc --save
```

node js example:

```javascript
const wrtc = require("wrtc");
// use from npm
const P2PWire = require("p2pwire");
// use from source code
// const P2PWire = require("../p2pwire/index.js")

startNetwork();

function startNetwork() {
  var p2pwire = new P2PWire({
    wrtc,
  });

  p2pwire.on("created", (nodeAddress) => {
    console.log(`Created - my nodeAddress: `, nodeAddress);
  });

  p2pwire.on("nodeConnected", (nodeAddress, nodeData) => {
    console.log(`Connected to node: `, {
      nodeAddress,
      nodeData,
    });

    // send a message to remote node
    const dt = new Date();
    const message = {
      title: "Hello from " + p2pwire.nodeAddress,
      from: p2pwire.nodeAddress,
      dt,
    };
    p2pwire.sendMessage(nodeAddress, message);
  });

  p2pwire.on("nodeDisconnected", (nodeAddress) => {
    console.log(`Disconnected from node: `, {
      nodeAddress,
    });
  });

  p2pwire.on("linksUpdate", (links) => {
    console.log(`Links update received: `, {
      links,
    });
  });

  p2pwire.on("receiveMessage", (remoteNodeAddress, message) => {
    console.log("Received a message from: ", remoteNodeAddress);
    console.log("Message: ", JSON.stringify(message, null, 2));
  });
}
```

### More examples:

Other examples like a nodeJS console application and other html examples could be checked in:

[p2pWire playground repository](https://github.com/brustulim/p2pwire-playground)

# Development control

As a WIP, there is a lot of things to be implemented, refactored, changed, defined and even "discovered". Then this part of read.me will be dedicated to keep the ideas and next steps of development aboveboard.

### Definition of resources in p2pwire:

Resources are any service or content that can be shared or disponibilized through the p2pwire network, like:

- websites
- web services
- rpc (remote procedure call)
- file sharing
- audio and video streaming

## Requirements:

- Run directly in browser, without plugins or complex configurations
- Run (maybe with some limitations) in mobile browsers on smartphones, smartTVs, boxTV, personal assistants (amazon Alexa, google home, etc.)
- Run on any application developed using nodejs, like background services, desktop applications server side applications, SPAs, mobile apps
- Allow anonymous communication when desired by node
- Allow resources to be hosted directly by any node
- Allow resources to be replicated, distributed and shared in a decentralized way
- Allow resources to be hosted and consumed anonymously

## Next Steps:

- [x] Separate library from the html example and post the p2pWire lib to NPM and minimized version to a CDN
- [x] Introduce a Event Bus to simplify the events dispatch and listeners on the application
- [x] Create a log util that show message in the console and dispatch events to debug as html in the browsers that have no console options like smart tvs and amazon echo show
- [ ] Introduce resources sharing. get items directly or get a descriptor with a list of resources.
- [ ] Introduce media stream.
- [ ] Introduce public an private keys cryptography to all packages.
- [ ] Take a picture with many devices connected to p2pWire: laptop, android smartphone, android boxTv, amazon echo show, raspberry Pi, samsung smart TV (anything more?)
- [ ] Create an windows/mac/linux service that keeps p2pWire running fulltime
- [ ] Create an android service that keeps p2pWire running fulltime
- [ ] Create a direct communication between a node and a p2pWire, to use its connections, cache, etc. It will improve speed and storage capacity when user has a service running somewhere
- [ ] Implement an eventQueue for connections with prioritization for local nodes messages

## Modules / Thanks!

| module                            | description                                                       |
| --------------------------------- | ----------------------------------------------------------------- |
| [simple-peer][simple-peer]        | Simplify the webrtc use                                           |
| [bittorrent-tracker][simple-peer] | Bittorrent tracker client. Used to find the first node to connect |
| [tweetnacl][tweetnacl]            | Cryptographic library                                             |

[simple-peer]: https://github.com/feross/simple-peer
[bittorrent-tracker]: https://github.com/webtorrent/bittorrent-tracker
[tweetnacl]: https://github.com/dchest/tweetnacl-js

### License

MIT. Copyright (c) [Herminio Brustulim](https://github.com/brustulim).
