# Modelo financeiro — Google Sheets, AppSheet e Looker Studio

## Princípio de apuração

O modelo separa a **obrigação financeira** do **dinheiro efetivamente realizado**. Uma venda emitida, mas ainda não recebida, integra as contas a receber, porém não aumenta o caixa realizado. Uma despesa lançada, mas ainda não paga, integra as contas a pagar, porém não reduz o caixa realizado.

> **Saldo em Caixa Realizado = Σ ValorRecebido − Σ ValorPago.**

Essa regra permite que o painel diferencie, sem ambiguidade, faturamento, recebimento, compromissos futuros e saldo disponível.

## Abas financeiras incluídas

| Aba | Papel | Situação financeira principal |
|---|---|---|
| `Receitas` | Contas a receber por nota, cliente, contrato, ticket e talhão. | `A Receber`, `Recebido Parcial` ou `Recebido Total`. |
| `Despesas` | Contas a pagar por fornecedor, categoria, propriedade, talhão e contrato. | `A Pagar`, `Pago Parcial` ou `Pago Total`. |
| `RecorrenciasDespesas` | Cadastro-mestre de custo fixo ou parcelamento, sem duplicar a regra em cada parcela. | Controla quantidade, periodicidade, valor e geração. |
| `MovimentosFinanceiros` | Livro auxiliar de eventos de caixa para auditoria e análises futuras. | Crédito ou débito efetivamente realizado. |
| `IndicadoresFinanceiros` | Fonte consolidada para o painel do AppSheet e para o Looker Studio. | Caixa realizado, recebimentos, pagamentos e valores em aberto. |

## Regras gravadas na planilha

| Origem | Fórmula/regra | Resultado |
|---|---|---|
| `Receitas[StatusRecebimento]` | Valor recebido igual a zero, menor que a nota ou igual/superior à nota. | Classifica automaticamente como a receber, parcial ou total. |
| `Receitas[SaldoPendente]` | `MAX(ValorNota − ValorRecebido; 0)` por fórmula de matriz na coluna de saldo. | Exibe o saldo ainda devido pelo cliente. |
| `Despesas[StatusPagamento]` | Valor pago igual a zero, menor que a despesa ou igual/superior à despesa. | Classifica automaticamente como a pagar, parcial ou total. |
| `Despesas[SaldoPendente]` | `MAX(Valor − ValorPago; 0)` por fórmula de matriz na coluna de saldo. | Exibe exatamente o valor ainda devido ao credor. |
| `IndicadoresFinanceiros[Saldo em Caixa Realizado]` | `SUM(Receitas!L2:L)-SUM(Despesas!Q2:Q)`. | Indicador de dinheiro realmente recebido menos dinheiro efetivamente pago. |

Os cabeçalhos financeiros foram preservados nas abas existentes e as abas novas receberam cabeçalho, congelamento da primeira linha, identidade visual, quebra de texto e filtros. Foi realizado um teste controlado, explicitamente marcado como `TESTE`, e os seus registros foram removidos ao final; portanto, a base voltou a ficar sem dados fictícios.

## Recorrência e parcelamento no AppSheet

O fluxo operacional escolhido é o mais simples e acessível para a equipe de campo: o usuário cadastra uma linha em `RecorrenciasDespesas` e executa **Gerar próxima parcela** com confirmação explícita. A ação cria uma linha em `Despesas` com `RecorrenciaID`, `PropertyID`, `TalhaoID`, `Credor`, `Descricao`, `Valor`, `DataVencimento`, `ParcelaNumero` e `TotalParcelas`. Em seguida, atualiza os contadores, a próxima data, o status e a trava de geração.

A geração atual é **uma parcela por clique**, não uma automação silenciosa nem um processo agendado. No primeiro teste controlado, a recorrência passou de `ParcelasGeradas = 0` e `ParcelasRestantes = 3` para `ParcelasGeradas = 1` e `ParcelasRestantes = 2`; a planilha registrou uma única despesa com `ParcelaNumero = 1`, `TotalParcelas = 3` e o mesmo `RecorrenciaID`, enquanto `ProximaParcela` avançou para `31/10/2026`. Isso confirma que uma execução gera a próxima parcela corrente e avança o controle, em vez de repetir a mesma parcela. No edge case com duas parcelas, foi identificado que a ação avalia as expressões após o decremento; por isso, a configuração foi corrigida no editor para `StatusGeracao = IF([ParcelasRestantes] > 0, "Em geração", "Concluído")` e `GerarParcelas = IF([ParcelasRestantes] > 0, TRUE, FALSE)`. A primeira execução após a correção ainda precisa ser repetida no preview depois de uma sincronização completa para confirmar a segunda parcela e o bloqueio final. A geração de todas as parcelas em uma única confirmação permanece uma melhoria futura.

A ação técnica de criação e a ação técnica de avanço ficam ocultas para evitar execução isolada. A ação agrupada visível exige confirmação e só fica disponível quando a recorrência está ativa, marcada para geração e possui parcelas restantes. Não foi criado bot de alteração ou bot agendado para esse requisito.

## Estado confirmado no AppSheet

