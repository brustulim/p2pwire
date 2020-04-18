# bitnet

## Como vai funcionar?

- Funcionará diretamente no browser, mas criarei tbém uma versão que rodará como serviço na máquina, o que agilizará o acesso e permitirá a hospedagem de sites e serviços de uma forma mais profissional

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

