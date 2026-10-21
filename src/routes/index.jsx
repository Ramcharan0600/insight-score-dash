import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/metadata";
import {
  ArrowRight,
  ArrowUpRight,
  CircleCheck,
  Users,
  ScanLine,
  ClipboardCheck,
  ShieldCheck,
} from "lucide-react";
import { SOURCES } from "./solution";
export const Route = createFileRoute("/")({
  head: () =>
    pageHead(
      "Student Success Intelligence Platform",
      "Turning campus data into student success. Discover seven connected data sources, explainable risk insights and timely mentor support with BIB InsightIQ.",
    ),
  component: Home,
});
function Home() {
  return (
    <PublicLayout>
      <main>
        <section className="relative overflow-hidden border-b bg-[radial-gradient(60rem_28rem_at_85%_-10%,var(--rose-pale),transparent)]">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-2 lg:px-8 lg:py-24">
            <div>
              <p className="eyebrow flex items-center gap-2">
                <span className="size-2 rounded-full bg-primary" />
                BIB INSIGHTIQ · STUDENT SUCCESS INTELLIGENCE
              </p>
              <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.1] text-foreground sm:text-5xl lg:text-6xl">
                Turn Campus Data Into <span className="text-primary">Student Success.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Seven connected student data sources become one explainable Success Score, clear
                risk reasons and a practical next step for every student, so mentors can act before
                a small gap becomes a bigger challenge.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link to="/auth">
                    Get Started / Login <ArrowRight />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/solution">
                    Explore Platform <ArrowUpRight />
                  </Link>
                </Button>
              </div>
              <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="size-4 text-primary" />
                Explainable insights. Human-led support. Private by design.
              </p>
            </div>
            <figure
              aria-label="Illustrative preview of the Student Success Score"
              className="relative"
            >
              <div className="surface relative z-10 p-5 shadow-lg">
                <div className="flex items-center gap-5">
                  <svg viewBox="0 0 100 100" className="size-24 shrink-0 -rotate-90" aria-hidden>
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="var(--border)"
                      strokeWidth="9"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="var(--primary)"
                      strokeWidth="9"
                      strokeLinecap="round"
                      strokeDasharray="264"
                      strokeDashoffset="68"
                    />
                  </svg>
                  <div>
                    <p className="text-xs font-semibold uppercase text-label">Success Score</p>
                    <p className="font-display text-4xl font-bold tabular-nums">74 / 100</p>
                    <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-xs font-semibold text-warning">
                      Monitor
                    </span>
                  </div>
                </div>
                <div className="mt-5 space-y-3">
                  {[
                    ["Academics", 82],
                    ["Attendance", 71],
                    ["LMS", 64],
                    ["Placement", 58],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <div className="flex justify-between text-xs">
                        <span>{k}</span>
                        <span className="tabular-nums text-muted-foreground">{v}</span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${v}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-4 rounded-lg bg-accent p-3 text-xs text-accent-foreground">
                  Why flagged: attendance under 75% in 1 subject, placement readiness below 60%.
                </p>
              </div>
              <div
                aria-hidden
                className="absolute -bottom-4 -right-3 h-full w-full rounded-[14px] border bg-rose-pale"
              />
              <figcaption className="relative z-10 mt-3 text-xs text-muted-foreground">
                Illustrative preview, not a live student record.
              </figcaption>
            </figure>
          </div>
        </section>
        <section className="border-b bg-card">
          <div className="mx-auto grid max-w-7xl gap-6 px-5 py-7 sm:grid-cols-3 lg:px-8">
            {[
              { n: "07", t: "Connected data sources", d: "One shared student identity" },
              { n: "03", t: "Connected perspectives", d: "Student · Faculty · Administrator" },
              { n: "100", t: "Point Success Score", d: "Transparent, advisory, actionable" },
            ].map((x) => (
              <div key={x.n} className="flex items-center gap-5">
                <span className="font-display text-4xl font-semibold text-primary">{x.n}</span>
                <div>
                  <p className="text-sm font-semibold">{x.t}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{x.d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="eyebrow">LESS GUESSWORK. MORE MEANINGFUL SUPPORT.</p>
              <h2 className="mt-4 font-display text-3xl font-semibold sm:text-4xl">
                Three questions. A clearer next step.
              </h2>
            </div>
            <Button asChild variant="link">
              <Link to="/solution">
                Why BIB InsightIQ <ArrowRight />
              </Link>
            </Button>
          </div>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Users,
                q: "Who needs help?",
                d: "Find students who need attention with evidence-led risk signals and a complete view of their progress.",
                n: "01",
              },
              {
                icon: ScanLine,
                q: "Why are they at risk?",
                d: "Connect grades, attendance, learning activity and placement readiness to reveal gaps a single system can miss.",
                n: "02",
              },
              {
                icon: ClipboardCheck,
                q: "What should faculty do next?",
                d: "Turn the insight into a practical mentor action, with an owner, a follow-up date and visible progress.",
                n: "03",
              },
            ].map((x) => (
              <article key={x.n} className="border-t pt-6">
                <div className="flex items-center justify-between">
                  <x.icon className="motion-icon size-7 text-primary" />
                  <span className="text-xs text-muted-foreground">{x.n}</span>
                </div>
                <h3 className="mt-6 text-xl font-semibold">{x.q}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{x.d}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="overflow-hidden border-y bg-muted/50 py-10">
          <p className="eyebrow mb-7 text-center">THE WHOLE STORY, NOT ANOTHER SILO</p>
          <div>
            <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-12 gap-y-5 px-6">
              {SOURCES.map((s, i) => (
                <div key={`${s.name}-${i}`} className="flex shrink-0 items-center gap-3">
                  <s.icon className="size-6 text-primary" />
                  <span className="font-display text-lg font-medium">{s.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-2 lg:px-8">
          <div>
            <p className="eyebrow">CONNECT THE SIGNALS</p>
            <h2 className="mt-4 text-3xl font-semibold">
              Strong grades do not
              <br />
              always tell the whole story.
            </h2>
            <p className="mt-5 text-muted-foreground">
              A student with a strong CGPA but low attendance needs a different plan from a strong
              coder with weak aptitude. BIB InsightIQ connects the evidence so support is specific,
              not generic.
            </p>
            <Button asChild variant="outline" className="mt-6">
              <Link to="/auth">
                Sign in as faculty <ArrowRight />
              </Link>
            </Button>
          </div>
          <div className="border-y py-7">
            <p className="text-xs font-semibold text-muted-foreground">
              ILLUSTRATIVE CROSS-SOURCE INSIGHT
            </p>
            <h3 className="mt-5 text-xl font-semibold">Strong coding. An aptitude gap.</h3>
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Coding</span>
                <span className="font-semibold text-success">85 / 100</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[85%] bg-success" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Aptitude</span>
                <span className="font-semibold text-warning">45 / 100</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[45%] bg-warning" />
              </div>
            </div>
            <p className="mt-6 flex gap-3 text-sm">
              <CircleCheck className="size-5 shrink-0 text-primary" />
              Next step: targeted aptitude practice and a mentor follow-up, rather than more generic
              coding work.
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              Illustrative example, not a live student record or selection prediction.
            </p>
          </div>
        </section>
        <section className="border-t bg-accent/40">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-8 px-5 py-12 lg:px-8">
            <div>
              <p className="eyebrow">A BETTER PICTURE. A BETTER CONVERSATION.</p>
              <h2 className="mt-3 text-3xl font-semibold">
                See your campus through BIB InsightIQ.
              </h2>
              <p className="mt-3 text-muted-foreground">
                Explore the experience, or connect with the people behind it.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/benefits">
                  Find your perspective <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/contact">Connect with us</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
