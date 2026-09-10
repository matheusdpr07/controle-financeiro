# Arquitetura

## Stack

Node.js 24 LTS; Next.js 16 com App Router, React 19, TypeScript estrito,
`src/` e alias `@/*`; Tailwind CSS 4 e shadcn/ui com CSS variables;
MySQL 8.4 LTS; Prisma ORM 7 com `@prisma/adapter-mariadb`;
Better Auth com adapter Prisma e Zod 4.

Vitest e React Testing Library cobrem unidades e renderização. Playwright cobre
fluxos completos com Chromium. ESLint, Prettier e prettier-plugin-tailwindcss
padronizam o código. Recharts está reservado para a fase de dashboard, instalado
por exigência da fundação, sem gráficos ou dados fictícios nesta etapa.

As versões exatas estão em `package.json` e a árvore reproduzível em
`package-lock.json`. Prisma, `@prisma/client` e `@prisma/adapter-mariadb` permanecem
sincronizados em 7.10.0, a versão estável mais recente da linha 7 consultada em
10/09/2026. A linha 7 oferece a integração MySQL escolhida. A adoção da linha 8
exige revisão explícita de compatibilidade e autorização, inclusive no Dependabot.

Vitest usa a linha 4, aceita pelos peer dependencies do Better Auth. Recharts usa
3.10.1, atualizado por solicitação explícita. Redux, React Redux e Redux Toolkit
são dependências internas do Recharts; não há store global criada pela aplicação.

O override de `deepmerge-ts` para 8.0.2 fica limitado a `@prisma/config@7.10.0`.
Sua compatibilidade foi verificada no carregamento da configuração do projeto
e nos tipos de valores usados pelo Prisma. Os testes cobrem a preservação dos
campos e a correção de referências circulares. Não há promessa de compatibilidade
com todas as APIs do deepmerge-ts. Revalidar e remover o override quando o Prisma
incluir uma versão corrigida oficialmente. Evidências em `docs/VALIDATION.md`.

## Responsabilidades

- `src/app`: rotas, layouts, composição de telas e Route Handlers.
- `src/features/auth`: formulários, saída e schemas de entrada da autenticação.
  Outros domínios serão criados conforme o escopo autorizado: `accounts`,
  `categories`, `transactions`, `dashboard` e `profile`.
- `src/components/ui`: componentes genéricos do shadcn/ui. Outros componentes
  compartilhados ficam em `src/components` apenas quando houver uso real.
- `src/lib/auth`: opções, configuração do servidor e cliente Better Auth.
- `src/lib/db`: conexão e singleton Prisma, exclusivamente no servidor.
- `src/lib/env.ts`: validação tipada e acesso centralizado às variáveis.
- `prisma`: schema e migrations revisadas. A inicial de autenticação está aplicada
  no banco local confirmado.
- `src/generated/prisma`: client gerado, ignorado no Git e recriado no postinstall.
- `tests/unit`, `tests/integration`, `tests/e2e`: testes separados por finalidade.

`money.ts`, `dates.ts` e diretórios de features serão criados quando necessários.
Não há placeholders vazios para forçar diretórios no Git.

## Fluxo planejado

Interface → Server Action → Zod → autenticação/autorização → acesso a dados → MySQL.

Esse fluxo se aplica às futuras operações financeiras. Cadastro, login e logout
usam o cliente oficial Better Auth → Route Handler → middleware de validação Zod
no servidor → adapter Prisma. Isso mantém o fluxo HTTP de cookies, verificação
de origem/CSRF e rate limiting da biblioteca. Não há Server Actions de autenticação
nem necessidade do plugin `nextCookies` nesta integração.

A sessão validada determina o usuário. Toda consulta privada deverá restringir
os registros ao dono. IDs recebidos do navegador são entradas não confiáveis.
Respostas ao cliente usam objetos explícitos, nunca modelos Prisma completos.

## Banco e ambiente

O generator `prisma-client` produz TypeScript em caminho explícito e fixa
`moduleFormat = "cjs"`, coerente com o formato do projeto e do executor Playwright.
O datasource usa `mysql`; a URL de ferramentas fica em `prisma.config.ts`. O adapter oficial
MariaDB atende MySQL; seu nome não significa troca do servidor para MariaDB.

O banco local é MySQL Community Server 8.4.12 na imagem oficial Oracle, executada
com Podman rootless. A porta 3306 está ligada somente a 127.0.0.1 e os dados ficam
no volume nomeado `controle-financeiro-mysql-data`. Banco e usuário dedicados se
chamam `controle_financeiro`; a aplicação não usa root. As credenciais ficam em
arquivos locais ignorados e com permissão 0600.

