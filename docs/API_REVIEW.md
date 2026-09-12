# Seleção de APIs para o Controle Financeiro

Análise em 12/09/2026. Esta é uma proposta técnica, não uma integração implementada.

## Decisão

Priorizar Iconify como fonte de ícones locais para a UI. Na evolução da
autenticação, selecionar Mailtrap para e-mail transacional e Pwned Passwords para
identificar senhas expostas. BrasilAPI, Banco Central, IBGE e Frankfurter ficam
condicionados à existência de funcionalidades que realmente usem seus dados.

Contas, categorias, lançamentos, saldos e gráficos mensais devem continuar
funcionando com os dados do próprio usuário e a infraestrutura já existente.
Uma indisponibilidade de cotação ou calendário não pode impedir um registro.

## Cobertura e limites

Foi baixado e inventariado o README completo do
[public-apis/public-apis](https://github.com/public-apis/public-apis).
Foram identificadas **1.784 entradas de tabela**, sendo **1.773 nas 51 categorias
do catálogo** e **11 na área promocional**. Entradas repetidas não foram deduplicadas.
O cabeçalho promocional não representa uma categoria funcional.

SHA-256 do README consultado:
`c0a7a882f443f017367981d71ec7fbfe669358def6bd2008f149fa261acfed3c`.

O [inventário completo](API_INVENTORY.csv) registra cada entrada, sua linha no
README, categoria, URL, decisão, justificativa e nível de evidência. A triagem
abrange todas as entradas; os descartes por categoria são uma avaliação de
aderência ao escopo, não uma auditoria individual dos fornecedores. Documentação
oficial foi consultada para os candidatos destacados abaixo. Oito endpoints
receberam consultas públicas pontuais. Não foram testadas todas as APIs, nem
criados cadastros, chaves, assinaturas ou envios de e-mail.

Os filtros foram utilidade nas telas existentes, privacidade, custo recorrente,
dependência operacional, cobertura brasileira, precisão dos dados e compatibilidade
com a stack. A classificação não usa notas numéricas que sugeririam uma medição
de qualidade ou disponibilidade que não foi realizada.

## Seleção principal

### 1. Iconify — aplicação imediata à identidade visual

A API permite consultar e obter SVGs. Minha escolha é usar uma única coleção,
como Lucide, e incorporar somente os ícones utilizados ao projeto. Isso permite
padronizar navegação, receitas, despesas, edição e arquivamento sem requisições
externas durante o uso das telas. A licença deve ser conferida por coleção;
Lucide usa ISC e exige preservar os avisos aplicáveis em um arquivo de licença.
[API Iconify](https://iconify.design/docs/api/) e
[licença Lucide](https://lucide.dev/license).

Benefício esperado: consistência visual na reformulação inspirada na Apple.
Ícones devem acompanhar rótulos claros, e não substituir nomes de ações por
símbolos ambíguos. O estilo visual virá principalmente de tipografia, espaçamento,
hierarquia e estados; uma API não entrega esse resultado por si só.

### 2. Mailtrap — primeira opção para e-mail transacional

A oferta Email API/SMTP consultada inclui **4.000 e-mails/mês**, teto de
**150/dia**, um domínio e três dias de retenção de logs e conteúdo. O produto de
sandbox de testes é separado do envio real. Exige conta, credencial e configuração
do domínio remetente. [Planos oficiais](https://mailtrap.io/pricing/).

Uso proposto: recuperação de senha e verificação de e-mail, ainda ausentes no
projeto. O Better Auth continua responsável pela autenticação. Escolho Mailtrap
pelo foco transacional e pela separação entre teste e envio; esta preferência não
é uma medição comparativa de entregabilidade. O domínio pode ter custo próprio.

O fornecedor receberá o destinatário e o conteúdo necessário da mensagem. Não
incluir saldos ou histórico financeiro. Revalidar termos, retenção e limites
quando houver definição do ambiente de produção. Controles contra abuso são
necessários para não esgotar a cota com pedidos de recuperação.

### 3. Pwned Passwords — reforço da escolha de senha

Este serviço específico do Have I Been Pwned é gratuito, sem assinatura ou chave.
Permite enviar apenas os cinco primeiros caracteres do hash SHA-1 e comparar o
restante localmente. Usar padding e consultar somente após a senha estar completa,
sem consultas a cada tecla. A consulta por e-mail é outro produto e não deve ser
confundida com essa API. [Documentação oficial](https://haveibeenpwned.com/API/v3#PwnedPasswords).

Proposta: verificar no servidor durante criação ou alteração de senha, mantendo
o hash de armazenamento e o fluxo de sessão do Better Auth. SHA-1 serve apenas
ao protocolo de consulta, nunca ao armazenamento da senha. Definir mensagem e
comportamento em timeout antes da implementação. Não foi enviada senha nesta análise.

### 4. BrasilAPI — conveniências brasileiras opcionais

As consultas públicas de instituição e feriados responderam sem chave. Podem
apoiar sugestões de nomes de instituições e um calendário futuro. Não acessam
saldos ou transações bancárias. Os termos classificam a iniciativa como
experimental/beta e vedam crawling/full scan; não há base para prometer um SLA.
[Projeto e termos](https://brasilapi.com.br/) e
[documentação](https://brasilapi.com.br/docs).

Prioridade moderada: manter nome livre da conta, inclusive carteira em dinheiro,
e nunca tornar a seleção de instituição obrigatória. Feriados são referências de
calendário; não inferir automaticamente dia útil bancário ou mover vencimentos a
partir dessa lista. Não coletar CEP ou CNPJ apenas porque o serviço os oferece.

### 5. Banco Central — contexto econômico opcional

Escolha preferida para referências brasileiras de juros e, em eventual módulo
de câmbio, dados oficiais com metodologia definida. A série SGS 11 testada é Selic
efetiva em **% ao dia**, não a meta anual. Consultas de séries diárias exigem filtros
e têm janela de até dez anos. O conjunto consultado informa licença ODbL.
[Série e condições oficiais](https://dadosabertos.bcb.gov.br/dataset/11-taxa-de-juros---selic).

Uso proposto: informação contextual separada do resumo pessoal. Não presumir que
uma conta de investimento rende Selic, nem alterar saldos declarados. Selecionar
corretamente série, unidade, período e metodologia antes de qualquer cálculo.

### 6. IBGE/SIDRA — contexto de inflação

O SIDRA oferece consultas de tabelas estatísticas. Foi consultada a tabela 1737,
variável 63, para o último período disponível, com retorno JSON. É uma candidata
para contextualizar a evolução do poder de compra em uma fase futura.
[API oficial](https://apisidra.ibge.gov.br/).

A comparação de gastos do próprio usuário entre meses já pode ser feita sem API.
IPCA geral não equivale à inflação individual e variação mensal não deve ser
apresentada como acumulado anual. Uma implementação precisa validar metadados,
unidades, periodicidade e valores ausentes; a consulta pontual não homologou um
cálculo de inflação.

### 7. Frankfurter — primeira opção se houver multimoeda

A documentação atual apresenta a API v2, cotações diárias, uso comercial gratuito
e ausência de chave ou cotas mensais/diárias, com limitação contra abuso. É possível
filtrar o provedor; o padrão combina fontes. Os termos dos dados subjacentes também
precisam ser respeitados. [Documentação oficial](https://frankfurter.dev/).

Hoje, somente BRL é aceito. Adiar até que haja viagens, despesas internacionais
ou contas multimoeda no escopo. Uma futura conversão deve registrar taxa, fonte e
data com precisão decimal. Cotação indicativa não representa a taxa final cobrada
em cartão, impostos ou tarifas. Não recalcular retroativamente registros já
confirmados com uma cotação mais recente.

## Alternativas e serviços adiados

| Serviço                        | Avaliação                                                                                                                                                                                                                                                                                                          |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Mailjet                        | Alternativa de envio: 6.000 e-mails/mês e 200/dia, com API e SMTP. Comparar branding e configuração antes da escolha final. [Planos](https://www.mailjet.com/pricing/).                                                                                                                                            |
| Brevo, listado como Sendinblue | Alternativa com 300 e-mails/dia, sem acumular cota, e marca do fornecedor no plano gratuito. [Limites](https://help.brevo.com/hc/en-us/articles/208580669-FAQs-What-are-the-limits-of-the-Free-plan).                                                                                                              |
| AwesomeAPI                     | Boa alternativa para cotações com compra/venda. Sem chave há cache de um minuto; a documentação anuncia até 100 mil requisições gratuitas com cadastro, sem estabelecer nessa passagem a periodicidade dessa franquia. Não assumir acesso ilimitado. [Documentação](https://docs.awesomeapi.com.br/api-de-moedas). |
| Nager.Date                     | Endpoint brasileiro respondeu. Adiar para calendário internacional; termos, limites e cobertura regional ainda precisam de confirmação. [Fornecedor](https://date.nager.at/).                                                                                                                                      |
| ViaCEP                         | Gratuito para endereço por CEP. Não adicionar endereço ao cadastro atual: ele não é necessário ao controle financeiro. [Documentação](https://viacep.com.br/).                                                                                                                                                     |
| OCR.Space                      | Futuro preenchimento assistido por comprovantes. Plano gratuito documenta 25.000 consultas/mês, 500/dia/IP, arquivo de 1 MB e PDF de três páginas; motores podem ter cotas diferentes. Exige chave. [Documentação](https://ocr.space/ocrapi).                                                                      |

OCR só merece uma prova de conceito após definir consentimento para envio externo,
retenção e revisão humana de valor, data e descrição. Ele extrai texto; não garante
lançamentos corretos. Essa funcionalidade não está autorizada para implementação
por esta análise.

## O que não selecionar para o projeto atual

- APIs de pagamentos, boletos, Open Finance ou corretoras: fora do domínio pessoal
  definido em `DOMAIN.md`. Sugestões de instituições por BrasilAPI são um caso distinto.
- Cotações de ações e criptoativos: o tipo de conta “investimento” atual é um
  agrupador manual, não um módulo de carteira com posições e preços de mercado.
- Consulta de CPF, enriquecimento de pessoas, localização por IP e leitura de
  caixas de e-mail: não existe requisito que justifique esse acesso adicional.
- QuickChart e Image-Charts: o projeto já tem Recharts; gerar gráficos financeiros
  em outro serviço adicionaria uma transferência de dados desnecessária.
- APIs para criar senhas, criptografar textos ou calcular operações simples:
  essas operações devem permanecer em recursos locais apropriados.
- Outro provedor de autenticação, banco remoto genérico ou ferramenta de BI:
  não há motivo para trocar Better Auth, MySQL, Prisma ou Recharts nesta revisão.
- Imagens aleatórias, notícias, frases, clima, entretenimento e redes sociais:
  não ajudam a concluir as tarefas financeiras presentes.

O catálogo não garante que uma oferta permaneça gratuita. Um exemplo confirmado
é o SendGrid: a Twilio anunciou a retirada do plano gratuito a partir de maio de 2025. Portanto, não foi selecionado como serviço permanentemente gratuito.
[Comunicado oficial](https://www.twilio.com/en-us/changelog/sendgrid-free-plan).

## Consultas públicas realizadas

As oito consultas responderam HTTP 200 em 12/09/2026. Foram observados formato e
estrutura básica, sem teste de carga, credenciais, informações privadas ou
escritas nos fornecedores. Uma resposta isolada não comprova SLA ou precisão.

| Consulta              | Caminho consultado                                                                                                | Formato     |
| --------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------- |
| BrasilAPI instituição | `https://brasilapi.com.br/api/banks/v1/1`                                                                         | Objeto JSON |
| BrasilAPI calendário  | `https://brasilapi.com.br/api/feriados/v1/2026`                                                                   | Lista JSON  |
| Frankfurter USD/BRL   | `https://api.frankfurter.dev/v2/rate/usd/brl`                                                                     | Objeto JSON |
| AwesomeAPI USD/BRL    | `https://economia.awesomeapi.com.br/json/last/USD-BRL`                                                            | Objeto JSON |
| BCB Selic             | `https://api.bcb.gov.br/dados/serie/bcdata.sgs.11/dados?formato=json&dataInicial=01/09/2026&dataFinal=11/09/2026` | Lista JSON  |
| IBGE/SIDRA            | `https://apisidra.ibge.gov.br/values/t/1737/n1/all/v/63/p/last%201`                                               | Lista JSON  |
| Iconify               | `https://api.iconify.design/lucide/wallet.svg`                                                                    | SVG         |
| Nager.Date            | `https://date.nager.at/api/v3/PublicHolidays/2026/BR`                                                             | Lista JSON  |

## Aplicação ao planejamento

1. Concluir a identidade visual das telas existentes, usando ícones locais e
   preservando os fluxos atuais. Esta análise não conclui a reformulação solicitada.
2. Construir o dashboard mensal a partir dos dados privados existentes.
3. Planejar recuperação/verificação de e-mail com Mailtrap e a verificação de
   senha exposta. Nenhuma credencial deve ser enviada pelo chat.
4. Acrescentar BrasilAPI apenas a fluxos que realmente precisem de sugestões ou calendário.
5. Considerar BCB/IBGE para contexto opcional e Frankfurter somente com multimoeda.

Toda integração de dados futura deve passar por módulo `server-only`, timeout,
validação Zod, cache compatível com a fonte e estado de indisponibilidade legível.
Os parâmetros de consultas públicas não devem carregar usuário, saldo ou descrição
de lançamento. Fonte e data devem acompanhar indicadores externos. Não criar uma
camada genérica de provedores antes de existir o primeiro uso concreto.

Nesta entrega foram adicionados apenas o relatório e o inventário. Nenhuma API
foi incorporada ao aplicativo, nenhuma dependência foi instalada e nenhuma
migration, publicação, commit ou push foi executado.
