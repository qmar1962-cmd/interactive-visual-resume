export interface PersonalInfo {
  name: string;
  title: string;
  avatarUrl: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  github: string;
  linkedin: string;
  bio: string;
  summary: string;
}

export interface Skill {
  name: string;
  level: number; // 0-100
  category: "薪酬福利规划" | "HRBP业务协同" | "组织效能与绩效激活" | "人力数字化与用工合规";
  yearsOfExp: number;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string; // "Present" or "YYYY-MM"
  location: string;
  description: string[];
  techStack: string[];
  website?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  techStack: string[];
  githubRepo?: string; // used for live fetching
  demoUrl?: string;
  featured: boolean;
  highlights: string[];
  // 展开详情字段
  background?: string;       // 项目背景
  objective?: string;        // 项目目标
  actions?: string[];        // 关键行动（多条）
  outcomes?: string[];       // 量化成果（多条）
  role?: string;             // 项目角色
  timeline?: string;         // 项目周期
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  major: string;
  startDate: string;
  endDate: string;
  category: "学历教育" | "职业资格" | "培训认证";
  certName?: string;        // 证书名称（职业资格/培训认证时使用）
  certOrg?: string;         // 颁发机构
  certDate?: string;        // 获证时间
  highlights?: string[];
}

export interface GitHubConfig {
  username: string;
  useLiveApi: boolean;
  repoCountOverride: number;
  commitCountOverride: number;
  starredCountOverride: number;
  languages: { name: string; percentage: number; color: string }[];
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
}

export interface ResumeData {
  version: string;
  _version?: string;
  personalInfo: PersonalInfo;
  skills: Skill[];
  experience: Experience[];
  projects: Project[];
  education: Education[];
  githubConfig: GitHubConfig;
}
