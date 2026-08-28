
Esta nota registra as fontes consultadas durante a configuração do financeiro, para posterior incorporação na documentação operacional.

| Tema | Síntese aplicável | Fonte |
|---|---|---|
| Ações de dados | O AppSheet permite criar linhas em outra tabela, atualizar campos na linha atual e agrupar ações em uma sequência explícita iniciada pelo usuário. | [Actions: The Essentials](https://support.google.com/appsheet/answer/10107706?hl=en) |
| Geração de várias linhas | O padrão client-side documentado usa ações de criação, incremento de contador e condição de parada. A aplicação atual foi mantida em modo conservador: uma parcela por confirmação, pois um loop em lote não foi validado no editor desta sessão. | [FAQ: Add a number of rows](https://discuss.google.dev/t/faq-add-a-number-of-rows/67654) |
| Avanço mensal | `EOMONTH()` é suportada pelo AppSheet e considera meses com duração diferente e anos bissextos. | [EOMONTH() — AppSheet Help](https://support.google.com/appsheet/answer/10107332?hl=en) |
| Bots encadeados | Mudanças causadas por um bot não podem acionar o mesmo bot novamente; cadeias de bots têm limitação de segurança. Por isso, a geração de parcelas foi direcionada ao padrão de ações explícitas no cliente, não a um bot recursivo. | [Trigger other bots — AppSheet](https://discuss.google.dev/t/new-feature-trigger-other-bots/74101) |

> As referências de comunidade servem apenas para documentar o padrão técnico. Nenhuma execução com dados fictícios foi realizada. A geração em lote de todas as parcelas ainda não é apresentada como validada.

## Estado de configuração confirmado em 28 de agosto de 2026

| Item | Estado confirmado |
|---|---|
| `Despesas` | Estrutura regenerada no AppSheet e os campos financeiros adicionais passaram a ser exibidos. `ValorPago`, `DataPagamento`, `SaldoPendente`, `RecorrenciaID`, `ParcelaNumero`, `TotalParcelas`, `GeradoPorRecorrencia` e `ObservacoesFinanceiras` foram tipados ou preparados; `RecorrenciaID` aponta para `RecorrenciasDespesas`; os campos calculados `StatusPagamento` e `SaldoPendente` não são editáveis no aplicativo. |
| `RecorrenciasDespesas` | `Ativa` foi tipado como lógico; `PropertyID` e `TalhaoID` foram confirmados como referências, respectivamente, para `Propriedades` e `Talhoes`. |
| Ação técnica de criação | Ação `Financeiro — Criar despesa da parcela corrente`, aplicada a `RecorrenciasDespesas` e destinada a `Despesas`. Transporta `RecorrenciaID`, `PropertyID`, `TalhaoID`, `ValorParcela` para `Valor`, `Credor`, `Descricao` e `ProximaParcela` para `DataVencimento`, além de `ParcelaNumero` e `TotalParcelas`. Está oculta para não ser acionada isoladamente pelo operador. |
| Ação técnica de avanço | Ação `Financeiro — Avançar controle de parcela`, oculta para o operador, atualiza `ParcelasGeradas`, `ParcelasRestantes`, `ProximaParcela`, `StatusGeracao` e a trava `GerarParcelas` após cada parcela. |
| Ação operacional | Ação agrupada `Gerar próxima parcela`, aplicada a `RecorrenciasDespesas`, reúne criação e avanço, exige confirmação explícita e só fica disponível quando a recorrência está ativa, marcada para geração e possui parcelas restantes. Ela gera uma parcela por clique; não é uma automação agendada nem foi declarada como geração em lote validada. |
| Visões financeiras | Foram salvas no menu do AppSheet: `Contas a Receber` sobre `Receitas`, `Contas a Pagar` sobre `Despesas`, `Custos Fixos e Parcelamentos` sobre `RecorrenciasDespesas` e `Caixa Realizado` sobre `IndicadoresFinanceiros`. As visões financeiras estão no menu, enquanto `Propriedades` e `Áreas` permanecem na navegação principal. |

## Limite conhecido da implementação

O fluxo operacional atual é deliberadamente explícito e conservador: o usuário cadastra a recorrência, marca a solicitação de geração e confirma `Gerar próxima parcela` para cada obrigação. Isso evita geração silenciosa e duplicidade, mas ainda requer validação prática com uma recorrência real antes de considerar o processo concluído. A tabela `MovimentosFinanceiros` permanece como livro auxiliar planejado; o caixa realizado continua calculado diretamente por `Receitas[ValorRecebido] - Despesas[ValorPago]`.
