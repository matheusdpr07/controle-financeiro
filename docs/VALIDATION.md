# Validação da fundação, dependências, domínio e interface — 15/09/2026

## Temas e página inicial animada

As sete rotas atuais usam os temas automático, claro e escuro. A primeira visita
segue o sistema operacional; uma escolha explícita é armazenada no navegador e
permanece durante a navegação. Uma inicialização no layout aplica o tema antes da
primeira pintura. O controle compartilhado aparece na página inicial, na
autenticação e na área privada.

Os componentes deixaram de depender de cores claras fixas. Fundo, superfícies,
texto, borda, foco, receita, despesa, transferência e painel editorial usam tokens
semânticos em OKLCH. Rótulos e sinais monetários continuam presentes, portanto a
cor não é o único meio de identificar um tipo financeiro. Nenhuma regra, Server
Action, DTO, schema, modelo ou migration mudou nesta etapa.

A página inicial foi reconstruída com rolagem guiada por seções no desktop,
hierarquia tipográfica, cinco blocos editoriais e um SVG financeiro original.
Anime.js 4.5.0 foi adicionado como dependência direta, exata e estável. O
controlador cliente fica restrito à landing, desfaz seu escopo ao desmontar, pausa
movimento contínuo quando a página fica oculta e retorna antes de iniciar animações
quando `prefers-reduced-motion` pede redução. Conteúdo, links e vetores existem em
seu estado final sem a animação. Em celular, a rolagem permanece nativa.

### Validações de 15/09/2026

| Verificação            | Resultado                                                                 |
| ---------------------- | ------------------------------------------------------------------------- |
| Node                   | 24.20.0 usado nos comandos finais.                                        |
| Formatação             | `npm run format:check` passou.                                            |
| Lint                   | `npm run lint` passou sem avisos.                                         |
| Typecheck              | `npm run typecheck` passou com tipos do Next.js.                          |
| Vitest                 | 92 testes passaram em 21 arquivos.                                        |
| Playwright público     | 7 testes passaram, incluindo rolagem por gesto, 320, 390 e 1440 px.       |
| Playwright autenticado | 1 fluxo completo passou no MySQL 8.4 local em 17,7 segundos.              |
| Build Webpack          | Passou; página inicial estática e rotas privadas dinâmicas foram geradas. |
| Auditoria npm          | Zero vulnerabilidades conhecidas.                                         |
| Anime.js               | `npm ls animejs --depth=0` confirmou uma única versão 4.5.0.              |
| Revisão visual         | 28 capturas temporárias: 7 rotas × 2 temas × desktop e celular.           |
| Banco                  | MySQL 8.4 permaneceu ativo; nenhuma migration foi criada ou executada.    |

A revisão visual usou 1440 × 1000 e 390 × 844. Foram conferidos contraste,
hierarquia, navegação, foco, formulários, estados vazios, indicadores mensais e
ausência de overflow horizontal. O teste visual criou um usuário isolado, uma
conta e uma categoria e removeu esse usuário e todos os registros relacionados ao
final. As capturas ficaram em `/tmp` e não fazem parte do repositório.

O teste de rolagem usa uma janela de 1440 × 1000 e movimento ativo. Um único evento
de roda posicionou a segunda seção a 72 px do topo, respeitando o cabeçalho fixo;
um evento no sentido contrário retornou a página ao início. O teste unitário
também confirmou troca imediata com redução de movimento.

O build inicialmente mostrou `Could not parse output from TypeScript's
--showConfig` dentro do sandbox. A investigação reproduziu `EPERM` ao Node tentar
abrir o subprocesso TypeScript; o mesmo `tsc --showConfig` produziu JSON válido
fora dessa restrição. O build final passou com Node 24 fora do sandbox, sem contorno
em `next.config.ts` e sem mudança de configuração.

## Dashboard mensal, saldo inicial e diagnóstico de autenticação

A área autenticada agora oferece onboarding quando ainda não existem contas e um
relatório quando o controle já foi iniciado. O cadastro de conta foi dividido em
identificação e saldo inicial. Saldo de abertura, lançamentos, transferências e
correções usam um campo compartilhado que apresenta reais durante a digitação e
envia uma string decimal normalizada.

O relatório aceita `?month=AAAA-MM`, navega entre meses e apresenta saldo inicial,
ajustes, receitas, despesas e saldo final. O primeiro mês parte do saldo informado
na conta. Nos meses seguintes, o fechamento anterior é transportado por cálculo.
Uma correção preserva saldo esperado, saldo real e diferença assinada em
`BalanceAdjustment`; a diferença aparece separadamente e não modifica lançamentos.
Correções exigem sessão, conta ativa do mesmo usuário e mês atual ou passado.

O schema e o SQL de `20260912000000_monthly_balance_adjustments` foram revisados e
aplicados após autorização explícita. A migration cria somente
`balance_adjustment`, com três `DECIMAL(19,2)`, mês em `DATE`, unicidade por conta e
mês, índice por usuário e mês e relações em cascata. A inspeção no
`information_schema` confirmou colunas, índices e as duas relações com
`ON DELETE CASCADE`. `prisma migrate status` informou o banco atualizado.

### Investigação de `src/features/auth` e logs

O arquivo real `.next/dev/logs/next-development.log` registrou a ausência da tabela
`balance_adjustment` antes da aplicação da migration. Após a aplicação, o erro não
se repetiu durante o E2E completo. As entradas posteriores são mensagens do React
DevTools e um aviso de senha inválida, resultado esperado do cenário que testa
credenciais incorretas. A busca ampla anterior também alcançava bundles compilados
que incluem identificadores e textos como `error` e `warn`; eles não representam
eventos do servidor. O aviso antigo de hidratação surgiu durante uma captura
temporária em que o Playwright alterou o estilo do cursor e não está presente no
teste atual.

Lint, TypeScript e os 21 testes direcionados de autenticação passaram. A suíte
completa também preserva schemas, estados dos formulários, sessão, origem/CSRF,
rate limiting e respostas HTTP. Não foi identificada uma falha atual em
`src/features/auth`, portanto nenhum comportamento de autenticação foi alterado.

### Validações desta etapa

