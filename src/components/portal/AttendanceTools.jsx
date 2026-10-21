import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState, SectionTitle } from "@/components/widgets";
import {
  ErrorState,
  Field,
  PageSkeleton,
  StatusPill,
  inputClass,
  useAction,
} from "@/components/ui-kit";
import {
  loadAttendanceRoster,
  loadMyAttendance,
  loadRecentSessions,
  removeTimetableSlot,
  saveAttendance,
  saveTimetableSlot,
} from "@/lib/platform.functions";
import { campusOptions } from "@/lib/use-campus";
import { KEYS, useTimetable } from "@/lib/use-platform";
import { todayIso } from "@/lib/live-profile";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// ---------------------------------------------------------------- mark attendance (staff)
export function MarkAttendance() {
  const timetable = useTimetable();
  const qc = useQueryClient();
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState(todayIso());
  const [period, setPeriod] = useState(1);
  const [present, setPresent] = useState({});
  const subjects = timetable.data?.subjects ?? [];
  const current = subject || subjects[0] || "";
  const key = ["attendance-roster", current, date, period];
  const roster = useQuery({
    queryKey: key,
    queryFn: () => loadAttendanceRoster({ data: { subject: current, date, period } }),
    enabled: Boolean(current && date),
  });
  const recent = useQuery({
    queryKey: ["attendance-recent", current],
    queryFn: () => loadRecentSessions({ data: { subject: current } }),
    enabled: Boolean(current),
  });
  // Start from the saved marks (or everyone present) whenever the class being marked changes.
  useEffect(() => {
    if (roster.data)
      setPresent(Object.fromEntries(roster.data.students.map((s) => [s.id, s.present])));
  }, [roster.data]);
  const { busy, run } = useAction(async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: key }),
      qc.invalidateQueries({ queryKey: ["attendance-recent", current] }),
      qc.invalidateQueries({ queryKey: campusOptions.queryKey }),
    ]);
  });

  if (timetable.isLoading) return <PageSkeleton rows={2} />;
  if (timetable.error) return <ErrorState error={timetable.error} onRetry={timetable.refetch} />;
  if (!subjects.length)
    return (
      <EmptyState
        title="No subjects to mark"
        hint="Subjects appear here once students assigned to you have them on their record."
      />
    );
  const students = roster.data?.students ?? [];
  const absentCount = students.filter((s) => present[s.id] === false).length;
  return (
    <div className="space-y-4">
      <SectionTitle sub="Tick who is absent. Everyone starts as present, and saving updates each student's attendance percentage.">
        Mark attendance
      </SectionTitle>
      <div className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-3">
        <Field label="Subject">
          <select
            className={inputClass}
            value={current}
            onChange={(e) => setSubject(e.target.value)}
          >
            {subjects.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label="Date">
          <Input
            type="date"
            value={date}
            max={todayIso()}
            onChange={(e) => setDate(e.target.value)}
          />
        </Field>
        <Field label="Period" hint="Use different periods for two classes on one day.">
          <select
            className={inputClass}
            value={period}
            onChange={(e) => setPeriod(Number(e.target.value))}
          >
            {Array.from({ length: 8 }, (_, i) => i + 1).map((p) => (
              <option key={p} value={p}>
                Period {p}
              </option>
            ))}
          </select>
        </Field>
      </div>
      {roster.error ? (
        <ErrorState error={roster.error} onRetry={roster.refetch} />
      ) : roster.isLoading ? (
        <PageSkeleton rows={3} />
      ) : !students.length ? (
        <EmptyState
          title="No students in this class"
          hint="Only students assigned to you are listed."
        />
      ) : (
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            run(
              () =>
                saveAttendance({
                  data: {
                    subject: current,
                    date,
                    period,
                    marks: students.map((s) => ({
                      studentId: s.id,
                      present: present[s.id] !== false,
                    })),
                  },
                }),
              roster.data.marked ? "Attendance updated." : "Attendance saved.",
            );
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              {students.length - absentCount} present · {absentCount} absent
              {roster.data.marked && " · already marked, saving will update it"}
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setPresent(Object.fromEntries(students.map((s) => [s.id, true])))}
            >
              <CheckCheck /> Mark all present
            </Button>
          </div>
          <ul className="divide-y rounded-xl border bg-card">
            {students.map((s) => {
              const here = present[s.id] !== false;
              return (
                <li key={s.id} className="flex items-center justify-between gap-3 px-3 py-2">
                  <span className="min-w-0 truncate text-sm">
                    <span className="font-medium">{s.name}</span>{" "}
                    <span className="text-xs text-muted-foreground">{s.id}</span>
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={here}
                    aria-label={`${s.name} ${here ? "present" : "absent"}`}
                    onClick={() => setPresent({ ...present, [s.id]: !here })}
                    className="min-h-9 shrink-0 rounded-full"
                  >
                    <StatusPill tone={here ? "success" : "danger"}>
                      {here ? "Present" : "Absent"}
                    </StatusPill>
                  </button>
                </li>
              );
            })}
          </ul>
          <Button type="submit" disabled={busy}>
            Save attendance
          </Button>
        </form>
      )}
      {recent.data?.length > 0 && (
        <div>
          <p className="mb-1 text-sm font-medium">Recent classes</p>
          <ul className="divide-y rounded-xl border bg-card text-sm">
            {recent.data.map((r) => (
              <li key={r.id} className="flex flex-wrap justify-between gap-2 px-3 py-2">
                <button
                  type="button"
                  className="text-left underline-offset-2 hover:underline"
                  onClick={() => {
                    setDate(r.held_on);
                    setPeriod(r.period);
                  }}
                >
                  {r.held_on} · Period {r.period}
                </button>
                <span className="text-muted-foreground">
                  {r.present} present · {r.absent} absent
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- timetable
function SlotForm({ subjects, onSaved }) {
  const [f, setF] = useState({
    subject: subjects[0],
    day: 1,
    start: "09:00",
    end: "10:00",
    room: "",
  });
  const { busy, run } = useAction(onSaved);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <form
      className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-5"
      onSubmit={(e) => {
        e.preventDefault();
        run(
          () => saveTimetableSlot({ data: { ...f, day: Number(f.day) } }),
          "Class added to the timetable.",
        );
      }}
    >
      <Field label="Subject">
        <select className={inputClass} value={f.subject} onChange={set("subject")}>
          {subjects.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </Field>
      <Field label="Day">
        <select className={inputClass} value={f.day} onChange={set("day")}>
          {DAYS.map((d, i) => (
            <option key={d} value={i + 1}>
              {d}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Starts">
        <Input type="time" value={f.start} onChange={set("start")} required />
      </Field>
      <Field label="Ends">
        <Input type="time" value={f.end} onChange={set("end")} required />
      </Field>
      <Field label="Room">
        <Input value={f.room} onChange={set("room")} maxLength={60} />
      </Field>
      <div className="sm:col-span-5">
        <Button type="submit" size="sm" disabled={busy}>
          Add class
        </Button>
      </div>
    </form>
  );
}

/** The weekly timetable. Teachers and administrators can add and remove classes. */
export function Timetable({ canEdit }) {
  const { data, isLoading, error, refetch } = useTimetable();
  const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: KEYS.timetable });
  const { busy, run } = useAction(refresh);
  if (isLoading) return <PageSkeleton rows={2} />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;
  return (
    <section className="space-y-3" aria-label="Timetable">
      <SectionTitle
        sub={
          canEdit
            ? "Set when each subject meets. Students see this too."
            : "When each of your subjects meets."
        }
      >
        Timetable
      </SectionTitle>
      {canEdit && data.subjects.length > 0 && (
        <SlotForm subjects={data.subjects} onSaved={refresh} />
      )}
      {!data.slots.length ? (
        <EmptyState
          title="No timetable yet"
          hint={
            canEdit
              ? "Add the first class above."
              : "Your teacher has not published a timetable yet."
          }
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {DAYS.map((name, i) => {
            const slots = data.slots.filter((s) => s.day === i + 1);
            if (!slots.length) return null;
            return (
              <div key={name} className="rounded-xl border bg-card p-3">
                <p className="mb-2 text-sm font-semibold">{name}</p>
                <ul className="space-y-2">
                  {slots.map((s) => (
                    <li key={s.id} className="flex items-start justify-between gap-2 text-sm">
                      <span>
                        <span className="font-medium tabular-nums">
                          {s.start}–{s.end}
                        </span>{" "}
                        {s.subject}
                        {s.room && <span className="text-muted-foreground"> · {s.room}</span>}
                      </span>
                      {canEdit && (
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          disabled={busy}
                          aria-label={`Remove ${s.subject} on ${name}`}
                          onClick={() =>
                            run(() => removeTimetableSlot({ data: { id: s.id } }), "Class removed.")
                          }
                        >
                          <Trash2 />
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

// ---------------------------------------------------------------- student log
/** A student's own marked classes, so a percentage can be traced to the days behind it. */
export function MyAttendanceLog({ subjects }) {
  const [subject, setSubject] = useState(subjects[0] ?? "");
  const log = useQuery({
    queryKey: ["my-attendance", subject],
    queryFn: () => loadMyAttendance({ data: { subject } }),
    enabled: Boolean(subject),
  });
  if (!subjects.length) return null;
  return (
    <section className="space-y-3" aria-label="Class by class attendance">
      <SectionTitle sub="Each class your teacher has marked.">Class-by-class record</SectionTitle>
      <select
        className={inputClass + " max-w-xs"}
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        aria-label="Subject"
      >
        {subjects.map((s) => (
          <option key={s}>{s}</option>
        ))}
      </select>
      {log.error ? (
        <ErrorState error={log.error} onRetry={log.refetch} />
      ) : !log.data?.length ? (
        <EmptyState title="No classes marked yet" hint="Marked classes will appear here." />
      ) : (
        <ul className="divide-y rounded-xl border bg-card text-sm">
          {log.data.map((r) => (
            <li
              key={`${r.held_on}-${r.period}`}
              className="flex items-center justify-between px-3 py-2"
            >
              <span>
                {r.held_on} · Period {r.period}
              </span>
              <StatusPill tone={r.present ? "success" : "danger"}>
                {r.present ? "Present" : "Absent"}
              </StatusPill>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
