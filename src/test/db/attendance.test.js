// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { addStudent, addUser, createTestDb, recordOf } from "./harness";
import * as attendance from "@/backend/attendance.server";

const TODAY = "2026-10-21";
const maths = (held, attended) => [
  { subject: "Maths", marks: 70, classesHeld: held, classesAttended: attended },
];

let ctx, db, admin, teacher, other, ann, ben, cara;

beforeAll(async () => {
  ctx = await createTestDb();
  db = ctx.db;
  admin = await addUser(db, "admin@x.edu", "Admin", ["admin"]);
  teacher = await addUser(db, "t1@x.edu", "Teacher One", ["faculty"]);
  other = await addUser(db, "t2@x.edu", "Teacher Two", ["faculty"]);
  ann = await addUser(db, "ann@x.edu", "Ann");
  ben = await addUser(db, "ben@x.edu", "Ben");
  cara = await addUser(db, "cara@x.edu", "Cara");
  await addStudent(db, "S-ANN", ann, teacher, { subjects: maths(10, 8) });
  await addStudent(db, "S-BEN", ben, teacher, { subjects: maths(10, 10) });
  await addStudent(db, "S-CARA", cara, other, { subjects: maths(10, 5) });
}, 60_000);

afterAll(() => ctx?.close());

const base = { subject: "Maths", date: "2026-10-20", period: 1 };
const totals = async (id) => (await recordOf(db, id)).subjects[0];

describe("marking attendance", () => {
  it("lists only the teacher's own students, everyone present by default", async () => {
    const r = await attendance.loadRoster(db, teacher, base);
    expect(r.marked).toBe(false);
    expect(r.students.map((s) => s.id)).toEqual(["S-ANN", "S-BEN"]);
    expect(r.students.every((s) => s.present)).toBe(true);
  });

  it("updates held/attended totals and notifies the absent student", async () => {
    const r = await attendance.markAttendance(
      db,
      teacher,
      { ...base, marks: [{ studentId: "S-ANN", present: false }] },
      TODAY,
    );
    expect(r).toMatchObject({ present: 1, absent: 1 });
    expect(await totals("S-ANN")).toMatchObject({ classesHeld: 11, classesAttended: 8 });
    expect(await totals("S-BEN")).toMatchObject({ classesHeld: 11, classesAttended: 11 });
    const n = await db.query("SELECT title FROM notifications WHERE user_id = $1", [ann.id]);
    expect(n.rows[0].title).toMatch(/absent in Maths/);
  });

  it("re-marking the same class corrects it instead of counting it twice", async () => {
    await attendance.markAttendance(
      db,
      teacher,
      {
        ...base,
        marks: [
          { studentId: "S-ANN", present: true },
          { studentId: "S-BEN", present: false },
        ],
      },
      TODAY,
    );
    expect(await totals("S-ANN")).toMatchObject({ classesHeld: 11, classesAttended: 9 });
    expect(await totals("S-BEN")).toMatchObject({ classesHeld: 11, classesAttended: 10 });
    const r = await attendance.loadRoster(db, teacher, base);
    expect(r.marked).toBe(true);
    expect(r.students.find((s) => s.id === "S-BEN").present).toBe(false);
    expect(await attendance.recentSessions(db, teacher, { subject: "Maths" })).toHaveLength(1);
  });

  it("keeps other teachers' students, students and future dates out", async () => {
    await expect(
      attendance.markAttendance(
        db,
        teacher,
        { ...base, marks: [{ studentId: "S-CARA", present: false }] },
        TODAY,
      ),
    ).rejects.toThrow(/not in your class/);
    await expect(
      attendance.markAttendance(db, ann, { ...base, marks: [] }, TODAY),
    ).rejects.toThrow();
    await expect(
      attendance.markAttendance(db, teacher, { ...base, date: "2026-10-22", marks: [] }, TODAY),
    ).rejects.toThrow(/future/);
    expect(await totals("S-CARA")).toMatchObject({ classesHeld: 10, classesAttended: 5 });
  });

  it("lets an administrator mark everyone and a student see only their own log", async () => {
    const r = await attendance.loadRoster(db, admin, { ...base, period: 2 });
    expect(r.students).toHaveLength(3);
    const log = await attendance.myAttendance(db, ann, { subject: "Maths" });
    expect(log).toEqual([{ held_on: "2026-10-20", period: 1, present: true }]);
    await expect(attendance.myAttendance(db, ann, { subject: "Chemistry" })).rejects.toThrow();
  });
});

describe("timetable", () => {
  it("lets a teacher add classes, rejects clashes and bad times, and shows them to students", async () => {
    await attendance.saveSlot(db, teacher, {
      subject: "Maths",
      day: 1,
      start: "09:00",
      end: "10:00",
      room: "A1",
    });
    await expect(
      attendance.saveSlot(db, teacher, {
        subject: "Maths",
        day: 1,
        start: "09:30",
        end: "10:30",
        room: "",
      }),
    ).rejects.toThrow(/already has a class/);
    await expect(
      attendance.saveSlot(db, teacher, {
        subject: "Maths",
        day: 2,
        start: "11:00",
        end: "10:00",
        room: "",
      }),
    ).rejects.toThrow(/end after/);
    const t = await attendance.loadTimetable(db, ann);
    expect(t.slots).toMatchObject([
      { subject: "Maths", day: 1, start: "09:00", end: "10:00", room: "A1" },
    ]);
  });

  it("stops students and unrelated teachers from changing it", async () => {
    await expect(
      attendance.saveSlot(db, ann, {
        subject: "Maths",
        day: 3,
        start: "09:00",
        end: "10:00",
        room: "",
      }),
    ).rejects.toThrow();
    const { slots } = await attendance.loadTimetable(db, teacher);
    await expect(attendance.deleteSlot(db, ann, { id: slots[0].id })).rejects.toThrow();
    await attendance.deleteSlot(db, teacher, { id: slots[0].id });
    expect((await attendance.loadTimetable(db, teacher)).slots).toEqual([]);
  });
});