| Verificação               | Resultado                                                                    |
| ------------------------- | ---------------------------------------------------------------------------- |
| Formatação                | `npm run format:check` passou.                                               |
| Lint                      | Passou sem avisos.                                                           |
| Typecheck                 | Passou com tipos do Next.js e TypeScript estrito.                            |
| Vitest                    | 87 testes passaram em 19 arquivos.                                           |
| Testes direcionados auth  | 21 testes passaram em 4 arquivos.                                            |
| Prisma validate/generate  | Passaram com Prisma 7.10.0.                                                  |
| Prisma migrate status     | Cinco migrations aplicadas; banco atualizado.                                |
| Build padrão              | Turbopack bloqueado por `EPERM` ao abrir porta interna durante o PostCSS.    |
| Build de produção         | Webpack passou e gerou as nove rotas.                                        |
| Playwright público        | 3 testes passaram no Chromium.                                               |
| Playwright com MySQL      | 1 fluxo completo passou em 8,1 segundos.                                     |
| Audit completo e omit=dev | Zero vulnerabilidades conhecidas em ambos.                                   |
| npm ls --all              | Árvore válida; dependências opcionais ausentes não produziram erro de saída. |
| git diff --check          | Passou.                                                                      |

O build Webpack precisou desativar temporariamente `useTypeScriptCli` porque o
Next.js não interpretou a saída de `tsc --showConfig` neste ambiente. A opção foi
removida de `next.config.ts` depois do build. O código final não contém esse
contorno. O E2E autenticado cobre a criação em duas etapas, ajuste mensal,
persistência decimal, isolamento, logout e expiração. Os usuários temporários
foram removidos ao final. Não houve instalação ou troca de dependências, commit,
push ou deploy.

## Identidade visual em todas as telas atuais

A identidade aprovada na página inicial agora também atende `/entrar`,
`/cadastro`, `/area`, `/contas`, `/categorias` e `/lancamentos`. A aplicação usa
verde profundo, superfícies claras, tipografia do sistema, espaçamento amplo,
cartões suaves e estados de foco visíveis. Nenhuma imagem ou dependência visual
externa foi necessária; a própria página inicial serviu como referência aprovada,
portanto não houve importação do Figma.

As telas de autenticação usam uma composição dividida no desktop e uma coluna no
celular. As telas privadas compartilham marca, saída e navegação com indicação da
rota atual. A área inicial apresenta onboarding ou resumo mensal; contas,
categorias e lançamentos usam formulários e listas com hierarquia visual
consistente. Os fluxos, rótulos, regras financeiras, Server Actions, DTOs e
verificações de sessão e propriedade foram preservados.

Os controles compartilhados agora têm áreas de toque maiores, bordas e foco
uniformes. Um componente de seleção elimina estilos divergentes entre os
formulários. Os cartões distinguem receita, despesa e transferência apenas como
informação de acompanhamento; a interface continua afirmando que nenhuma
movimentação real de dinheiro acontece.

### Conexão local após reinício do MySQL

O E2E inicialmente falhou antes do primeiro cenário porque o contêiner MySQL
estava parado. Depois de iniciar o mesmo contêiner 8.4.12, a porta `127.0.0.1:3306`
respondeu e os logs confirmaram o servidor pronto, mas o MariaDB Connector recusou
o primeiro login `caching_sha2_password` com `ER_CANNOT_RETRIEVE_RSA_KEY`.

