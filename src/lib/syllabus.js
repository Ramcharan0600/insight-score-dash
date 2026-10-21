// Builds the downloadable syllabus text for a unit (or a whole subject) from what the teacher
// entered: the unit title and its comma- or line-separated topic list.

const topicsOf = (topics) =>
  (topics ?? "")
    .split(/[\n;,]+/)
    .map((t) => t.trim())
    .filter(Boolean);

export const hasSyllabus = (unit) => Boolean(unit.configured || unit.topics?.trim());

function unitText(unit) {
  const topics = topicsOf(unit.topics);
  return [
    `Unit ${unit.unit}: ${unit.title}`,
    ...(topics.length
      ? topics.map((t, i) => `  ${i + 1}. ${t}`)
      : ["  Topics have not been published for this unit yet."]),
  ].join("\n");
}

export function unitSyllabus(subject, unit) {
  return {
    name: `${subject} - Unit ${unit.unit} syllabus.txt`,
    text: `${subject}\nSyllabus\n\n${unitText(unit)}\n`,
  };
}

export function subjectSyllabus(subject, units) {
  const published = units.filter(hasSyllabus);
  return {
    name: `${subject} - syllabus.txt`,
    text: `${subject}\nSyllabus\n\n${published.map(unitText).join("\n\n")}\n`,
  };
}

/** Saves text as a file in the browser. Files are always downloaded, never opened in the page. */
export function downloadText({ name, text }) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name.replace(/[\\/:*?"<>|]/g, "-");
  a.click();
  URL.revokeObjectURL(url);
}
