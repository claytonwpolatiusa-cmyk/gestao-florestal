# Guia operacional — Google Earth, polígonos e AppSheet

## Finalidade

> Este procedimento orienta a criação e o uso de talhões no fluxo **Google Earth → arquivo KML → armazenamento controlado → AppSheet**. Ele foi desenhado para preservar a rastreabilidade territorial e evitar o lançamento de tickets ou despesas na área errada.

O usuário pode desenhar cada talhão no Google Earth usando KML, KMZ, GeoJSON ou Shapefile compactado como formatos de origem. Para a camada de mapa do AppSheet, o resultado operacional deve ser um **KML leve** e com URL que o AppSheet consiga alcançar. O Google Earth suporta esses formatos de importação, enquanto o AppSheet exige KML hospedado para exibir limites e formas na Map View. [1] [2]

## Procedimento de cadastro

| Etapa | Ação obrigatória | Conferência antes de avançar |
|---|---|---|
| 1. Desenho | No Google Earth, crie ou revise um polígono individual para o talhão. Use um nome operacional inequívoco, como `PIN-07` ou `EUC-03`. | O desenho deve estar contido no limite autorizado da propriedade e não deve invadir APP, Reserva Legal ou área de terceiro. |
| 2. Exportação | Exporte o talhão como **KML**. Se o arquivo original for GeoJSON ou KMZ, conserve-o como origem técnica, mas gere também uma versão KML para o AppSheet. | O arquivo KML deve abrir corretamente no Google Earth e conter somente o recorte esperado. |
| 3. Simplificação | Reduza vértices e elementos desnecessários quando o arquivo estiver pesado. | Mantenha o KML obtido abaixo de **3 MB**; o AppSheet também limita o KML descompactado a 10 MB. [1] |
| 4. Hospedagem | Armazene o KML em uma pasta controlada no Google Drive, por exemplo `Gestão Florestal/Polígonos/KML`. | Defina a menor permissão que ainda permita ao AppSheet buscar o arquivo; teste o link sem depender de sessão administrativa. |
| 5. Cadastro | Na linha de `Talhoes`, preencha `CodigoTalhao`, `PropertyID`, espécie, ciclo, área, `CentroLatLong`, `PolygonKML_URL`, formato, versão e data de atualização. | O código, a espécie e o ciclo devem refletir o planejamento; a URL deve apontar à versão atual do KML. |
| 6. Histórico | Crie ou atualize a linha correspondente em `Poligonos` com `TalhaoID`, URL, formato, versão e status de conferência. | O registro anterior deve ser preservado se houve mudança no desenho. |
| 7. Sincronização | No AppSheet, sincronize a aplicação e abra `Áreas` em modo satélite. | O pin do centróide e o contorno KML devem aparecer sobre a área correta. |
| 8. Uso de campo | Toque no **pin** do talhão, abra o detalhe e use a ação de ticket ou despesa. | Confirme que a tela de formulário mostra o talhão e a propriedade esperados antes de gravar. |

## Como calcular e registrar o centróide

`CentroLatLong` deve receber latitude e longitude decimais separadas por vírgula, por exemplo `-26.238500, -51.078800`. Esse ponto não substitui o polígono: ele é o endereço de interação do mapa. A referência oficial do AppSheet descreve `LatLong` como valores decimais separados por vírgula. [1]

O centróide deve ficar dentro ou muito próximo do talhão. Em áreas longas, estreitas ou separadas em partes, posicione o ponto onde ele seja mais fácil de selecionar em campo, sem confundi-lo com talhão vizinho.

## Controle de versões do polígono

| Situação | Ação na tabela `Poligonos` | Ação na tabela `Talhoes` |
|---|---|---|
| Primeiro recorte do talhão | Inserir versão `v1` com a URL KML e data de conferência. | Apontar `PolygonKML_URL` para essa versão e preencher `PolygonVersao` como `v1`. |
| Correção de limite | Inserir novo registro, por exemplo `v2`, sem apagar a referência histórica. | Atualizar a URL atual, `PolygonVersao` e `PolygonAtualizadoEm`. |
| Arquivo de origem GeoJSON/KMZ | Registrar o formato e a URL técnica no histórico. | Usar como camada de mapa somente a URL do KML convertido e revisado. |
| Erro de acesso à camada | Marcar o polígono como pendente de conferência e corrigir o acesso. | Não usar a área para lançamento até que o KML seja visualizado no mapa. |

## Segurança, privacidade e desempenho

Limites geográficos podem revelar informações operacionais e patrimoniais. Por isso, não configure o compartilhamento público como padrão. O Google Drive permite controlar se pessoas podem apenas abrir, comentar ou editar um arquivo; a configuração deve respeitar o nível mínimo necessário para a leitura da camada pelo aplicativo. [3]

Evite colocar muitos recortes em um único arquivo. O AppSheet/Google Maps estabelece limites de 3 MB por arquivo obtido, 1.000 feições, 10 links de rede e aproximadamente 10–20 camadas KML; arquivos individuais e simplificados tornam o diagnóstico e a atualização mais seguros. [1]

## Verificação de aceite para cada novo talhão

Antes de considerar um talhão pronto para corte, transporte ou lançamento financeiro, confirme que o polígono abre no Google Earth, que `CentroLatLong` leva ao local correto, que o contorno aparece em `Áreas` e que o detalhe do talhão pré-preenche corretamente a propriedade e o código da área no formulário. Caso qualquer uma dessas verificações falhe, corrija a geometria, a URL ou a relação de referência antes de registrar ticket ou despesa.

## Referências

[1]: https://support.google.com/appsheet/answer/10106601?hl=en "Map view type — AppSheet Help"
[2]: https://developers.google.com/maps/documentation/earth/import-data "Import data into Google Earth — Google for Developers"
[3]: https://support.google.com/drive/answer/2494822?hl=en&co=GENIE.Platform%3DDesktop "Share files from Google Drive — Google Drive Help"

