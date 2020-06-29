# p2pwire

## WIP - An distributed and anonymous network running directly in your browser 
YES! no installation, no plugins, no manual operations... just enter an address in your browser and navigate!

## Important!
This is a WIP project, many parts will be changed and some are just ideas at this moment. Do not use this library in a production or serious project/product.
The unit tests are not implemented yet because it is a draft. When the core functionalities are stable the unit tests will be created. 

## How p2pWire (will) work?
The p2pWire library create a overlay network above the internet through WebRTC. The library is responsible for connect the browsers creating a distributed network where resources like websites, web services, file sharing, realtime video and audio could be served and consumed by any node.

// TODO: Add details about nodes discovering, resources database, swarms, two hand anonymous access, key pair security, distributed hosting, etc.

## What is WebRTC?
// TODO: add a description of webRTC here

## Install 
There are 3 ways to install p2pWire:

#### Local file in your project:
Download the file [p2pwire.min.js](https://github.com/brustulim/p2pwire/blob/master/p2pwire.min.js), add it to your project folder and add a script tag in your html pointing to p2pwire:
```html
<script src="p2pwire.min.js"></script>
```

#### Hosted in a CDN:
Just add a script tag pointing to a CDN:
```html
<script src="https://cdn.jsdelivr.net/npm/p2pwire@latest/p2pwire.min.js"></script>
```

#### Instal as a npm dependency:
```bash
npm install p2pwire --save
```


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
- Must have a javascript library, allowing any application like background services, desktop applications server side applications, mobile apps to communicate with the network
- Allow anonymous communication when desired by node
- Allow resources to be hosted directly by any node
- Allow resources to be replicated, distributed and shared in a decentralized way
- Allow resources to be hosted anonymously

## Next Steps:
- [X] Separate library from htm example and post the p2pWire lib to NPM and minimized version to some CDN
- [ ] Create a log util that show message in the console and dispatch events to debug as html in the browsers that have no console options like smart tvs and amazon echo show
- [ ] Take a picture with many devices connected to p2pWire: laptop, android smartphone, android boxTv, amazon echo show, raspberry Pi, samsung smart TV (anything more?)
- [ ] Create an windows/mac/linux service that keeps p2pWire running fulltime
- [ ] Create an android service that keeps p2pWire running fulltime
- [ ] Create a direct communication between a node and a p2pWire, to use its connections, cache, etc. It will improve speed and storage capacity when user has a service running somewhere
- [ ] Implement an eventQueue for connections with prioritization for local nodes messages

## Modules:
| module | description |
|---|---|
| [simple-peer][simple-peer] | Simplify the webrtc use 
| [tweetnacl][tweetnacl] | Cryptographic library

[simple-peer]: https://github.com/feross/simple-peer
[tweetnacl]: https://github.com/dchest/tweetnacl-js

### License

MIT. Copyright (c) [Herminio Brustulim](https://github.com/brustulim).
