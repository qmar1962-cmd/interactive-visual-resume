/**
 * create-template.mjs — 生成专业简历模板 resume-data.xlsx
 * 中文化列名 + 填写说明 + 格式美化 + 示例数据
 */

import XLSX from "xlsx";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const OUT_PATH = resolve(ROOT, "resume-data.xlsx");

// ─── 颜色常量 ───
const HEADER_BG = "2F5496";   // 深蓝表头
const HINT_BG   = "FFF2CC";   // 浅黄说明行
const SECTION_BG = "D6E4F0";  // 浅蓝分区行

// ─── 工具函数 ───
function makeHeaderRow(cols) {
  // 返回一个纯对象行，key=列名 value=空
  const row = {};
  cols.forEach(c => row[c.key] = c.label);
  return row;
}

function makeHintRow(cols, hintText) {
  const row = {};
  cols.forEach(c => row[c.key] = c.hint || "");
  // 把第一列设为提示标识
  if (cols.length > 0) row[cols[0].key] = "📝 " + hintText;
  return row;
}

function setColWidths(ws, cols) {
  ws["!cols"] = cols.map(c => ({ wch: c.width || 20 }));
}

function styleHeader(ws, colCount, rowIdx) {
  // 给表头行加背景色（XLSX 社区版有限，尽力做）
  for (let c = 0; c < colCount; c++) {
    const addr = XLSX.utils.encode_cell({ r: rowIdx, c });
    if (!ws[addr]) ws[addr] = { t: "s", v: "" };
    ws[addr].s = {
      font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12 },
      fill: { fgColor: { rgb: HEADER_BG } },
      alignment: { horizontal: "center", vertical: "center", wrapText: true },
    };
  }
}

// ─── 数据定义 ───
const wb = XLSX.utils.book_new();

// =============================================
// Sheet 0: 📋 使用说明
// =============================================
const guideCols = [
  { key: "section", label: "模块", width: 15 },
  { key: "desc", label: "说明", width: 40 },
  { key: "tip", label: "填写提示", width: 55 },
];
const guideData = [
  { section: "📌 整体规则", desc: "修改 Excel 后保存，执行 git 推送即可自动部署", tip: "多条内容用英文分号 ; 分隔（不要用中文分号）" },
  { section: "", desc: "", tip: "" },
  { section: "👤 个人信息", desc: "personalInfo 表", tip: "直接修改 value 列即可，key 列不要动" },
  { section: "🎯 技能列表", desc: "skills 表", tip: "每行一条技能；level 填 0-100 的数字；category 必须是以下之一：Frontend / Backend / DevOps & Cloud / Tools & Others" },
  { section: "🏢 工作经历", desc: "experience 表", tip: "每行一段经历；日期格式 YYYY-MM；多条工作描述/技术栈用 ; 分隔" },
  { section: "📊 项目经历", desc: "projects 表", tip: "每行一个项目；featured 填 true/false；actions/outcomes/highlights 等多条用 ; 分隔" },
  { section: "🎓 教育背景", desc: "education 表", tip: "每行一条；category 填：学历教育 / 职业资格 / 培训认证" },
  { section: "⚙️ GitHub配置", desc: "githubConfig 表", tip: "key-value 格式；languages 特殊格式：名称:百分比:颜色代码; 用 ; 分隔多条" },
  { section: "", desc: "", tip: "" },
  { section: "🚀 部署命令", desc: "在项目目录执行以下 3 条命令", tip: "" },
  { section: "", desc: "git add -A", tip: "添加所有修改" },
  { section: "", desc: 'git commit -m "更新简历"', tip: "提交" },
  { section: "", desc: "git -c http.sslBackend=openssl push origin master", tip: "推送到 GitHub（约1分钟后自动部署生效）" },
  { section: "", desc: "", tip: "" },
  { section: "🌐 访问地址", desc: "https://qmar1962-cmd.github.io/interactive-visual-resume/", tip: "" },
];
const guideWs = XLSX.utils.json_to_sheet(guideData);
setColWidths(guideWs, guideCols);
XLSX.utils.book_append_sheet(wb, guideWs, "📋使用说明");

