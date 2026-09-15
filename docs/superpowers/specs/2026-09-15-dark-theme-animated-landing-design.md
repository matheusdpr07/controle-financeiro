# Tema escuro e página inicial animada

## Objetivo

Criar uma identidade visual contemporânea para o Controle Financeiro, com temas
claro, escuro e automático em todas as telas. A página inicial receberá uma
apresentação editorial animada inspirada na composição da Beagle Ship e em
referências de dashboards do Figma, mantendo identidade, textos e vetores
originais do projeto.

A experiência deve comunicar organização e tranquilidade. O produto continua
sendo um controle de finanças pessoais e não deve parecer um banco, uma corretora
ou um serviço que movimenta dinheiro.

## Escopo

- Aplicar tokens semânticos de tema nas telas pública, de autenticação e privadas.
- Oferecer as preferências `Automático`, `Claro` e `Escuro`.
- Usar o tema do sistema na primeira visita e armazenar escolhas explícitas no
  navegador.
- Evitar a exibição temporária do tema incorreto durante o carregamento.
- Redesenhar a página inicial com composição vetorial própria e movimento.
- Usar Anime.js em versão estável e exata, carregado somente onde houver animação.
- Preservar todos os fluxos financeiros e de autenticação existentes.
- Manter a interface acessível e funcional sem animação ou JavaScript de movimento.

Não fazem parte deste trabalho novas funcionalidades financeiras, gráficos com
dados reais, mudanças no banco, migrations, integrações externas, rastreamento,
imagens da Beagle Ship ou reprodução da identidade visual da agência.

## Direção visual

O tema escuro usará um fundo grafite com tonalidade verde, superfícies em camadas
e bordas de baixo contraste. Verde menta será o destaque principal. Receitas,
despesas, transferências, alertas e estados destrutivos terão cores semânticas
próprias e legíveis em ambos os temas.

O tema claro continuará suave e levemente esverdeado. Os dois temas compartilharão
a mesma hierarquia, espaçamento, tipografia e geometria. Preto e branco puros serão
reservados para situações em que o contraste exigir. Sombras serão contidas;
profundidade virá principalmente de cor, borda, transparência e sobreposição.

Os tokens em `src/app/globals.css` substituirão cores fixas espalhadas pelos
componentes. Os componentes usarão nomes semânticos como fundo, superfície,
texto principal, texto secundário, borda, destaque, receita, despesa e
transferência. Isso permite evoluir os temas sem revisar cada tela novamente.

## Comportamento do tema

Uma inicialização curta aplicará o tema antes da primeira pintura. A preferência
será armazenada localmente com os valores `system`, `light` ou `dark`. Na ausência
de preferência, o sistema operacional determinará o tema.

Um controle acessível permitirá alternar entre as três opções. A escolha ficará
disponível na navegação pública, nos shells de autenticação e na área privada. No
modo automático, mudanças do sistema serão refletidas enquanto a aplicação estiver
aberta.

O controle de tema será o menor Client Component possível. O layout, shells e
páginas permanecerão Server Components. Se o armazenamento local estiver
indisponível, a aplicação continuará usando a preferência do sistema.

## Página inicial

A página inicial terá seções editoriais amplas. Em desktop com mouse, um gesto
vertical forte avançará ou retornará um painel completo; toque e telas menores
manterão rolagem natural. O conteúdo será visível e navegável antes de qualquer
animação.

### Primeira dobra

- Navegação discreta e translúcida com marca, acesso, cadastro e seletor de tema.
- Mensagem principal curta à esquerda, com hierarquia tipográfica forte.
- Chamadas para criar acesso e conhecer o funcionamento.
- Composição vetorial financeira à direita, formada por cartões, discos, linhas de
  fluxo, pontos e uma curva mensal abstrata.
- Profundidade construída com SVG em camadas, perspectiva CSS, transparência e
  sombras suaves.

A composição não mostrará valores financeiros fictícios. Rótulos conceituais como
receitas, despesas e saldo poderão aparecer quando ajudarem a explicar o produto.

### Seções seguintes

1. `Veja seu mês`: hierarquia de saldo inicial, receitas, despesas e saldo final.
2. `Organize suas contas`: cartões em camadas representando contas pessoais.
3. `Registre cada movimento`: fluxo vetorial entre receita, despesa e transferência.
4. `Corrija seu saldo`: comparação visual entre saldo esperado e saldo informado.
5. Encerramento com chamada clara para cadastro e acesso.

As seções alternarão composição e posição dos elementos. Durante uma transição no
desktop, novos gestos serão bloqueados até o fim do deslocamento para evitar saltos
múltiplos. Em telas pequenas, texto e ações aparecem antes do elemento decorativo.

## Movimento com Anime.js

