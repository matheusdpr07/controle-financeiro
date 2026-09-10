# Validação da fundação, dependências e autenticação — 10/09/2026

## Fase 2: banco e autenticação

Fase autorizada após a revisão de dependências. Foram implementadas as telas
`/cadastro`, `/entrar`, `/area` e a saída de sessão. A área privada consulta a
sessão no servidor e usa DTO explícito. Os formulários usam o cliente HTTP oficial
Better Auth, mantendo cookies, origem/CSRF e rate limiting. As entradas de
cadastro/login são validadas por Zod em um hook no servidor, inclusive chamadas
diretas à API. Não há funcionalidade financeira.

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

Na revisão de dependências nenhum arquivo foi movido e nenhuma migration foi
aplicada. Considerando toda a entrega atual, não houve funcionalidade financeira,
commit, push, publicação, deploy, sudo ou alteração de configuração global.
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
Não houve teste de banco, migração ou funcionamento integral do Studio.

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
Persistência e comunicação dos drivers com um MySQL real ainda não foram testadas.

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
preservados. A fase 2 acrescentou os arquivos de autenticação e testes descritos
no início deste relatório. LICENSE e Git permanecem preservados; não houve
arquivos financeiros, staging, commit, push ou deploy.

## Próximos passos mapeados

1. Ativar Node 24 com seu npm e iniciar o contêiner MySQL no desenvolvimento.
2. Antes da fase financeira, aprovar os conceitos de conta e categoria: nome do
   modelo que evita `Account` do Better Auth, moeda, tipos, saldo inicial ou
   derivado, categorias de receita/despesa, arquivamento e exclusão.
3. Implementar contas e categorias com Zod no servidor, sessão validada, filtro
   obrigatório pelo dono, DTOs explícitos e testes entre dois usuários. Revisar
   o SQL e confirmar o banco antes da próxima migration.
4. Projetar transações com `DECIMAL(19,2)`, data financeira `DATE`, timestamps UTC,
   convenção de sinais, transferências e regras de edição/exclusão. Comprovar que
   conta e categoria pertencem à sessão em toda operação.
5. Construir o dashboard a partir de agregações mensais no servidor. Entregar ao
   Recharts 3 apenas DTOs serializáveis e cobrir estado vazio, virada do mês,
   responsividade e acessibilidade.
6. Aprofundar IDOR, concorrência, entradas malformadas e sessões. Antes de escalar
   para múltiplas instâncias, configurar proxies confiáveis e armazenamento
   compartilhado para rate limiting.
7. Preparar produção apenas depois: HTTPS, segredos externos, backup/restauração
   testados, migrate deploy, observabilidade e recuperação/verificação de e-mail.
8. Acompanhar releases estáveis que eliminem os pré-lançamentos transitivos e
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
