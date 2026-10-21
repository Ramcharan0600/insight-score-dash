import { Link } from "@tanstack/react-router";
import { ArrowRight, Target } from "lucide-react";
import { ProgressBar, SectionTitle } from "@/components/widgets";
import { liveNotifications } from "@/lib/live-profile";
import { roleMatch } from "@/lib/role-match";
import { componentScores, lmsCompletion, studentAttendancePct } from "@/lib/scoring";

const card = "surface p-4";
const AREA_LINK = {
  Attendance: "/portal/attendance",
  Assignment: "/portal/lms",
  Academics: "/portal/results",
  Skills: "/portal/skills",
  Engagement: "/portal/engagement",
};

/** Next steps built from the same rules as the alerts, each linking to where to act. */
export function RecommendedActions({ s, today }) {
  const actions = liveNotifications(s, today)
    .filter((n) => n.tone !== "info")
    .slice(0, 5);
  return (
    <div className={card}>
      <SectionTitle sub="From your own data and the configured rules">
        Recommended actions
      </SectionTitle>
      {actions.length === 0 ? (
        <p className="text-sm text-success">Nothing urgent. Keep going.</p>
      ) : (
        <ul className="space-y-2">
          {actions.map((n) => (
            <li key={n.key} className="rounded-lg border p-3 text-sm">
              <p className="font-medium">{n.text}</p>
              <p className="text-muted-foreground">{n.tip}</p>
              {AREA_LINK[n.area] && (
                <Link
                  to={AREA_LINK[n.area]}
                  className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  Go to {n.area.toLowerCase()} <ArrowRight className="size-3" />
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Readiness and the biggest skill gaps for the roles the student is aiming for. */
export function PlacementSnapshot({ s }) {
  const readiness = componentScores(s).placement;
  const matches = (s.targetRoles ?? []).map((r) => roleMatch(s.skills, r)).filter(Boolean);
  const gaps = matches.flatMap((m) => m.gaps.map((g) => ({ ...g, role: m.role }))).slice(0, 4);
  return (
    <div className={card}>
      <SectionTitle sub="How ready you are, and what to build next">
        Placement readiness and skill gaps
      </SectionTitle>
      <div className="flex items-baseline gap-2">
        <span className="font-display text-3xl font-bold tabular-nums">
          {readiness === null ? "—" : Math.round(readiness)}
        </span>
        <span className="text-sm text-muted-foreground">
          {readiness === null ? "not enough placement data yet" : "/ 100 readiness"}
        </span>
      </div>
      {readiness !== null && <ProgressBar value={readiness} />}
      {matches.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Add target roles on your{" "}
          <Link to="/portal/profile" className="text-primary underline">
            profile
          </Link>{" "}
          to see role-specific gaps.
        </p>
      ) : gaps.length === 0 ? (
        <p className="mt-3 text-sm text-success">
          Your assessed skills meet the levels typical for {matches.map((m) => m.role).join(", ")}.
        </p>
      ) : (
        <ul className="mt-3 space-y-1 text-sm">
          {gaps.map((g) => (
            <li key={g.role + g.skill}>
              <b>{g.skill[0].toUpperCase() + g.skill.slice(1)}</b> for {g.role}: {g.value} of{" "}
              {g.required} needed
            </li>
          ))}
        </ul>
      )}
      <Link
        to="/portal/placement"
        className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
      >
        Drives and eligibility <ArrowRight className="size-3" />
      </Link>
    </div>
  );
}

// Targets used by the progress bars below. They match the thresholds used by the risk rules.
export const GOALS = [
  { key: "attendance", label: "Attendance", target: 75, unit: "%" },
  { key: "cgpa", label: "CGPA", target: 7.5, unit: "", decimals: 1 },
  { key: "lms", label: "LMS completion", target: 80, unit: "%" },
  { key: "placement", label: "Placement readiness", target: 75, unit: "%" },
];

export function GoalProgress({ s }) {
  const values = {
    attendance: studentAttendancePct(s),
    cgpa: s.cgpa > 0 ? s.cgpa : null,
    lms: lmsCompletion(s),
    placement: componentScores(s).placement,
  };
  return (
    <div className={card}>
      <SectionTitle sub="Where you are against the usual targets">
        <span className="inline-flex items-center gap-2">
          <Target className="size-4 text-primary" /> Progress towards your goals
        </span>
      </SectionTitle>
      <div className="space-y-3">
        {GOALS.map((g) => {
          const v = values[g.key];
          const reached = v !== null && v >= g.target;
          const d = g.decimals ?? 0;
          return (
            <div key={g.key}>
              <div className="flex justify-between text-sm">
                <span>{g.label}</span>
                <span className="tabular-nums">
                  {v === null ? "Not recorded" : `${v.toFixed(d)}${g.unit}`} of {g.target}
                  {g.unit}
                  {reached && <span className="ml-2 font-semibold text-success">Goal met</span>}
                </span>
              </div>
              <ProgressBar
                value={v === null ? 0 : Math.min(100, (v / g.target) * 100)}
                tone={reached ? "var(--success)" : undefined}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
