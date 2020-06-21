'use strict'
import { pipe, map, get, isEqual, uniqWith } from 'lodash/fp'

class Store {
  constructor () {
    if (!Store.instance) {
      this.nodes = new Map()
      this.links = []
      this.linksSimplified = []

      Store.instance = this
    }

    return Store.instance
  }

  addLink (link) {
    if (!this.links.includes(link)) {
      console.log('Store -> addLink -> link', link)
      this.links.push(link)
    }
    // this.links = union(this.links, [link])
  }

  updateLinksSimplified () {
    this.links.map(it => {
      const link = get('l', it).sort()
      if (!this.linksSimplified.includes(link)) {
        this.linksSimplified.push(link)
      }
    })

    // this.linksSimplified = pipe(
    //   map((it) => get('l', it).sort()),
    //   uniqWith(isEqual)
    // )(this.links)
  }

  /*
  add - adiciona um item
  delete -  remove um item

  */
  // addNode (address, peerId, club) {
  //   const node = this.nodes.get(address) || { peerId }
  //   this.nodes.set(address, { ...node, t: Date.now() })
  // }
}

const instance = new Store()
// Object.freeze(instance)

export default instance
