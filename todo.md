# Project TODO

- [x] Estruturar a arquitetura da plataforma e a navegação principal orientada a operações florestais.
- [x] Criar modelo de dados para propriedades, talhões, operações, tickets, documentos, contratos, garantias, vistorias e ocorrências.
- [x] Implementar cadastro e visualização de talhões com espécie, área, ciclo e vínculo para polígono geográfico.
- [x] Implementar lançamento rápido de ticket com foto/arquivo, tonelagem, talhão, destino e status de conferência.
- [x] Implementar caixa operacional de receitas e despesas com categorias, anexos e status de aprovação.
- [x] Implementar repositório de documentos para contratos, relatórios, tarefas e arquivos de campo.
- [x] Implementar acompanhamento de contratos por tonelada e por preço fixo, com garantias, prazos, multas e situação operacional.
- [x] Implementar vistorias de campo, controle de infraestrutura e registro de ocorrências de risco.
- [x] Criar painel com filtros por período e talhão, KPIs de toneladas, receita e custo, gráfico por talhão e despesas por categoria.
- [x] Construir interface responsiva, com navegação de campo em dispositivos móveis e identidade visual verde-floresta.
- [x] Escrever e executar testes unitários para regras de cálculo e exibição essenciais.
- [x] Validar experiência em desktop e celular e corrigir inconsistências.
- [x] Documentar a arquitetura, o uso inicial e as limitações ou próximos passos para integrações externas do ecossistema Google.
- [x] Modelar e exibir multas contratuais específicas para atraso e corte fora do polígono.
- [x] Confirmar os vínculos de propriedade ao gravar documentos e ocorrências associados a talhões ou contratos.
- [x] Validar compilação, testes unitários e fluxos essenciais de interface antes da entrega.
- [x] Segmentar Pinus e Eucalipto com cores, indicadores e sinais visuais consistentes.
- [x] Registrar modalidade comercial do contrato como venda do talhão por preço fixo ou retirada por tonelada, com orientação para desbaste.
- [x] Permitir anexar imagens de câmera de trilha aos tickets de pesagem.
- [x] Exibir alertas visuais para vencimentos próximos de contratos e tickets pendentes de pesagem.
- [x] Exportar relatório filtrado do painel em PDF e Excel.
- [x] Exportar dados de contratos em PDF e Excel.
- [x] Ampliar testes e validar os novos fluxos em desktop e celular.
- [x] Ajustar a composição do PDF do painel para evitar sobreposição de tabelas em relatórios extensos.
- [x] Validar os fluxos novos de exportação, contrato comercial e imagens de câmera em desktop e celular.
- [x] Executar a construção de produção para validar os módulos de PDF, Excel, contratos e tickets com evidências.
- [x] Implementar edição de propriedades, com histórico de alterações e identificação do usuário responsável.
- [x] Registrar no cadastro de talhões a referência do arquivo de polígono e o formato geográfico utilizado.
- [x] Definir a estrutura de abas Google Sheets e o modelo de dados para mapas, polígonos, talhões, tickets e despesas no AppSheet.
- [x] Configurar, se houver conexão autorizada, a fonte Google Sheets, a view de Áreas em mapa, as camadas de talhões e as ações de navegação do AppSheet.
- [x] Produzir guia operacional para importação de polígonos do Google Earth e manutenção de camadas no AppSheet.
- [x] Validar os novos fluxos de edição, auditoria e integração cartográfica antes da entrega.
- [x] Cobrir em teste unitário a autoria automática de criação e edição de propriedades.
- [x] Corrigir o estado vazio da integração cartográfica na tela territorial para evitar um quadro de mapa sem conteúdo.
- [ ] Validar um talhão real com centróide, KML hospedado e ações de ticket/despesa após o usuário fornecer a geometria e autorizar o teste de acesso.
- [x] Modelar contas a receber com situação de recebimento total, parcial e em aberto, incluindo saldo pendente e vencimento.
- [x] Modelar contas a pagar com fornecedor, situação de pagamento, saldo pendente e vencimento.
- [x] Criar parâmetros de custo recorrente e parcelamento com geração controlada de despesas futuras.
- [x] Calcular e exibir o saldo de caixa realizado com receitas recebidas menos despesas pagas.
- [x] Atualizar as fontes Google Sheets/AppSheet e preparar a base de indicadores para Looker Studio.
- [x] Cobrir as regras financeiras adicionadas com testes e validar a integração controlada antes da entrega.

- [x] Salvar no AppSheet as visões Contas a Receber, Contas a Pagar, Custos Fixos e Parcelamentos e Caixa Realizado.
- [x] Confirmar no preview do AppSheet o menu financeiro e os cinco indicadores de Caixa Realizado, sem dados fictícios.
- [x] Verificar no Google Sheets as fórmulas de saldo pendente, status de receitas/despesas e indicadores de caixa.
- [x] Executar `pnpm check`, `pnpm test` e `pnpm build` após a atualização documental e financeira.
- [ ] Validar a execução de `Gerar próxima parcela` com uma recorrência real autorizada pelo usuário, sem inserir dados fictícios.
- [ ] Confirmar ou implementar um loop nativo que replique todas as X parcelas em uma única confirmação, caso essa operação seja necessária.
- [ ] Criar o relatório do Looker Studio mediante abertura/autorização específica do usuário; a base para conexão está preparada.
- [ ] Salvar checkpoint WebDev final após a revisão do checklist financeiro.

