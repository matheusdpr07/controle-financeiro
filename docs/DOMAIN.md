# Domínio

## Escopo do produto

O Controle Financeiro é um sistema pessoal de registro e acompanhamento. Os
valores representam informações declaradas pelo usuário; a aplicação não guarda
recursos, não oferece conta bancária, não processa pagamentos e não envia dinheiro.
Também não há integração com bancos ou Open Finance no escopo atual.

Uma conta financeira é apenas um agrupador usado para representar algo que a
pessoa deseja acompanhar, como conta corrente externa, poupança, carteira em
dinheiro ou investimento. Um lançamento é um registro contábil pessoal. Uma
transferência entre contas cadastradas representa efeitos internos de saída e
entrada, sem executar uma transferência real.

| Conceito         | Responsabilidade planejada                                     |
| ---------------- | -------------------------------------------------------------- |
| Usuário          | Identidade autenticada e dono dos dados privados.              |
| Preferências     | Configurações pessoais de apresentação e uso.                  |
| Conta financeira | Origem ou destino financeiro pertencente ao usuário.           |
| Categoria        | Classificação das movimentações do usuário.                    |
| Lançamento       | Registro de receita ou despesa associado à conta e ao usuário. |
| Ajuste de saldo  | Diferença declarada entre saldo calculado e saldo real mensal. |
| Dashboard mensal | Visão consolidada das movimentações do mês.                    |

Dinheiro é armazenado como `DECIMAL(19,2)`, nunca float. O transporte deve
preservar precisão decimal, sem conversão indiscriminada para `number`.

A data financeira será `DATE`: representa um dia civil, sem horário nem fuso.
Timestamps técnicos, como criação e atualização, serão tratados em UTC.

A tabela `Account` gerada pelo Better Auth representa uma credencial de
autenticação. Ela não é uma conta financeira. O domínio usa
`FinancialAccount`, persistido em `financial_account`, para evitar a colisão.

## Contas financeiras

Nesta fase, cada conta pertence a um usuário e possui nome, tipo, moeda, saldo e
data de abertura. A moeda aceita pela aplicação é BRL; o código ISO é armazenado
na conta para permitir evolução planejada sem prometer conversão cambial.

Os tipos iniciais são conta corrente, poupança, dinheiro, investimento e outros.
Cartão de crédito fica fora desta fase porque exige fatura, fechamento, vencimento,
limite e tratamento próprio de passivo.

O saldo de abertura usa `DECIMAL(19,2)` e pode ser negativo. O saldo atual é
calculado como saldo de abertura, mais receitas, menos despesas, menos
transferências de saída, mais transferências de entrada e mais ajustes mensais.
Ele não é armazenado em uma segunda coluna sujeita a divergência. A data do saldo
de abertura usa `DATE`.

O nome é único por usuário sob a collation do banco. Uma conta deixa de aparecer
entre as ativas por arquivamento; não há exclusão destrutiva nesta fase. O usuário
pode restaurar a mesma conta, preservando sua identidade para as transações futuras.

## Categorias

Cada categoria pertence a um usuário, possui nome e natureza de receita ou
despesa. O nome é único dentro da combinação usuário e natureza. Não são criadas
categorias globais nem dados fictícios.

Categorias também são arquivadas e restauradas. Referências históricas são
preservadas, e a aplicação valida que lançamento, conta e categoria pertencem ao
mesmo usuário autenticado.

## Lançamentos

`FinancialEntry` registra receita ou despesa com descrição, valor positivo, data,
conta obrigatória e categoria opcional. O tipo define o sinal no saldo: receita
soma e despesa subtrai. Se uma categoria for escolhida, sua natureza deve coincidir
com o tipo do lançamento.

A conta e a categoria precisam estar ativas na criação e na edição. A data não
pode ser anterior à data do saldo de abertura da conta. A remoção preenche
`deletedAt` e pode ser revertida; registros removidos não entram no saldo.

`FinancialTransfer` registra a passagem interna de um valor positivo entre duas
contas distintas. A data deve ser igual ou posterior às datas de abertura das duas
contas. O valor reduz o saldo da origem e aumenta o saldo do destino, com efeito
zero no patrimônio total representado. Não existe comunicação com sistemas de
pagamento.

## Relatório mensal e ajustes

O primeiro mês de uma conta parte do saldo inicial informado no cadastro. O saldo
final é derivado por `saldo inicial + ajustes + receitas - despesas - transferências
de saída + transferências de entrada`. O fechamento resultante é carregado
automaticamente como saldo inicial do mês seguinte. Transferências entre contas do
mesmo usuário alteram cada conta, mas têm efeito líquido zero no consolidado.

Quando o saldo real no início do mês diverge do valor calculado, o usuário pode
registrar uma correção. `BalanceAdjustment` preserva o saldo esperado, o saldo real
informado e a diferença assinada. Essa diferença aparece separadamente como
“Ajuste de saldo”; receitas, despesas e lançamentos passados não são reescritos.
Uma conta possui no máximo uma correção por mês, que pode ser atualizada. Meses
futuros e contas arquivadas não aceitam correção.

Valores digitados são apresentados em reais durante a edição. O formulário envia
uma string decimal normalizada, e cálculos e persistência usam `Decimal`, sem
conversão para ponto flutuante.

## Autorização

Toda leitura e escrita financeira deriva `userId` da sessão validada. IDs enviados
por formulário são tratados como entrada externa, validados e combinados com o
`userId` na própria consulta de alteração. A ausência do registro e a tentativa de
acessar registro de outro usuário produzem o mesmo resultado, sem revelar sua
existência. Objetos Prisma são convertidos em DTOs explícitos; valores monetários
e datas financeiras são enviados como strings.
