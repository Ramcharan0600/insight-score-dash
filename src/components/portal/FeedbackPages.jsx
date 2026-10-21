import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Lock, Send, ShieldCheck, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState, SectionTitle } from "@/components/widgets";
import {
  ErrorState,
  Field,
  PageSkeleton,
  StatusPill,
  inputClass,
  useAction,
} from "@/components/ui-kit";
import { PageTitle, RoleGate } from "@/components/portal/PortalShell";
import { answerComplaint, sendComplaint, sendRating } from "@/lib/platform.functions";
import { useAllComplaints, useMyComplaints, useMyRatings, useRefreshAll } from "@/lib/use-platform";
import { LiveFeedback } from "@/components/student-profile/LiveStudentProfile";
import { useCampus } from "@/lib/use-campus";

const DIMENSIONS = [
  ["teaching", "Quality of teaching"],
  ["content", "Course content and materials"],
  ["support", "Mentor and staff support"],
  ["facilities", "Campus facilities"],
];

function StarInput({ name, label, value, onChange }) {
  return (
    <fieldset>
      <legend className="text-sm font-medium">{label}</legend>
      <div className="mt-1 flex gap-1" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className="cursor-pointer">
            <input
              type="radio"
              name={name}
              value={n}
              checked={value === n}
              onChange={() => onChange(n)}
              className="peer sr-only"
              required
            />
            <span
              className={`flex size-9 items-center justify-center rounded-md border text-sm font-semibold transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-ring ${
                value >= n
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-card hover:bg-accent"
              }`}
            >
              {n}
              <span className="sr-only"> out of 5</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Satisfaction() {
  const refresh = useRefreshAll();
  const ratings = useMyRatings();
  const [v, setV] = useState({ teaching: 0, content: 0, support: 0, facilities: 0 });
  const [comment, setComment] = useState("");
  const { busy, run } = useAction(refresh);
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <form
        className="surface space-y-4 p-4"
        onSubmit={async (e) => {
          e.preventDefault();
          const r = await run(
            () => sendRating({ data: { ...v, comment } }),
            "Thank you. Your ratings were saved.",
          );
          if (r.ok) {
            setV({ teaching: 0, content: 0, support: 0, facilities: 0 });
            setComment("");
          }
        }}
      >
        <SectionTitle sub="Rate each from 1 (poor) to 5 (excellent). You can share once a week.">
          How satisfied are you?
        </SectionTitle>
        {DIMENSIONS.map(([key, label]) => (
          <StarInput
            key={key}
            name={key}
            label={label}
            value={v[key]}
            onChange={(n) => setV({ ...v, [key]: n })}
          />
        ))}
        <Field label="Anything you would like to add? (optional)">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            maxLength={1000}
          />
        </Field>
        <Button type="submit" disabled={busy || Object.values(v).some((x) => !x)}>
          <Send /> Submit ratings
        </Button>
      </form>
      <section className="surface p-4">
        <SectionTitle sub="Teachers see the average, not your comment text">
          Your submissions
        </SectionTitle>
        {ratings.isLoading ? (
          <PageSkeleton rows={1} />
        ) : ratings.error ? (
          <ErrorState error={ratings.error} onRetry={ratings.refetch} />
        ) : !ratings.data.length ? (
          <p className="text-sm text-muted-foreground">You have not shared ratings yet.</p>
        ) : (
          <ul className="divide-y text-sm">
            {ratings.data.map((r) => (
              <li key={r.id} className="py-2">
                <p className="flex items-center gap-1 font-medium">
                  <Star className="size-4 text-warning" aria-hidden />
                  {((r.teaching + r.content + r.support + r.facilities) / 4).toFixed(1)} / 5
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString()}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Teaching {r.teaching} · Content {r.content} · Support {r.support} · Facilities{" "}
                  {r.facilities}
                </p>
                {r.comment && <p className="mt-1">{r.comment}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

const CATEGORY_LABEL = {
  academic: "Academic matter",
  faculty: "About a staff member",
  facilities: "Facilities",
  harassment: "Harassment or safety",
  other: "Something else",
};
const STATUS_TONE = { new: "warning", "in-review": "info", resolved: "success" };
const STATUS_LABEL = { new: "Received", "in-review": "Under review", resolved: "Resolved" };

function Complaints() {
  const refresh = useRefreshAll();
  const mine = useMyComplaints();
  const [f, setF] = useState({ category: "academic", subject: "", body: "" });
  const { busy, run } = useAction(refresh);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <form
        className="surface space-y-3 p-4"
        onSubmit={async (e) => {
          e.preventDefault();
          const r = await run(
            () => sendComplaint({ data: f }),
            "Your complaint was sent to the administrators.",
          );
          if (r.ok) setF({ category: "academic", subject: "", body: "" });
        }}
      >
        <SectionTitle sub="Only you and the administrators can read this. Teachers and mentors cannot.">
          <span className="inline-flex items-center gap-2">
            <Lock className="size-4 text-primary" /> Confidential complaint
          </span>
        </SectionTitle>
        <Field label="What is it about?">
          <select value={f.category} onChange={set("category")} className={inputClass}>
            {Object.entries(CATEGORY_LABEL).map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Subject">
          <Input
            value={f.subject}
            onChange={set("subject")}
            required
            minLength={3}
            maxLength={150}
          />
        </Field>
        <Field
          label="Details"
          hint="At least 10 characters. Include dates and places where it helps."
        >
          <Textarea
            value={f.body}
            onChange={set("body")}
            rows={6}
            required
            minLength={10}
            maxLength={4000}
          />
        </Field>
        <Button type="submit" disabled={busy}>
          <Send /> Send confidentially
        </Button>
      </form>
      <section className="surface p-4">
        <SectionTitle sub="Responses from the administrators appear here">
          Your complaints
        </SectionTitle>
        {mine.isLoading ? (
          <PageSkeleton rows={1} />
        ) : mine.error ? (
          <ErrorState error={mine.error} onRetry={mine.refetch} />
        ) : !mine.data.length ? (
          <p className="text-sm text-muted-foreground">You have not filed any complaints.</p>
        ) : (
          <ul className="space-y-3">
            {mine.data.map((c) => (
              <li key={c.id} className="rounded-lg border p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{c.subject}</p>
                  <StatusPill tone={STATUS_TONE[c.status]}>{STATUS_LABEL[c.status]}</StatusPill>
                </div>
                <p className="text-xs text-muted-foreground">
                  {CATEGORY_LABEL[c.category]} · {new Date(c.created_at).toLocaleDateString()}
                </p>
                {c.response && (
                  <p className="mt-2 rounded-md bg-accent p-2 text-accent-foreground">
                    Response: {c.response}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export function StudentFeedbackCentre({ s }) {
  const { refresh } = useCampus();
  const [tab, setTab] = useState("satisfaction");
  const tabs = [
    ["satisfaction", "Satisfaction ratings"],
    ["notes", "Notes and teacher feedback"],
    ["complaint", "Confidential complaint"],
  ];
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Feedback centre">
        {tabs.map(([key, label]) => (
          <Button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            size="sm"
            variant={tab === key ? "default" : "outline"}
            onClick={() => setTab(key)}
          >
            {label}
          </Button>
        ))}
      </div>
      {tab === "satisfaction" && <Satisfaction />}
      {tab === "notes" && (
        <LiveFeedback s={s} isOwner canWriteFaculty={false} onChanged={refresh} />
      )}
      {tab === "complaint" && <Complaints />}
    </div>
  );
}

// ---------------------------------------------------------------- administrators
function ComplaintCard({ c, refresh }) {
  const [status, setStatus] = useState(c.status);
  const [response, setResponse] = useState(c.response);
  const { busy, run } = useAction(refresh);
  return (
    <article className="surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold">{c.subject}</h3>
        <StatusPill tone={STATUS_TONE[c.status]}>{STATUS_LABEL[c.status]}</StatusPill>
      </div>
      <p className="text-xs text-muted-foreground">
        {CATEGORY_LABEL[c.category]} · from {c.author_name || c.author_email} ({c.author_email}) ·{" "}
        {new Date(c.created_at).toLocaleString()}
      </p>
      <p className="mt-2 whitespace-pre-wrap text-sm">{c.body}</p>
      <form
        className="mt-3 space-y-2 border-t pt-3"
        onSubmit={(e) => {
          e.preventDefault();
          run(() => answerComplaint({ data: { id: c.id, status, response } }), "Response saved.");
        }}
      >
        <Field label="Response to the student">
          <Textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            rows={3}
            maxLength={3000}
          />
        </Field>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Status"
            className={inputClass + " w-auto"}
          >
            {Object.entries(STATUS_LABEL).map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </select>
          <Button type="submit" size="sm" disabled={busy}>
            Save response
          </Button>
        </div>
      </form>
    </article>
  );
}

export function ComplaintsPage() {
  const refresh = useRefreshAll();
  const all = useAllComplaints();
  return (
    <RoleGate allow={["admin"]}>
      <PageTitle
        title="Confidential complaints"
        sub="Visible to administrators only. Notifications never include what was written."
      />
      <p className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <ShieldCheck className="size-4 text-primary" />
        Handle these privately. Opening or answering a complaint is recorded in the audit log.
      </p>
      {all.isLoading ? (
        <PageSkeleton rows={3} />
      ) : all.error ? (
        <ErrorState error={all.error} onRetry={all.refetch} />
      ) : !all.data.length ? (
        <EmptyState title="No complaints" hint="Nothing is waiting for review." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {all.data.map((c) => (
            <ComplaintCard key={c.id + c.status + c.response.length} c={c} refresh={refresh} />
          ))}
        </div>
      )}
      <p className="mt-6 text-xs text-muted-foreground">
        Students file complaints from{" "}
        <Link to="/portal/feedback" className="underline">
          Feedback
        </Link>
        .
      </p>
    </RoleGate>
  );
}
