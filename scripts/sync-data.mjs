/**
 * sync-data.mjs — 从 Excel (resume-data.xlsx) 读取简历数据，生成 src/initialData.ts
 *
 * Excel Sheet 结构：
 *   1. personalInfo  — 键值对（key | value 两列）
 *   2. skills        — 每行一条技能
 *   3. experience    — 每行一条经历，description/techStack 用分号分隔
 *   4. projects      — 每行一个项目，techStack/actions/outcomes/highlights 用分号分隔
 *   5. education     — 每条教育/证书，highlights 用分号分隔
 *   6. githubConfig  — 键值对，languages 单独处理（name:percentage:color 用分号分隔）
 */

import XLSX from "xlsx";
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const XLSX_PATH = resolve(ROOT, "resume-data.xlsx");
const OUT_PATH = resolve(ROOT, "src", "initialData.ts");

// ─── 工具函数 ───
function splitSemicolon(val) {
  if (!val) return [];
  return String(val)
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
}

function sheetToRows(wb, name) {
  const ws = wb.Sheets[name];
  if (!ws) {
    console.warn(`⚠️  Sheet "${name}" 不存在，跳过`);
    return [];
  }
  return XLSX.utils.sheet_to_json(ws, { defval: "" });
}

// ─── 读取 Excel ───
console.log(`📖 读取 Excel: ${XLSX_PATH}`);
const wb = XLSX.readFile(XLSX_PATH);

// 1. personalInfo
const piRows = sheetToRows(wb, "personalInfo");
const personalInfo = {};
for (const row of piRows) {
  const key = String(row.key ?? row.Key ?? "").trim();
  const val = String(row.value ?? row.Value ?? "").trim();
  if (key) personalInfo[key] = val;
}

// 2. skills
const skillRows = sheetToRows(wb, "skills");
const skills = skillRows.map((r, i) => ({
  name: String(r.name ?? r.Name ?? `技能${i + 1}`),
  level: Number(r.level ?? r.Level ?? 80),
  category: String(r.category ?? r.Category ?? "Tools & Others"),
  yearsOfExp: Number(r.yearsOfExp ?? r.YearsOfExp ?? r.years ?? 1),
}));

// 3. experience
const expRows = sheetToRows(wb, "experience");
const experience = expRows.map((r, i) => ({
  id: String(r.id ?? `exp_${i + 1}`),
  company: String(r.company ?? r.Company ?? ""),
  role: String(r.role ?? r.Role ?? ""),
  startDate: String(r.startDate ?? r.StartDate ?? ""),
  endDate: String(r.endDate ?? r.EndDate ?? "至今"),
  location: String(r.location ?? r.Location ?? ""),
  description: splitSemicolon(r.description ?? r.Description ?? ""),
  techStack: splitSemicolon(r.techStack ?? r.TechStack ?? ""),
  ...(r.website || r.Website ? { website: String(r.website ?? r.Website) } : {}),
}));

// 4. projects
const projRows = sheetToRows(wb, "projects");
const projects = projRows.map((r, i) => ({
  id: String(r.id ?? `proj_${i + 1}`),
  title: String(r.title ?? r.Title ?? ""),
  description: String(r.description ?? r.Description ?? ""),
  category: String(r.category ?? r.Category ?? ""),
  techStack: splitSemicolon(r.techStack ?? r.TechStack ?? ""),
  featured: String(r.featured ?? r.Featured ?? "false").toLowerCase() === "true",
  highlights: splitSemicolon(r.highlights ?? r.Highlights ?? ""),
  ...(r.background ?? r.Background ? { background: String(r.background ?? r.Background) } : {}),
  ...(r.objective ?? r.Objective ? { objective: String(r.objective ?? r.Objective) } : {}),
  ...(r.actions ?? r.Actions ? { actions: splitSemicolon(r.actions ?? r.Actions) } : {}),
  ...(r.outcomes ?? r.Outcomes ? { outcomes: splitSemicolon(r.outcomes ?? r.Outcomes) } : {}),
  ...(r.role ?? r.Role ? { role: String(r.role ?? r.Role) } : {}),
  ...(r.timeline ?? r.Timeline ? { timeline: String(r.timeline ?? r.Timeline) } : {}),
  ...(r.githubRepo ?? r.GithubRepo ? { githubRepo: String(r.githubRepo ?? r.GithubRepo) } : {}),
  ...(r.demoUrl ?? r.DemoUrl ? { demoUrl: String(r.demoUrl ?? r.DemoUrl) } : {}),
}));

// 5. education
const eduRows = sheetToRows(wb, "education");
const education = eduRows.map((r, i) => ({
  id: String(r.id ?? `edu_${i + 1}`),
  institution: String(r.institution ?? r.Institution ?? ""),
  degree: String(r.degree ?? r.Degree ?? ""),
  major: String(r.major ?? r.Major ?? ""),
  startDate: String(r.startDate ?? r.StartDate ?? ""),
  endDate: String(r.endDate ?? r.EndDate ?? ""),
  category: String(r.category ?? r.Category ?? "学历教育"),
  certName: String(r.certName ?? r.CertName ?? ""),
  certOrg: String(r.certOrg ?? r.CertOrg ?? ""),
  certDate: String(r.certDate ?? r.CertDate ?? ""),
  highlights: splitSemicolon(r.highlights ?? r.Highlights ?? ""),
}));

// 6. githubConfig
const ghRows = sheetToRows(wb, "githubConfig");
const githubConfig = { username: "", useLiveApi: false, repoCountOverride: 12, commitCountOverride: 184, starredCountOverride: 45, languages: [] };
for (const row of ghRows) {
  const key = String(row.key ?? row.Key ?? "").trim();
  const val = String(row.value ?? row.Value ?? "").trim();
  if (!key) continue;
  if (key === "languages") {
    githubConfig.languages = splitSemicolon(val).map((entry) => {
      const [name, pct, color] = entry.split(":");
      return { name: name ?? "", percentage: Number(pct) || 0, color: color ?? "#3b82f6" };
    });
  } else if (key === "useLiveApi") {
    githubConfig.useLiveApi = val === "true";
  } else if (["repoCountOverride", "commitCountOverride", "starredCountOverride"].includes(key)) {
    githubConfig[key] = Number(val) || 0;
  } else if (key === "username") {
    githubConfig.username = val;
  }
}

// ─── 生成 TypeScript ───
const data = { version: "1.0.0", personalInfo, skills, experience, projects, education, githubConfig };

const ts = `import { ResumeData } from "./types";

export const initialResumeData: ResumeData = ${JSON.stringify(data, null, 2)} as ResumeData;
`;

writeFileSync(OUT_PATH, ts, "utf-8");
console.log(`✅ 已生成: ${OUT_PATH}`);
console.log(`   skills: ${skills.length} 条 | experience: ${experience.length} 条 | projects: ${projects.length} 条 | education: ${education.length} 条`);
