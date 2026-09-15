export function FinancialOrbit() {
  return (
    <div
      data-orbit-stage
      className="relative mx-auto aspect-square w-full max-w-[42rem] transition-transform duration-300 ease-out"
    >
      <div className="absolute inset-[8%] rounded-full bg-primary/10 blur-3xl" />
      <svg
        viewBox="0 0 720 720"
        role="presentation"
        aria-hidden="true"
        className="relative size-full overflow-visible drop-shadow-[0_32px_55px_var(--shadow-soft)]"
      >
        <defs>
          <linearGradient id="orbit-surface" x1="0" x2="1" y1="0" y2="1">
            <stop stopColor="var(--surface-raised)" />
            <stop offset="1" stopColor="var(--surface)" />
          </linearGradient>
          <linearGradient id="orbit-flow" x1="0" x2="1" y1="0" y2="0">
            <stop stopColor="var(--income)" />
            <stop offset="0.52" stopColor="var(--primary)" />
            <stop offset="1" stopColor="var(--transfer)" />
          </linearGradient>
        </defs>

        <g data-orbit-layer style={{ transformOrigin: "360px 360px" }}>
          <circle
            cx="360"
            cy="360"
            r="284"
            fill="none"
            stroke="var(--border)"
            strokeWidth="2"
            strokeDasharray="9 13"
          />
          <circle
            cx="360"
            cy="360"
            r="238"
            fill="none"
            stroke="var(--primary)"
            strokeOpacity="0.2"
            strokeWidth="34"
          />
          <path
            data-orbit-line
            d="M104 416 C190 286 298 486 420 342 C498 250 548 268 616 190"
            fill="none"
            stroke="url(#orbit-flow)"
            strokeLinecap="round"
            strokeWidth="6"
          />
        </g>

        <g data-orbit-layer style={{ transformOrigin: "360px 360px" }}>
          <rect
            x="154"
            y="178"
            width="412"
            height="292"
            rx="46"
            fill="url(#orbit-surface)"
            stroke="var(--border)"
            strokeWidth="2"
          />
          <rect
            x="188"
            y="214"
            width="148"
            height="16"
            rx="8"
            fill="var(--muted-foreground)"
            opacity="0.3"
          />
          <rect
            x="188"
            y="248"
            width="242"
            height="34"
            rx="14"
            fill="var(--foreground)"
            opacity="0.88"
          />
          <rect
            x="188"
            y="318"
            width="344"
            height="116"
            rx="28"
            fill="var(--muted)"
            stroke="var(--border)"
          />
          <path
            data-orbit-line
            d="M216 398 C254 354 286 386 326 350 C366 314 402 382 504 334"
            fill="none"
            stroke="var(--primary)"
            strokeLinecap="round"
            strokeWidth="7"
          />
          <circle cx="504" cy="334" r="11" fill="var(--primary)" />
        </g>

        <g data-orbit-layer style={{ transformOrigin: "168px 510px" }}>
          <rect
            x="70"
            y="454"
            width="208"
            height="126"
            rx="30"
            fill="var(--surface-raised)"
            stroke="var(--income)"
            strokeOpacity="0.35"
            strokeWidth="2"
          />
          <circle
            cx="112"
            cy="498"
            r="18"
            fill="var(--income)"
            opacity="0.18"
          />
          <path
            d="M104 498h16M112 490v16"
            stroke="var(--income)"
            strokeLinecap="round"
            strokeWidth="4"
          />
          <text
            x="142"
            y="503"
            fill="var(--income-foreground)"
            fontSize="17"
            fontWeight="700"
            letterSpacing="1.5"
          >
            RECEITAS
          </text>
          <rect
            x="102"
            y="534"
            width="116"
            height="12"
            rx="6"
            fill="var(--foreground)"
            opacity="0.24"
          />
        </g>

        <g data-orbit-layer style={{ transformOrigin: "558px 494px" }}>
          <rect
            x="454"
            y="430"
            width="220"
            height="132"
            rx="32"
            fill="var(--hero)"
            stroke="var(--hero-accent)"
            strokeWidth="2"
          />
          <circle
            cx="502"
            cy="478"
            r="19"
            fill="var(--expense)"
            opacity="0.24"
          />
          <path
            d="M493 478h18"
            stroke="var(--expense)"
            strokeLinecap="round"
            strokeWidth="4"
          />
          <text
            x="534"
            y="484"
            fill="var(--hero-foreground)"
            fontSize="16"
            fontWeight="700"
            letterSpacing="1.4"
          >
            DESPESAS
          </text>
          <rect
            x="486"
            y="519"
            width="124"
            height="12"
            rx="6"
            fill="var(--hero-muted)"
            opacity="0.5"
          />
        </g>

        <g data-orbit-layer style={{ transformOrigin: "580px 166px" }}>
          <circle
            cx="590"
            cy="152"
            r="58"
            fill="var(--transfer)"
            opacity="0.16"
          />
          <circle
            data-orbit-node
            cx="590"
            cy="152"
            r="23"
            fill="var(--transfer)"
          />
          <path
            d="m579 152 8 8 16-18"
            fill="none"
            stroke="var(--primary-foreground)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="5"
          />
        </g>

        <circle data-orbit-node cx="116" cy="260" r="11" fill="var(--income)" />
        <circle data-orbit-node cx="628" cy="324" r="9" fill="var(--expense)" />
      </svg>
    </div>
  );
}
