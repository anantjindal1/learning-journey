import type { Metadata } from "next";
import Link from "next/link";

// Mirror the inline CMS-like data structure from the blog index so static generation stays simple.
const posts = [
  {
    slug: "returning-to-coding-with-ai",
    title:
      "Returning to Coding After 10 Years — How AI Changed Everything",
    date: "2026-02-26",
    excerpt:
      "I stopped coding in 2015. Here is what it felt like to come back with Cursor and Claude as my pair programmers.",
    readTime: "5 min read",
    tags: ["AI", "Vibe Coding", "Career"],
  },
  {
    slug: "vibe-coding-workflow",
    title: "My Vibe Coding Workflow — From Idea to Deployed App",
    date: "2026-02-28",
    excerpt:
      "Describe, generate, read, refine, ship. How I use Cursor to build faster than ever.",
    readTime: "4 min read",
    tags: ["Cursor", "Productivity", "React"],
  },
  {
    slug: "modern-python-2026",
    title: "Modern Python in 2026 — What Changed Since 2015",
    date: "2026-03-01",
    excerpt:
      "Dataclasses, type hints, match/case, f-strings. Python feels like a different language now.",
    readTime: "6 min read",
    tags: ["Python", "TypeScript", "Learning"],
  },
] as const;

type Post = (typeof posts)[number];

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export function generateStaticParams() {
  // Use static params so all posts are prerendered and fast out of the box.
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata | undefined> {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) return undefined;

  return {
    title: `${post.title} — Anant Jindal`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const postIndex = posts.findIndex((p) => p.slug === slug);
  const post = posts[postIndex];

  if (!post) {
    return (
      <div className="px-4 pb-16 pt-10 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl space-y-4">
          <p className="text-sm font-semibold text-slate-200">
            404 — Post not found
          </p>
          <p className="text-sm text-slate-300">
            The article you&apos;re looking for doesn&apos;t exist (yet). It
            may have been renamed, or it&apos;s still an idea in a notes app.
          </p>
          <Link
            href="/blog"
            className="inline-flex text-sm font-medium text-sky-400 hover:text-sky-300"
          >
            ← Back to blog
          </Link>
        </div>
      </div>
    );
  }

  const nextPost: Post | undefined =
    posts[(postIndex + 1) % posts.length] ?? undefined;

  return (
    <div className="px-4 pb-16 pt-10 sm:px-8 lg:px-12">
      <article className="mx-auto max-w-3xl space-y-10">
        <header className="space-y-4">
          <Link
            href="/blog"
            className="inline-flex text-xs font-medium text-sky-400 hover:text-sky-300"
          >
            ← Back to blog
          </Link>
          <div className="space-y-2">
            <p className="text-xs text-slate-400">
              {post.date} · {post.readTime}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {post.title}
            </h1>
            <div className="flex flex-wrap gap-1">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </header>

        {/* Use a hand-written narrative body for now; in a real CMS this would come from markdown or MDX. */}
        <div className="prose prose-invert prose-slate max-w-none text-sm sm:text-base">
          {post.slug === "returning-to-coding-with-ai" && (
            <>
              <p>
                Coming back to code after a decade away felt like landing in a
                different universe. In 2015 my toolkit was Eclipse, XML
                layouts, and hand-written Retrofit calls. In 2026, the default
                question isn&apos;t “what can I code?” but “what can I describe
                well enough that an AI can help me build?”.
              </p>
              <p>
                Tools like Cursor and modern language models don&apos;t replace
                fundamentals — they amplify them. When I can explain a design
                in detail, the editor turns that intent into scaffolding,
                boilerplate, and even refactors. The limiting factor is no
                longer typing speed, but clarity of thought.
              </p>
              <p>
                The hardest part of returning hasn&apos;t been syntax. It&apos;s
                rebuilding the intuition for trade-offs: server components vs
                client, React vs server-rendered UI, Python sync vs async. AI
                helps by showing multiple approaches quickly, but the judgement
                of which to pick still has to be mine.
              </p>
              <p>
                This blog exists to document that process in public — what it
                feels like to pair with an assistant that can read the entire
                codebase, propose designs, and still occasionally hallucinate.
                It&apos;s messy, but it&apos;s also the most fun I&apos;ve had
                writing software.
              </p>
            </>
          )}

          {post.slug === "vibe-coding-workflow" && (
            <>
              <p>
                “Vibe coding” is my name for a workflow where I stay in flow by
                describing what I want, reading what the tools generate, and
                tightening the loop until it feels right. It&apos;s less about
                perfect specs and more about steering a conversation toward the
                product in my head.
              </p>
              <p>
                A typical session starts with a short narrative: the problem,
                constraints, and rough UX. From there, Cursor scaffolds routes,
                components, and types. I rarely accept the first draft, but it
                gives me something concrete to react to instead of a blank
                file.
              </p>
              <p>
                The key is staying in charge of the architecture. I&apos;ll ask
                for specific patterns — “use server components where possible”,
                “push state to the top”, “keep side effects isolated” — and
                then refactor the output myself. AI is great at exploring the
                design space quickly; it&apos;s still my job to decide what
                feels maintainable.
              </p>
              <p>
                By the end of a session I try to ship something small but real:
                a new route, a feature flag, a deploy. That tight loop from
                idea to production is where vibe coding shines.
              </p>
            </>
          )}

          {post.slug === "modern-python-2026" && (
            <>
              <p>
                When I left Python around 2015, type hints were barely a
                curiosity and async felt experimental. Coming back in 2026,
                modern Python feels like a thoughtfully typed, batteries-included
                language that still respects its simple roots.
              </p>
              <p>
                Dataclasses and type hints make domain models explicit and
                readable. Tools like mypy and Pyright catch whole classes of
                bugs before they ever hit runtime. Pattern matching with
                <code>match</code> / <code>case</code> brings a level of
                expressiveness that reminds me of Kotlin or Scala.
              </p>
              <p>
                On the web side, FastAPI pairs beautifully with this style:
                async first, typed request/response models, and automatic
                documentation. Combined with an AI assistant that can generate
                Pydantic schemas or suggest endpoint shapes, iterating on APIs
                feels dramatically faster than it used to.
              </p>
              <p>
                The most surprising part is how well Python now plays with
                TypeScript-based frontends. Shared contracts, generated clients,
                and consistent typing end-to-end make the stack feel cohesive —
                even though it evolved in parallel.
              </p>
            </>
          )}
        </div>

        {nextPost && nextPost.slug !== post.slug && (
          <section className="border-t border-slate-800 pt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Next Article
            </p>
            <div className="mt-2">
              <Link
                href={`/blog/${nextPost.slug}`}
                className="text-sm font-medium text-sky-400 hover:text-sky-300"
              >
                {nextPost.title}
              </Link>
            </div>
          </section>
        )}
      </article>
    </div>
  );
}