O Anime.js ficará em um Client Component restrito à página inicial. A integração
usará escopo por componente e limpeza completa ao desmontar.

- Entrada inicial coordenada para marca, texto, ações e composição vetorial.
- Desenho progressivo de poucos caminhos SVG.
- Flutuação lenta das camadas com amplitudes pequenas.
- Paralaxe limitada no desktop, baseada em ponteiro e perspectiva CSS.
- Revelação das seções quando entram no campo visível.
- Feedback curto em ações que se beneficiem de movimento.

As animações usarão prioritariamente `transform`, `opacity` e propriedades SVG.
Elementos fora da tela não manterão animações contínuas. A aba em segundo plano não
deverá consumir ciclos de animação. O movimento não controlará navegação, envio de
formulário ou apresentação de mensagens importantes.

Com `prefers-reduced-motion: reduce`, a composição será apresentada em seu estado
final, sem paralaxe, desenho progressivo ou movimentos contínuos.

## Aplicação nas telas existentes

- `Início`: composição editorial e movimento completo.
- `Cadastro` e `Entrar`: painel visual escuro, formulário em superfície elevada e
  transições discretas de estado.
- `Área`: maior destaque para o fechamento mensal e separação clara dos indicadores.
- `Contas`: cartões com hierarquia para saldo e estado de arquivamento.
- `Categorias`: diferenciação semântica entre receita e despesa.
- `Lançamentos`: formulários, histórico e transferências com cores consistentes.

Os shells compartilhados concentrarão navegação, fundo, seletor de tema e rodapé.
Botões, campos, seletores, cartões e mensagens receberão os mesmos estados em todas
as rotas.

## Responsividade e acessibilidade

- Conteúdo e ações essenciais devem funcionar a partir de 320 px de largura.
- Alvos interativos terão tamanho confortável para toque.
- Foco visível será preservado em todos os controles.
- Cor não será o único indicador de tipo ou estado financeiro.
- Texto e controles buscarão contraste WCAG AA nos dois temas.
- Vetores decorativos serão ocultos da árvore de acessibilidade.
- O seletor de tema terá nome e estado anunciáveis.
- A ordem de leitura seguirá a ordem visual principal.

## Desempenho

- A biblioteca de animação entrará apenas no pacote da página inicial.
- Os SVGs serão escritos no projeto e não dependerão de requisições externas.
- A composição evitará filtros SVG caros e grandes áreas com desfoque animado.
- O número de elementos animados simultaneamente será limitado.
- O layout reservará espaço para os vetores e não deverá sofrer deslocamentos ao
  hidratar.
- Dispositivos pequenos receberão menos camadas e movimentos mais curtos.

O objetivo é manter animações suaves em dispositivos atuais. A interface deverá
reduzir trabalho visual quando o navegador ou a preferência do usuário pedir, em
vez de prometer uma taxa de quadros fixa em qualquer equipamento.

## Falhas e degradação

Se Anime.js não carregar, todo conteúdo continuará visível em seu estado final. Se
a preferência não puder ser lida ou gravada, o tema automático será usado. Uma
falha no controle de tema não poderá afetar autenticação, navegação ou operações
financeiras.

## Validação

- Testes unitários para preferência inicial, persistência, modo automático e
  alteração do sistema.
- Testes de renderização para o seletor e os shells nos dois temas.
- Teste da página inicial com movimento reduzido.
- Playwright em desktop e celular para navegação, cadastro e troca de tema.
- Verificação de ausência de overflow horizontal e de conteúdo inacessível.
- Formatação, lint, typecheck, testes existentes e build de produção.
- Revisão visual em temas claro e escuro nas sete rotas atuais.

## Critérios de aceite

- A primeira visita segue o tema do sistema sem piscar o tema oposto.
- A escolha manual permanece após recarregar e navegar entre páginas.
- Todas as telas atuais são legíveis e coerentes nos temas claro e escuro.
- A página inicial comunica finanças pessoais com vetores originais.
- O conteúdo principal funciona sem as animações.
- Movimento reduzido elimina animações decorativas contínuas.
- Cadastro, login, contas, categorias, lançamentos e relatório mensal mantêm o
  comportamento atual.
- Nenhuma mudança de banco ou funcionalidade financeira é introduzida.

## Referências

- [Beagle Ship](https://beagleship.com.br/)
- [Figma: modelos de dashboard](https://www.figma.com/templates/dashboard-designs/)
- [Figma: Mini Finance UI Kit](https://forum.figma.com/showcase-your-work-14/introducing-mini-finance-ui-kit-for-figma-39716)
- [Anime.js: integração com React](https://animejs.com/documentation/getting-started/using-with-react/)
- [Anime.js: utilitários SVG](https://animejs.com/documentation/svg/)
