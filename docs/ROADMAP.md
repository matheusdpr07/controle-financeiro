# Roadmap

1. **Concluída — Fundação técnica:** configuração da stack, página inicial, validação de
   ambiente, infraestrutura de banco/auth, componentes básicos, testes e CI.
2. **Concluída — Banco e autenticação:** disponibilizar MySQL 8.4 LTS, preencher ambiente,
   revisar modelos de autenticação, aplicar migration autorizada e testar
   persistência de sessão, cadastro, login e logout. Criar telas nessa fase.
3. **Próxima — Contas e categorias:** aprovar o modelo financeiro e implementar operações
   privadas com validação, sessão e propriedade dos registros.
4. **Transações:** implementar movimentações, precisão monetária, datas civis e
   regras de relacionamento com contas e categorias.
5. **Dashboard:** consolidar o mês e adicionar gráficos Recharts acessíveis.
6. **Testes de segurança e isolamento:** aprofundar cenários entre usuários,
   entradas inválidas, acesso indevido, sessão expirada e revogação. Validação e
   isolamento já são exigências desde a primeira operação privada.
7. **Refinamento visual:** aperfeiçoar acessibilidade, responsividade e estados
   de interação após estabilizar o comportamento.

A fundação e a fase 2 estão validadas. O ambiente local usa MySQL 8.4.12 LTS;
cadastro, entrada, saída, sessão, isolamento entre usuários e expiração passaram
no E2E real. A migration inicial contém somente autenticação e está aplicada.

Antes de iniciar a fase 3, devem ser decididos e documentados: nome do modelo de
conta financeira para evitar colisão com `Account` do Better Auth; moeda única ou
múltiplas moedas; tipos e estados de conta; saldo inicial ou derivado; categorias
de receita/despesa; regras de unicidade, arquivamento e exclusão. Somente depois
virão schema, migration revisada, operações privadas e testes de propriedade.

As fases financeiras ainda não foram iniciadas. Não houve publicação.
