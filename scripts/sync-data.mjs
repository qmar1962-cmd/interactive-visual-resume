/**
 * sync-data.mjs — 从 Excel (resume-data.xlsx) 读取简历数据，生成 src/initialData.ts
 *
 * 支持中英文 Sheet 名，自动跳过提示行（以 📝 开头的行）
 * 多条内容用英文分号 ; 分隔
 */

import XLSX from "xlsx";
import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const XLSX_PATH = resolve(ROOT, "resume-data.xlsx");
const OUT_PATH = resolve(ROOT, "src", "initialData.ts");

// ─── Sheet 名映射（中文名 → 逻辑名） ───
const SHEET_MAP = {
  "👤个人信息": "personalInfo",
  "personalInfo": "personalInfo",
  "🎯技能列表": "skills",
  "skills": "skills",
  "🏢工作经历": "experience",
  "experience": "experience",
  "📊项目经历": "projects",
  "projects": "projects",
  "🎓教育背景": "education",
  "education": "education",
  "⚙GitHub配置": "githubConfig",
  "githubConfig": "githubConfig",
};

// ─── 工具函数 ───
function splitSemicolon(val) {
  if (!val) return [];
  return String(val)
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
}

function isHintRow(row) {
  // 跳过提示行：第一列值以 📝 开头
  const firstVal = String(Object.values(row)[0] ?? "");
  return firstVal.startsWith("📝");
}

function findSheet(wb, logicalName) {
  // 先按映射找中文名，再找英文名
  for (const [sheetName, logic] of Object.entries(SHEET_MAP)) {
    if (logic === logicalName && wb.Sheets[sheetName]) return sheetName;
  }
  return null;
}

function sheetToRows(wb, logicalName) {
  const sheetName = findSheet(wb, logicalName);
  if (!sheetName) {
    console.warn(`⚠️  Sheet "${logicalName}" 不存在，跳过`);
    return [];
  }
  const allRows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: "" });
  // 过滤掉提示行
  return allRows.filter(r => !isHintRow(r));
}

// ─── 读取 Excel ───
console.log(`📖 读取 Excel: ${XLSX_PATH}`);
const wb = XLSX.readFile(XLSX_PATH);

// 1. personalInfo
const piRows = sheetToRows(wb, "personalInfo");
const personalInfo = {};
for (const row of piRows) {
  const key = String(row.key ?? row.Key ?? row["字段名（勿改）"] ?? "").trim();
  const val = String(row.value ?? row.Value ?? row["内容（请修改这里）"] ?? "").trim();
  if (key && !key.startsWith("📝")) personalInfo[key] = val;
}

// 2. skills
const skillRows = sheetToRows(wb, "skills");
const skills = skillRows.map((r, i) => ({
  name: String(r.name ?? r.Name ?? r["技能名称"] ?? `技能${i + 1}`),
  level: Number(r.level ?? r.Level ?? r["熟练度(0-100)"] ?? 80),
  category: String(r.category ?? r.Category ?? r["分类"] ?? "Tools & Others"),
  yearsOfExp: Number(r.yearsOfExp ?? r.YearsOfExp ?? r["经验年限"] ?? 1),
}));

// 3. experience
const expRows = sheetToRows(wb, "experience");
const experience = expRows.map((r, i) => ({
  id: String(r.id ?? r.Id ?? r["编号"] ?? `exp_${i + 1}`),
  company: String(r.company ?? r.Company ?? r["公司名称"] ?? ""),
  role: String(r.role ?? r.Role ?? r["职位"] ?? ""),
  startDate: String(r.startDate ?? r.StartDate ?? r["开始时间"] ?? ""),
  endDate: String(r.endDate ?? r.EndDate ?? r["结束时间"] ?? "至今"),
  location: String(r.location ?? r.Location ?? r["城市"] ?? ""),
  description: splitSemicolon(r.description ?? r.Description ?? r["工作描述（多条用 ; 分隔）"] ?? ""),
  techStack: splitSemicolon(r.techStack ?? r.TechStack ?? r["技能标签（多条用 ; 分隔）"] ?? ""),
  ...(r.website || r.Website ? { website: String(r.website ?? r.Website) } : {}),
}));

