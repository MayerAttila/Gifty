import {
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

type ShoppingResult = {
  id: string;
  title: string;
  source: string;
  link: string;
  thumbnail?: string;
  priceText?: string;
  priceValue?: number;
  extractedPrice?: number;
};

type PriceMatch = ShoppingResult & {
  matchesTarget: boolean;
};

const SERP_API_KEY = import.meta.env.VITE_SERP_API_KEY;
const SERP_API_BASE =
  typeof import.meta.env.DEV !== "undefined" && import.meta.env.DEV
    ? "/serpapi"
    : "https://serpapi.com";

const normalizePrice = (candidate: unknown): number | undefined => {
  if (typeof candidate === "number" && Number.isFinite(candidate)) {
    return candidate;
  }
  if (typeof candidate === "string") {
    const sanitized = candidate.replace(/[^0-9.,]/g, "").replace(",", ".");
    const parsed = Number.parseFloat(sanitized);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return undefined;
};

const Products = () => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ShoppingResult[]>([]);
  const [rawPayload, setRawPayload] = useState<string | null>(null);

  const hasApiKey = Boolean(SERP_API_KEY && SERP_API_KEY.length > 6);

  const enrichedResults = useMemo<PriceMatch[]>(() => {
    return results.map((result) => ({
      ...result,
      matchesTarget: false,
    }));
  }, [results]);

  const handleQueryChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!query.trim() || !hasApiKey) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        engine: "google_shopping",
        q: query.trim(),
        api_key: SERP_API_KEY!,
        num: "10",
      });
      const response = await fetch(
        `${SERP_API_BASE}/search.json?${params.toString()}`
      );
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const payload = (await response.json()) as {
        shopping_results?: Array<Record<string, unknown>>;
        error?: string;
      };

      if (payload.error) {
        throw new Error(payload.error);
      }

      console.log("SerpApi payload:", payload);

      const shoppingResults = Array.isArray(payload.shopping_results)
        ? payload.shopping_results
        : [];

      const normalized = shoppingResults
        .map((candidate) => {
          const id =
            typeof candidate.id === "string"
              ? candidate.id
              : typeof candidate.position === "number"
              ? `item-${candidate.position}`
              : undefined;
          const title =
            typeof candidate.title === "string" ? candidate.title : undefined;
          const source =
            typeof candidate.source === "string"
              ? candidate.source
              : typeof candidate.store === "string"
              ? candidate.store
              : undefined;
          const link =
            typeof candidate.link === "string" ? candidate.link : undefined;
          if (!id || !title || !source || !link) {
            return null;
          }
          const priceText =
            typeof candidate.price === "string" ? candidate.price : undefined;
          const priceValue = normalizePrice(candidate.price);
          const extractedPrice =
            typeof candidate.extracted_price === "number"
              ? candidate.extracted_price
              : normalizePrice(candidate.extracted_price);
          const thumbnail =
            typeof candidate.thumbnail === "string"
              ? candidate.thumbnail
              : undefined;
          return {
            id,
            title,
            source,
            link,
            thumbnail,
            priceText,
            priceValue,
            extractedPrice,
          };
        })
        .filter((entry): entry is ShoppingResult => entry !== null);

      setResults(normalized.slice(0, 8));
      setRawPayload(JSON.stringify(payload, null, 2));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unknown error fetching products."
      );
      setResults([]);
      setRawPayload(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 text-contrast">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-brand">Products</h1>
        <p className="max-w-2xl text-sm text-contrast/70">
          Connect gifts to members and monitor prices. This demo queries the
          SerpApi Google Shopping engine so you can validate the workflow before
          wiring up notifications.
        </p>
      </header>

      <section className="space-y-6 rounded-xl bg-primary p-5 shadow-sm">
        <header className="space-y-1">
          <h2 className="text-lg font-semibold text-contrast">
            Price Tracker Preview
          </h2>
          <p className="text-sm text-contrast/60">
            Enter a product keyword and optional target price. We&apos;ll call
            SerpApi and highlight offers that meet your price point.
          </p>
        </header>

        {!hasApiKey ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
            Add your SerpApi key to a <code>.env</code> file as
            <code className="mx-1 font-mono text-xs">VITE_SERP_API_KEY</code>,
            then restart the dev server to enable live requests.
          </div>
        ) : null}

        <form
          onSubmit={handleSearch}
        className="flex flex-col gap-4 rounded-lg border border-accent-2/70 bg-primary/80 p-4 sm:flex-row sm:items-end"
      >
        <label className="flex flex-1 flex-col text-sm font-medium text-contrast">
          Product keyword
          <input
              type="text"
              value={query}
              onChange={handleQueryChange}
              placeholder="e.g. Nintendo Switch OLED"
              className="mt-1 rounded-lg border border-accent-2/60 bg-primary px-3 py-2 text-sm text-contrast shadow-sm focus:border-brand/70 focus:outline-none focus:ring-2 focus:ring-brand/50"
              required
            />
          </label>
          <button
            type="submit"
            disabled={!hasApiKey || !query.trim() || isLoading}
            className="inline-flex min-w-[140px] items-center justify-center rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-primary shadow transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:bg-brand/40 disabled:text-primary/70"
          >
            {isLoading ? "Searching…" : "Search"}
          </button>
        </form>

        {error ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-700 dark:bg-rose-950 dark:text-rose-100">
            {error}
          </div>
        ) : null}

        {enrichedResults.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {enrichedResults.map((item) => (
              <article
                key={item.id}
                className={[
                  "relative flex flex-col gap-3 rounded-xl border p-4 transition shadow-sm",
                  item.matchesTarget
                    ? "border-emerald-400/70 bg-emerald-50 dark:border-emerald-500/60 dark:bg-emerald-950/40"
                    : "border-accent-2/60 bg-primary/70",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <div className="flex items-start gap-3">
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt=""
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                  ) : null}
                  <div className="flex flex-1 flex-col gap-1">
                    <h3 className="text-sm font-semibold text-contrast">
                      {item.title}
                    </h3>
                    <p className="text-xs uppercase tracking-wide text-contrast/60">
                      {item.source}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-brand">
                    {item.priceText ??
                      (item.extractedPrice
                        ? `$${item.extractedPrice.toFixed(2)}`
                        : "N/A")}
                  </span>
                  {item.matchesTarget ? (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200">
                      Target met
                    </span>
                  ) : null}
                </div>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-lg border border-brand/50 px-3 py-2 text-xs font-semibold text-brand transition hover:bg-brand/10"
                >
                  View offer
                </a>
              </article>
            ))}
          </div>
        ) : isLoading ? null : (
          <p className="text-sm text-contrast/60">
            Results will appear here after a search.
          </p>
        )}

        {rawPayload ? (
          <details className="rounded-lg border border-accent-2/60 bg-primary/60 p-4 text-xs text-contrast/70">
            <summary className="cursor-pointer text-sm font-semibold text-contrast">
              Raw API response
            </summary>
            <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap break-all font-mono text-[11px] leading-snug">
              {rawPayload}
            </pre>
          </details>
        ) : null}
      </section>
    </div>
  );
};

export default Products;