| Componente | Estado confirmado |
|---|---|
| `Receitas` | Incluída no aplicativo. `TalhaoID`, `PropertyID` e `TicketID` foram configurados como referências; nota, recebido e saldo como **Price**; datas como **Date**; comprovante como **File**; autor como **Email**; momento de lançamento como **DateTime**. As situações são calculadas na planilha e exibidas como texto. |
| `Despesas` | A estrutura foi regenerada e os campos financeiros adicionais foram reconhecidos no editor. Foram tipados/preparados os campos de vencimento, valor pago, data de pagamento, saldo pendente, situação, credor, recorrência, parcela, total de parcelas, origem da recorrência e observações. `RecorrenciaID` aponta para `RecorrenciasDespesas`; `StatusPagamento` e `SaldoPendente` ficam não editáveis por serem calculados. |
| `RecorrenciasDespesas` | Incluída no aplicativo. `Ativa` é lógico; `PropertyID` e `TalhaoID` apontam respectivamente para `Propriedades` e `Talhoes`; valor, quantidade e contadores são numéricos/monetários; datas são **Date**; `GerarParcelas` é **Yes/No**; auditoria de geração usa **Email** e **DateTime**. |
| Ações financeiras | Criadas a ação técnica `Financeiro — Criar despesa da parcela corrente`, a ação técnica `Financeiro — Avançar controle de parcela` e a ação operacional agrupada `Gerar próxima parcela`. As duas técnicas ficam ocultas e a ação operacional exige confirmação. |
| Visões | Salvas no menu do aplicativo: `Contas a Receber` sobre `Receitas`, `Contas a Pagar` sobre `Despesas`, `Custos Fixos e Parcelamentos` sobre `RecorrenciasDespesas` e `Caixa Realizado` sobre `IndicadoresFinanceiros`. `Propriedades` e `Áreas` permanecem na navegação principal. |
| Painel | `Caixa Realizado` apresenta a tabela de indicadores calculada pela planilha, incluindo saldo em caixa, receitas recebidas, despesas pagas, contas a receber em aberto e contas a pagar em aberto. Um dashboard com cartões independentes não foi declarado como concluído; a visão de indicadores é a fonte operacional validada. |

## Fonte para Looker Studio

O conector deve usar a aba `IndicadoresFinanceiros` para os cartões de saldo e as abas `Receitas` e `Despesas` para detalhamento por período, propriedade, talhão, cliente/credor, categoria e status. O relatório ainda não foi criado nesta sessão, pois não há conector ou autorização específica para operar a interface do Looker Studio.

Na criação manual do relatório, selecionar **Google Sheets**, escolher a planilha `Gestão Florestal — Base AppSheet e Mapas` e adicionar as abas necessárias como fontes. Usar `ValorRecebido` e `ValorPago` nas métricas de caixa; não usar `ValorNota` nem `Valor` nominal de obrigação para representar dinheiro disponível. Recomenda-se criar campos ou cartões para:

| Métrica | Fonte recomendada |
|---|---|
| Caixa Realizado | Linha `Saldo em Caixa Realizado` em `IndicadoresFinanceiros`, ou diferença entre recebidos e pagos. |
| Recebidos | Soma de `Receitas[ValorRecebido]`. |
| Pagos | Soma de `Despesas[ValorPago]`. |
| Contas a receber em aberto | Soma de `Receitas[SaldoPendente]`. |
| Contas a pagar em aberto | Soma de `Despesas[SaldoPendente]`. |
| Segmentação operacional | Filtros por `DataVencimento`, `PropertyID`, `TalhaoID`, `Cliente`, `Credor` e status. |

## Validação controlada e limites

`MovimentosFinanceiros` permanece como livro auxiliar planejado para auditoria; o cálculo atual do caixa não depende de seu preenchimento automático. A validação de geometrias depende do envio posterior de um KML real pelo usuário.

Em 28/08/2026, foram realizados dois testes controlados no AppSheet. O primeiro usou o registro `TESTE-REC-20260828004146-60063`, com valor fictício de `R$ 1.234,56` e três parcelas; a ação criou exatamente uma despesa, avançou os contadores e atualizou a próxima data. O segundo usou `TESTE-REC-EDGE-20260828004740-18636`, com duas parcelas; após a primeira execução, foi identificado o erro de finalização prematura descrito acima. As linhas de ambos os testes foram excluídas atomicamente das abas `RecorrenciasDespesas` e `Despesas`, mantendo apenas os cabeçalhos. A validação confirma o caminho feliz da primeira parcela, mas não confirma ainda a segunda execução nem o bloqueio correto no fim da série; esses casos permanecem pendentes de correção no editor do AppSheet.

## Referências

[1]: https://support.google.com/appsheet/answer/10107706?hl=en "Actions: The Essentials — AppSheet Help"
[2]: https://support.google.com/appsheet/answer/11431791?hl=en "AppSheet automation: The Components — AppSheet Help"
[3]: https://support.google.com/appsheet/answer/11998993?hl=en "AppSheet automation: The Essentials — AppSheet Help"
[4]: https://support.google.com/appsheet/answer/10107332?hl=en "EOMONTH() — AppSheet Help"
[5]: https://discuss.google.dev/t/faq-add-a-number-of-rows/67654 "FAQ: Add a number of rows"
