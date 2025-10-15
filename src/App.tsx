import Navbar from "./components/Navbar";

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="rounded-lg bg-amber-500 px-6 py-4 text-3xl font-bold text-white shadow dark:bg-amber-500/90">
          Hello world!
        </h1>
      </main>
    </div>
  );
}

export default App;
