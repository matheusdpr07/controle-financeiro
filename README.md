# Controle Financeiro

Aplicação financeira pessoal em desenvolvimento. Cadastro, entrada, saída,
contas financeiras, categorias e lançamentos estão implementados em uma área
protegida pela sessão. O dashboard mensal acompanha saldo inicial, ajustes,
receitas, despesas e saldo final. O fluxo foi validado em MySQL 8.4 LTS.

O produto é um organizador de informações financeiras pessoais. Ele registra os
dados informados pelo usuário e calcula visões para acompanhamento. Não mantém
dinheiro, não executa pagamentos ou transferências e não se conecta a instituições
financeiras nesta etapa.

## Executar sem banco

Use Node.js 24 LTS e npm. Com nvm já instalado:

```sh
nvm install
nvm use
npm ci
npm run dev
```

Abra <http://localhost:3000>. Não é necessário criar `.env` para a página inicial.
`npm ci` gera o client Prisma sem abrir conexão. As dependências são fixadas em
versões exatas; `.npmrc` impede instalação com outra linha do Node.

A validação desta entrega usa Node 24.20.0 e npm 11.19.1 em ambiente isolado.
O Node/npm globais não foram alterados. No Fedora deste ambiente, `/usr/bin/npm`
executa explicitamente Node 22; selecionar apenas outro `node` no PATH não basta.
Use o npm fornecido junto com sua instalação do Node 24.

## Tema e interface

A interface oferece os temas automático, claro e escuro em todas as rotas. O
botão no cabeçalho alterna entre as três preferências e mantém a escolha neste
navegador. Na primeira visita, o modo automático acompanha o tema do sistema.

A página inicial usa uma composição SVG própria e Anime.js para movimentos leves.
Com a preferência de redução de movimento ativada no sistema, o conteúdo aparece
diretamente no estado final. Cadastro, entrada e toda a área privada continuam
funcionais sem depender dessas animações.

Em telas de desktop com mouse, um gesto vertical da roda avança ou retorna uma
seção completa da página inicial. Gestos adicionais são aguardados até o término
da transição. Celular e telas menores preservam a rolagem nativa.

## Comandos

| Comando                             | Finalidade                                                                              |
| ----------------------------------- | --------------------------------------------------------------------------------------- |
| `npm run dev`                       | Servidor de desenvolvimento.                                                            |
| `npm run build`                     | Build de produção.                                                                      |
| `npm start`                         | Servidor de produção, após build.                                                       |
| `npm run lint`                      | ESLint, sem avisos permitidos.                                                          |
| `npm run typecheck`                 | Geração de tipos Next.js e TypeScript estrito.                                          |
| `npm run format`                    | Formatar arquivos.                                                                      |
| `npm run format:check`              | Conferir formatação.                                                                    |
| `npm test`                          | Testes Vitest e React Testing Library.                                                  |
| `npm run test:watch`                | Vitest em modo watch.                                                                   |
| `npm run test:e2e`                  | Smoke test Chromium com servidor de produção automático.                                |
| `npm run test:e2e:auth`             | Fluxo completo de autenticação no MySQL 8.4 local.                                      |
| `npm run prisma:generate`           | Gerar Prisma Client sem conexão.                                                        |
| `npm run auth:generate`             | Gerar candidato ao schema de autenticação para revisão.                                 |
| `npm run db:migrate -- --name NOME` | Criar/aplicar migration de desenvolvimento, somente após confirmar banco e credenciais. |
| `npm run db:studio`                 | Abrir Prisma Studio com banco configurado.                                              |

Para o teste de navegador:

```sh
npx playwright install chromium
npm run build
npm run test:e2e
```

Somente Chromium é necessário. Não execute instalação de dependências do sistema
com sudo por conta desta configuração.

## MySQL local e autenticação

O desenvolvimento usa **MySQL Community Server 8.4.12 LTS** na imagem oficial da
Oracle, em um contêiner Podman rootless. O servidor não foi instalado globalmente.
O bundle MySQL 26.7 presente em Downloads pertence à linha Innovation e não foi
usado. A linha 8.4 preserva o contrato LTS definido para o projeto.

| Item                 | Configuração local                                                        |
| -------------------- | ------------------------------------------------------------------------- |
| Contêiner            | `controle-financeiro-mysql`                                               |
| Imagem               | `container-registry.oracle.com/mysql/community-server:8.4`                |
| Digest validado      | `sha256:7dcc4add9183664de3a214daf85a50c3ba6cccfd7534f700b6561bf5b41885be` |
| Banco                | `controle_financeiro`                                                     |
| Usuário da aplicação | `controle_financeiro`                                                     |
| Rede                 | `127.0.0.1:3306`, sem exposição externa                                   |
| Dados                | volume `controle-financeiro-mysql-data`                                   |

As credenciais aleatórias estão em `.env` e `.env.mysql`, ambos ignorados pelo
Git e com permissão `0600`. O primeiro é lido pela aplicação; o segundo existe
somente para administrar o contêiner. Nenhum valor secreto está documentado.

```sh
podman start controle-financeiro-mysql
podman stop controle-financeiro-mysql
podman logs --tail 50 controle-financeiro-mysql
```

Após reiniciar a máquina, execute o primeiro comando antes de iniciar a aplicação.
Para recriar o ambiente, copie `.env.mysql.example`, gere duas senhas diferentes
com `openssl rand -hex 24`, crie o volume e execute o contêiner com a mesma imagem,
porta, banco e usuário. Fixe o digest acima para reproduzir exatamente o ambiente
validado; atualizações de patch da linha 8.4 devem passar por backup e validações.

