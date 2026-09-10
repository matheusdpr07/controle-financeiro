# Domínio planejado

Este documento registra conceitos futuros, sem implementar o schema financeiro.

| Conceito         | Responsabilidade planejada                                      |
| ---------------- | --------------------------------------------------------------- |
| Usuário          | Identidade autenticada e dono dos dados privados.               |
| Preferências     | Configurações pessoais de apresentação e uso.                   |
| Conta financeira | Origem ou destino financeiro pertencente ao usuário.            |
| Categoria        | Classificação das movimentações do usuário.                     |
| Transação        | Movimentação financeira associada a conta, categoria e usuário. |
| Dashboard mensal | Visão consolidada das movimentações do mês.                     |

Dinheiro será armazenado como `DECIMAL(19,2)`, nunca float. O transporte deve
preservar precisão decimal, sem conversão indiscriminada para `number`.

A data financeira será `DATE`: representa um dia civil, sem horário nem fuso.
Timestamps técnicos, como criação e atualização, serão tratados em UTC.

Uma eventual tabela `Account` gerada pelo Better Auth representa uma credencial
de autenticação. Ela não é uma conta financeira. O nome do futuro modelo de
contas financeiras deve evitar essa colisão.
