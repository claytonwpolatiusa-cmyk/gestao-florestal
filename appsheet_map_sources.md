# Arquitetura cartográfica e estado do AppSheet

## Objetivo operacional

A base **Gestão Florestal Campo** foi estruturada para tratar o talhão como a unidade operacional do mapa, do ticket e da despesa. A interação de campo parte do **centróide** do talhão, armazenado em `CentroLatLong`; o contorno técnico é mantido em arquivo geográfico versionado, com o **KML** como formato de visualização nativo recomendado para a camada do mapa. Essa separação preserva a navegação confiável por pin e, ao mesmo tempo, evita perder o histórico de geometrias.

> O AppSheet usa colunas `Address`, `LatLong` ou `XY` como fonte de localização em uma Map View. O tipo de mapa **Aerial** usa imagens de satélite e a URL de um KML hospedado é configurada na definição de uma coluna `Address` ou `LatLong`. [1]

## Artefatos e acessos

| Artefato | Identificação confirmada | Finalidade |
|---|---|---|
| Planilha-base | [Gestão Florestal — Base AppSheet e Mapas](https://docs.google.com/spreadsheets/d/1jUDzzg8m1DTV9NMpKelJ38-zJgN_1st9b32x_YkoRog/edit) | Fonte de dados relacional para a operação de campo. |
| ID da planilha | `1jUDzzg8m1DTV9NMpKelJ38-zJgN_1st9b32x_YkoRog` | Referência técnica da integração. |
| Aplicativo AppSheet | **Gestão Florestal Campo** | Interface móvel para consulta de áreas e lançamentos. |
| ID do aplicativo | `a1427a89-2c53-4f46-9685-b685c697a3d8` | Identificador da aplicação. |
| Editor do AppSheet | [Abrir editor](https://www.appsheet.com/template/appdef?appId=a1427a89-2c53-4f46-9685-b685c697a3d8&appName=Gest%C3%A3oFlorestalCampo-628524180) | Administração da estrutura, regras, ações e compartilhamento. |

## Modelo de dados configurado

| Tabela ou coluna | Configuração efetivamente salva | Papel no fluxo |
|---|---|---|
| Abas da planilha | `Propriedades`, `Talhoes`, `Poligonos`, `Tickets`, `Despesas`, `Usuarios` e `Auditoria` | Base relacional da operação. |
| `Talhoes[PropertyID]` | **Ref** para `Propriedades` | Mantém a hierarquia propriedade → talhão. |
| `Poligonos[TalhaoID]` | **Ref** para `Talhoes` | Registra arquivo, versão e metadados sem depender de exclusão em cascata. |
| `Tickets[TalhaoID]` e `[PropertyID]` | **Ref** para `Talhoes` e `Propriedades` | Mantém a rastreabilidade da carga por área e fazenda. |
| `Despesas[TalhaoID]` e `[PropertyID]` | **Ref** para `Talhoes` e `Propriedades` | Mantém a rastreabilidade financeira por área e fazenda. |
| `Talhoes[CodigoTalhao]` | **Label** | Referências exibem o código operacional, não o identificador técnico. |
| `Talhoes[CentroLatLong]` | **LatLong** e coluna de mapa da visualização `Áreas` | Pin/centróide usado para interação nativa. |
| `Talhoes[CentroLatLong]` — KML opcional | Expressão `[PolygonKML_URL]` | Indica a URL do recorte KML individual do registro. |
| `Talhoes[AreaHa]` | **Decimal** | Área do talhão em hectares. |
| `Talhoes[Especie]` | **Enum**: `Pinus`, `Eucalipto` | Segmentação silvicultural de campo. |
| `Talhoes[Ciclo]` | **Enum**: `1º desbaste`, `2º desbaste`, `corte raso` | Classificação do manejo. |
| `Talhoes[StatusOperacional]` | **Enum**: `planejado`, `em operação`, `suspenso`, `concluído` | Situação operacional da área. |
| `Talhoes[PolygonFormato]` | **Enum**: `KML`, `KMZ`, `GeoJSON` | Identificação do formato técnico do arquivo. |
| `Talhoes[PolygonAtualizadoEm]` | **DateTime** | Rastreabilidade da atualização territorial. |
| `Tickets[DataHora]` e `[PesoToneladas]` | **DateTime** e **Decimal** | Registro de pesagem em campo. |
| Anexos de tickets | URL para comprovante de balança e **Image** para quatro fotos de câmera de trilha | Evidências do carregamento e da conferência. |
| `Tickets[LancadoPor]` | **Email**, com valor inicial `USEREMAIL()` | Autoria automática por sessão no AppSheet. |
| `Tickets[StatusConferencia]` | **Enum**: `pendente`, `conferido`, `divergente`, `recusado` | Controle fechado da validação do ticket. |

Após o preenchimento das listas de enumeração e o salvamento no editor, o botão de avisos deixou de ser exibido. Isso confirma a consistência das enumerações configuradas, mas **não substitui** o teste de uma URL KML real nem o teste de lançamento com um registro verdadeiro.

## Mapa e navegação por área

A visualização principal **Áreas** foi convertida para **Map**, com base cartográfica **Aerial/Satellite** e `CentroLatLong` selecionado como a coluna de mapa. Ao tocar em um pin, o AppSheet centraliza o local e apresenta o detalhe do registro; esse é o ponto confiável para a equipe abrir a área e iniciar os lançamentos. [1]

| Ação em `Talhoes` | Destino configurado | Resultado esperado |
|---|---|---|
| **Lançar ticket neste talhão** | `LINKTOFORM("Tickets_Form", "TalhaoID", [TalhaoID], "PropertyID", [PropertyID], "DataHora", NOW(), "LancadoPor", USEREMAIL())` | Abre o formulário de ticket com propriedade, talhão, data/hora e operador pré-preenchidos. |
| **Lançar despesa neste talhão** | `LINKTOFORM("Despesas_Form", "TalhaoID", [TalhaoID], "PropertyID", [PropertyID])` | Abre o formulário de despesa com propriedade e talhão pré-preenchidos. |

As duas ações foram configuradas como **Prominent**, para aparecerem no detalhe do talhão. Como a base ainda não contém um talhão real com coordenada e polígono fornecidos pelo usuário, a execução final das ações será validada assim que houver o primeiro registro operacional. Não se deve pressupor que tocar diretamente no desenho KML acione uma ação: o fluxo garantido é **pin do centróide → detalhe do talhão → ação de ticket ou despesa**. [1]

Em **27 de agosto de 2026**, a aplicação em execução foi aberta no navegador e a visualização `Áreas` carregou corretamente em modo **Satellite**. Não havia pins no mapa porque a planilha está sem propriedades e talhões reais; nenhum registro ou polígono de demonstração foi criado para simular essa validação.

## Limites e proteção de dados geográficos

O AppSheet informa que cada camada KML exibida no mapa deve respeitar limite de **3 MB** para o arquivo obtido, **10 MB** para KML descompactado, **1.000 feições**, **10 links de rede** e aproximadamente **10 a 20 camadas** KML. A solução adotada, portanto, é um KML simples e leve por talhão, com simplificação de vértices quando necessário. [1]

O Google Earth aceita KML, KMZ, GeoJSON e Shapefile compactado para importação, mas essa compatibilidade não transforma automaticamente GeoJSON em uma camada nativa do AppSheet. Para visualização no mapa do AppSheet, deve ser mantida uma versão **KML** acessível; GeoJSON e KMZ podem continuar arquivados na tabela `Poligonos` como referência técnica ou origem para conversão. [2]

A camada KML precisa estar hospedada em URL que o AppSheet/Google Maps possa buscar. O Google Drive oferece permissões por pessoa, grupo ou acesso geral, e o responsável deve escolher a menor abrangência de acesso que ainda permita a leitura necessária da camada. [3] Isso exige validação prática, pois uma URL amplamente acessível pode expor os limites da propriedade. Não foi publicada nenhuma geometria real durante a configuração.

## Referências

[1]: https://support.google.com/appsheet/answer/10106601?hl=en "Map view type — AppSheet Help"
[2]: https://developers.google.com/maps/documentation/earth/import-data "Import data into Google Earth — Google for Developers"
[3]: https://support.google.com/drive/answer/2494822?hl=en&co=GENIE.Platform%3DDesktop "Share files from Google Drive — Google Drive Help"
