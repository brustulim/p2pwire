const { uniqWith, isEqual, pipe, curry, remove, filter } = require('lodash/fp')
const EventBus = require('../eventBus')
const Store = require('../store')

class MeshManager {
  constructor () {
    if (!MeshManager.instance) {
      MeshManager.instance = this

      this.flatLinks = []
      this.mesh = []
    }

    return MeshManager.instance
  }

  registerLinks (remoteNodeAddress, links) {
    this.mesh = pipe(
      this._getArrayOfLinks,
      curry(this._createLinkObjects)(remoteNodeAddress),
      newLinks => [...this.mesh, ...newLinks],
      curry(uniqWith)(isEqual)
    )(links)

    this._updateFlatLinks()
  }

  updateRemoteLinks (remoteNodeAddress, links) {
    const cleanedLinks = this._cleanIncomingLinksBasedOnDirectConnections(
      remoteNodeAddress,
      links
    )
    this._removeLinksFrom(remoteNodeAddress)
    this.registerLinks(remoteNodeAddress, cleanedLinks)
  }

  _updateFlatLinks () {
    const updatedLinks = pipe(
      this._extractLinks,
      curry(uniqWith)(isEqual)
    )(this.mesh)

    const addedLinks = updatedLinks.filter(
      link => !this.flatLinks.some(curr => isEqual(curr, link))
    )
    const removedLinks = this.flatLinks.filter(
      link => !updatedLinks.some(updatedLink => isEqual(link, updatedLink))
    )

    const addedNodes = updatedLinks
      .flat()
      .filter(peer => !this.flatLinks.flat().includes(peer))
    const removedNodes = this.flatLinks
      .flat()
      .filter(peer => !updatedLinks.flat().includes(peer))

    this.flatLinks = updatedLinks

    process.nextTick(() => {
      EventBus.emit('linksUpdate', {
        addedNodes,
        removedNodes,
        addedLinks,
        removedLinks
      })
      EventBus.emit('linksTableChanged', this.flatLinks)
    })
  }

  _removeLinksFrom (remoteNodeAddress) {
    this.mesh = remove(link => link.a === remoteNodeAddress, this.mesh)
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

    this.mesh = remove(
      link =>
        link.a === Store.nodeAddress && link.l.includes(remoteNodeAddress),
      this.mesh
    )

    this._updateFlatLinks()
  }

  getLinks () {
    return this.mesh
  }

  getFlatLinksToShare (remoteNodeAddress) {
    return pipe(
      filter(link => link.a !== remoteNodeAddress),
      this._extractLinks,
      filter(link => !link.includes(remoteNodeAddress)),
      this._addFlatDirectLinks.bind(this),
      curry(uniqWith)(isEqual)
    )(this.mesh)
  }

  _addFlatDirectLinks (links) {
    return [...this._getFlatDirectLinks(), ...links]
  }

  _getFlatDirectLinks () {
    return pipe(
      filter(link => link.a === Store.nodeAddress),
      this._extractLinks
    )(this.mesh)
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
}

const instance = new MeshManager()
module.exports = instance
