import Link from "next/link";

const EXERCISES = [
  { href: "/exercise1", title: "Exercise 1", description: "Normal range" },
  { href: "/exercise2", title: "Exercise 2", description: "Fixed values range" },
] as const;

export default function Home() {
  return (
    <main className="flex flex-1 w-full flex-col items-center justify-center gap-8 px-4">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-semibold">Hola!</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Prueba técnica por Pere Bruy
        </p>
      </div>
      <nav aria-label="Exercises">
        <ul className="flex flex-col gap-4 sm:flex-row">
          {EXERCISES.map(({ href, title, description }) => (
            <li key={href}>
              <Link
                href={href}
                className="flex flex-col items-center rounded-xl border border-black/8 px-6 py-4 transition-colors hover:bg-black/4 dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
              >
                <span className="font-medium">{title}</span>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">{description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  );
}
