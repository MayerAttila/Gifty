const Home = () => {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-amber-500">
          Welcome to Gifty
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Curated gifts made delightfully simple.
        </h1>
        <p className="max-w-2xl text-base text-slate-600 dark:text-slate-300">
          Discover thoughtful gifts with personalized recommendations tailored to every occasion.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60 dark:bg-slate-900 dark:ring-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Inspiration</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Browse curated collections for birthdays, anniversaries, and surprise celebrations.
          </p>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60 dark:bg-slate-900 dark:ring-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Personalization</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Narrow choices with preferences, interests, and budgets to find the perfect match.
          </p>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60 dark:bg-slate-900 dark:ring-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Delivery</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Share gifts digitally or ship them worldwide with confidence and tracking.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Home;
