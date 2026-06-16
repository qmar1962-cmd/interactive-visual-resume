/**
 * sync-data.mjs — 从 Excel (resume-data.xlsx) 读取简历数据，生成 src/initialData.ts
 * 支持中文列名，自动跳过提示行（以 📝 开头的行）
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

// ─── 中文列名 → 英文字段名映射 ───
const COL_MAP = {
  // 个人信息
  "字段名（勿改）": "key",
  "内容（请修改这里）": "value",
  // 技能列表
  "技能名称": "name",
  "熟练度(0-100)": "level",
  "分类": "category",
  "经验年限": "yearsOfExp",
  // 工作经历
  "编号": "id",
  "公司名称": "company",
  "职位": "role",
  "开始时间": "startDate",
  "结束时间": "endDate",
  "城市": "location",
  "工作描述（多条用 ; 分隔）": "description",
  "技能标签（多条用 ; 分隔）": "techStack",
  // 项目经历
  "项目名称": "title",
  "项目类别": "category_proj",
  "是否重点": "featured",
  "项目角色": "role_proj",
  "项目周期": "timeline",
  "项目简介": "description_proj",
  "项目背景": "background",
  "项目目标": "objective",
  "关键行动（多条用 ; 分隔）": "actions",
  "量化成果（多条用 ; 分隔）": "outcomes",
  "亮点摘要（多条用 ; 分隔）": "highlights",
  "技术/方法论（多条用 ; 分隔）": "techStack_proj",
  // 教育背景
  "学校/机构": "institution",
  "学历": "degree",
  "专业": "major",
  "类别": "category_edu",
  "证书名称": "certName",
  "颁发机构": "certOrg",
  "获证时间": "certDate",
  "亮点（多条用 ; 分隔）": "highlights_edu",
  // GitHub配置
  "配置项（勿改）": "key",
  "值（请修改这里）": "value",
};

// 技能分类中文 → 英文映射
const SKILL_CATEGORY_MAP = {
  "薪酬福利规划": "Frontend",
  "HRBP业务协同": "Backend",
  "组织效能与绩效激活": "DevOps & Cloud",
  "人力数字化与用工合规": "Tools & Others",
  // 兼容英文
  "Frontend": "Frontend",
  "Backend": "Backend",
  "DevOps & Cloud": "DevOps & Cloud",
  "Tools & Others": "Tools & Others",
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
  const firstVal = String(Object.values(row)[0] ?? "");
  return firstVal.startsWith("📝");
}

// 将中文列名的行转为英文 key 的对象
function translateRow(row) {
  const out = {};
  for (const [cnKey, val] of Object.entries(row)) {
    const enKey = COL_MAP[cnKey] ?? cnKey;
    out[enKey] = val;
  }
  return out;
}

function sheetToRows(wb, sheetName) {
  if (!wb.Sheets[sheetName]) {
    console.warn(`⚠️  Sheet "${sheetName}" 不存在，跳过`);
    return [];
  }
  const allRows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: "" });
  return allRows.filter(r => !isHintRow(r)).map(translateRow);
}

// ─── 读取 Excel ───
console.log(`📖 读取 Excel: ${XLSX_PATH}`);
const wb = XLSX.readFile(XLSX_PATH);

// 1. personalInfo
const piRows = sheetToRows(wb, "👤个人信息");
const personalInfo = {};
for (const row of piRows) {
  const key = String(row.key ?? "").trim();
  const val = String(row.value ?? "").trim();
  if (key) personalInfo[key] = val;
}

// 2. skills
const skillRows = sheetToRows(wb, "🎯技能列表");
const skills = skillRows.map((r, i) => {
  const cat = String(r.category ?? "");
  return {
    name: String(r.name ?? `技能${i + 1}`),
    level: Number(r.level ?? 80),
    category: SKILL_CATEGORY_MAP[cat] ?? (cat || "Tools & Others"),
    yearsOfExp: Number(r.yearsOfExp ?? 1),
  };
});

// 3. experience
const expRows = sheetToRows(wb, "🏢工作经历");
const experience = expRows.map((r, i) => ({
  id: String(r.id ?? `exp_${i + 1}`),
  company: String(r.company ?? ""),
  role: String(r.role ?? ""),
  startDate: String(r.startDate ?? ""),
  endDate: String(r.endDate ?? "至今"),
  location: String(r.location ?? ""),
  description: splitSemicolon(r.description ?? ""),
  techStack: splitSemicolon(r.techStack ?? ""),
}));

// 4. projects
const projRows = sheetToRows(wb, "📊项目经历");
const projects = projRows.map((r, i) => {
  const p = {
    id: String(r.id ?? `proj_${i + 1}`),
    title: String(r.title ?? ""),
    description: String(r.description_proj ?? ""),
    category: String(r.category_proj ?? ""),
    techStack: splitSemicolon(r.techStack_proj ?? ""),
    featured: String(r.featured ?? "否").trim() === "是" || String(r.featured ?? "").toLowerCase() === "true",
    highlights: splitSemicolon(r.highlights ?? ""),
  };
  if (r.background) p.background = String(r.background);
  if (r.objective) p.objective = String(r.objective);
  if (r.actions) p.actions = splitSemicolon(r.actions);
  if (r.outcomes) p.outcomes = splitSemicolon(r.outcomes);
  if (r.role_proj) p.role = String(r.role_proj);
  if (r.timeline) p.timeline = String(r.timeline);
  return p;
});

// 5. education
const eduRows = sheetToRows(wb, "🎓教育背景");
const education = eduRows.map((r, i) => ({
  id: String(r.id ?? `edu_${i + 1}`),
  institution: String(r.institution ?? ""),
  degree: String(r.degree ?? ""),
  major: String(r.major ?? ""),
  startDate: String(r.startDate ?? ""),
  endDate: String(r.endDate ?? ""),
  category: String(r.category_edu ?? "学历教育"),
  certName: String(r.certName ?? ""),
  certOrg: String(r.certOrg ?? ""),
  certDate: String(r.certDate ?? ""),
  highlights: splitSemicolon(r.highlights_edu ?? ""),
}));

// 6. githubConfig
const ghRows = sheetToRows(wb, "⚙GitHub配置");
const githubConfig = { username: "", useLiveApi: false, repoCountOverride: 12, commitCountOverride: 184, starredCountOverride: 45, languages: [] };
for (const row of ghRows) {
  const key = String(row.key ?? "").trim();
  const val = String(row.value ?? "").trim();
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
const data = { version: "2.0.0", _version: new Date().toISOString().slice(0, 10) + "-v2", personalInfo, skills, experience, projects, education, githubConfig };

const ts = `// ⚠️ 此文件由 resume-data.xlsx 自动生成，请勿手动修改
// 修改数据请编辑 resume-data.xlsx，然后运行 npm run sync

import { ResumeData } from "./types";

export const initialResumeData: ResumeData = ${JSON.stringify(data, null, 2)} as ResumeData;
`;

writeFileSync(OUT_PATH, ts, "utf-8");
console.log(`✅ 已生成: ${OUT_PATH}`);
console.log(`   个人信息: ${Object.keys(personalInfo).length} 项 | 技能: ${skills.length} 条 | 经历: ${experience.length} 条 | 项目: ${projects.length} 条 | 教育: ${education.length} 条`);