A conexão e o Better Auth são inicializados sob demanda. Importar uma rota durante
o build não valida segredos nem abre conexões. A página inicial, testes e CI
funcionam sem `.env`. Ao usar autenticação, as variáveis obrigatórias são validadas
com mensagens que identificam os campos sem incluir os valores.

`prisma.config.ts` aceita URL ausente apenas para permitir geração offline; não
há credencial fictícia. Operações reais de banco exigem `.env` preenchido.
Use apenas um usuário dedicado, nunca root. O parâmetro `timezone=+00:00` do driver
configura também a sessão MySQL em UTC, comportamento comprovado no E2E. Datas
financeiras não devem sofrer conversão de fuso. TLS e certificados
para banco remoto deverão ser configurados de acordo com o provedor, sem desativar
validação de certificados.

## Segurança

Banco e autenticação possuem `server-only`. Variáveis privadas não usam prefixo
público. A URL pública contém somente a origem e deve corresponder à origem da
autenticação. Em produção as URLs exigem HTTPS e cookies usam `Secure`, `HttpOnly`
e `SameSite=Lax`. O Better Auth mantém suas verificações de origem e CSRF.

E-mail e senha estão habilitados nas telas `/entrar` e `/cadastro`. Nome e e-mail
são normalizados no servidor; a senha é preservada e exige de 12 a 128 caracteres
no cadastro. A coluna de e-mail é VARCHAR(254), alinhada ao limite da entrada.
Erros comuns de login não distinguem conta inexistente de senha incorreta.

`requireUser()` valida a sessão pelo Better Auth em cada renderização de `/area`
e retorna um DTO explícito com id, nome e e-mail. Headers são lidos antes da
inicialização do servidor de autenticação, mantendo o build independente do banco.
Não há autorização baseada somente na presença de um cookie.

Sessões usam persistência via Prisma, expiração configurada para sete dias e
cache de sessão em cookie desativado. O logout usa o endpoint oficial de revogação.
O limite de tentativas HTTP está habilitado também em desenvolvimento; usa memória
do processo e as regras padrão da biblioteca. Antes de múltiplas instâncias, será
necessário definir armazenamento compartilhado e configurar os proxies confiáveis
conforme a infraestrutura real. Persistência, revogação e isolamento foram
exercitados no MySQL local; essa evidência não substitui a validação futura da
infraestrutura de produção.
Não existe autorização de domínio implementada porque não há operações financeiras.

## Testes e CI

Unidades verificam ambiente, schemas, DTO de sessão e redirecionamento. React
Testing Library verifica a página inicial e os estados de sucesso, erro e espera
dos formulários. O smoke test inicia o servidor de produção e verifica a página
inicial e a navegação entre cadastro e entrada sem depender do MySQL.
Testes de integração atuais verificam o carregador de configuração do Prisma,
o merger corrigido e a renderização acessível do Recharts 3 com React 19.
O handler real do Better Auth também é testado com o adapter em memória da própria
biblioteca: entradas inválidas, normalização, origem e limite de tentativas.
Esses testes habilitam explicitamente a checagem de origem, que o Better Auth
desativa por padrão quando NODE_ENV=test.

`npm run test:e2e:auth` executa a suíte separada em `tests/auth-e2e`, com Chromium,
servidor de desenvolvimento na porta 3101 e o MySQL 8.4 do `.env`. Cria somente
usuários temporários próprios e os remove ao finalizar. Verifica cadastro, hash
da senha, sessão após reload, separação entre usuários, logout, replay de cookie
revogado, senha incorreta e expiração. A suíte passou no MySQL 8.4.12 local e
confirma banco, usuário e fuso da sessão. Traces dessa suíte estão desativados.

O CI executa npm ci (incluindo geração Prisma), formatação, lint, typecheck,
unidades e build, sem credenciais. E2E fica disponível localmente e pode ser
adicionado ao CI depois. Dependabot propõe atualizações semanais para npm e
GitHub Actions, sem automerge.

## Documentação consultada

- [Prisma 7 e MySQL](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/mysql)
- [Configuração do Prisma 7](https://www.prisma.io/docs/orm/v7/reference/prisma-config-reference)
- [Generator Prisma Client](https://www.prisma.io/docs/orm/v7/prisma-schema/overview/generators)
- [Better Auth: Prisma](https://better-auth.com/docs/adapters/prisma)
- [Better Auth: CLI](https://better-auth.com/docs/concepts/cli)
- [Better Auth: Next.js](https://better-auth.com/docs/integrations/next)
- [Better Auth: cookies](https://better-auth.com/docs/concepts/cookies)
- [shadcn/ui: Next.js](https://ui.shadcn.com/docs/installation/next)
- [Playwright: navegadores](https://playwright.dev/docs/browsers)
- Guias da versão instalada em `node_modules/next/dist/docs/`: Vitest, Playwright,
  Route Handlers, Server/Client Components, ESLint e geração de tipos.
