# Gestão Florestal

## Visão geral

**Gestão Florestal** é uma plataforma web responsiva para controle de operações com eucalipto e pinus. Ela centraliza a organização das propriedades e talhões, o registro de tickets de balança, a movimentação financeira, os contratos, documentos, vistorias e ocorrências de risco.

O acesso é autenticado e os registros ficam isolados por usuário. Arquivos enviados, como fotos de tickets, PDFs contratuais e evidências de vistoria, são armazenados de forma separada do banco de dados, com o banco mantendo apenas os metadados e o vínculo operacional.

## Módulos entregues

| Módulo | Função principal | Controles incluídos |
|---|---|---|
| **Visão geral** | Consolidar indicadores e prioridades da operação. | Toneladas conferidas, receita, custo, tickets pendentes, alertas, prazos próximos e gráficos. |
| **Talhões** | Cadastrar propriedades, talhões, espécies, áreas e ciclo. | Status operacional, vínculo de polígono, campo GeoJSON/coordenadas, mapa de referência regional e distinção visual entre **Pinus** e **Eucalipto**. |
| **Tickets de balança** | Registrar cada carga e seu comprovante. | Talhão, contrato, placa, destino, tonelagem, comprovante, até quatro imagens de câmeras de trilha e alerta de atraso. |
| **Caixa e operações** | Registrar receitas e despesas. | Categorias, tonelagem, documento anexo, situação pendente/aprovada/rejeitada e saldo operacional. |
| **Contratos** | Controlar venda do talhão e retirada por tonelada. | Modalidade comercial, identificação de desbaste/corte raso, garantias, prazos, valores, prazo para tickets, arquivo assinado, multas e exportação em PDF/Excel. |
| **Arquivos** | Organizar documentos da atividade. | Contratos, relatórios, licenças, garantias, tarefas e demais documentos vinculados à operação. |
| **Vistorias** | Registrar verificações de campo. | Infraestrutura, segurança, meio ambiente, colheita e entrega final, com evidências. |
| **Ocorrências** | Formalizar riscos e não conformidades. | Categoria, gravidade, status, descrição e evidência de acesso, ticket, chuva, incêndio, ambiente e segurança. |

## Fluxo recomendado para o primeiro uso

1. Entre na plataforma e acesse **Talhões**.
2. Cadastre a propriedade rural, informando município, UF, matrícula, CAR e referências de acesso disponíveis.
3. Registre os talhões com código único, espécie, área, ciclo, status e referência de polígono.
4. Cadastre os contratos de venda, incluindo modalidade, comprador, garantia, prazo e multas aplicáveis.
5. Durante a operação, lance os tickets de balança e anexos; após conferência, os indicadores de tonelagem serão atualizados.
6. Lance receitas e despesas e altere a situação para **aprovado** quando houver validação. Apenas registros aprovados compõem os indicadores financeiros.
7. Centralize arquivos de apoio e realize vistorias ou ocorrências sempre que houver alteração de infraestrutura, risco de chuva, desvio, incêndio, questão ambiental ou inconformidade operacional.

> A plataforma foi desenhada para trabalhar com dados reais. Por isso, ela não vem com cadastros ou indicadores fictícios.

## Regras de cálculo no painel

| Indicador | Critério usado |
|---|---|
| **Toneladas extraídas** | Soma dos tickets marcados como **conferidos**. |
| **Receita total** | Soma dos lançamentos de receita com situação **aprovado**. |
| **Custo operacional total** | Soma dos lançamentos de despesa com situação **aprovado**. |
| **Produção por talhão** | Soma dos tickets conferidos agrupados por talhão. |
| **Despesas por categoria** | Soma das despesas aprovadas, agrupadas por categoria. |
| **Prazos contratuais** | Contratos ativos ou suspensos com vencimento em até trinta dias, inclusive vencidos. |
| **Tickets atrasados** | Tickets pendentes cujo prazo de conferência ultrapassou a quantidade de dias definida no contrato. |

## Integrações com Google

Esta entrega é uma **plataforma web própria**, com autenticação, banco de dados, armazenamento de arquivos e suporte a mapas. Ela substitui a necessidade de manter dados operacionais espalhados entre planilhas, aplicativo de campo e painel de indicadores, mantendo as funções solicitadas em um único ambiente.

No contexto atual, o conector de **Google Workspace** está disponível, porém desabilitado; não há autorização ativa para criar ou editar uma planilha Google Sheets, um aplicativo AppSheet ou um painel Looker Studio na conta do usuário. Portanto, esta versão não cria links externos desses três serviços nem sincroniza dados automaticamente com eles.

Caso seja desejada uma integração futura, o caminho recomendado é habilitar a conexão autorizada ao Google Workspace e definir, antes da implementação, qual será a fonte oficial dos dados: esta plataforma ou uma planilha compartilhada. A sincronização bidirecional sem essa definição pode produzir conflitos de edição e divergências nos indicadores.

## Segurança e limites operacionais

Os controles de usuário impedem que uma conta acesse registros de outra conta. O sistema valida, no servidor, que talhões e contratos vinculados a documentos, tickets, caixa, vistorias e ocorrências pertencem à mesma propriedade do registro.

Os módulos são ferramentas de gestão operacional e documental. A plataforma não substitui conferência física, laudos, licenças, medidas de segurança, exigências ambientais, contabilidade, assinatura de documentos ou revisão jurídica dos contratos.

## Validação técnica realizada

| Verificação | Resultado |
|---|---|
| Migrações e tabelas principais | Criadas no banco de dados. |
| Checagem de tipos TypeScript | Concluída sem erros. |
| Testes automatizados | 3 testes aprovados, cobrindo sessão e regras de totais/multa diária. |
| Visual desktop | Validado nas páginas de painel, talhões, tickets, caixa, contratos, arquivos, vistorias e ocorrências. |
| Visual mobile | Validado nas páginas principais, com navegação adaptada para campo e atalhos inferiores. |