// 4. projects
const projRows = sheetToRows(wb, "projects");
const projects = projRows.map((r, i) => ({
  id: String(r.id ?? r.Id ?? r["编号"] ?? `proj_${i + 1}`),
  title: String(r.title ?? r.Title ?? r["项目名称"] ?? ""),
  description: String(r.description ?? r.Description ?? r["项目简介"] ?? ""),
  category: String(r.category ?? r.Category ?? r["项目类别"] ?? ""),
  techStack: splitSemicolon(r.techStack ?? r.TechStack ?? r["技术/方法论（多条用 ; 分隔）"] ?? ""),
  featured: String(r.featured ?? r.Featured ?? r["重点展示"] ?? "false").toLowerCase() === "true",
  highlights: splitSemicolon(r.highlights ?? r.Highlights ?? r["亮点摘要（多条用 ; 分隔）"] ?? ""),
  ...(r.background ?? r.Background ?? r["项目背景"] ? { background: String(r.background ?? r.Background ?? r["项目背景"] ?? "") } : {}),
  ...(r.objective ?? r.Objective ?? r["项目目标"] ? { objective: String(r.objective ?? r.Objective ?? r["项目目标"] ?? "") } : {}),
  ...(r.actions ?? r.Actions ?? r["关键行动（多条用 ; 分隔）"] ? { actions: splitSemicolon(r.actions ?? r.Actions ?? r["关键行动（多条用 ; 分隔）"] ?? "") } : {}),
  ...(r.outcomes ?? r.Outcomes ?? r["量化成果（多条用 ; 分隔）"] ? { outcomes: splitSemicolon(r.outcomes ?? r.Outcomes ?? r["量化成果（多条用 ; 分隔）"] ?? "") } : {}),
  ...(r.role ?? r.Role ?? r["项目角色"] ? { role: String(r.role ?? r.Role ?? r["项目角色"] ?? "") } : {}),
  ...(r.timeline ?? r.Timeline ?? r["项目周期"] ? { timeline: String(r.timeline ?? r.Timeline ?? r["项目周期"] ?? "") } : {}),
  ...(r.githubRepo ?? r.GithubRepo ? { githubRepo: String(r.githubRepo ?? r.GithubRepo) } : {}),
  ...(r.demoUrl ?? r.DemoUrl ? { demoUrl: String(r.demoUrl ?? r.DemoUrl) } : {}),
}));

// 5. education
const eduRows = sheetToRows(wb, "education");
const education = eduRows.map((r, i) => ({
  id: String(r.id ?? r.Id ?? r["编号"] ?? `edu_${i + 1}`),
  institution: String(r.institution ?? r.Institution ?? r["学校/机构"] ?? ""),
  degree: String(r.degree ?? r.Degree ?? r["学历"] ?? ""),
  major: String(r.major ?? r.Major ?? r["专业"] ?? ""),
  startDate: String(r.startDate ?? r.StartDate ?? r["开始时间"] ?? ""),
  endDate: String(r.endDate ?? r.EndDate ?? r["结束时间"] ?? ""),
  category: String(r.category ?? r.Category ?? r["类别"] ?? "学历教育"),
  certName: String(r.certName ?? r.CertName ?? r["证书名称"] ?? ""),
  certOrg: String(r.certOrg ?? r.CertOrg ?? r["颁发机构"] ?? ""),
  certDate: String(r.certDate ?? r.CertDate ?? r["获证时间"] ?? ""),
  highlights: splitSemicolon(r.highlights ?? r.Highlights ?? r["亮点（多条用 ; 分隔）"] ?? ""),
}));

// 6. githubConfig
const ghRows = sheetToRows(wb, "githubConfig");
const githubConfig = { username: "", useLiveApi: false, repoCountOverride: 12, commitCountOverride: 184, starredCountOverride: 45, languages: [] };
for (const row of ghRows) {
  const key = String(row.key ?? row.Key ?? row["配置项（勿改）"] ?? "").trim();
  const val = String(row.value ?? row.Value ?? row["值（请修改这里）"] ?? "").trim();
  if (!key || key.startsWith("📝")) continue;
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

// ─── 清理空字段 ───
function cleanEmpty(obj) {
  const cleaned = { ...obj };
  // 移除 projects 中空的可选字段
  if (cleaned.background === "") delete cleaned.background;
  if (cleaned.objective === "") delete cleaned.objective;
  if (cleaned.actions?.length === 0) delete cleaned.actions;
  if (cleaned.outcomes?.length === 0) delete cleaned.outcomes;
  if (cleaned.role === "") delete cleaned.role;
  if (cleaned.timeline === "") delete cleaned.timeline;
  return cleaned;
}

const cleanedProjects = projects.map(p => {
  const c = { ...p };
  if (!c.background) delete c.background;
  if (!c.objective) delete c.objective;
  if (!c.actions || c.actions.length === 0) delete c.actions;
  if (!c.outcomes || c.outcomes.length === 0) delete c.outcomes;
  if (!c.role) delete c.role;
  if (!c.timeline) delete c.timeline;
  if (!c.githubRepo) delete c.githubRepo;
  if (!c.demoUrl) delete c.demoUrl;
  return c;
});

// ─── 生成 TypeScript ───
const data = { version: "1.0.0", personalInfo, skills, experience, projects: cleanedProjects, education, githubConfig };

const ts = `// ⚠️ 此文件由 resume-data.xlsx 自动生成，请勿手动修改
// 修改数据请编辑 resume-data.xlsx，然后运行 npm run sync

import { ResumeData } from "./types";

export const initialResumeData: ResumeData = ${JSON.stringify(data, null, 2)} as ResumeData;
`;

writeFileSync(OUT_PATH, ts, "utf-8");
console.log(`✅ 已生成: ${OUT_PATH}`);
console.log(`   个人信息: ${Object.keys(personalInfo).length} 项 | 技能: ${skills.length} 条 | 经历: ${experience.length} 条 | 项目: ${projects.length} 条 | 教育: ${education.length} 条`);
