const { uniqWith, isEqual, pipe, curry, remove, filter } = require('lodash/fp')
const EventBus = require('./eventBus')
const Store = require('./store')

class MeshManager {
  constructor () {
    if (!MeshManager.instance) {
      MeshManager.instance = this

      this.links = []
      this.lolo = 'lolo'
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
    this.removeLinksFrom(remoteNodeAddress)
    this.registerLinks(links)
  }

  removeLinksFrom (remoteNodeAddress) {
    this.links = remove(link => link.a === remoteNodeAddress, this.links)
  }

  removeAllLinksRelatedTo (remoteNodeAddress) {
    this.removeLinksFrom(remoteNodeAddress)

    this.links = this.links.filter(
      link => link.a === Store.nodeAddress && link.l.includes(remoteNodeAddress)
    )

    console.log('removeu: ', this.links)

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
      console.log(
        `MeshManager -> removeAllLinksRelatedTo -> this.links`,
        this.links
      )
      console.log(
        `MeshManager -> removeAllLinksRelatedTo -> this.links`,
        this.links
      )
      console.log(
        `MeshManager -> removeAllLinksRelatedTo -> this.links`,
        this.links
      )
      console.log(
        `MeshManager -> removeAllLinksRelatedTo -> this.links`,
        this.links
      )
      console.log(
        `MeshManager -> removeAllLinksRelatedTo -> this.links`,
        this.links
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
