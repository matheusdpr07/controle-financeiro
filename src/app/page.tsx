import Link from "next/link";
import { Button } from "@/components/ui/button";

const recursos = [
  {
    numero: "01",
    titulo: "Registre o que acontece",
    descricao:
      "Inclua receitas, despesas e transferências com data, conta e uma descrição clara.",
  },
  {
    numero: "02",
    titulo: "Organize do seu jeito",
    descricao:
      "Separe seus registros por contas e categorias que façam sentido para a sua rotina.",
  },
  {
    numero: "03",
    titulo: "Consulte com confiança",
    descricao:
      "Acompanhe saldos e encontre o histórico necessário para entender cada movimentação.",
  },
] as const;

const etapas = [
  {
    titulo: "Contas",
    descricao: "Organize onde cada valor está registrado.",
    cor: "bg-[#dff1e8] text-[#245f4f]",
  },
  {
    titulo: "Receitas e despesas",
    descricao: "Dê contexto ao que entra e ao que sai.",
    cor: "bg-[#fae8d6] text-[#945128]",
  },
  {
    titulo: "Transferências",
    descricao: "Registre mudanças entre as suas contas.",
    cor: "bg-[#e7e7f5] text-[#4f4f8c]",
  },
] as const;

export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#f6f7f2] text-[#16231c]">
      <a
        href="#conteudo"
        className="sr-only fixed top-3 left-3 z-50 rounded-lg bg-[#173f35] px-4 py-2 text-sm font-semibold text-white focus:not-sr-only"
      >
        Ir para o conteúdo
      </a>

      <header className="relative z-20 border-b border-[#dfe4dc] bg-[#f6f7f2]/90 backdrop-blur-sm">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link
            href="/"
            aria-label="Controle Financeiro — início"
            className="flex items-center gap-3 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-[#4c8b77]/35"
          >
            <span
              aria-hidden="true"
              className="grid size-9 place-items-center rounded-xl bg-[#173f35] text-sm font-bold text-white shadow-sm"
            >
              CF
            </span>
            <span className="hidden text-sm font-bold tracking-[-0.01em] sm:inline">
              Controle Financeiro
            </span>
          </Link>

          <nav aria-label="Acesso" className="flex items-center gap-1 sm:gap-2">
            <Button
              asChild
              variant="ghost"
              className="h-10 px-3 text-[#294238] hover:bg-[#e8ece5] hover:text-[#173f35]"
            >
              <Link href="/entrar">Entrar</Link>
            </Button>
            <Button
              asChild
              className="h-10 bg-[#173f35] px-4 text-white shadow-sm hover:bg-[#225649] focus-visible:ring-[#4c8b77]/35"
            >
              <Link href="/cadastro">Criar acesso</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main id="conteudo">
        <section className="relative">
          <div
            aria-hidden="true"
            className="absolute top-0 right-0 h-96 w-96 translate-x-1/3 -translate-y-1/3 rounded-full bg-[#dceee4] blur-3xl"
          />
          <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.06fr_0.94fr] lg:gap-20 lg:px-10 lg:py-24">
            <div className="max-w-2xl">
              <p className="mb-5 flex items-center gap-2 text-sm font-bold tracking-[0.12em] text-[#32725e] uppercase">
                <span aria-hidden="true" className="h-px w-7 bg-[#58a088]" />
                Controle financeiro pessoal
              </p>
              <h1 className="max-w-xl text-4xl leading-[1.07] font-bold tracking-[-0.045em] text-balance sm:text-5xl lg:text-6xl">
                Entenda para onde seu dinheiro vai.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-[#536158] sm:text-xl">
                Registre contas, receitas, despesas e transferências em um só
                lugar. Transforme sua rotina financeira em informações simples
                de consultar.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="h-12 bg-[#173f35] px-6 text-base text-white shadow-[0_10px_25px_rgba(23,63,53,0.18)] hover:bg-[#225649] focus-visible:ring-[#4c8b77]/35"
                >
                  <Link href="/cadastro">
                    Começar agora
                    <span aria-hidden="true">→</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 border-[#cdd6cf] bg-transparent px-6 text-base text-[#294238] hover:bg-white hover:text-[#173f35]"
                >
                  <Link href="#como-funciona">Ver como funciona</Link>
                </Button>
              </div>

              <p className="mt-6 flex items-center gap-2 text-sm text-[#69756d]">
                <span
                  aria-hidden="true"
                  className="grid size-5 place-items-center rounded-full bg-[#dceee4] text-xs font-bold text-[#28634f]"
                >
                  ✓
                </span>
                Sem conexão bancária e sem movimentar dinheiro.
              </p>
            </div>

            <div className="relative mx-auto w-full max-w-lg lg:mx-0">
              <div
                aria-hidden="true"
                className="absolute -top-4 -right-4 size-28 rounded-[2rem] border border-[#c9ddd2]"
              />
              <div
                aria-hidden="true"
                className="absolute -bottom-5 -left-5 size-24 rounded-full bg-[#efb57d]/30"
              />
              <div className="relative rounded-[2rem] border border-[#d9e0da] bg-white p-5 shadow-[0_28px_70px_rgba(37,61,49,0.13)] sm:p-7">
                <div className="flex items-start justify-between gap-5 border-b border-[#e7ebe7] pb-5">
                  <div>
                    <p className="text-xs font-bold tracking-[0.12em] text-[#738078] uppercase">
                      Uma visão organizada
                    </p>
                    <h2 className="mt-2 text-xl font-bold tracking-[-0.02em]">
                      O essencial em contexto
                    </h2>
                  </div>
                  <span className="rounded-full bg-[#edf6f1] px-3 py-1.5 text-xs font-semibold text-[#28634f]">
                    Sua rotina
                  </span>
                </div>

                <ol className="mt-2 divide-y divide-[#edf0ed]">
                  {etapas.map((etapa, indice) => (
                    <li
                      key={etapa.titulo}
                      className="flex items-center gap-4 py-5"
                    >
                      <span
                        aria-hidden="true"
                        className={`grid size-11 shrink-0 place-items-center rounded-2xl text-sm font-bold ${etapa.cor}`}
                      >
                        {indice + 1}
                      </span>
                      <div>
                        <h3 className="font-bold text-[#23382e]">
                          {etapa.titulo}
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-[#657169]">
                          {etapa.descricao}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>

                <div className="rounded-2xl bg-[#173f35] px-5 py-4 text-white">
                  <p className="text-sm leading-6 text-[#dfece7]">
                    Você registra. O sistema organiza. As decisões continuam
                    sendo suas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="como-funciona"
          aria-labelledby="recursos-titulo"
          className="border-y border-[#e1e5df] bg-white"
        >
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
            <div className="max-w-2xl">
              <p className="text-sm font-bold tracking-[0.12em] text-[#32725e] uppercase">
                Como funciona
              </p>
              <h2
                id="recursos-titulo"
                className="mt-3 text-3xl font-bold tracking-[-0.035em] text-[#16231c] sm:text-4xl"
              >
                Menos esforço para manter tudo em ordem.
              </h2>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {recursos.map((recurso) => (
                <article
                  key={recurso.numero}
                  className="rounded-3xl border border-[#e1e7e2] bg-[#fafbf8] p-6 transition-colors hover:border-[#bad3c7] hover:bg-[#f5faf7] sm:p-7"
                >
                  <span className="text-sm font-bold text-[#4a8a74]">
                    {recurso.numero}
                  </span>
                  <h3 className="mt-8 text-xl font-bold tracking-[-0.02em] text-[#20342a]">
                    {recurso.titulo}
                  </h3>
                  <p className="mt-3 leading-7 text-[#627068]">
                    {recurso.descricao}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="escopo-titulo">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20 lg:px-10">
            <div>
              <p className="text-sm font-bold tracking-[0.12em] text-[#32725e] uppercase">
                Feito para acompanhar
              </p>
              <h2
                id="escopo-titulo"
                className="mt-3 text-3xl font-bold tracking-[-0.035em] sm:text-4xl"
              >
                Seu dinheiro continua onde sempre esteve.
              </h2>
              <p className="mt-5 text-lg leading-8 text-[#5b685f]">
                O Controle Financeiro não guarda valores nem faz pagamentos. Ele
                organiza os registros que você adiciona para facilitar o
                acompanhamento da sua vida financeira.
              </p>
            </div>

            <ul className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {[
                "Registro manual e consciente",
                "Acesso individual protegido",
                "Sem movimentação financeira",
              ].map((item) => (
                <li
                  key={item}
                  className="flex min-h-16 items-center gap-3 rounded-2xl border border-[#dbe2dc] bg-white px-5 py-4 font-semibold text-[#294238] shadow-sm"
                >
                  <span
                    aria-hidden="true"
                    className="grid size-6 shrink-0 place-items-center rounded-full bg-[#dff1e8] text-xs text-[#245f4f]"
                  >
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="px-5 pb-16 sm:px-8 sm:pb-20 lg:px-10">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-7 overflow-hidden rounded-[2rem] bg-[#173f35] px-6 py-9 text-white shadow-[0_20px_55px_rgba(23,63,53,0.16)] sm:px-10 sm:py-11 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold tracking-[-0.03em] sm:text-3xl">
                Comece com o que você já sabe.
              </h2>
              <p className="mt-3 leading-7 text-[#d7e6e0]">
                Crie seu acesso e organize os primeiros registros no seu ritmo.
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="h-12 bg-white px-6 text-base text-[#173f35] shadow-sm hover:bg-[#edf4f0]"
            >
              <Link href="/cadastro">Criar meu acesso</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#dfe4dc] px-5 py-7 text-sm text-[#69756d] sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-semibold text-[#294238]">
            Controle Financeiro
          </span>
          <span>Organização pessoal para escolhas mais conscientes.</span>
        </div>
      </footer>
    </div>
  );
}
