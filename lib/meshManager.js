const { uniqWith, isEqual, pipe, curry, remove } = require('lodash/fp')
const EventBus = require('./eventBus')
const Store = require('./store')

class MeshManager {
  constructor () {
    if (!MeshManager.instance) {
      MeshManager.instance = this

      this.links = []
    }

    return MeshManager.instance
  }

  registerLinks (nodeAddress, links) {
    this.links = pipe(
      this._getArrayOfLinks,
      curry(this._createLinkObjects)(nodeAddress),
      newLinks => [...this.links, ...newLinks],
      curry(uniqWith)(isEqual)
    )(links)

    this._emitLinksUpdate()
  }

  updateRemoteLinks (remoteNodeAddress, links) {
    const cleanedLinks = this._cleanIncomingLinksBasedOnDirectConnections(
      remoteNodeAddress,
      links
    )
    this._removeLinksFrom(remoteNodeAddress)
    this.registerLinks(remoteNodeAddress, cleanedLinks)
  }

  _removeLinksFrom (remoteNodeAddress) {
    this.links = remove(link => link.a === remoteNodeAddress, this.links)
  }

  _cleanIncomingLinksBasedOnDirectConnections (remoteNodeAddress, links) {
    return links.filter(
      link =>
        link.includes(remoteNodeAddress) ||
        !this._linkContainsDirectNodes(link, Store.directNodesConnected)
    )
  }

  _linkContainsDirectNodes (link, directNodes) {
    return link.some(l => directNodes.includes(l))
  }

  removeAllLinksRelatedTo (remoteNodeAddress) {
    this._removeLinksFrom(remoteNodeAddress)

    this.links = remove(
      link =>
        link.a === Store.nodeAddress && link.l.includes(remoteNodeAddress),
      this.links
    )

    this._emitLinksUpdate()
  }

  getLinks () {
    return this.links
  }

  getFlatLinks () {
    return pipe(this._extractLinks, curry(uniqWith)(isEqual))(this.links)
  }

  _getArrayOfLinks (links) {
    if (links.constructor !== Array || links.length === 0) {
      LogManager.logWarning(
        'MESH_MANAGER - received malformed array of links: ',
        links
      )

      throw new Error(
        'Cannot process links. It must be an array of addresses or an array of links.'
      )
    }

    return typeof links[0] === 'string' ? [links] : links
  }

  _createLinkObjects (nodeAddress, links) {
    return links.map(link => ({ a: nodeAddress, l: link.sort() }))
  }

  _extractLinks (links) {
    return links.map(link => link.l)
  }

  _emitLinksUpdate () {
    process.nextTick(() => EventBus.emit('linksUpdate', this.getFlatLinks()))
  }
}

const instance = new MeshManager()
module.exports = instance
