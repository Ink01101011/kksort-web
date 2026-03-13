import HomeSnippetCard from "@/components/features/HomeSnippetCard";
import SocialIconLink from "@/components/ui/SocialIconLink";
import Table from "@/components/ui/Table";
import {
  ADVANTAGES,
  IMPORT_SNIPPET,
  INSTALL_SNIPPET,
  SEARCH_SNAPSHOT,
  SORT_SNAPSHOT,
  TRADE_OFFS,
} from "@/constants/home";
import { Link } from "react-router";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "KKsort Overview" },
    {
      name: "description",
      content:
        "Installation, pros and trade-offs, and algorithm overview for @kktestdev/kksort.",
    },
  ];
}

export default function Home() {
  return (
    <main className="home-grid home-page min-h-screen px-4 py-8 md:px-8 md:py-10">
      <div className="home-layout mx-auto grid max-w-7xl gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="home-main-content space-y-6">
          <header className="home-card home-hero-card fade-in-up p-6 md:p-8">
            <p className="home-kicker">@kktestdev/kksort</p>
            <h1 className="home-title mt-4">
              Type-Safe Sorting And Search Toolkit
            </h1>
            <p className="mt-4 max-w-4xl text-sm leading-relaxed md:text-base">
              A lightweight TypeScript library that ships 6 sorting algorithms
              and 4 searching algorithms with tree-shakable imports. This page
              summarizes installation, practical strengths, and caveats based on
              the npm package details.
            </p>

            <div className="mt-6 flex flex-wrap gap-2 font-mono text-xs">
              <span className="home-chip">TypeScript 5.3+</span>
              <span className="home-chip">Tree-Shakable</span>
              <span className="home-chip">Zero Dependencies</span>
              <span className="home-chip">Production Ready</span>
            </div>

            <div className="mt-6 home-hero-actions flex flex-wrap items-center gap-3">
              <Link className="primary-link-btn w-full text-center sm:w-auto" to="/kksort">
                Open Demo + Benchmark
              </Link>
              <div className="home-social-row flex flex-wrap gap-3">
                <SocialIconLink
                  href="https://github.com/Ink01101011/KKsort"
                  label="GitHub Repository"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 19c-5 1.5-5-2.5-7-3" />
                    <path d="M15 22v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 19 4.77 5.07 5.07 0 0 0 18.91 1S17.73.65 15 2.48a13.38 13.38 0 0 0-6 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77 5.44 5.44 0 0 0 3.5 8.52c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                  </svg>
                </SocialIconLink>

                <SocialIconLink
                  href="https://www.npmjs.com/package/@kktestdev/kksort"
                  label="NPM Package"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <path d="M7 16V9h3v7" />
                    <path d="M10 9h3v7" />
                    <path d="M13 9h4v3h-4" />
                  </svg>
                </SocialIconLink>

                <SocialIconLink href="https://www.linkedin.com/" label="LinkedIn">
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6Z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </SocialIconLink>
              </div>
            </div>
          </header>

          <section className="home-two-up grid gap-4 sm:gap-6 md:grid-cols-2">
            <HomeSnippetCard
              title="Installation"
              code={INSTALL_SNIPPET}
              copyAriaLabel="Copy installation commands"
              description="Use subpath imports for smallest bundles, or import grouped modules when you need many algorithms."
            />

            <HomeSnippetCard
              title="Import Patterns"
              code={IMPORT_SNIPPET}
              copyAriaLabel="Copy import patterns"
            />
          </section>

          <section className="home-card p-5 md:p-6">
            <h2 className="text-xl font-semibold">Pros And Trade-Offs</h2>
            <div className="mt-4 grid gap-6 md:grid-cols-2">
              <article>
                <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-neutral-600">
                  Advantages
                </h3>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed">
                  {ADVANTAGES.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </article>

              <article>
                <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-neutral-600">
                  Cautions
                </h3>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed">
                  {TRADE_OFFS.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </article>
            </div>
          </section>

          <section className="home-card p-5 md:p-6">
            <h2 className="text-xl font-semibold">Algorithm Snapshot</h2>

            <div className="mt-4 overflow-x-auto -mx-1 px-1 sm:mx-0 sm:px-0">
              <Table
                data={SORT_SNAPSHOT}
                cols={[
                  { key: "algorithm", label: "Sort" },
                  { key: "complexity", label: "Best / Avg / Worst" },
                  { key: "stable", label: "Stable" },
                  { key: "useCase", label: "Use Case" },
                ]}
              />
            </div>

            <div className="mt-5 overflow-x-auto -mx-1 px-1 sm:mx-0 sm:px-0">
              <Table
                data={SEARCH_SNAPSHOT}
                cols={[
                  { key: "algorithm", label: "Search" },
                  { key: "complexity", label: "Best / Avg / Worst" },
                  { key: "requirement", label: "Requirement" },
                ]}
              />
            </div>
          </section>
        </section>

        <aside className="home-aside space-y-6 lg:sticky lg:top-8 lg:self-start">
          <section className="home-card p-5">
            <h2 className="text-lg font-semibold">Package Links</h2>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed">
              <li className="break-all">- GitHub: github.com/Ink01101011/KKsort</li>
              <li className="break-all">- NPM: npmjs.com/package/@kktestdev/kksort</li>
              <li>
                - Weekly Downloads and version details on npm package page
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </main>
  );
}