A URL usada pelo Prisma agora permite a recuperação da chave RSA somente quando o
host é `localhost`, `127.0.0.1` ou `::1`. Conexões remotas não recebem essa opção
automaticamente. A mesma função prepara a conexão da aplicação e do E2E, mantendo
o fuso `+00:00`. A configuração é compatível com o objeto ou a URL aceitos pelo
[adapter oficial do Prisma](https://www.prisma.io/docs/orm/overview/databases/mysql)
e com a opção documentada pelo
[MariaDB Connector/Node.js](https://mariadb.com/docs/connectors/mariadb-connector-nodejs/node-js-connection-options).
Nenhuma migration foi executada e nenhuma credencial foi exibida ou alterada.

### Validações desta entrega

| Verificação               | Resultado                                                                            |
| ------------------------- | ------------------------------------------------------------------------------------ |
| Inspeção desktop          | `/area`, `/contas` e `/categorias` revisadas em 1280 × 720.                          |
| Inspeção móvel            | `/area`, `/contas` e `/lancamentos` revisadas em 390 × 844.                          |
| Formatação                | `npm run format:check` passou.                                                       |
| Lint                      | Passou sem avisos.                                                                   |
| Typecheck                 | Passou com tipos do Next.js e TypeScript estrito.                                    |
| Vitest                    | 73 testes passaram em 13 arquivos.                                                   |
| Build de produção         | Passou com Webpack nas nove rotas; o Turbopack encontrou bloqueio local.             |
| Playwright público        | 3 testes passaram, incluindo autenticação pública e celular.                         |
| Playwright com MySQL      | 1 fluxo completo passou depois da correção de conexão local.                         |
| Audit completo e omit=dev | Zero vulnerabilidades conhecidas em ambos.                                           |
| npm ls --all              | Árvore válida, sem ELSPROBLEMS.                                                      |
| Comentários manuscritos   | Nenhum foi acrescentado aos arquivos de código.                                      |
| Dependências e migrations | Nenhuma dependência foi instalada; a migration mensal foi aplicada após autorização. |
| git diff --check          | Passou.                                                                              |

O build padrão do Next.js 16 não concluiu porque o processo auxiliar do
Turbopack tentou abrir uma porta durante o processamento do CSS e recebeu
`EPERM`, inclusive após autorização fora do sandbox. O build suportado com
`next build --webpack` compilou, verificou os tipos, gerou as páginas estáticas e
registrou `/area`, `/categorias`, `/contas` e `/lancamentos` como rotas dinâmicas.
A opção temporária que contornou a criação de um subprocesso do TypeScript foi
removida de `next.config.ts` depois da validação.

Os testes dos shells foram escritos antes da implementação e comprovaram o estado
vermelho e depois o verde. O problema de conexão também foi reproduzido primeiro
no E2E e em uma conexão direta; um teste unitário protege a restrição da opção RSA
a hosts locais. Não houve commit, push ou deploy.

## Tela inicial pública

A rota `/` deixou de apresentar uma mensagem técnica de fundação e passou a
explicar o produto em linguagem direta. A página descreve o registro de contas,
receitas, despesas e transferências e informa expressamente que a aplicação não
se conecta a bancos, não guarda valores e não movimenta dinheiro. Cadastro e
entrada permanecem como os únicos destinos de acesso.

A composição usa HTML semântico e continua como Server Component estático, sem
JavaScript interativo ou acesso ao MySQL. Há apenas um `h1`, seções identificadas,
navegação nomeada, atalho para o conteúdo, foco visível e elementos decorativos
ocultos da árvore de acessibilidade. Nenhuma dependência, imagem externa ou dado
financeiro fictício foi acrescentado.

### Validações da tela inicial

| Verificação         | Resultado                                                                  |
| ------------------- | -------------------------------------------------------------------------- |
| Inspeção desktop    | Composição revisada em 1440 × 1000, incluindo a página completa.           |
| Inspeção móvel      | Composição revisada em 390 × 844, sem rolagem horizontal.                  |
| Formatação          | `npm run format:check` passou.                                             |
| Lint                | Passou sem avisos.                                                         |
| Typecheck           | Passou com tipos do Next.js e TypeScript estrito.                          |
| Vitest              | 70 testes passaram em 11 arquivos.                                         |
| Build de produção   | Passou; `/` permanece pré-renderizada como conteúdo estático.              |
| Playwright dirigido | 2 testes passaram para desktop, links de acesso e responsividade em 390px. |
| Playwright público  | 3 testes passaram no Chromium, incluindo a navegação da autenticação.      |
| git diff --check    | Passou.                                                                    |

O teste unitário agora verifica a proposta do produto e os destinos de cadastro
e entrada. O Playwright também protege a ausência de estouro horizontal na
largura móvel. O comentário residual do arquivo `next.config.ts` foi removido em
conformidade com a regra do projeto. Não houve commit, push ou deploy.

## Fase 4: lançamentos pessoais

A fase acrescenta `/lancamentos` para registrar receitas, despesas e transferências
internas. Esses registros existem somente para acompanhamento: não há custódia,
pagamento, integração bancária ou movimentação real de dinheiro.

`FinancialEntry` armazena descrição, tipo, valor positivo `DECIMAL(19,2)`, data
`DATE`, conta obrigatória e categoria opcional. Receita soma e despesa subtrai do
saldo. A categoria precisa ter a mesma natureza do lançamento. `FinancialTransfer`
registra origem e destino distintos; reduz uma conta, aumenta a outra e conserva o
total. Registros removidos usam `deletedAt`, podem ser restaurados e não participam
dos saldos.

Contas e categorias referenciadas precisam estar ativas, pertencer à sessão e ter
data de abertura compatível. Criação, edição, remoção e restauração repetem a
sessão na camada `server-only`. Toda alteração combina o ID do registro com o
`userId`. O saldo atual das contas é derivado no servidor por agregações Prisma e
operações `Decimal`, sem `number`.

### Migrations e recuperação verificada

`20260911010000_financial_entries_and_transfers` cria as duas tabelas, seus índices,
chaves estrangeiras e restrições de valor positivo. A primeira tentativa também
incluía um `CHECK` que comparava as contas da transferência. O MySQL recusou a chave
estrangeira posterior com erro 3823, pois colunas usadas em `CHECK` não podem
participar de ações referenciais.

Como DDL do MySQL não reverteu automaticamente as tabelas criadas antes do erro,
foram confirmados zero registros, removidas somente `financial_entry` e
`financial_transfer`, e a tentativa foi marcada como revertida com
`prisma migrate resolve --rolled-back`. O `CHECK` redundante foi retirado; a regra
de contas distintas permanece obrigatória no Zod. A migration corrigida foi então
aplicada com sucesso.

O primeiro E2E identificou que a combinação inicial de `ON DELETE RESTRICT` com as
cascatas do usuário impedia remover integralmente o usuário de teste. Uma prova
isolada no mesmo MySQL confirmou suporte ao caminho de cascatas múltiplas. A
migration `20260911020000_financial_record_cascades` alterou as três relações com
contas para `ON DELETE CASCADE`. A interface não exclui contas; essa regra permite
apagar todos os dados financeiros quando o próprio usuário for removido. O E2E
seguinte comprovou a limpeza completa.

### Código sem comentários manuscritos

As cinco diretivas de ambiente existentes nos testes foram removidas. O Vitest
agora separa os projetos Node e jsdom em `vitest.config.mts`, preservando o mesmo
comportamento sem comentários nos testes. `AGENTS.md` registra a regra para o
trabalho futuro. Arquivos gerados pelo Next e comentários de migrations aplicadas
anteriormente foram preservados para não alterar artefatos gerados ou checksums.

### Validações da fase 4

| Verificação               | Resultado                                                            |
| ------------------------- | -------------------------------------------------------------------- |
| Prisma validate/generate  | Passaram com Prisma 7.10.0.                                          |
| Prisma migrate status     | Quatro migrations aplicadas; banco atualizado.                       |
| Formatação                | `npm run format:check` passou.                                       |
| Lint                      | Passou sem avisos.                                                   |
| Typecheck                 | Passou com tipos do Next.js e TypeScript estrito.                    |
| Vitest                    | 70 testes passaram em 11 arquivos.                                   |
| Build de produção         | Passou, incluindo `/lancamentos` como rota dinâmica.                 |
| Playwright comum          | 2 testes passaram no Chromium sem banco.                             |
| Playwright com MySQL      | 1 fluxo passou com lançamentos, transferências, saldos e isolamento. |
| Audit completo e omit=dev | Zero vulnerabilidades conhecidas em ambos.                           |
| npm ls --all              | Árvore válida, sem ELSPROBLEMS.                                      |
| Dados temporários         | Zero usuários E2E, registros órfãos, lançamentos ou transferências.  |
| Comentários manuscritos   | Nenhum nos arquivos de código mantidos manualmente.                  |
| git diff --check          | Passou.                                                              |

O E2E persiste um lançamento, comprova `DATE`, categoria, conta e a restrição de
valor positivo no próprio MySQL. Também edita, remove e restaura o registro, cria
uma transferência interna, verifica saldos exatos nas duas contas e confirma que
um segundo usuário não enxerga esses dados. Cookie forjado, logout, replay, senha
incorreta e sessão expirada continuam cobertos.

Não foram adicionadas dependências ou overrides. Não houve ponto flutuante,
integração bancária, `npm audit fix --force`, downgrade do Prisma, reset do banco,
commit, push ou deploy.

## Fase 3: contas e categorias

A fase implementa as primeiras operações financeiras privadas. O modelo
`FinancialAccount` evita colisão com `Account` do Better Auth. Cada conta possui
nome, tipo, moeda BRL, saldo de abertura `DECIMAL(19,2)`, data civil `DATE` e
arquivamento. Categorias pertencem ao usuário, têm natureza `INCOME` ou `EXPENSE`
e também podem ser arquivadas. Cartão de crédito, transações e dashboard não fazem
parte desta entrega.

Essas contas representam agrupadores de acompanhamento preenchidos pelo usuário.
A aplicação não oferece conta bancária, custódia, pagamento, transferência real
ou integração com instituições financeiras.

Nomes de conta são únicos por usuário; nomes de categoria são únicos por usuário
e natureza. Não há exclusão destrutiva na interface. O saldo atual futuro será
derivado do saldo de abertura e das transações, evitando uma segunda fonte de
verdade. Valores são validados, persistidos e devolvidos como decimais exatos;
nenhuma operação monetária usa ponto flutuante.

As rotas `/contas` e `/categorias` são Server Components protegidos. Formulários
interativos usam Server Actions pequenas e Zod no servidor. Cada operação de
dados chama `requireUser()`. Leituras filtram o usuário, criações derivam `userId`
exclusivamente da sessão e alterações combinam `id` e `userId` na mesma consulta.
Campos extras enviados pelo navegador são descartados. As consultas retornam DTOs
explícitos com dinheiro e data como strings, sem expor modelos Prisma.

### Migration financeira aplicada no banco local confirmado

O SQL de `20260911000000_financial_accounts_and_categories` foi comparado com o
schema anterior e revisado antes da aplicação. A versão final contém somente a
criação de `financial_account` e `category`, seus índices, unicidades e duas chaves
estrangeiras para `user` com `ON DELETE CASCADE`. Não contém `DROP`, alterações nas
tabelas do Better Auth, dados iniciais ou comandos de transação.

Uma primeira diferença contra o banco sugeriu recriar dois índices já presentes
em `account` e `session`. A comparação isolada entre o schema anterior e o atual
confirmou que eles não pertenciam à nova alteração, e essas instruções espúrias
foram removidas antes do deploy. `npx prisma migrate status` indicou apenas a nova
migration pendente; `npx prisma migrate deploy` a aplicou e a verificação seguinte
informou o banco atualizado.

A inspeção de `information_schema` no MySQL confirmou `DECIMAL(19,2)`, `DATE`,
enums, nulabilidade, chaves primárias, índices únicos e chaves estrangeiras. O E2E
persistiu `12345678901234567.89` sem perda e leu a data como meia-noite UTC. A
suíte criou somente dois usuários aleatórios e a cascata removeu seus registros de
teste ao final.

### Validações da fase 3

Executadas com Node 24.20.0, npm 11.19.1, Prisma 7.10.0, MySQL 8.4.12 e Chromium
153.0.8010.12:

| Verificação               | Resultado                                                         |
| ------------------------- | ----------------------------------------------------------------- |
| npm ci                    | Passou, incluindo a geração do Prisma Client.                     |
| Prisma validate/generate  | Passaram; duas migrations aplicadas e schema atualizado.          |
| Formatação                | `npm run format:check` passou.                                    |
| Lint                      | Passou sem avisos.                                                |
| Typecheck                 | Passou com tipos do Next.js e TypeScript estrito.                 |
| Vitest                    | 58 testes passaram em 10 arquivos.                                |
| Build de produção         | Passou, incluindo as novas rotas privadas.                        |
| Playwright comum          | 2 testes passaram no Chromium sem banco.                          |
| Playwright com MySQL      | 1 fluxo passou com autenticação, contas, categorias e isolamento. |
| Audit completo e omit=dev | Zero vulnerabilidades conhecidas em ambos.                        |
| npm ls --all              | Árvore válida, sem ELSPROBLEMS.                                   |
| git diff --check          | Passou.                                                           |

Os testes unitários novos cobrem limites e formatação exata de dinheiro,
calendário civil, descarte de `userId`/moeda externos e filtros de propriedade em
criação, edição e arquivamento. O E2E verifica registro real, valor decimal no
limite, data, conflito de nome, edição, arquivamento/restauração, dois usuários
com categorias homônimas e ausência de dados cruzados. O fluxo anterior de cookie
forjado, logout, replay, senha incorreta e expiração permanece coberto.

Não foram adicionadas dependências ou overrides nesta fase. Não houve downgrade
do Prisma, `npm audit fix --force`, reset do banco, dados fictícios permanentes,
commit, push ou deploy. Os arquivos existentes não foram movidos.

## Fase 2: banco e autenticação

Fase autorizada após a revisão de dependências. Foram implementadas as telas
`/cadastro`, `/entrar`, `/area` e a saída de sessão. A área privada consulta a
sessão no servidor e usa DTO explícito. Os formulários usam o cliente HTTP oficial
Better Auth, mantendo cookies, origem/CSRF e rate limiting. As entradas de
cadastro/login são validadas por Zod em um hook no servidor, inclusive chamadas
diretas à API. Na entrega daquela fase ainda não havia funcionalidade financeira.

Foi escolhido MySQL 8.4 LTS para preservar o contrato de suporte e facilitar uma
atualização futura planejada. O bundle 26.7 Innovation encontrado em Downloads
não foi instalado. A imagem oficial Oracle 8.4 foi obtida e identificada como
MySQL Community Server **8.4.12**, digest
`sha256:7dcc4add9183664de3a214daf85a50c3ba6cccfd7534f700b6561bf5b41885be`.

O servidor roda em contêiner Podman rootless `controle-financeiro-mysql`, publica
somente `127.0.0.1:3306` e persiste no volume
`controle-financeiro-mysql-data`. Banco e usuário dedicado se chamam
`controle_financeiro`. Senhas administrativas e da aplicação foram geradas
aleatoriamente e permanecem apenas em `.env.mysql` e `.env`, ignorados pelo Git
e com modo 0600. Nenhum segredo foi exibido ou documentado.

Antes da migration, consultas somente leitura confirmaram versão 8.4.12, banco,
usuário dedicado, fuso de sistema UTC e zero tabelas no schema de destino.

### Migration aplicada no banco local confirmado

`prisma/migrations/20260910000000_auth/migration.sql` foi gerado com:

```sh
npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script --output prisma/migrations/20260910000000_auth/migration.sql
```

O comando usa apenas o schema local. Foram revisados quatro CREATE TABLE
(`user`, `session`, `account`, `verification`), índices únicos, duas relações com
exclusão em cascata e timestamps DATETIME(3). Não há DROP, ALTER de tabelas
preexistentes nem tabelas financeiras; os dois ALTER TABLE adicionam as relações
das tabelas criadas no próprio script. `user.email` foi definido como VARCHAR(254)
para suportar o limite validado pela aplicação. `migration_lock.toml` fixa mysql.

Após a confirmação do destino vazio, `npx prisma migrate deploy` aplicou somente
`20260910000000_auth`. A inspeção posterior encontrou `_prisma_migrations`,
`account`, `session`, `user` e `verification`; o histórico registra conclusão sem
rollback. Não foram usados migrate dev, db push, db execute nem reset.

O primeiro E2E revelou que `initSql` não deve ser passado como query string ao
driver MariaDB: os espaços codificados eram tratados como sinais `+` literais e
causavam erro de sintaxe. O parâmetro redundante foi removido. `timezone=+00:00`
permanece e foi comprovado como fuso da sessão por consulta feita pelo mesmo
Prisma Client da aplicação.

O gerador Prisma agora declara `moduleFormat = "cjs"`. A inferência anterior gerava
`import.meta.url`, incompatível com o carregamento CommonJS feito pelo Playwright.
Essa opção é suportada oficialmente pelo gerador `prisma-client`, não altera o
schema SQL e manteve Next.js, Prisma e TypeScript compatíveis.

### Validação desta fase

Node 24.20.0 e npm 11.19.1, sem novas dependências ou overrides:

| Verificação                   | Resultado                                                                  |
| ----------------------------- | -------------------------------------------------------------------------- |
| npm ci                        | Passou, incluindo geração do Prisma Client.                                |
| Prisma generate e validate    | Passaram com Prisma 7.10.0.                                                |
| Typecheck                     | Passou, incluindo a suíte de banco preparada.                              |
| Lint                          | Passou, sem avisos.                                                        |
| Formatação                    | `npm run format:check` passou após atualizar a documentação.               |
| Vitest                        | 34 testes passaram em 8 arquivos.                                          |
| Build de produção             | Passou; `/`, `/entrar` e `/cadastro` estáticas, `/area` e API dinâmicas.   |
| Playwright comum              | 2 testes passaram no Chromium: página inicial e navegação de autenticação. |
| Audit completo e omit=dev     | Zero vulnerabilidades em ambos.                                            |
| npm ls --all                  | Sem problemas na árvore.                                                   |
| git diff --check              | Passou.                                                                    |
| E2E de autenticação com MySQL | 1 fluxo completo passou no MySQL 8.4.12.                                   |

Todas as validações da tabela foram repetidas após as alterações de banco,
configuração, testes e documentação.

Os testes Vitest acrescentados cobrem normalização e limites de entrada, senha
preservada, estados dos formulários, DTO de sessão e redirecionamento. O handler
real Better Auth foi exercitado usando seu adapter em memória: entrada inválida
retorna 400, origem externa retorna 403 e a quarta tentativa de login na janela
padrão retorna 429. O teste de origem configura `disableOriginCheck: false`
explicitamente, pois o Better Auth relaxa esse comportamento em NODE_ENV=test.

`npm run test:e2e:auth` está configurado em `playwright.auth.config.ts` e
`tests/auth-e2e/auth.spec.ts`. A suíte exige MySQL 8.4 e verifica cadastro e hash
persistido, cookie HttpOnly/SameSite, sessão após reload, duas identidades, cookie
forjado, logout com remoção no banco, replay de cookie revogado, senha incorreta,
login e sessão expirada. Também confirma versão do servidor, banco, usuário e UTC.
Cria dois usuários temporários com UUID e remove somente seus registros, usando as
relações em cascata. A execução passou e a inspeção posterior confirmou zero
usuários, sessões ou contas do teste. A suíte usa HTTP local em desenvolvimento e
não comprova cookies Secure em uma infraestrutura HTTPS de produção.

O rate limiting usa memória do processo; a infraestrutura de proxy e o
armazenamento compartilhado precisam de definição antes de múltiplas instâncias.
Não há recuperação de senha nem verificação de e-mail nesta fase.

README, arquitetura e roadmap foram atualizados. O restante deste documento
preserva a evidência da revisão anterior de dependências. Referências desta fase:
[integração Next.js](https://better-auth.com/docs/integrations/next),
[hooks](https://better-auth.com/docs/concepts/hooks) e
[sessões](https://better-auth.com/docs/concepts/session-management), além dos
guias locais de autenticação e formulários da versão instalada do Next.js.

## Resultado

Recharts atualizado de 2.15.4 para **3.10.1**, a versão estável mais recente da
linha 3 consultada novamente em 10/09/2026. Os três alertas altos foram corrigidos
sem alterar a versão do Prisma: **npm audit completo e npm audit --omit=dev
retornam zero vulnerabilidades conhecidas**.

Prisma, client e adapter permanecem sincronizados em **7.10.0**, ainda a versão
estável mais recente da linha 7. Há **12 entradas transitivas com sufixo de
pré-lançamento**, inventariadas abaixo e mantidas com justificativa. Audit limpo
não significa ausência de pré-lançamentos nem comprovação de segurança absoluta.

Na revisão de dependências nenhum arquivo foi movido, nenhuma migration foi
aplicada e não houve funcionalidade financeira. Nas fases posteriores, as
migrations autorizadas e o domínio descrito acima foram acrescentados. Não houve
push, publicação, deploy, sudo ou alteração de configuração global.
A autorização para Recharts 3 inclui suas dependências internas Redux; não foi
introduzida uma store de estado global na aplicação.

## Ambiente e preservação

- Raiz: `/home/matheus/Documentos/controle-financeiro`.
- Remote: `https://github.com/matheusdpr07/controle-financeiro.git`.
- Branch: `main`. As alterações não commitadas da fundação foram preservadas.
- Validações: Node **24.20.0**, npm **11.19.1**, ativados somente no PATH dos comandos.
- Ambiente global preservado: Node 22.23.1, npm 10.9.8; Git 2.55.0.
- Único lockfile: `package-lock.json`; npm ci reinstala o projeto com sucesso.
- MySQL 8.4.12 LTS agora está validado no contêiner local descrito na fase 2.
- Chromium 153.0.8010.12, revisão Playwright 1243, já instalado. Nenhum navegador
  adicional ou pacote nativo do sistema foi instalado nesta revisão.

O npm global do Fedora tem shebang explícito para Node 22. Os comandos utilizaram
Node/npm isolados no cache, sem alterar os executáveis globais. Para uso habitual,
ative sua instalação de Node 24 com o npm correspondente, conforme README.

## Investigação dos três alertas altos

A auditoria inicial confirmou uma vulnerabilidade de origem e dois alertas
propagados aos consumidores, não três falhas independentes:

```text
prisma@7.10.0
└── @prisma/config@7.10.0
    └── deepmerge-ts@7.1.5
```

| Entrada no audit inicial | Origem do alerta                           | Severidade      |
| ------------------------ | ------------------------------------------ | --------------- |
| deepmerge-ts             | GHSA-ggr8-5vv4-36mx / CVE-2026-40345       | Alta            |
| @prisma/config           | Dependência exata de deepmerge-ts 7.1.5    | Alta, propagada |
| prisma                   | Dependência exata de @prisma/config 7.10.0 | Alta, propagada |

O [aviso oficial](https://github.com/advisories/GHSA-ggr8-5vv4-36mx) descreve
estouro de pilha ao mesclar dois grafos com referências circulares correspondentes.
Afeta deepmerge-ts anterior a 8.0.0; a correção começa em 8.0.0. JSON puro não
representa ciclos. A reprodução local provocou `RangeError: Maximum call stack
size exceeded` em 7.1.5 e preservou a referência circular em 8.0.2.

O código instalado de `@prisma/config/dist/index.js`, função
`loadConfigTsOrJs`, importa apenas `deepmerge` e o fornece como `merger` ao c12.
A configuração desativa leitura de RC, extensão remota e configuração de
package.json. As estruturas utilizadas pelo projeto são registros simples,
strings, arrays, booleanos e valores opcionais. Não há Map, deepmergeInto nem
customizadores nessa integração.

Embora Prisma esteja declarado em devDependencies, Better Auth, seu adapter e
Prisma Client o referenciam como peer opcional. O npm inclui essa cadeia no
conjunto considerado por `audit --omit=dev`. Por isso os alertas apareciam também
nessa auditoria; não era correto classificá-los como automaticamente excluídos
da instalação de produção. Os sete arquivos `.nft.json` examinados após o build
não referenciaram deepmerge-ts, @prisma/config, Studio, visx, gensync ou o pacote
resolve. Isso descreve o build atual, não todos os possíveis usos futuros.

O audit sugeria downgrade para Prisma 6.12.0 com `--force`; essa solução foi
rejeitada por contrariar a stack. Nenhum downgrade ou audit fix --force foi usado.

## Compatibilidade comprovada antes do novo override

Foram lidas as [notas oficiais do deepmerge-ts 8](https://github.com/RebeccaStevens/deepmerge-ts/releases/tag/v8.0.0)
e o CHANGELOG do pacote 8.0.2 baixado com `npm pack`, fora do repositório.
As mudanças incompatíveis envolvem mesclagem de Maps, tipos dos customizadores
e comportamento de deepmergeInto. Essas APIs não são utilizadas pelo carregador
Prisma nesta configuração. O pacote mantém entradas ESM/CJS e suporta Node >=16.9,
incluindo Node 24.

Antes de modificar package.json, a comparação local entre 7.1.5 e 8.0.2 verificou:

1. **1.000 combinações** de configurações com registros, campos opcionais, arrays,
   caminhos e metadados, com igualdade dos resultados.
2. **Oito arquivos de configuração** carregados pelo c12 com os mesmos parâmetros
   empregados pelo Prisma, com resultados equivalentes.
3. O carregamento real de `prisma.config.ts`, com conteúdo equivalente.
4. Exportação da função deepmerge nas entradas ESM e CommonJS.
5. Reprodução da falha de ciclos em 7.1.5 e comportamento corrigido em 8.0.2.

Foi então adicionado somente este override novo e restrito:

```json
"@prisma/config@7.10.0": {
  "deepmerge-ts": "8.0.2"
}
```

Cadeia final confirmada por npm ls:

```text
prisma@7.10.0
└── @prisma/config@7.10.0
    └── deepmerge-ts@8.0.2 (override restrito)
```

Os testes permanentes em `tests/integration/prisma-config.test.ts` exercitam
carregamento real, preservação/precedência de campos e a regressão de ciclos.
A geração/validação Prisma e toda a suíte também passam com o override instalado.
Isso comprova compatibilidade para o uso examinado, **não uma certificação do
mantenedor ou compatibilidade universal entre todas as APIs das linhas 7 e 8**.
Naquela revisão isolada não houve teste de banco ou do Studio; as fases seguintes
validaram Prisma e driver no MySQL, mas não o funcionamento integral do Studio.

Revalidar o override quando a configuração ou a versão do Prisma mudar. Removê-lo
quando uma versão autorizada do Prisma declarar uma dependência corrigida. O
escopo exato evita aplicar silenciosamente essa decisão a outro @prisma/config.

Overrides anteriores preservados, sem criar novas substituições para eles:

| Override anterior | Consumidor e versão originalmente declarada | Versão mantida |
| ----------------- | ------------------------------------------- | -------------- |
| mariadb           | @prisma/adapter-mariadb 7.10.0 → 3.4.5      | 3.5.4          |
| mysql2            | prisma 7.10.0 → 3.15.3                      | 3.24.4         |
| lodash            | Chevrotain → 4.17.21; visx → ^4.17.21       | 4.18.1         |

Essas versões foram mantidas da fundação para preservar correções anteriores.
Persistência e comunicação do adapter com o MySQL real foram exercitadas nas fases
2 e 3. O pacote `mysql2`, usado pelo CLI Prisma, passou em validate, generate,
status e migrate deploy.

## Recharts 3

Foi executado `npm install --save-exact recharts@3.10.1` após consultar versões,
engines, peers e o [guia oficial de migração](https://github.com/recharts/recharts/wiki/3.0-migration-guide).
O pacote aceita Node >=18 e React/React DOM 19. Não existiam gráficos na aplicação
para migrar; a alteração não introduz dashboard ou dados financeiros.

Árvore instalada relevante:

```text
recharts@3.10.1
├── @reduxjs/toolkit@2.12.0
│   ├── redux@5.0.1
│   └── redux-thunk@3.1.0
└── react-redux@9.3.0
    └── redux@5.0.1
```

Esses pacotes são transitivos do Recharts, não dependências diretas escolhidas para
a aplicação. O teste `tests/integration/recharts.test.tsx` monta um gráfico de
exemplo técnico com React 19 e verifica a camada acessível. O componente só existe
no teste; a página inicial permanece igual.

## Inventário completo de pré-lançamentos transitivos

O inventário percorreu todas as entradas de `package-lock.json`, inclusive
ferramentas e dependências opcionais, e consultou versões/dist-tags oficiais do
npm. As alternativas estáveis abaixo são **candidatas**, não substituições cuja
compatibilidade esteja comprovada.

| Pacote                    | Instalado                                           | Estável disponível | Consumidor imediato                                  |
| ------------------------- | --------------------------------------------------- | ------------------ | ---------------------------------------------------- |
| `@prisma/engines-version` | `7.10.0-4.0edf323efd1d98336f3f0a68684b56f689b900d3` | `0.0.1`            | `@prisma/engines`, `@prisma/fetch-engine`            |
| `@visx/curve`             | `4.0.1-alpha.0`                                     | `4.0.0`            | `@prisma/studio-core`, `@visx/grid`, `@visx/shape`   |
| `@visx/event`             | `4.0.1-alpha.0`                                     | `4.0.0`            | `@prisma/studio-core`                                |
| `@visx/grid`              | `4.0.1-alpha.0`                                     | `4.0.0`            | `@prisma/studio-core`                                |
| `@visx/group`             | `4.0.1-alpha.0`                                     | `4.0.0`            | `@prisma/studio-core`, `@visx/grid`, `@visx/shape`   |
| `@visx/point`             | `4.0.1-alpha.0`                                     | `4.0.0`            | `@visx/event`, `@visx/grid`                          |
| `@visx/responsive`        | `4.0.1-alpha.0`                                     | `4.0.0`            | `@prisma/studio-core`                                |
| `@visx/scale`             | `4.0.1-alpha.0`                                     | `4.0.0`            | `@prisma/studio-core`, `@visx/grid`, `@visx/shape`   |
| `@visx/shape`             | `4.0.1-alpha.0`                                     | `4.0.0`            | `@prisma/studio-core`, `@visx/grid`                  |
| `@visx/vendor`            | `4.0.0-alpha.0`                                     | `4.0.0`            | `@visx/curve`, `@visx/scale`, `@visx/shape`          |
| `gensync`                 | `1.0.0-beta.2`                                      | `0.1.0`            | `@babel/core`                                        |
| `resolve`                 | `2.0.0-next.7`                                      | `1.22.12`          | `eslint-import-resolver-node`, `eslint-plugin-react` |

**Decisões por família:**

- **visx (9 pacotes):** cadeia `prisma@7.10.0 → @prisma/studio-core@0.33.0 →
@visx/*`. O Studio 0.33.0 ainda é a versão estável mais recente consultada e
  fixa explicitamente os alphas. Há visx 4.0.0 estável; para oito pacotes ele é
  anterior ao pin 4.0.1-alpha.0, e vendor também está fixado explicitamente. Não
  se comprovou que substituir a família inteira preservaria todos os recursos do
  Studio. Nenhum override de visx ou Studio foi criado.
- **gensync:** `eslint-config-next → eslint-plugin-react-hooks → @babel/core`,
  além de `auth`/`shadcn → @babel/core → gensync`. Babel 7.29.7 exige
  `^1.0.0-beta.2`; o dist-tag latest continua apontando para beta. A versão estável
  0.1.0 pertence a outra linha. Não foi feito downgrade nem substituição de Babel.
- **resolve:** `eslint-config-next → eslint-plugin-react@7.37.5 → resolve`, e
  `eslint-config-next → eslint-import-resolver-node@0.3.10 → resolve` (também
  alcançado via eslint-plugin-import). Os ranges são ^2.0.0-next.5 e
  ^2.0.0-next.6. A versão estável 1.22.12 não satisfaz esses ranges. Mantido sem
  override de versão principal.
- **engines-version:** identificador interno fixado por @prisma/engines e
  @prisma/fetch-engine, com hash do engine. É um pré-lançamento segundo a sintaxe
  SemVer, mas representa o engine selecionado pela release estável Prisma 7.10.0.
  Não deve ser substituído pelas antigas versões 0.0.x apenas para remover o
  sufixo, pois perderia o alinhamento com os engines do ORM.

visx e engines-version aparecem sem `dev: true` no lockfile pela cadeia opcional
do Prisma descrita acima. gensync e resolve são marcados como dev. Nenhuma dessas
entradas apresenta advisory no audit final; isso não elimina o risco de usar
pré-lançamentos. A restrição inicial de ausência absoluta deles continua sendo
uma pendência da stack transitiva. Todos os pacotes diretos são estáveis e exatos.

O CLI auth permanece em 1.6.22: sua atualização para 1.7.3 introduziria c12 beta.
Não houve troca adicional do CLI ou do Better Auth nesta revisão.

## Correção adicional do lockfile

Depois da primeira rodada verde, `npm ls --all` encontrou ELSPROBLEMS: o binário
opcional lightningcss-linux-x64-musl 1.32.0 era resolvido indevidamente pelo
Lightning CSS 1.33.0 do Vite. O lockfile omitia a restrição `libc` da versão 1.32.0,
embora o manifesto oficial exija musl; a máquina usa glibc.

Foram restaurados os campos `libc` ausentes de **22 entradas opcionais Linux**
(SWC, Tailwind Oxide, unrs e Lightning CSS), exclusivamente conforme a resposta
`npm view PACOTE@VERSAO libc --json`. Nenhuma versão, integrity ou dependência
foi alterada por essa correção, e nenhum override novo foi necessário.

Após npm ci, o npm passou a selecionar os binários da libc adequada e
`npm ls --all --json` retornou sem problemas. A rodada de validação foi repetida
após essa correção. Não foram removidos arquivos-fonte nem excluídas dependências
opcionais necessárias do projeto.

## Versões diretas instaladas

Cada versão abaixo foi comparada com o package.json efetivamente instalado em
node_modules. Todas coincidem com o manifesto do projeto.

| Pacote                        | Versão  | Grupo      |
| ----------------------------- | ------- | ---------- |
| `@better-auth/prisma-adapter` | 1.7.3   | Aplicação  |
| `@prisma/adapter-mariadb`     | 7.10.0  | Aplicação  |
| `@prisma/client`              | 7.10.0  | Aplicação  |
| `animejs`                     | 4.5.0   | Aplicação  |
| `better-auth`                 | 1.7.3   | Aplicação  |
| `class-variance-authority`    | 0.7.1   | Aplicação  |
| `cn`                          | 0.2.6   | Aplicação  |
| `next`                        | 16.3.4  | Aplicação  |
| `radix-ui`                    | 1.6.7   | Aplicação  |
| `react`                       | 19.2.8  | Aplicação  |
| `react-dom`                   | 19.2.8  | Aplicação  |
| `recharts`                    | 3.10.1  | Aplicação  |
| `server-only`                 | 0.0.1   | Aplicação  |
| `zod`                         | 4.5.4   | Aplicação  |
| `@playwright/test`            | 1.63.0  | Ferramenta |
| `@tailwindcss/postcss`        | 4.3.3   | Ferramenta |
| `@testing-library/dom`        | 10.4.1  | Ferramenta |
| `@testing-library/jest-dom`   | 7.0.1   | Ferramenta |
| `@testing-library/react`      | 16.3.3  | Ferramenta |
| `@types/node`                 | 24.13.3 | Ferramenta |
| `@types/react`                | 19.2.18 | Ferramenta |
| `@types/react-dom`            | 19.2.7  | Ferramenta |
| `@vitejs/plugin-react`        | 6.1.1   | Ferramenta |
| `auth`                        | 1.6.22  | Ferramenta |
| `dotenv`                      | 17.4.2  | Ferramenta |
| `eslint`                      | 9.39.5  | Ferramenta |
| `eslint-config-next`          | 16.3.4  | Ferramenta |
| `jsdom`                       | 30.0.1  | Ferramenta |
| `prettier`                    | 3.9.6   | Ferramenta |
| `prettier-plugin-tailwindcss` | 0.8.1   | Ferramenta |
| `prisma`                      | 7.10.0  | Ferramenta |
| `shadcn`                      | 4.21.0  | Ferramenta |
| `tailwindcss`                 | 4.3.3   | Ferramenta |
| `typescript`                  | 5.9.3   | Ferramenta |
| `vite`                        | 8.2.2   | Ferramenta |
| `vitest`                      | 4.1.11  | Ferramenta |

## Validações da revisão de dependências (anteriores à fase 2)

A sequência solicitada foi executada com Node 24.20.0 e npm 11.19.1, sem migrations:

| Ordem | Comando/verificação     | Resultado                                                                 |
| ----- | ----------------------- | ------------------------------------------------------------------------- |
| 1     | npm install             | Passou, com postinstall Prisma.                                           |
| 2     | npm run prisma:generate | Passou, Prisma 7.10.0, sem banco.                                         |
| 3     | npm run format:check    | Passou.                                                                   |
| 4     | npm run lint            | Passou, sem avisos de lint.                                               |
| 5     | npm run typecheck       | Passou, incluindo next typegen.                                           |
| 6     | npm test                | Passou: 4 arquivos, 13 testes.                                            |
| 7     | npm run build           | Passou: / estática e /api/auth/[...all] dinâmica.                         |
| 8     | npm run test:e2e        | Passou: 1 smoke test Chromium sem MySQL.                                  |
| 9     | npm audit --omit=dev    | Passou: zero vulnerabilidades.                                            |
| 10    | git status              | Revisado; alterações preservadas, sem staging/commit.                     |
| 11    | git diff --stat         | Revisado; inclui a fundação anterior ainda não commitada.                 |
| 12    | Revisão de package.json | Passou: versões diretas/overrides exatos e estáveis; Prisma sincronizado. |

Verificações adicionais: npm ci, prisma validate, audit completo, npm ls --all,
correspondência de versões instaladas, inventário de pré-lançamentos e git diff
--check. O smoke test inicia e encerra o servidor de produção automaticamente.
A formatação é conferida novamente após finalizar este relatório.

**Avisos restantes:** ESLint 9.39.5 está fora de suporte; os plugins React e Import
usados pela configuração Next atual ainda não declaram ESLint 10. npm 11.19.1
informa scripts de dependências sem entradas em allowScripts; não foi aprovada
execução global ou indiscriminada. A geração Prisma do projeto passou. O CLI
sugere Prisma 8 RC, ignorado conforme a arquitetura. Playwright emite aviso de
NO_COLOR/FORCE_COLOR; o teste passou com o Chromium previamente instalado para
Ubuntu 24.04 no Fedora. O CI remoto não foi disparado, porque não houve push.

## Comandos de investigação e alteração

- pwd; git status; git branch --show-current; git remote -v; leitura de AGENTS.md,
  package.json, lockfile, documentação e código instalado dos consumidores.
- npm view prisma@7 version --json; npm view recharts@3 version --json;
  consultas de dependencies, peerDependencies, engines, dist-tags e versões.
- npm audit --json; npm audit --omit=dev; npm explain deepmerge-ts --json;
  npm ls deepmerge-ts recharts redux react-redux @reduxjs/toolkit --all.
- npm pack deepmerge-ts@8.0.2 --pack-destination /tmp/controle-review-deepmerge --json;
  inspeção do CHANGELOG e comparação em processo isolado antes do override.
- npm install --save-exact recharts@3.10.1, depois do override restrito comprovado.
- npm view dos metadados libc nas versões exatas; restauração do lockfile e npm ci.
- npx prettier --write nos arquivos alterados; todos os comandos da tabela acima.
- npm ls --all --json; conferência de versões e dependências opcionais;
  análise dos arquivos de rastreamento de dependências gerados pelo build.

## Arquivos desta revisão

| Arquivo                                 | Alteração                                             |
| --------------------------------------- | ----------------------------------------------------- |
| package.json                            | Recharts 3.10.1 e override restrito de deepmerge-ts.  |
| package-lock.json                       | Árvore correspondente e metadados libc corrigidos.    |
| tests/integration/prisma-config.test.ts | Novo: três testes de compatibilidade e segurança.     |
| tests/integration/recharts.test.tsx     | Novo: renderização acessível com React 19.            |
| README.md                               | Decisões atuais de Recharts e override.               |
| docs/ARCHITECTURE.md                    | Versões, limites do override e estratégia dos testes. |
| docs/VALIDATION.md                      | Este relatório, substituindo os resultados antigos.   |

Na revisão de dependências, fontes da aplicação, schema, rotas, UI e CI foram
preservados. As fases 2 e 3 acrescentaram os arquivos descritos no início deste
relatório. LICENSE e Git permanecem preservados; não houve staging, commit, push
ou deploy nesta fase.

## Próximos passos mapeados

1. Manter Node 24 com seu npm e iniciar o contêiner MySQL no desenvolvimento.
2. Projetar transações com `DECIMAL(19,2)`, data financeira `DATE`, timestamps UTC,
   convenção de sinais, transferências e regras de edição/exclusão. Comprovar que
   conta e categoria pertencem à sessão em toda operação.
3. Construir o dashboard a partir de agregações mensais no servidor. Entregar ao
   Recharts 3 apenas DTOs serializáveis e cobrir estado vazio, virada do mês,
   responsividade e acessibilidade.
4. Aprofundar IDOR, concorrência, entradas malformadas e sessões. Antes de escalar
   para múltiplas instâncias, configurar proxies confiáveis e armazenamento
   compartilhado para rate limiting.
5. Preparar produção apenas depois: HTTPS, segredos externos, backup/restauração
   testados, migrate deploy, observabilidade e recuperação/verificação de e-mail.
6. Acompanhar releases estáveis que eliminem os pré-lançamentos transitivos e
   tornem desnecessário o override; revalidar a cada atualização do Prisma.

## Fontes oficiais

- [Prisma 7 e MySQL](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/mysql)
- [Configuração Prisma 7](https://www.prisma.io/docs/orm/v7/reference/prisma-config-reference)
- [Gerador Prisma Client](https://www.prisma.io/docs/orm/v7/prisma-schema/overview/generators)
- [MySQL: linhas LTS e Innovation](https://dev.mysql.com/doc/refman/8.4/en/mysql-releases.html)
- [MySQL 8.4 em contêiner](https://dev.mysql.com/doc/refman/8.4/en/docker-mysql-getting-started.html)
- [Advisory deepmerge-ts](https://github.com/advisories/GHSA-ggr8-5vv4-36mx)
- [Release deepmerge-ts 8.0.0](https://github.com/RebeccaStevens/deepmerge-ts/releases/tag/v8.0.0)
- [Recharts: migração para 3](https://github.com/recharts/recharts/wiki/3.0-migration-guide)
- [npm: overrides](https://docs.npmjs.com/cli/v11/configuring-npm/package-json#overrides)
- Manifests e dist-tags do registro oficial npm para as versões identificadas.
- Guia local do Next instalado: node_modules/next/dist/docs/01-app/02-guides/package-bundling.md;
  não foi utilizado o analisador experimental.
