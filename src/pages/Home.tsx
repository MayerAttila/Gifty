const Home = () => {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">
          Welcome to Gifty
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-contrast sm:text-4xl">
          Curated gifts made delightfully simple.
        </h1>
        <p className="max-w-2xl text-base text-contrast/70">
          Discover thoughtful gifts with personalized recommendations tailored to every occasion.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-primary p-6 shadow-sm ring-1 ring-accent-2/60">
          <h2 className="text-lg font-semibold text-contrast">Inspiration</h2>
          <p className="mt-2 text-sm text-contrast/70">
            Browse curated collections for birthdays, anniversaries, and surprise celebrations.
          </p>
        </div>
        <div className="rounded-xl bg-primary p-6 shadow-sm ring-1 ring-accent-2/60">
          <h2 className="text-lg font-semibold text-contrast">Personalization</h2>
          <p className="mt-2 text-sm text-contrast/70">
            Narrow choices with preferences, interests, and budgets to find the perfect match.
          </p>
        </div>
        <div className="rounded-xl bg-primary p-6 shadow-sm ring-1 ring-accent-2/60">
          <h2 className="text-lg font-semibold text-contrast">Delivery</h2>
          <p className="mt-2 text-sm text-contrast/70">
            Share gifts digitally or ship them worldwide with confidence and tracking.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Home;
