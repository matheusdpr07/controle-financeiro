<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Regras do Controle Financeiro

- Respeite a arquitetura descrita em `docs/ARCHITECTURE.md`, os conceitos de `docs/DOMAIN.md` e o escopo de `docs/ROADMAP.md`.
- Leia a documentação oficial atual e os guias locais do Next.js antes de alterar decisões ou APIs. Não troque bibliotecas sem autorização.
- Use Node 24, npm, versões exatas e estáveis. Não instale dependências sem necessidade. Mantenha Prisma, client e adapter na mesma versão da linha 7; não migre para Prisma 8.
- Preserve alterações anteriores, a licença e o Git. Não use sudo nem altere configurações globais. Não faça commit, push ou deploy sem solicitação.
- Mantenha TypeScript estrito, sem `any`, poucos comentários e sem abstrações sem uso, barrel files ou arquivos genéricos como `utils.ts`.
- Use Server Components por padrão e Client Components somente quando houver interação real.
- Valide entradas externas com Zod no servidor. Mantenha Server Actions pequenas.
- Em toda operação privada, verifique sessão e propriedade do registro. Nunca confie em `userId` vindo do navegador; derive-o da sessão validada.
- Não envie modelos Prisma diretamente ao cliente. Retorne objetos de transferência explícitos, sem campos privados.
- Acesse banco e autenticação apenas por módulos protegidos com `server-only`. Centralize variáveis da aplicação em `src/lib/env.ts`; configurações de ferramentas podem ler seu próprio ambiente.
- Use `DECIMAL(19,2)`, nunca float, para dinheiro; `DATE` para datas financeiras; UTC para timestamps técnicos.
- Não crie funcionalidades fora do escopo solicitado. Crie diretórios de features somente quando houver código necessário.
- Execute formatação, lint, typecheck, testes e build conforme o impacto. Não aplique migrations sem credenciais e destino confirmados.