// =============================================
// Sheet 1: 👤 个人信息
// =============================================
const piCols = [
  { key: "key",   label: "字段名（勿改）", width: 18, hint: "← 这一列不要修改！" },
  { key: "value", label: "内容（请修改这里）", width: 80, hint: "← 在这里填写你的信息" },
];
const piData = [
  { key: "📝 填写说明", value: "只修改右侧「内容」列，左侧「字段名」列不要动" },
  { key: "name",     value: "陈晓敏" },
  { key: "title",    value: "HRBP / 薪酬绩效资深专家" },
  { key: "avatarUrl", value: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200" },
  { key: "email",    value: "xiaomin.chen_hr@example.com" },
  { key: "phone",    value: "138-1234-5678" },
  { key: "location", value: "中国 · 深圳" },
  { key: "website",  value: "https://xiaomin-hrbp.github.io" },
  { key: "github",   value: "xiaomin-hrbp" },
  { key: "linkedin", value: "xiaomin-chen-hr" },
  { key: "bio",      value: "拥有 10 年+ 知名高成长科技企业及跨国集团深厚人力资源管理经验。专注于薪酬福利体系设计 (C&B)、全面绩效激励闭环管理（OKR/KPI/三阶评估）以及业务合作伙伴 (HRBP) 战略落地。擅长将企业经营指标与人效分析指标深度绑定，通过精益调薪策略、宽带薪酬、多元激励以及人效诊断为业务部门打造高产出战队。" },
  { key: "summary",  value: "高级人力资源管理师、资深 HRBP 专家。熟谙宽带薪酬、美世/海氏等标杆岗位技能要素评估体系，主导过多次覆盖千人规模的调薪与期权激励方案统筹；深挖业务核心痛点并进行组织重构设计与核心骨干盘点，具备极强的人效数据分析（People Analytics）与信息化 HR 治理工具落地应用能力。" },
];
const piWs = XLSX.utils.json_to_sheet(piData);
setColWidths(piWs, piCols);
XLSX.utils.book_append_sheet(wb, piWs, "👤个人信息");

// =============================================
// Sheet 2: 🎯 技能列表
// =============================================
const skCols = [
  { key: "name",       label: "技能名称", width: 40 },
  { key: "level",      label: "熟练度(0-100)", width: 16 },
  { key: "category",   label: "分类", width: 20 },
  { key: "yearsOfExp", label: "经验年限", width: 12 },
];
const skData = [
  { name: "📝 分类说明: Frontend=薪酬福利规划(C&B) | Backend=HRBP业务协同 | DevOps & Cloud=组织效能与绩效激活 | Tools & Others=人力数字化与用工合规", level: "", category: "", yearsOfExp: "" },
  { name: "宽带薪酬与定岗定级体系设计", level: 96, category: "Frontend", yearsOfExp: 10 },
  { name: "全面绩效闭环与动态激励机制 (OKR/KPI)", level: 95, category: "Frontend", yearsOfExp: 9 },
  { name: "人工成本预算分析与总数控制 (C&B Control)", level: 92, category: "Frontend", yearsOfExp: 8 },
  { name: "HRBP 业务诊断与组织痛点攻坚", level: 94, category: "Backend", yearsOfExp: 8 },
  { name: "组织架构重建与核心岗位对标设计", level: 90, category: "Backend", yearsOfExp: 10 },
  { name: "核心干部后备梯队盘点 (Succession Planning)", level: 88, category: "Backend", yearsOfExp: 7 },
  { name: "组织效能盘点与综合人效分析 (ROI & L&D)", level: 93, category: "DevOps & Cloud", yearsOfExp: 9 },
  { name: "360度环评胜任力建模与反馈机制", level: 88, category: "DevOps & Cloud", yearsOfExp: 6 },
  { name: "核心骨干定制激励与个人发展计划 (IDP)", level: 91, category: "DevOps & Cloud", yearsOfExp: 8 },
  { name: "高级数据管理与决策透析 (Excel/PowerBI/SQL)", level: 95, category: "Tools & Others", yearsOfExp: 10 },
  { name: "一体化数智 HRM 与飞书 OKR 系统集成", level: 92, category: "Tools & Others", yearsOfExp: 5 },
  { name: "劳动纠纷防范与用工风险实务管理", level: 86, category: "Tools & Others", yearsOfExp: 10 },
];
const skWs = XLSX.utils.json_to_sheet(skData);
setColWidths(skWs, skCols);
XLSX.utils.book_append_sheet(wb, skWs, "🎯技能列表");

// =============================================
// Sheet 3: 🏢 工作经历
// =============================================
const expCols = [
  { key: "id",          label: "编号", width: 10 },
  { key: "company",     label: "公司名称", width: 28 },
  { key: "role",        label: "职位", width: 30 },
  { key: "startDate",   label: "开始时间", width: 14 },
  { key: "endDate",     label: "结束时间", width: 14 },
  { key: "location",    label: "城市", width: 10 },
  { key: "description", label: "工作描述（多条用 ; 分隔）", width: 80 },
  { key: "techStack",   label: "技能标签（多条用 ; 分隔）", width: 50 },
];
const expData = [
  { id: "📝 提示", company: "日期格式: YYYY-MM（如 2022-04）", role: "至今填: 至今", startDate: "", endDate: "", location: "", description: "多条工作描述用英文分号 ; 隔开", techStack: "多条技能标签用英文分号 ; 隔开" },
  { id: "exp_1", company: "领航创想智能科技有限公司", role: "资深 HRBP 专家 / 薪酬绩效部负责人", startDate: "2022-04", endDate: "至今", location: "深圳",
    description: "深度服务于千人级产研、运营及全球业务群。主导重构并落定了2023-2025年最新集团宽带薪酬标准和定岗定级总盘子，方案升级后，研发核心高价值人才流失率同比大幅缩减 35%。;打通'战略-绩效-激励'闭环，推行'OKR + 敏捷KPI双轨考核制'。协同产品线总裁重整核心业务提成与奖金分配政策，直接促成组织人效提升 18%，单兵销售业绩复合增长 22%。;联合数据团队从零构建'集团人效效能分析管理系统 (People Analytics Console)'，深度集成飞书与配薪核算引擎，实时打通人工成本支出额、编制冗余度、及绩效饱和度，为集团管委会决策提供精确数据依据。",
    techStack: "全面薪酬宽带管理 (C&B);组织架构重组;OKR/KPI 双轨考核制;人效看板 (BI);飞书HRM;中高管绩效辅导" },
  { id: "exp_2", company: "极光数字空间科技有限公司", role: "HRBP 经理 (产研事业部负责人)", startDate: "2018-09", endDate: "2022-03", location: "深圳",
    description: "全面负责技术中心（450人+）的组织发展、人才梯队与激励配置工作。主导中高层核心中坚力量两轮大盘点，并对核心核心架构师及骨干实施'一人一策'动态股权保留政策，使核心技术专家留任率提升至 95%。;深入业务核心开展敏捷改组，剥离重叠的多维繁冗层级，重组为 8 个高内聚自闭环业务战队，大幅提升内部业务流转与人效提速 15%。;推行月度人效专项复盘、新晋技术经理管理辅导；协同集团年度薪酬回顾，解决历史不匹配倒挂等痛点，年度调薪满意度评分达 4.8 / 5.0。",
    techStack: "HRBP 实践;胜任力模型评估;晋升评审机制;晋升调薪测算模型;组织诊断与人效分析" },
  { id: "exp_3", company: "中科智能制造控股集团", role: "人力资源主管 -> 薪酬福利高级专员", startDate: "2015-07", endDate: "2018-08", location: "上海",
    description: "统管 2000+ 关系复杂中大型组织员工算薪、多层级社保公积金及个税代扣代缴事宜，流程精密核算，创下连续 12 季度 100% 算薪'零差错'。;深度协助美世（Mercer）岗位对标盘点咨询项目，作为项目主力撰写与对标 150 余个核心中高层及技术研发关键岗位说明书；协同定制《集团薪酬福利精益发放白皮书》，极大降低不规避福利成本支出。",
    techStack: "海氏/美世岗位对标;精密个税社保算薪实务;用工风险管理;组织绩效模型;高级 Excel 分析建模" },
];
const expWs = XLSX.utils.json_to_sheet(expData);
setColWidths(expWs, expCols);
// 设置行高让描述行可以换行显示
expWs["!rows"] = [{ hpt: 30 }, { hpt: 90 }, { hpt: 90 }, { hpt: 60 }];
XLSX.utils.book_append_sheet(wb, expWs, "🏢工作经历");

// =============================================
// Sheet 4: 📊 项目经历
// =============================================
const projCols = [
  { key: "id",          label: "编号", width: 10 },
  { key: "title",       label: "项目名称", width: 35 },
  { key: "category",    label: "项目类别", width: 18 },
  { key: "featured",    label: "重点展示", width: 10 },
  { key: "role",        label: "项目角色", width: 14 },
  { key: "timeline",    label: "项目周期", width: 14 },
  { key: "description", label: "项目简介", width: 50 },
  { key: "background",  label: "项目背景", width: 45 },
  { key: "objective",   label: "项目目标", width: 45 },
  { key: "actions",     label: "关键行动（多条用 ; 分隔）", width: 55 },
  { key: "outcomes",    label: "量化成果（多条用 ; 分隔）", width: 55 },
  { key: "highlights",  label: "亮点摘要（多条用 ; 分隔）", width: 55 },
  { key: "techStack",   label: "技术/方法论（多条用 ; 分隔）", width: 40 },
];
const projData = [
  { id: "📝 提示", title: "featured 填 true 或 false", category: "", featured: "", role: "", timeline: "", description: "多条内容用英文分号 ; 隔开", background: "", objective: "", actions: "", outcomes: "", highlights: "", techStack: "" },
  { id: "proj_1", title: "最新年度全集团宽带薪酬重构及动态绩效挂钩计划", category: "薪酬福利核心工程", featured: "true", role: "项目负责人", timeline: "2023-2024",
    description: "针对原有薪金重合严重、职级虚高、起步倒挂等历史痛点，主导落地的涵盖千人规模的宽带薪酬重新评估定档和调薪算法项目。",
    background: "原有薪酬体系存在薪金重合严重、职级虚高、起步倒挂等历史痛点，导致核心人才流失率高、调薪满意度低，亟需系统性重构。",
    objective: "在把控总人本支出增幅低于5%的前提下，激活绩优主力团队，同时消除历史倒挂问题。",
    actions: "搭建深度仿真数学测算，推演12种不同调薪分配曲线，量化分析每种方案的成本影响与激励效果。;引入美世（Mercer）岗位要素评估体系，对全集团核心岗位重新定档定级。;设计晋升定级和薪资起锚点的自动锁定矩阵，实现调薪流程标准化与自动化。",
    outcomes: "在把控总人本支出增幅低于5%的同时，高质激活了前40%的绩优主力团队。;将历史倒挂严重性由25%压缩至2.5%以内。;研发核心高价值人才流失率同比大幅缩减35%。",
    highlights: "搭建深度仿真数学测算，推演 12 种不同调薪分配曲线，最终实现在把控总人本支出增幅低于 5% 的同时，高质激活了前 40% 的绩优主力团队。;重置新晋升定级和薪资起锚点的自动锁定矩阵，将历史倒挂严重性由 25% 压缩至 2.5% 以内。",
    techStack: "宽带薪酬;调薪矩阵算法;美世定档模型;Excel 仿真财务模型" },
  { id: "proj_2", title: 'HR 人效数据飞轮与"一站式人效监控 BI 决策平台"', category: "人力资源数字化", featured: "true", role: "项目负责人", timeline: "2023-2024",
    description: "自研一套与飞书多维表格与 PowerBI 打通的组织效能监控系统，用于全息透视实时人员编制、主动流失、业绩 ROI、单兵创出以及绩效偏离系数。",
    background: "传统人力数据统计依赖手工跨源取数，效率低下且时效性差，管理层无法实时获取人效数据支撑决策。",
    objective: "将人效数据从手工两周合并一次升级为日级自动抓取，构建实时组织效能监控与预警体系。",
    actions: "打通飞书多维表格与PowerBI数据流，建立自动化数据采集与清洗管道。;设计组织效能指标库，涵盖人员编制、主动流失率、业绩ROI、单兵产出、绩效偏离系数等核心维度。;融入组织规模预膨胀系数、核心异动预警、绩优被动流失危机指标等智能预警模型。",
    outcomes: "将传统手工跨源取数及算账时间从两周合并一次缩短至日级自动抓取更新，人力统计生产力提升95%。;帮助管理层提早识别并化解多起用工重叠危机，避免潜在成本损失。;实时数据看板覆盖全集团，管委会决策响应速度提升3倍。",
    highlights: "将传统手工跨源取数及算账的时间从原本每两周合并一次缩短至日级自动抓取更新，提高人力资源统计生产力达 95%。;融入组织规模预膨胀系数、核心异动预警、绩优被动流失危机指标，帮助管理层提早识别并化解了多起用工重叠危机。",
    techStack: "PowerBI;People Analytics;数据清洗;指标库治理;飞书 API" },
  { id: "proj_3", title: '产研核心主管 360 度能力盘点与"主管成长加速营"', category: "组织能力盘点及发展", featured: "false", role: "项目负责人", timeline: "2022-2023",
    description: "针对产研事业部中层管理者管理成熟度参差不齐的问题，引入针对性的 360 度胜任力矩阵全方位诊断，并配套设计出 IDP (个人成长计划) 落地赋能方案。",
    background: "产研事业部中层管理者管理成熟度参差不齐，基层工程师与管理者沟通割裂，内部继任准备度不足。",
    objective: "通过360度胜任力诊断精准定位管理短板，配套IDP个人成长计划与加速营，提升内部继任准备度。",
    actions: "引入360度胜任力矩阵，对80+中高级经理进行全方位能力诊断与盘点。;基于诊断结果，为核心高潜人才设计'一人一策'IDP个人发展计划。;配套两场'管理者角色转身理论与研讨'，聚焦沟通力与团队领导力提升。",
    outcomes: "高标准全票落地80+中高级经理能力诊断，构建核心高潜力人才蓄水池。;组织'内部继任准备度'实质性提升40%。;基层工程师与管理者沟通满意度显著改善。",
    highlights: "高标准全票落地 80+ 中高级经理能力诊断，构建集团核心高潜力人才蓄水池，使组织'内部继任准备度'实质提升 40%。;配套两场'管理者角色转身理论与研讨'，切实改善了产研线基层工程师与管理者之间原本割裂的沟通习惯。",
    techStack: "360度评估机制;胜任力九宫格;IDP 提升路线;管理者角色转身辅导" },
];
const projWs = XLSX.utils.json_to_sheet(projData);
setColWidths(projWs, projCols);
projWs["!rows"] = [{ hpt: 30 }, { hpt: 60 }, { hpt: 60 }, { hpt: 60 }];
XLSX.utils.book_append_sheet(wb, projWs, "📊项目经历");

// =============================================
// Sheet 5: 🎓 教育背景
// =============================================
const eduCols = [
  { key: "id",          label: "编号", width: 10 },
  { key: "category",    label: "类别", width: 14 },
  { key: "institution", label: "学校/机构", width: 22 },
  { key: "degree",      label: "学历", width: 10 },
  { key: "major",       label: "专业", width: 16 },
  { key: "startDate",   label: "开始时间", width: 14 },
  { key: "endDate",     label: "结束时间", width: 14 },
  { key: "certName",    label: "证书名称", width: 18 },
  { key: "certOrg",     label: "颁发机构", width: 16 },
  { key: "certDate",    label: "获证时间", width: 14 },
  { key: "highlights",  label: "亮点（多条用 ; 分隔）", width: 55 },
];
const eduData = [
  { id: "📝 提示", category: "填: 学历教育/职业资格/培训认证", institution: "", degree: "", major: "", startDate: "格式: YYYY-MM", endDate: "", certName: "职业资格/培训认证时填写", certOrg: "", certDate: "", highlights: "" },
  { id: "edu_1", category: "学历教育", institution: "中南财经政法大学", degree: "本科", major: "人力资源管理", startDate: "2011-09", endDate: "2015-06", certName: "", certOrg: "", certDate: "",
    highlights: "主修组织行为学、薪酬福利设计、绩效考评与实务、劳动法与合同合规规划。;曾荣获国家级励志奖学金、校级优秀毕业生。毕设《互联网科技企业动态期权及虚拟股绩效绑定设计》被评为校级一等论文。" },
];
const eduWs = XLSX.utils.json_to_sheet(eduData);
setColWidths(eduWs, eduCols);
XLSX.utils.book_append_sheet(wb, eduWs, "🎓教育背景");

// =============================================
// Sheet 6: ⚙️ GitHub配置
// =============================================
const ghCols = [
  { key: "key",   label: "配置项（勿改）", width: 25 },
  { key: "value", label: "值（请修改这里）", width: 80 },
];
const ghData = [
  { key: "📝 填写说明", value: "只修改右侧「值」列，左侧「配置项」列不要动" },
  { key: "username", value: "xiaomin-hrbp" },
  { key: "useLiveApi", value: "false" },
  { key: "repoCountOverride", value: "12" },
  { key: "commitCountOverride", value: "184" },
  { key: "starredCountOverride", value: "45" },
  { key: "languages", value: "薪酬福利设计与规划 (C&B):38.5:#10b981;全面绩效激励机制对齐 (KPI/OKR):28.2:#3b82f6;HRBP 业务诊断与组织发展 (OD):18.3:#f59e0b;人效效能分析系统 (BI & Analytics):10.0:#8b5cf6;劳动合同合规与用工风险预防:5.0:#ef4444" },
];
const ghWs = XLSX.utils.json_to_sheet(ghData);
setColWidths(ghWs, ghCols);
XLSX.utils.book_append_sheet(wb, ghWs, "⚙GitHub配置");

// ─── 写入文件 ───
XLSX.writeFile(wb, OUT_PATH);
console.log(`✅ 简历模板已生成: ${OUT_PATH}`);
console.log("   7 个 Sheet: 📋使用说明 / 👤个人信息 / 🎯技能列表 / 🏢工作经历 / 📊项目经历 / 🎓教育背景 / ⚙GitHub配置");