```sh
podman volume create controle-financeiro-mysql-data
podman run --detach --name controle-financeiro-mysql --restart=unless-stopped \
  --publish 127.0.0.1:3306:3306 --env-file .env.mysql \
  --volume controle-financeiro-mysql-data:/var/lib/mysql:Z \
  container-registry.oracle.com/mysql/community-server:8.4@sha256:7dcc4add9183664de3a214daf85a50c3ba6cccfd7534f700b6561bf5b41885be
```

Cinco migrations estão aplicadas. Elas criam os modelos Better Auth, contas,
categorias, lançamentos e transferências internas, além de ajustar as cascatas de
remoção integral do usuário. `Account` continua sendo credencial de autenticação.
Não use reset; toda migration futura continua exigindo revisão do SQL e confirmação
do destino.

A conexão configura o driver e a sessão MySQL em UTC. Para acesso remoto, revise
TLS e certificados com o administrador; não desative a validação TLS.

O E2E com banco inicia um servidor de desenvolvimento separado na porta
3101, com as URLs de autenticação e pública ajustadas somente nesse processo.
Usa o banco de desenvolvimento indicado pelo `.env`, exige MySQL 8.4, cria dois
usuários com identificadores aleatórios e remove somente esses usuários e seus
registros relacionados ao terminar. Valida contas, categorias, lançamentos,
transferências internas, saldos derivados, precisão decimal, data civil, edição,
remoção reversível e isolamento. Também expira uma sessão criada pelo próprio
teste. Não execute essa suíte em produção. Os testes comuns e o smoke não precisam
de conexão. O HTTP local não comprova cookies Secure.

Os formulários usam o cliente oficial Better Auth e seu Route Handler. A validação
Zod acontece no servidor antes do cadastro/login; senhas novas exigem 12 a 128
caracteres. A página `/area` consulta a sessão no servidor, expõe apenas nome e
e-mail e dá acesso a `/contas`, `/categorias` e `/lancamentos`. Todas as operações
validam Zod, derivam o usuário da sessão e filtram alterações pelo proprietário.
Não há recuperação de senha nem verificação de e-mail nesta fase.

A geração do Better Auth usa `prisma/auth.config.ts`, configuração exclusiva do
CLI que compartilha as opções de autenticação do servidor, sem banco nem segredos.
O comando grava em `prisma/auth.generated.prisma` (ignorado), nunca substitui o
schema principal. Compare os modelos e preserve o `output` do generator ao
incorporar alterações. A ausência de base URL produz um aviso esperado nesse
comando offline; a configuração real do servidor exige URL e segredo válidos.

## Decisões e limitações

- Prisma/client/adapter ficam em 7.10.0; não migrar automaticamente para Prisma 8.
- ESLint 9 permanece por compatibilidade dos plugins React/Import, que ainda
  não declaram suporte à linha 10; há aviso de fim de suporte no npm.
- Vitest 4.1.11 respeita os peer dependencies do Better Auth; Vitest 5 foi rejeitado.
- Recharts 3.10.1 substitui a linha 2 por solicitação explícita. Redux e React Redux
  são dependências internas do Recharts; a aplicação não cria uma store global.
- Anime.js 4.5.0 anima somente a página inicial. Os vetores são locais, o conteúdo
  existe antes do movimento e `prefers-reduced-motion` desativa a animação.
- CLI `auth` 1.6.22 gera os modelos básicos usados por Better Auth 1.7.3. O CLI
  1.7 inclui c12 beta; por isso foi evitado. Novos plugins exigem nova revisão.
- Os overrides anteriores de mariadb, mysql2 e lodash foram preservados. Um override
  restrito a `@prisma/config@7.10.0` usa `deepmerge-ts@8.0.2` para corrigir
  GHSA-ggr8-5vv4-36mx, após comparação de comportamento e testes de regressão.
  A comprovação e seus limites estão em `docs/VALIDATION.md`. Reavalie esse
  override a cada atualização do Prisma; ele não altera a versão do ORM.
- A exigência de ausência absoluta de pré-lançamentos não é atendida na árvore
  transitiva: Prisma Studio inclui `@visx/*` alpha, Babel inclui gensync beta e
  ESLint inclui resolve next. Não foram forçadas versões internas incompatíveis.
  Todos os pacotes declarados diretamente são estáveis e exatos.
- shadcn/ui usa o preset neutro Radix Nova, somente button/input/label/card. O helper
  `cn` é importado do pacote oficial gerado pelo CLI; não há `utils.ts` nem barrel.
- Fontes do sistema permitem build sem baixar fontes do Google. Valores financeiros
  são normalizados e formatados como strings por `money.ts`, sem passar por ponto
  flutuante. Datas financeiras trafegam no formato `AAAA-MM-DD`.
- A moeda desta fase é BRL. Cartão de crédito aguarda um modelo próprio de fatura,
  vencimento, fechamento, limite e passivo. Contas e categorias são arquivadas,
  sem exclusão destrutiva pela interface.
- Lançamentos armazenam valores positivos; receita ou despesa define seu efeito no
  saldo. Transferências alteram somente as duas contas cadastradas e têm efeito
  total zero. Remoções são reversíveis e deixam o registro histórico disponível.

Consulte [arquitetura](docs/ARCHITECTURE.md), [domínio](docs/DOMAIN.md),
[roadmap](docs/ROADMAP.md) e [relatório de validação](docs/VALIDATION.md).
