# TorrentWeb

## WIP - An anonymous and decentralized network running directly in your browser 
YES! no installation, no plugins, no manual operations... just enter an address in your browser and navaigate!

## milestones

- implementar a descoberta de outros nodes via tracker (DHT não é possível em webrtc)

- implementar a comunicação entre nodes através de packets criptografados

- implementar uma forma de dht 
    - por enquanto os nodos terão acesso direto aos demais, através de um torrent em comum
    - por enquanto, os materiais compartilhados (sites, arquivos, serviços) serão encontrados via tracker, mas deverá mudar para encontrar via DHT
    - quanfo tivermos um dht, podemos ter um modo misto, onde recursos (nodes e materiais) podem ser encontrados tanto via tracker quando dht... tracker é mais rápido, mas DHT garante o funcionamento mesmo se nenhum tracker estiver disponível


## proximos passos

- [X] Criar um boilerplate que possa ser aberto no browser, tenha a lib em um pasta e já use o browserify para consumi-la.
- [ ] Implementar o const bitnet = Bitnet(), que automaticamente procura outros peers
- [ ] Implementar o uso de ES6 e standardJS
- [ ] Implementar o generatePacket() para gerar um pacote de comunicação no padrão da bitnet
- [ ] Implementar a infraestrutura basica para enviar e receber um pacote
- [ ] Implementar a geração de chaves com um prefixo - isso dificultará a geração de endereços em lote (tipo de proof of work básico) 
- [ ] Implementar a validação dos pacotes recebidos via chave do remetente e chave propria, só aceitar chamadas de endereços com prefixo da rede.
- [ ] Gerar um torrent que será o endereço central da rede... que será usado para que os peers se encontrem. estudar forma de gerá-lo com um prefixo: https://www.gkbrk.com/2018/04/generating-vanity-infohashes-for-torrents/

- NNN Implementar o DHT para encontrar outros peers da torrentWeb (DHT não funciona no browser!)

## Como provavelmente funcionará? (ideias, brainstorm)

- Funcionará diretamente no browser, mas criarei tbém uma versão que rodará como serviço na máquina, o que agilizará o acesso e permitirá a hospedagem de sites e serviços de uma forma mais profissional.

- O anonimato se dará através da chamada e resposta passando por vários peers, onde cada peer só conhecerá quem lhe passou o pacote e qual o próximo peer, pois os dados, assim como proximos saltos e caminho de volta, estarão criptografados em camadas.

- O atributo nextPeer será sempre criptografado com preenchimento de dados, para que tenha sempre o mesmo tamanho, independente de quantas rotas o compõe (se tem mais 1 salto ou 10, não tem como saber)

- Será possível o acesso direto a um recurso, caso não seja necessária privacidade do IP externo, para isso, basta chamar direto o peer de destino (o next peer ficará em branco) e entregar o proprio endereço como peer de retorno.

- Somente o peer de destino saberá o caminho de retorno (primeiro salto), pois encontra-se dentro da mensagem, criptografada com sua chame publica.

- A rota de retorno poderá passar por um caminho diferente do que o da da chamada de solicitação.

- Quando um peer recebe um pacote, ele checa se o proximo peer está respondendo e então aceita a conexão... senão informa que o caminho foi quebrado. Uma vez conectado ao próximo ele conecta um stream entre os dois, permitindo os dados fluirem. 

- Deve ter um gerador de "endereços", ou seja, gerador de keypair (nacl, provavelmente), já que a chave publica será usada como endereço. Pesquisar se existe uma forma de criar um keypair onde a publica tenha um prefixo, como bn01, bn02, onde bn01 seriam peers, bn02 sites, bn03 caminhos... (pensar melhor)
    - Poderiamos usar força bruta, já que o nacl é bem rápido... e isso ainda serviria como proof of work, limitando a criação de sites e peers em lotes gigantes...
    - Um recurso precisa ter o endereço/chave com prefixo, porem os filhos não.

- Existirá um endereço central... um torrent... que será a forma dos peers se encontrarem, buscando em trackers, magnet link ou DHT... ou seja... nodos que tem esse torrent provavelemente estão na bitnet.

- Cada endereço é um "grupo" através do qual, via tracker ou DHT você consegue saber quem mais tem esse conteúdo.
    - O masterAddress é um grupo tbém, onde encontrando alguem que o tenha, vc entra na rede e acha qq coisa

## Requisitos:

- Deve rodar 100% no browser, sem instalações extras, plugins
- Deve permitir aos nodos se comunicarem sem a necessidade de um servidor central (pode usar trackers, mas deve funcionar sem tbém)
- Deve permitir expor um webservice ou site hospedado localmente
- Deve permitir a criação de rotas de saída e chegada passando por vários hosts
- Deve permitir o acesso ou a disponibilização de sites e serviços de forma anônima


## Bibliotecas:

### webtorrent 
- Implementação do protocolo bitTorrent usando javascript e com suporte a WebRTC (além dos outros protocolos)

### webtorrent-dht
- Implementação do algoritmo de roteamento/descoberta DHT em javascript 

### tweetnacl
- Biblioteca javascript para critografia (muito rápida)

### bencode
- Biblioteca javascript para encode e decode de packets bitTorrent


## Interface *bnPacket*
Modelo dos dados trocados entre os nodes:
```javascript
// conteúdo padrão dos pacotes que trafegarão na rede

{
    peerAddress: '123.123.123.123',
    peerPort: 8882,
    peerId: 'abc_peer_A_address_public_key',
    nextPeer: 'encripted data with the all next jumps to the destination', // mesma estrutura com o proximo salto e mais um nextPeer encriptado com a chave 'abc_peer_A_address_public_key'... ele consegue saber o proximo node, mas não o outro
    nextPeerExemploDecriptado: {
        peerAddress: '222.123.123.212',
        peerPort: 12000,
        peerId: 'xyz_peer_B_address_public_key',
        nextPeer: 'encripted data with the all next jumps to the destination' // mesma estrutura com o proximo salto e mais um nextPeer encriptado.
    },
    message: 'encripted data', //contem os dados enviados, caso seja 
    messageExemploDecriptado: {
        backRoute: {
            peerAddress: '211.212.112.112',
            peerPort: 7000,
            peerId: 'vbn_peer_C_address_public_key',
            nextPeer: 'encripted data with the all next jumps to return to the source' // Caminho de retorno dos dados solicitados.
        },
        data: 'the content itself... the value sent from originator'
    }
}
```

## Used packages - thanks
Some are not entirely used, but some parts, ideas, study material, etc.
- webtorrent
- 
