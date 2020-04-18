# bitnet

## Como vai funcionar?

- Funcionará diretamente no browser, mas criarei tbém uma versão que rodará como serviço na máquina, o que agilizará o acesso e permitirá a hospedagem de sites e serviços de uma forma mais profissional.

- O anonimato se dará através da chamada e resposta passando por vários peers, onde cada peer só conhecerá quem lhe passou o pacote e qual o próximo peer, pois os dados, assim como proximos saltos e caminho de volta, estarão criptografados em camadas.

- O atributo nextPeer será sempre criptografado com preenchimento de dados, para que tenha sempre o mesmo tamanho, independente de quantas rotas o compõe (se tem mais 1 salto ou 10, não tem como saber)

- Será possível o acesso direto a um recurso, caso não seja necessária privacidade do IP externo, para isso, basta chamar direto o peer de destino (o next peer ficará em branco) e entregar o proprio endereço como peer de retorno.

- 


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
    nextPeer: 'encripted data with the all next jumps to the destination' // mesma estrutura com o proximo salto e mais um nextPeer encriptado com a chave 'abc_peer_A_address_public_key'... ele consegue saber o proximo node, mas não o outro
    nextPeerExemploDecriptado: {
        peerAddress: '222.123.123.212',
        peerPort: 12000,
        peerId: 'xyz_peer_B_address_public_key',
        nextPeer: 'encripted data with the all next jumps to the destination' // mesma estrutura com o proximo salto e mais um nextPeer encriptado.
    }
    message: 'encripted data' //contem os dados enviados, caso seja 
    messageExemploDecriptado: {
        backRoute: {
            peerAddress: '211.212.112.112',
            peerPort: 7000,
            peerId: 'vbn_peer_C_address_public_key',
            nextPeer: 'encripted data with the all next jumps to return to the source' // Caminho de retorno dos dados solicitados.
        },
        message
    }
}
```
