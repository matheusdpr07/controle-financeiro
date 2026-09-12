# Plano do dashboard mensal e saldos

**Objetivo:** transformar a área autenticada em um relatório mensal, registrar
correções de saldo sem alterar receitas ou despesas e formatar todos os campos
monetários em reais.

**Arquitetura:** o saldo de abertura da conta continua sendo a base do primeiro
mês. O fechamento de cada mês é derivado de saldo inicial, ajustes, receitas,
despesas e transferências. Uma nova entidade guarda somente correções mensais,
incluindo saldo calculado, saldo informado e diferença. Leituras e alterações
permanecem protegidas por sessão e propriedade.

## Etapas

1. Criar testes para a máscara BRL e implementar um campo monetário
   compartilhado, preservando strings decimais exatas no formulário.
2. Aplicar o campo monetário ao saldo de abertura, lançamentos e transferências.
3. Criar testes para período mensal, cálculo de saldo e validação de correções.
4. Acrescentar `BalanceAdjustment` ao schema Prisma e preparar uma migration SQL
   revisável, sem aplicá-la.
5. Implementar DTOs, agregações mensais e alteração de ajuste com sessão,
   propriedade e Zod no servidor.
6. Transformar `/area` em onboarding para quem ainda não possui conta e relatório
   mensal para quem já iniciou o controle.
7. Transformar a criação de conta em duas etapas visuais: identificação e saldo
   inicial.
8. Atualizar testes de interface, documentação de domínio, arquitetura, roadmap e
   validação.
9. Executar formatação, lint, typecheck, testes e build. Apresentar o SQL antes de
   solicitar autorização para aplicar a migration no MySQL local.
