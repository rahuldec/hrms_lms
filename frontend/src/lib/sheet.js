import Papa from "papaparse";

const SHEET_ID = process.env.REACT_APP_SHEET_ID;
const SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`;

export const extractDriveFileId = (url) => {
  if (!url) return null;
  const m = url.match(/\/file\/d\/([^/]+)/);
  if (m) return m[1];
  const m2 = url.match(/[?&]id=([^&]+)/);
  if (m2) return m2[1];
  return null;
};

export const drivePreviewUrl = (url) => {
  const id = extractDriveFileId(url);
  return id ? `https://drive.google.com/file/d/${id}/preview` : null;
};

// Parse rows from CSV → flat list of lessons grouped by modules.
// CSV columns: Sr No, Module, Days, Sub Parts, Link, Assignment
export const fetchSheetModules = async () => {
  const res = await fetch(SHEET_CSV_URL, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch sheet");
  const text = await res.text();
  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });

  const modules = [];
  let currentModule = null;
  let currentDay = null;
  let orderCounter = 0;

  parsed.data.forEach((row, idx) => {
    const sr = (row["Sr No"] || "").toString().trim();
    const mod = (row["Module"] || "").toString().trim();
    const day = (row["Days"] || "").toString().trim();
    const sub = (row["Sub Parts"] || "").toString().trim();
    const link = (row["Link"] || "").toString().trim();
    const assignment = (row["Assignment"] || "").toString().trim();

    if (mod) {
      currentModule = {
        id: `m-${sr || idx}`,
        order: parseInt(sr, 10) || modules.length + 1,
        name: mod,
        lessons: [],
      };
      modules.push(currentModule);
    }
    if (day) currentDay = day;
    if (!currentModule) return;
    if (!sub && !link && !assignment) return;

    orderCounter += 1;
    const isAssignment =
      sub.toLowerCase() === "assignment" || (!link && !!assignment);
    const isReview = sub.toLowerCase() === "review";

    currentModule.lessons.push({
      id: `${currentModule.id}-l${orderCounter}`,
      moduleId: currentModule.id,
      moduleName: currentModule.name,
      day: currentDay || "",
      title: sub || (isAssignment ? "Assignment" : "Lesson"),
      videoUrl: link || null,
      videoEmbedUrl: drivePreviewUrl(link),
      assignmentUrl: assignment || null,
      kind: isAssignment ? "assignment" : isReview ? "review" : "video",
    });
  });

  return modules.filter((m) => m.lessons.length > 0);
};
