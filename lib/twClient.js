'use strict'
import { box } from 'tweetnacl'
import { encode } from 'bs58check'
import { EventEmitter } from 'events'
var Client = require('bittorrent-tracker')

/**
 * - NP - Encontrar endereço externo com stun
 * - Encontrar club livre e acessar - via tracker
 *   - socio announce torrent (é seeder)
 *   - candidato procura download
 *   - assim não arrisca dois clubes (socios) se connectarem ou dois clientes
 * - https://github.com/webtorrent/bittorrent-tracker
 * - OUTRA IDEIA - como dependeremos de torrent (tracer só acha, não conecta), vamos para uma idéia onte é diretamente relacionado a torrents para encontrar e conectar peers
 *
 * -----------------------------------------------
 * - Cada club tem um endereço torrent
 * - Quando o clube tem vagas, ele escuta um endereço central (podemos migrar para vários, para ter mais portas de entrada... tipo um DHT)
 * - Ele tem vagas se tem até de 10* socios ou 12 candidatos
 * - O ultimo socio a entrar é o responsável por escutar novos sócios (seed do hash do club)
 *   - se o ultimo sócio sai, o anterior assume o papel e consecutivamente
 *   - talvez possamos mudar sempre para o 3o ou 4o, para evitar clientes que conectam e saem rápido ficarem nesse papel
 * - Cada sócio se conecta a outro club
 *   - podemos ter um torrent com ofertas de vaga de conexão com clubes, onde cada cliente do clube deve acessar e achar um clube ainda não ligado ao seu
 *   - talvez não precise que todos se conectem a outro clube... pensar em quantos são necessários
 * - O club sempre tem 2* socios gestores responsáveis por manter os socios sincronizados com os dados do club
 *   - se um socio sai, assume o proximo da fila de sócios (sequencial por entrada no club)
 *   - para se conectar aos gestores, os socios consomem um torrent onde os gestorres são seeders e os socios downloaders
 *   - pensar em uma forma de algum sócio não autorizado se tornar seeder do torrent de sócios
 *   - pensar em o que fazer se os dois gestores sairem ao mesmo tempo (talvez ter 3? ter suplentes previamente conectados?)
 * - O clube mantem listas compartilhadas entre os socios, gerida pelos gestores
 * - OUTRA IDEIA - vendo que o clube trafegará apenas sinalização, descoberta e roteamento (não trafega dados em si), e que o socio conectará diretamente ao provedor de dados que quiser consumir
 *     - e levando em conta que o "limite" de conexões por peer em algo na faixa de 250 conexões
 *     - podemos ao invés de gerenciar tooodos esse conecta e desconecta, baseado em papeis... ter uma mesh entre todos os 10* socios
 *     - isso facilita a troca de gestores e fica menos vulnerável a saídas em massa em grupos
 *
 * -----------------------------------------------
 * - Cada club tem um endereço torrent
 * - Todos os socios se interligam via uma rede mesh, facilitando a troca de gestores e comunicação com outros grupos
 * - Quando o clube tem vagas, ele escuta um endereço central global (podemos migrar para vários, para ter mais portas de entrada... tipo um DHT)
 *   - Ele tem vagas se tem até de 10* socios ou 12* candidatos
 *   - O ultimo socio a entrar é o responsável por escutar novos sócios (seed do hash do club)
 *   - se o ultimo sócio sai, o anterior assume o papel e consecutivamente
 *   - talvez possamos mudar sempre para o 3o ou 4o, para evitar clientes que conectam e saem rápido ficarem nesse papel
 *   - quando um novo sócio entra, quem o recebeu faz o signaling para conectá-lo aos demais
 * - Cada sócio se conecta a um outro club
 *   - podemos ter um torrent com ofertas de vaga de conexão com clubes, onde cada socio do clube deve acessar e achar um clube ainda não ligado ao seu
 *   - talvez não precise que todos se conectem a outro clube... pensar em quantos são necessários
 * - O club sempre tem 2* socios gestores responsáveis por manter os socios sincronizados com os dados do club
 *   - se um socio gestor sai, assume o proximo da fila de sócios (sequencial por entrada no club)
 *   - como é uma mesh, todos socios já estão conectados aos gestores (e aos próximos em caso de queda)
 *   - pensar em o que fazer se os dois gestores sairem ao mesmo tempo (como validar em grupo quem será o gestor?)
 * - O clube mantem listas compartilhadas entre os socios, gerida pelos gestores
 *   - lista de socios, ordenada por sequencia de entrada
 *   - lista de clubes conectados + socio responsável (cada socio falará com um clube)
 *   - talvez lista de clubes conectados com vagas disponíveis
 *   - ???
 * - ??? Proteção contra crawling
 *   - Clientes que entram e saem muito rápido, são mandados para uma "lista negra": LN
 *   - O cliente permanece por um tempo na LN (1* min?)
 *   - Se outro grupo manda esse mesmo cliente para a LN antes de acabar seu TTL sua pontuação aumenta e o TTL tbém
 *   - Quanto mais grupos mandam esse cliente para a LN, mais pontuado ele fica
 *   - Gupos podem monitorar essa lista e não aceitar esses clientes
 *   - Quando tivermos um DB, podemos manter nele a lista
 *   - Podemos usar um esquema de validação dos avisos, onde N outros grupos tem que acessar o grupo delator e confirmar que ele existe
 * - ??? Tamanho de grupo varia conforme cliente
 *   - mobile, grupos de 10*
 *   - computadores, grupos de 20*
 *   - serviços, grupos de 30*
 * - ??? Não ter gestores
 *   - decisões são tomadas em grupo, via votação. ações só são tomadas se tiver 80% de aprovação
 *   - decisões são baseadas em regras globais da rede, ou seja, se algum socio estiver corrompido, ele será vencido
 *   - ??? socios que votam diferente ou não votam, vão para a LN do clube (funciona igual LN global)
 *   - ??? 2* pontos na LN perde o direito de voto até o TTL, mais pontos, pode ser expulso e vai para a LN global.
 *   - por exemplo:
 *     - recepcionista apresenta novo socio, todos votam se ele entra no clube
 *     - se chega uma solicitação de roteamento, todos votam no socio que assumirá o papel (que vai abrir o tunnel de mensagens)
 *     - se cair o numero de sócios, todos votam em qual sócio será o recepcionista
 * - ??? LN global pode ser 2* niveis a partir do clube
 *   - cada socio manda para seu DT, com contador 1
 *   - cada socio que recebe um aviso de LN, avisa o clube, que manda para o 2o nivel (com contador em 2) se o contador for 1
 *   - assim, 1 grupo manda para 10 grupos que manda para mais 10, atingindo aproximadamente 1000 usuarios 10 * 10 * 10
 *   - ??? mandar 3 ou 4 niveis.... atingindo 10 * 10 * 10 * 10 * 10 = 100.000 users
 *  - ??? Pesquisa de recursos pode seguir mesmo esquema de propagação da LN
 *   - caminho de volta pode ir sendo adicionado à mensagem
 *   - se um peer/clube tem a resposta (endereço de alguem que tem), manda o endereço e caminho via o caminho de volta que foi sendo guardado
 *   - cada um criptografando sua parte, para o resto da rede não poder "trackear"
 *
 * - ??? Pensar em uma forma dessas conexões ocorrerem como um DHT onde as conexões entre clubes e peers siga uma regra baseada em endereções, facilitando achar recursos/peers
 *
 * - TORRENTS DA REDE:
 *   - VT - Clubes com vagas disponíveis
 *   - DT - Clubes com dentritos livres
 *
 * - TODO:
 * - >>>>> SOCIO
 * - connecta como cliente em VT
 * - se conecta a um socio recepcionista de um clube
 * - cria um OFFER e manda para o recepcionista
 * - aguarda answer e se conecta a cada socio
 * - pede as tabelas para os gestores
 * - procura um clube em DT, se conecta a um que ainda não está ligado no seu clube
 * - se não encontrar, tenta novamente em 60* segundos
 * - ao conectar avisa um gestor para que ele coloque o DT na lista e mande para os socios
 *
 * TODO DEV:
 * - modulo de entrada na rede
 *   - instancia o Client
 *   - gera um offer
 *   - se conecta como downloader a um torrent de entrada VT
 *   - no handshake, passa seu offer informando que quer entrar na rede
 *   - escuta os answers e se conecta aos socios
  *   - fecha o torrent VT
 *   - aguarda o CDB e armazena
 *   - inicia escuta de CDB change
 *   - inicia escuta de offers (novos membros)
 *
 */

