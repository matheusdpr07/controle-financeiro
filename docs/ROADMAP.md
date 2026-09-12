# Roadmap

1. **Concluída — Fundação técnica:** configuração da stack, página inicial, validação de
   ambiente, infraestrutura de banco/auth, componentes básicos, testes e CI.
2. **Concluída — Banco e autenticação:** disponibilizar MySQL 8.4 LTS, preencher ambiente,
   revisar modelos de autenticação, aplicar migration autorizada e testar
   persistência de sessão, cadastro, login e logout. Criar telas nessa fase.
3. **Concluída — Contas e categorias:** modelo financeiro aprovado; operações
   privadas implementadas com validação, sessão, propriedade e arquivamento.
4. **Concluída — Lançamentos:** receitas, despesas e transferências internas com
   precisão monetária, datas civis, propriedade, edição e remoção reversível.
5. **Em andamento — Dashboard:** resumo mensal, navegação entre meses, saldo
   transportado e correções separadas estão implementados e validados no MySQL.
   Gráficos Recharts acessíveis ficam para o próximo refinamento.
6. **Testes de segurança e isolamento:** aprofundar cenários entre usuários,
   entradas inválidas, acesso indevido, sessão expirada e revogação. Validação e
   isolamento já são exigências desde a primeira operação privada.
7. **Refinamento visual:** aperfeiçoar acessibilidade, responsividade e estados
   de interação após estabilizar o comportamento.

As quatro primeiras fases estão validadas no MySQL 8.4.12 local. A fase 3 usa o
modelo `FinancialAccount`, BRL, saldo de abertura em `DECIMAL(19,2)`, data civil,
tipos explícitos e categorias de receita/despesa. Contas e categorias pertencem
ao usuário autenticado, possuem unicidade dentro desse proprietário e podem ser
arquivadas e restauradas. A segunda migration foi revisada e aplicada ao banco
local confirmado. Não houve publicação.

Na fase 4, valores são positivos e o tipo determina o efeito de receita ou despesa.
Transferências têm origem e destino distintos e efeito total zero. Categorias são
opcionais e precisam ter a mesma natureza do lançamento. Registros podem ser
editados e removidos de forma reversível. Referências arquivadas permanecem no
histórico, mas precisam ser restauradas antes de uma edição.

O dashboard usa o saldo inicial no primeiro mês e carrega o fechamento nos meses
seguintes. Saldo inicial, ajustes, receitas, despesas e saldo final aparecem em
linhas separadas. A correção registra a diferença sem reescrever lançamentos. O
formulário de conta apresenta identificação e saldo inicial em duas etapas, e os
campos monetários exibem reais durante a digitação. Cartão de crédito continua
adiado até o desenho próprio de faturas e passivos.

As transações e transferências desse roadmap são registros para controle pessoal.
O projeto não executará movimentação de dinheiro, pagamentos ou serviços bancários.