- [x] Executar teste isolado com dados fictícios explicitamente marcados como TESTE e verificar geração manual de parcela, contadores e prevenção de repetição da parcela corrente.
- [x] Remover os registros fictícios após a validação, sem misturá-los aos dados operacionais reais.
- [x] Adicionar testes automatizados para a lógica de recorrência/parcelamento, cobrindo geração, contadores, próxima data e bloqueio ao fim da série.
- [ ] Validar no AppSheet os casos de segunda execução sem repetir a parcela anterior e ação indisponível quando não houver parcelas restantes.
- [ ] Corrigir a condição de finalização da ação Gerar próxima parcela: com parcelas restantes, manter GerarParcelas ativo e permitir a próxima execução; só concluir em zero.
- [ ] Ajustar a expressão final para usar o saldo já decrementado: `StatusGeracao = IF([ParcelasRestantes] > 0, "Em geração", "Concluído")` e `GerarParcelas = IF([ParcelasRestantes] > 0, TRUE, FALSE)`.

## Nova fase — Treeway Forest

- [x] Renomear a marca visível da plataforma para Treeway Forest, incluindo título, navegação, login e metadados.
- [x] Criar e integrar logo moderna com destaque visual para Treeway, incluindo favicon ou marca compacta quando aplicável.
- [x] Criar landing page pública antes do login, em português, voltada a produtores de pinus e eucalipto, explicando público, problemas resolvidos, funcionalidades e benefício operacional.
- [x] Adicionar imagens/visuais explicativos na apresentação pública sem inserir depoimentos ou avaliações fictícias.
- [x] Adicionar área de perfil/configurações para dados da conta e orientações de recuperação de e-mail e senha.
- [x] Implementar acesso delegado seguro por códigos temporários no servidor, com escolha de duração, expiração, revogação e registro de uso; nunca exibir senha do titular. A validação ponta a ponta permanece pendente.
- [x] Criar página de compra com formulário de nome, e-mail e telefone, preço promocional de R$ 390 riscado por R$ 97 mensais e pacote único com tudo incluído.
- [ ] Testar os fluxos públicos, login, perfil, acesso delegado, compra e responsividade em desktop e celular.
- [x] Implementar login por código delegado com o mesmo nível de acesso do titular, incluindo validação segura, expiração, revogação e uso controlado; a validação ponta a ponta permanece pendente.
- [x] Filtrar na listagem somente códigos delegados não expirados e não revogados.
- [x] Adicionar testes automatizados para a política de códigos delegados: normalização/hash, validade, revogação, expiração e reutilização controlada.
- [x] Tratar códigos inválidos, expirados ou revogados com mensagem amigável na tela `/acesso`.
- [x] Definir e implementar política explícita de uso controlado dos códigos delegados — reutilizável até expiração ou revogação — e refletir essa regra na interface.
- [ ] Testar a implementação real de acesso delegado no banco: criação, listagem, revogação, expiração e consumo.
- [ ] Testar a rota `/api/delegated-login` para sucesso e erros amigáveis em códigos inválidos, expirados e revogados.
- [ ] Validar que a listagem real retorna somente códigos não expirados e não revogados.
- [ ] Validar posteriormente o login por código delegado em janela anônima/outro navegador, confirmando abertura do painel com o mesmo nível do titular.

## Refinamento visual e comercial — Treeway Forest

- [x] Redesenhar a landing pública com estética premium de reflorestamento, atmosfera americana moderna e linguagem principalmente em português.
- [x] Remover referências a Porto União e União da Vitória da apresentação pública e da comunicação comercial.
- [x] Aplicar sistema visual com verde profundo, laranja queimado, linhas topográficas, elementos fluidos e microanimações acessíveis.
- [x] Reforçar a narrativa de solução, confiança, controle da floresta e retorno operacional sem inventar depoimentos ou avaliações.
- [x] Elevar a experiência de compra da assinatura mensal de R$ 97 com desconto de R$ 390 por R$ 97 e apresentação comercial transparente.
- [x] Validar landing, compra e responsividade em desktop e celular após o redesenho.
- [x] Refinar a landing pública para uma identidade Treeway mais proprietária e premium, reduzindo aparência de SaaS genérico.
- [x] Fortalecer motivos recorrentes de manejo florestal, topografia, parcelas e hierarquia tipográfica na experiência pública.
- [x] Validar a landing redesenhada também em viewport móvel e corrigir eventuais problemas encontrados.

## Tutorial e onboarding visual

- [x] Adicionar aba Tutorial no menu autenticado com roteiro visual das principais funcionalidades.
- [x] Criar exemplos demonstrativos fictícios de uma propriedade, talhões, tickets, contratos e caixa, sempre rotulados como exemplo.
- [x] Criar onboarding pulável nas três primeiras entradas da conta e em toda entrada por Acesso de equipe.
- [x] Direcionar o onboarding para o Tutorial e permitir fechar com X ou pular sem bloquear a plataforma.
- [x] Validar Tutorial, onboarding e responsividade em desktop e celular.
- [x] Marcar explicitamente a sessão criada pelo login de equipe como delegada para acionar o onboarding em toda entrada por código.
- [x] Validar o modal de onboarding com acesso de equipe simulado, incluindo X, pular e abertura do Tutorial.
- [x] Validar o onboarding de equipe também em desktop.
- [ ] Testar explicitamente fechar no X, pular por agora e abrir tutorial no onboarding simulado.
- [x] Registrar evidência de navegação do cenário `/?delegated=1` para o Tutorial; o CTA está conectado a `/tutorial`.
- [ ] Testar no onboarding simulado o botão “Abrir tutorial” e confirmar navegação efetiva para `/tutorial`.
- [ ] Testar no onboarding simulado os controles “X” e “Pular por agora”, confirmando fechamento sem bloquear a plataforma.