class TWClient extends EventEmitter {
  constructor () {
    super()
    this.mainAddress = 'A28qimnfJYoRjs6Fxon4fWfjGmjvKED5CxboyUEbuxdvtNRqe'

    this.keyPair = box.keyPair()
    // this.address = encode(Buffer.from(this.keyPair.publicKey))
    this.address = encode(Buffer.from(this.keyPair.publicKey)).substring(0, 20)
    this.peerId = this.keyPair.publicKey
    console.log('address:', this.address)
    console.log('keyPair:', this.keyPair)

    var requiredOpts = {
      infoHash: this.mainAddress,
      peerId: this.peerId,
      // peerId: this.address,
      // infoHash: new Buffer.from('08ada5a7a6183aae1e09d831df6748d566095a10', 'hex'), // hex string or Buffer
      // peerId: new Buffer.from('01234567890123456789'), // hex string or Buffer
      announce: [
        'wss://tracker.openwebtorrent.com',
        'wss://tracker.btorrent.xyz/'
      ]
      // announce: [], // list of tracker server urls
      // port: 6881 // torrent client port, (in browser, optional)
    }
    console.log('TWClient -> constructor -> requiredOpts', requiredOpts)

    this.client = new Client(requiredOpts)

    this.client.on('error', function (err) {
      // fatal client error!
      console.log('ERROR: ', err)
    })

    this.client.on('warning', function (err) {
      // a tracker was unavailable or sent bad data to the client. you can probably ignore it
      console.log('WARNING->: ', err)
    })

    // start getting peers from the tracker
    this.client.start()

    this.client.on('update', function (data) {
      console.log('TWClient -> constructor -> data', data)
      console.log('got an announce response from tracker: ' + data.announce)
      console.log('number of seeders in the swarm: ' + data.complete)
      console.log('number of leechers in the swarm: ' + data.incomplete)
    })

    // this.client.on('')

    this.client.on('peer', (peer) => this.onPeer(peer))
    /*
    this.client.on('peer', function (peer) {
      if (!peer) {
        console.log('NOT addr')
        return
      }
      // console.log('found a peer: ', typeof peer, JSON.parse(JSON.stringify(peer))) // 85.10.239.191:48623
      console.log('found a peer: ', this.address, peer) // 85.10.239.191:48623

      peer.on('error', (err) => console.log('peer - error', err))

      peer.on('signal', (data) => {
        console.log('peer - SIGNAL', JSON.stringify(data))
      })

      peer.on('connect', () => {
        peer.send('Hey Pal! Here ' + this.address + ' contacting you!')
      })

      peer.on('data', (data) => {
        console.log('data: ' + data)
      })
    })
    */

    // announce that download has completed (and you are now a seeder)
    // this.client.complete();

    // force a tracker announce. will trigger more 'update' events and maybe more 'peer' events
    this.client.update()
  }

  onPeer (peer) {
    if (!peer) {
      console.log('NOT addr')
      return
    }
    // console.log('found a peer: ', typeof peer, JSON.parse(JSON.stringify(peer))) // 85.10.239.191:48623
    console.log('found a peer: ', this.address, peer) // 85.10.239.191:48623

    peer.on('error', (err) => console.log('peer - error', err))

    peer.on('signal', (data) => {
      console.log('peer - SIGNAL', JSON.stringify(data))
    })

    peer.on('connect', () => {
      peer.send('Hey Pal! Here ' + this.address + ' contacting you!')
    })

    peer.on('data', (data) => {
      console.log('data: ' + data)
    })
  }
}

export default TWClient
