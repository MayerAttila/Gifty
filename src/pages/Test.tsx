import { useMemo } from "react";

const Test = () => {
  const palette = useMemo(
    () =>
      [
        {
          title: "Brand · Rose",
          description: "Signature brand accent for CTAs and highlights.",
          items: [
            {
              label: "Brand",
              token: "--color-brand",
              tailwind: "text-brand / bg-brand",
              lightHex: "#d32752",
              darkHex: "#e6345a",
            },
          ],
        },
        {
          title: "Primary · Surface",
          description:
            "Default surface tone for cards, inputs, and backgrounds.",
          items: [
            {
              label: "Primary",
              token: "--color-primary",
              tailwind: "text-primary / bg-primary",
              lightHex: "#f8fafc",
              darkHex: "#0f172a",
            },
          ],
        },
        {
          title: "Accent 1 · Softest Neutral",
          description:
            "Lightest supporting neutral; darkest base in dark mode.",
          items: [
            {
              label: "Accent 1",
              token: "--color-accent-1",
              tailwind: "text-accent-1 / bg-accent-1",
              lightHex: "#f9fafb",
              darkHex: "#111827",
            },
          ],
        },
        {
          title: "Accent 2 · Soft Neutral",
          description:
            "Secondary surface shade for cards and subtle separators.",
          items: [
            {
              label: "Accent 2",
              token: "--color-accent-2",
              tailwind: "text-accent-2 / bg-accent-2",
              lightHex: "#f1f5f9",
              darkHex: "#1e293b",
            },
          ],
        },
        {
          title: "Accent 3 · Mid Neutral",
          description:
            "Mid-tone neutral that works for borders and muted backgrounds.",
          items: [
            {
              label: "Accent 3",
              token: "--color-accent-3",
              tailwind: "text-accent-3 / bg-accent-3",
              lightHex: "#e2e8f0",
              darkHex: "#334155",
            },
          ],
        },
        {
          title: "Accent 4 · Deep Neutral",
          description:
            "Highest contrast neutral, ideal for typography and icons.",
          items: [
            {
              label: "Accent 4",
              token: "--color-accent-4",
              tailwind: "text-accent-4 / bg-accent-4",
              lightHex: "#d1d5db",
              darkHex: "#475569",
            },
          ],
        },
        {
          title: "Contrast · Text",
          description:
            "Dedicated contrast token for body text and essential iconography.",
          items: [
            {
              label: "Contrast",
              token: "--color-contrast",
              tailwind: "text-contrast / bg-contrast",
              lightHex: "#475569",
              darkHex: "#f8fafc",
            },
          ],
        },
      ] as const,
    []
  );

  const ColorSwatch = ({
    label,
    token,
    tailwind,
    lightHex,
    darkHex,
  }: {
    label: string;
    token: string;
    tailwind: string;
    lightHex: string;
    darkHex: string;
  }) => (
    <div className="flex flex-col gap-2 rounded-lg border border-slate-200/60 bg-white/70 p-3 shadow-sm transition-colors dark:border-white/10 dark:bg-slate-900/60">
      <div
        className="h-16 w-full rounded-md border border-black/5 shadow-inner dark:border-white/10"
        style={{ backgroundColor: `rgb(var(${token}))` }}
      />
      <div className="flex flex-col text-xs leading-tight text-slate-600 dark:text-slate-300">
        <span className="font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
          {label}
        </span>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <code className="font-mono text-[0.7rem] text-slate-500 dark:text-slate-400">
            {token}
          </code>
          <span className="font-mono text-[0.7rem] text-slate-400 dark:text-slate-500">
            Light {lightHex}
          </span>
          <span className="font-mono text-[0.7rem] text-slate-400 dark:text-slate-500">
            Dark {darkHex}
          </span>
        </div>
        <span className="text-[0.65rem] uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Tailwind: {tailwind}
        </span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-8">
      <section
        aria-labelledby="color-palette-heading"
        className="rounded-2xl border border-slate-200/60 bg-white/70 p-6 shadow-md shadow-slate-500/10 backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/70 dark:shadow-black/30"
      >
        <div className="flex flex-col gap-2 pb-4">
          <h2
            id="color-palette-heading"
            className="text-lg font-semibold text-slate-900 dark:text-slate-100"
          >
            Color Palette
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            These brand and neutral tokens are defined in{" "}
            <code>src/style.css</code> and mapped into Tailwind via{" "}
            <code>tailwind.config.ts</code>. Use utilities like{" "}
            <code>text-brand</code>,<code>bg-primary</code>, or{" "}
            <code>border-accent-3/60</code> and they will adapt to dark mode.
          </p>
        </div>

        <div className="space-y-8">
          {palette.map((group) => (
            <div key={group.title} className="space-y-3">
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                  {group.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {group.description}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((item) => (
                  <ColorSwatch
                    key={item.token}
                    label={item.label}
                    token={item.token}
                    tailwind={item.tailwind}
                    lightHex={item.lightHex}
                    darkHex={item.darkHex}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Test;
