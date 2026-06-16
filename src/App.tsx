import React, { useState, useEffect, useMemo } from "react";
import {
  LayoutDashboard,
  Brain,
  Briefcase,
  Award,
  GraduationCap,
  Mail,
  Printer,
  Moon,
  Sun,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Activity,
  ChevronRight,
  ChevronDown,
  Calendar,
  MapPin,
  User,
  Phone,
  Search,
  Menu,
  X,
  FileText,
  BadgeCheck,
  TrendingUp,
  Flame,
  Users,
  Target,
  Crosshair,
  Zap,
  Star,
  Wrench
} from "lucide-react";
import { initialResumeData } from "./initialData";
import { ResumeData, Skill, Experience, Project, Education, ContactMessage } from "./types";

const categoryDisplayMap: Record<string, string> = {
  "All": "全部",
  "薪酬福利规划": "薪酬福利规划",
  "HRBP业务协同": "HRBP业务协同",
  "组织效能与绩效激活": "组织效能与绩效激活",
  "人力数字化与用工合规": "人力数字化与用工合规"
};

export default function App() {
  // 1. Storage & Persistence
  const [resumeData, setResumeData] = useState<ResumeData>(() => {
    try {
      const saved = localStorage.getItem("interactive_resume_data");
      if (saved) {
        const parsed = JSON.parse(saved);
        // 版本检查：localStorage 数据版本落后时丢弃缓存，使用最新初始数据
        if (parsed?._version !== initialResumeData._version) {
          console.log(`数据版本已更新 (${parsed?._version || '无'} → ${initialResumeData._version})，使用最新数据`);
          return initialResumeData;
        }
        // Validate parsed data has expected structure
        if (parsed?.personalInfo && parsed?.education) {
          return parsed;
        }
        // If structure is invalid, fall back to defaults
        console.warn("Stored data structure invalid, falling back to defaults");
      }
    } catch (e) {
      console.error("Failed to parse local resume data, falling back to defaults", e);
    }
    return initialResumeData;
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    try {
      localStorage.setItem("interactive_resume_data", JSON.stringify(resumeData));
    } catch (e) {
      console.error("Failed to save resume data to localStorage", e);
    }
  }, [resumeData]);

  // 2. Dark Mode Support
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const savedMode = localStorage.getItem("resume_dark_mode");
      return savedMode === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    localStorage.setItem("resume_dark_mode", String(darkMode));
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode]);

  // 3. Navigation & Filtering States
  const [activeTab, setActiveTabRaw] = useState<string>("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Smooth top scroll on tab switch
  const setActiveTab = (tabId: string) => {
    setActiveTabRaw(tabId);
    setMobileMenuOpen(false);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "instant" as any });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      const mainElement = document.getElementById("main-view-container");
      if (mainElement) {
        mainElement.scrollTop = 0;
      }
    }, 4);
  };

  const [skillCategoryFilter, setSkillCategoryFilter] = useState<string>("All");
  const [minSkillLevel, setMinSkillLevel] = useState<number>(0);
  const [projectCategoryFilter, setProjectCategoryFilter] = useState<string>("All");
  const [projectSearch, setProjectSearch] = useState<string>("");
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

  // 4. Contact Form state
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>(() => {
    try {
      const savedMessages = localStorage.getItem("resume_contact_messages");
      return savedMessages ? JSON.parse(savedMessages) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("resume_contact_messages", JSON.stringify(contactMessages));
  }, [contactMessages]);

  const [formInput, setFormInput] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [formStatus, setFormStatus] = useState<{ type: "success" | "error" | null; text: string }>({
    type: null,
    text: ""
  });

  // Notifications
  const [alertMessage, setAlertMessage] = useState<{ type: "success" | "info" | null; text: string }>({
    type: null,
    text: ""
  });

  const showAlert = (text: string, type: "success" | "info" = "success") => {
    setAlertMessage({ type, text });
    setTimeout(() => {
      setAlertMessage({ type: null, text: "" });
    }, 4000);
  };

  // Contact Form Post Handle
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formInput.name || !formInput.email || !formInput.message) {
      setFormStatus({ type: "error", text: "请填写必填字段 (姓名、邮箱、留言)" });
      return;
    }

    const newMessage: ContactMessage = {
      id: "msg_" + Date.now(),
      name: formInput.name,
      email: formInput.email,
      subject: formInput.subject || "无主题咨询",
      message: formInput.message,
      date: new Date().toLocaleString("zh-CN")
    };

    setContactMessages((prev) => [newMessage, ...prev]);
    setFormInput({ name: "", email: "", subject: "", message: "" });
    setFormStatus({ type: "success", text: `留言已成功暂存！${resumeData.personalInfo.name} 将尽快给您答复。` });
    showAlert("收到了您的新联系信箱留言！");
  };

  // Data modification functions
  const handleUpdatePersonalInfo = (field: string, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }));
  };

  const handleUpdateGitHubConfig = (field: string, value: any) => {
    setResumeData((prev) => ({
      ...prev,
      githubConfig: {
        ...prev.githubConfig,
        [field]: value
      }
    }));
  };

  // Skills CRUD
  const handleAddSkill = () => {
    const newSkill: Skill = {
      name: "新技能",
      level: 80,
      category: "薪酬福利规划",
      yearsOfExp: 3
    };
    setResumeData((prev) => ({
      ...prev,
      skills: [...prev.skills, newSkill]
    }));
    showAlert("专业胜任力技能指标添加成功");
  };

  const handleUpdateSkill = (index: number, field: keyof Skill, value: any) => {
    setResumeData((prev) => {
      const updated = [...prev.skills];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, skills: updated };
    });
  };

  const handleDeleteSkill = (index: number) => {
    setResumeData((prev) => {
      const updated = prev.skills.filter((_, idx) => idx !== index);
      return { ...prev, skills: updated };
    });
    showAlert("该专业技能条目已移除", "info");
  };

  // Experience CRUD
  const handleAddExperience = () => {
    const newExp: Experience = {
      id: "exp_" + Date.now(),
      company: "新兴数字化科技标杆企业",
      role: "资深人力资源专家 / HRBP 负责人",
      startDate: "2025-01",
      endDate: "至今",
      location: "深圳",
      description: ["主导重大业务群组织架构诊断与轻量化重建。", "统筹年度宽带薪酬激励政策及中高层绩效考核。"],
      techStack: ["战略人力规划", "组织诊断及重组", "海氏岗位对标评估"]
    };
    setResumeData((prev) => ({
      ...prev,
      experience: [newExp, ...prev.experience]
    }));
    showAlert("工作执业历险里程碑节点添加成功");
  };

  const handleUpdateExperience = (id: string, field: keyof Experience, value: any) => {
    setResumeData((prev) => {
      const updated = prev.experience.map((exp) => {
        if (exp.id === id) {
          return { ...exp, [field]: value };
        }
        return exp;
      });
      return { ...prev, experience: updated };
    });
  };

  const handleUpdateExpDesc = (expId: string, descIndex: number, text: string) => {
    setResumeData((prev) => {
      const updated = prev.experience.map((exp) => {
        if (exp.id === expId) {
          const newDesc = [...exp.description];
          newDesc[descIndex] = text;
          return { ...exp, description: newDesc };
        }
        return exp;
      });
      return { ...prev, experience: updated };
    });
  };

  const handleAddExpDescLine = (expId: string) => {
    setResumeData((prev) => {
      const updated = prev.experience.map((exp) => {
        if (exp.id === expId) {
          return { ...exp, description: [...exp.description, "新增日常职责或卓越绩效指标描述"] };
        }
        return exp;
      });
      return { ...prev, experience: updated };
    });
  };

  const handleDeleteExpDescLine = (expId: string, descIndex: number) => {
    setResumeData((prev) => {
      const updated = prev.experience.map((exp) => {
        if (exp.id === expId) {
          const newDesc = exp.description.filter((_, idx) => idx !== descIndex);
          return { ...exp, description: newDesc };
        }
        return exp;
      });
      return { ...prev, experience: updated };
    });
  };

  const handleDeleteExperience = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.filter((exp) => exp.id !== id)
    }));
    showAlert("工作履历条目已成功删除", "info");
  };

  // Projects CRUD
  const handleAddProject = () => {
    const newProj: Project = {
      id: "proj_" + Date.now(),
      title: "新主导人资专项工程",
      description: "一句话阐述该专项工程对促进组织人效增长的核心实效成果。",
      category: "人力资源数字化",
      techStack: ["方法论一", "方法论二"],
      featured: false,
      role: "项目负责人",
      timeline: "",
      background: "",
      objective: "",
      actions: [],
      outcomes: [],
      highlights: []
    };
    setResumeData((prev) => ({
      ...prev,
      projects: [newProj, ...prev.projects]
    }));
    showAlert("新增主导重点专项案例成功");
  };

  const handleUpdateProject = (id: string, field: keyof Project, value: any) => {
    setResumeData((prev) => {
      const updated = prev.projects.map((proj) => {
        if (proj.id === id) {
          return { ...proj, [field]: value };
        }
        return proj;
      });
      return { ...prev, experience: prev.experience, projects: updated };
    });
  };

  const handleUpdateProjHighlight = (projId: string, hlIndex: number, text: string) => {
    setResumeData((prev) => {
      const updated = prev.projects.map((p) => {
        if (p.id === projId) {
          const newHl = [...p.highlights];
          newHl[hlIndex] = text;
          return { ...p, highlights: newHl };
        }
        return p;
      });
      return { ...prev, projects: updated };
    });
  };

  const handleAddProjHighlightLine = (projId: string) => {
    setResumeData((prev) => {
      const updated = prev.projects.map((p) => {
        if (p.id === projId) {
          return { ...p, highlights: [...p.highlights, "新增一项核心人力效能成效指标"] };
        }
        return p;
      });
      return { ...prev, projects: updated };
    });
  };

  const handleDeleteProjHighlightLine = (projId: string, hlIndex: number) => {
    setResumeData((prev) => {
      const updated = prev.projects.map((p) => {
        if (p.id === projId) {
          const newHl = p.highlights.filter((_, idx) => idx !== hlIndex);
          return { ...p, highlights: newHl };
        }
        return p;
      });
      return { ...prev, projects: updated };
    });
  };

  const handleDeleteProject = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id)
    }));
    showAlert("重点项目案例已删除", "info");
  };

  // Education CRUD
  const handleAddEducation = () => {
    const newEdu: Education = {
      id: "edu_" + Date.now(),
      institution: "请填写院校/培训机构",
      degree: "本科",
      major: "请填写专业",
      startDate: "2020-09",
      endDate: "2024-06",
      category: "学历教育",
      certName: "",
      certOrg: "",
      certDate: "",
      highlights: []
    };
    setResumeData((prev) => ({
      ...prev,
      education: [...prev.education, newEdu]
    }));
    showAlert("教育与资质信息添加成功");
  };

  const handleUpdateEducation = (id: string, field: keyof Education, value: any) => {
    setResumeData((prev) => {
      const updated = prev.education.map((edu) => {
        if (edu.id === id) {
          return { ...edu, [field]: value };
        }
        return edu;
      });
      return { ...prev, education: updated };
    });
  };

  const handleDeleteEducation = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.filter((edu) => edu.id !== id)
    }));
    showAlert("该教育资质条目已摘除", "info");
  };

  // Print utility
  const handlePrint = () => {
    window.print();
  };

  // Computed insights
  const skillsCount = useMemo(() => resumeData.skills.length, [resumeData.skills]);
  const experienceYears = useMemo(() => {
    let years = 10;
    try {
      const sorted = [...resumeData.experience].sort((a, b) => a.startDate.localeCompare(b.startDate));
      if (sorted.length > 0) {
        const start = new Date(sorted[0].startDate + "-01");
        const end = new Date();
        years = Math.max(1, Math.round((end.getTime() - start.getTime()) / (365 * 24 * 60 * 60 * 1000)));
      }
    } catch {
      // blank
    }
    return years + "年+";
  }, [resumeData.experience]);

  // Filter skills list based on categories and min filter level
  const filteredSkills = useMemo(() => {
    return resumeData.skills.filter((skill) => {
      const matchCat = skillCategoryFilter === "All" || skill.category === skillCategoryFilter;
      const matchLevel = skill.level >= minSkillLevel;
      return matchCat && matchLevel;
    });
  }, [resumeData.skills, skillCategoryFilter, minSkillLevel]);

  // Filter projects based on categories, search inputs
  const filteredProjects = useMemo(() => {
    return resumeData.projects.filter((p) => {
      const matchCat = projectCategoryFilter === "All" || p.category.includes(projectCategoryFilter) || p.techStack.includes(projectCategoryFilter);
      const text = (p.title + p.description + p.techStack.join(" ")).toLowerCase();
      const matchSearch = text.includes(projectSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [resumeData.projects, projectCategoryFilter, projectSearch]);

  return (
    <div className={`min-h-screen font-sans ${darkMode ? "dark bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-800"} flex flex-col transition-colors duration-300 print:bg-white print:text-black`}>
      
      {/* GLOBAL ALERTS */}
      {alertMessage.text && (
        <div id="live-alert" className="fixed top-4 right-4 z-50 flex items-center gap-3 p-4 rounded-xl shadow-2xl border transition-all animate-bounce bg-white text-slate-900 border-emerald-500 max-w-sm">
          {alertMessage.type === "success" ? (
            <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg">
              <CheckCircle2 size={18} />
            </div>
          ) : (
            <div className="bg-sky-100 text-sky-600 p-2 rounded-lg">
              <Activity size={18} />
            </div>
          )}
          <div>
            <p className="text-xs font-semibold text-slate-500">人资系统通知</p>
            <p className="text-sm font-medium text-slate-800">{alertMessage.text}</p>
          </div>
        </div>
      )}

      {/* MOBILE HEADER BAR */}
      <span id="mobile-top-bar" className="md:hidden flex items-center justify-between p-4 bg-white/95 dark:bg-slate-900/95 shadow-md sticky top-0 z-40 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 print:hidden">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={resumeData.personalInfo.avatarUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100&h=100"}
              alt="Avatar"
              className="w-10 h-10 rounded-full border-2 border-slate-200 dark:border-slate-700 object-cover"
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100&h=100";
              }}
            />
            <span id="status-badge" className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" title="可沟通联络"></span>
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white leading-tight">{resumeData.personalInfo.name}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate max-w-[150px]">{resumeData.personalInfo.title}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            id="mobile-dark-mode-toggle"
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            aria-label="切换黑白夜间模式"
          >
            {darkMode ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            id="mobile-menu-trigger"
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="菜单"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </span>

      {/* DASHBOARD CONTAINER */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 gap-6 lg:gap-8 min-h-0 print:block">
        
        {/* DESKTOP/MOBILE NAV SIDEBAR */}
        <aside
          id="resume-sidebar"
          className={`w-full md:w-68 lg:w-80 flex-shrink-0 transition-transform md:translate-x-0 bg-white dark:bg-slate-900 md:bg-white/70 md:dark:bg-indigo-950/20 md:backdrop-blur-lg border border-slate-200/60 dark:border-slate-800/80 md:rounded-3xl p-6 flex flex-col gap-6 sticky top-24 md:h-[calc(100vh-160px)] md:overflow-y-auto no-scrollbar print:hidden ${
            mobileMenuOpen ? "block absolute top-[73px] left-0 right-0 z-30 shadow-2xl animate-fade-in max-h-[80vh] overflow-y-auto border-t border-slate-100" : "hidden md:flex"
          }`}
        >
          {/* Profile Card */}
          <div className="flex flex-col items-center text-center pb-5 border-b border-slate-150/80 dark:border-slate-850">
            <div className="relative group mb-4">
              <div className="absolute inset-0 bg-emerald-500 rounded-full blur opacity-10 group-hover:opacity-20 transition-opacity"></div>
              <img
                src={resumeData.personalInfo.avatarUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200"}
                alt="照片"
                className="w-24 h-24 rounded-full border-4 border-slate-100 dark:border-slate-800 object-cover shadow-lg transition-transform hover:scale-102"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200";
                }}
              />
              <span className="absolute bottom-1 right-2 w-4.5 h-4.5 bg-emerald-500 rounded-full border-4 border-white dark:border-slate-900 shadow-sm" title="在线可连络沟通"></span>
            </div>
            
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-wide">{resumeData.personalInfo.name}</h2>
            <div className="mt-1.5 px-3 py-1 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 rounded-full text-[10px] font-bold uppercase tracking-wider border border-teal-100/40">
              {resumeData.personalInfo.title}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-400 mt-2 hover:text-emerald-500 transition-colors flex items-center gap-1.5">
              <MapPin size={12} className="text-slate-400" />
              {resumeData.personalInfo.location || "深圳 · 中国"}
            </p>
          </div>

          {/* Quick Contact */}
          <div className="space-y-3 p-1.5 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 text-xs text-slate-500 dark:text-slate-400 font-medium border border-slate-100 dark:border-slate-850">
            <a href={`mailto:${resumeData.personalInfo.email}`} className="flex items-center gap-2.5 hover:text-emerald-500 transition-colors p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800/50">
              <Mail size={13} className="text-slate-400 flex-shrink-0" />
              <span className="truncate">{resumeData.personalInfo.email}</span>
            </a>
            <a href={`tel:${resumeData.personalInfo.phone}`} className="flex items-center gap-2.5 hover:text-emerald-500 transition-colors p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800/50">
              <Phone size={13} className="text-slate-400 flex-shrink-0" />
              <span>{resumeData.personalInfo.phone}</span>
            </a>
          </div>

          {/* Navigation List */}
          <nav className="flex-1 space-y-1.5">
            <p className="text-[10px] font-bold text-slate-450 tracking-widest uppercase mb-2 px-3">导航</p>
            
            {[
              { id: "overview", label: "个人总览", icon: LayoutDashboard },
              { id: "skills", label: "专业技能", icon: Brain, badge: skillsCount },
              { id: "experience", label: "工作经历", icon: Briefcase, badge: resumeData.experience.length },
              { id: "projects", label: "核心项目", icon: Award, badge: resumeData.projects.length },
              { id: "education", label: "教育背景", icon: GraduationCap },
              { id: "contact", label: "联系方式", icon: Mail, badge: contactMessages.length ? contactMessages.length : undefined },
            ].map((menuItem) => {
              const Icon = menuItem.icon;
              const isActive = activeTab === menuItem.id;
              return (
                <button
                  key={menuItem.id}
                  onClick={() => setActiveTab(menuItem.id)}
                  id={`nav-item-${menuItem.id}`}
                  className={`w-full group text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all duration-200 cursor-pointer border ${
                    isActive
                      ? "bg-slate-900 border-slate-900 text-white shadow-lg dark:bg-emerald-500 dark:border-emerald-500 dark:text-slate-950"
                      : "border-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white"
                  } ${menuItem.highlight && !isActive ? "text-teal-600 dark:text-teal-400 font-extrabold" : ""}`}
                >
                  <span className="flex items-center gap-3">
                    <Icon size={15} className={`transition-transform group-hover:scale-105 ${isActive ? "text-white dark:text-slate-950" : "text-slate-400"}`} />
                    <span>{menuItem.label}</span>
                  </span>
                  {menuItem.badge !== undefined && (
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                      isActive
                        ? "bg-slate-800 text-white dark:bg-slate-950 dark:text-emerald-400"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                    }`}>
                      {menuItem.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick theme control & Print Button */}
          <div className="pt-4 border-t border-slate-150 dark:border-slate-850 space-y-2 mt-auto">
            <button
              onClick={handlePrint}
              id="print-resume-btn"
              className="w-full py-2 px-3 hover:scale-102 transition-transform bg-teal-55/40 dark:bg-teal-950/20 hover:bg-teal-100/50 dark:hover:bg-teal-950/40 border border-teal-100 dark:border-teal-900 text-teal-750 dark:text-teal-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
            >
              <Printer size={13} />
              <span>标准 A4 导出 / 打印</span>
            </button>
            <p className="text-[10px] text-center text-slate-400 leading-tight">支持自动打印精简双栏完美排版</p>
          </div>
        </aside>

        {/* MAIN VIEWPORT */}
        <main
          id="main-view-container"
          className="flex-1 min-h-[500px] md:min-h-[650px] md:h-[calc(100vh-160px)] bg-white/40 dark:bg-slate-900/30 md:bg-white md:dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 md:rounded-3xl p-4 md:p-6 lg:p-8 flex flex-col overflow-y-auto no-scrollbar shadow-sm print:shadow-none print:border-none print:bg-white print:p-0 print:m-0"
        >
          {/* SECTION HEADER - 个人总览时隐藏，其他tab显示 */}
          {activeTab !== "overview" && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-5 border-b border-slate-150 dark:border-slate-850 print:hidden">
            <div>
              <div className="flex items-center gap-2.5 text-[10px] text-teal-600 dark:text-teal-400 font-extrabold tracking-widest uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {activeTab === "overview" && "个人总览"}
                {activeTab === "skills" && "专业技能"}
                {activeTab === "experience" && "工作经历"}
                {activeTab === "projects" && "核心项目"}
                {activeTab === "education" && "教育背景"}
                {activeTab === "contact" && "联系方式"}
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {activeTab === "overview" && "个人总览"}
                {activeTab === "skills" && "专业技能"}
                {activeTab === "experience" && "工作经历"}
                {activeTab === "projects" && "核心项目"}
                {activeTab === "education" && "教育背景"}
                {activeTab === "contact" && "联系方式"}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-450 dark:text-slate-400 font-bold bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-150 dark:border-slate-700/80 flex items-center gap-2 shadow-xs">
                <Activity size={12} className="text-emerald-500 animate-pulse" />
                <span>在线</span>
              </span>
              
              <button
                onClick={() => setDarkMode(!darkMode)}
                id="desktop-theme-toggle"
                className="hidden md:flex p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/85 text-slate-600 dark:text-slate-300 hover:bg-slate-100 hover:scale-102 transition-all shadow-xs"
                title="切换黑夜模式"
              >
                {darkMode ? <Sun size={14} /> : <Moon size={14} />}
              </button>
            </div>
          </div>
          )}

          {/* CONTENT TABS */}
          <div className="flex-1">

            {/* ==================== TAB 1: OVERVIEW ==================== */}
            {activeTab === "overview" && (
              <div className="space-y-6 md:space-y-8 animate-fade-in print:hidden">
                
                {/* 4 CORE HR METRICS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* Metric 1: Exp */}
                  <div className="bg-slate-50/50 dark:bg-slate-900/35 p-4 rounded-2xl border border-slate-150/60 dark:border-slate-850 hover:shadow-md transition-all flex items-center gap-4">
                    <div className="p-3 bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 rounded-xl border border-teal-100/20">
                      <Briefcase size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-405 uppercase tracking-widest">工作年限</p>
                      <p className="text-lg font-extrabold text-slate-850 dark:text-white mt-0.5">{experienceYears}</p>
                    </div>
                  </div>

                  {/* Metric 2: Projects */}
                  <div className="bg-slate-50/50 dark:bg-slate-900/35 p-4 rounded-2xl border border-slate-150/60 dark:border-slate-850 hover:shadow-md transition-all flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-100/20">
                      <Award size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-405 uppercase tracking-widest">核心项目</p>
                      <p className="text-lg font-extrabold text-slate-850 dark:text-white mt-0.5">{resumeData.projects.length} 个</p>
                    </div>
                  </div>

                  {/* Metric 3: Performance Coverage Rate */}
                  <div className="bg-slate-50/50 dark:bg-slate-900/35 p-4 rounded-2xl border border-slate-150/60 dark:border-slate-850 hover:shadow-md transition-all flex items-center gap-4">
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-100/20">
                      <BadgeCheck size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-450 uppercase tracking-widest">绩效上线率</p>
                      <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-450 mt-0.5">
                        94%
                      </p>
                    </div>
                  </div>

                  {/* Metric 4: Messages */}
                  <div className="bg-slate-50/50 dark:bg-slate-900/35 p-4 rounded-2xl border border-slate-150/60 dark:border-slate-850 hover:shadow-md transition-all flex items-center gap-4 cursor-pointer" onClick={() => setActiveTab("contact")}>
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-100/20">
                      <Mail size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-405 uppercase tracking-widest">留言</p>
                      <p className="text-lg font-extrabold text-slate-850 dark:text-white mt-0.5">{contactMessages.length} 封留言</p>
                    </div>
                  </div>

                </div>

                {/* TWO-COLUMN LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  
                  {/* Left Column: About & Work Strategy logs */}
                  <div className="lg:col-span-7 flex flex-col gap-6 md:gap-8">
                    
                    {/* About me card */}
                    <div className="bg-slate-50/40 dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-150/60 dark:border-slate-850/80">
                      <div className="flex items-center gap-2 mb-4">
                        <User className="text-emerald-500" size={17} />
                        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">关于我</h3>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed whitespace-pre-line">
                        {resumeData.personalInfo.bio}
                      </p>
                      <div className="mt-4 p-4 rounded-xl bg-slate-100/50 dark:bg-slate-800/60 text-xs text-slate-500 dark:text-slate-400 border border-slate-150 dark:border-slate-750">
                        <span className="font-extrabold text-slate-705 dark:text-slate-300 block mb-1">核心优势：</span>
                        {resumeData.personalInfo.summary}
                      </div>
                    </div>

                    {/* HRBP Strategic Activity Bulletin */}
                    <div className="bg-slate-50/40 dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-150/60 dark:border-slate-850/80">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Activity className="text-emerald-500 animate-pulse" size={17} />
                          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">近期核心工作</h3>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <p className="text-[11px] text-slate-400 leading-relaxed bg-amber-50/50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 p-2.5 rounded-lg border border-amber-100/30 dark:border-amber-950/50">
                          聚焦人力成本精细化管控与组织效能提升，持续推动三大核心工作落地：
                        </p>
                        
                        {[
                          { field: "人力成本管控", info: "围绕人效2300、单次人工成本0.076元目标，搭建成本分析机制，按月输出成本分析报告与预算方案。Q1单次人工成本完成率97%，大区累计节余成本超20万元。", date: "成本精细化运营" },
                          { field: "智能排班系统", info: "从0到1主导排班系统研发迭代，V1版本实现进出港货量预测与AI分析，V2版本实现数据实时上传与数据库自动更新，已在郑州、襄阳、新乡等多中心试点落地。", date: "数字化用工配置" },
                          { field: "绩效体系推进", info: "搭建绩效种子人才全流程培养体系（理论→实操→认证），2025年培养13人（通过率100%、优秀率54%）；推动13个中心绩效上线，上线率达94%。", date: "组织效能激活" }
                        ].map((item, idx) => (
                          <div key={idx} className="flex gap-3 items-start border-l-2 border-slate-200 dark:border-slate-800 pl-4 py-1.5 transition-colors hover:bg-slate-100/30">
                            <span className="text-slate-400 text-xs mt-1 font-bold">●</span>
                            <div>
                              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                <span className="bg-slate-150 dark:bg-slate-800 text-slate-600 dark:text-slate-350 px-1.5 py-0.5 rounded mr-1.5 text-[9px] uppercase tracking-wider">{item.field}</span>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500">[{item.date}]</span>
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{item.info}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: 核心能力分布 + 重点项目 */}
                  <div className="lg:col-span-5 flex flex-col gap-5">

                    {/* 技能领域分布 */}
                    <div className="bg-slate-50/40 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-150/60 dark:border-slate-850/80 flex flex-col">
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                        <Brain size={16} className="text-teal-500" />
                        <span>核心能力领域分布</span>
                      </h3>

                      <div className="space-y-2.5">
                        {resumeData.githubConfig.languages.map((lang, index) => (
                          <div key={index} className="space-y-1">
                            <div className="flex items-center justify-between text-xs font-semibold">
                              <span className="flex items-center gap-1.5">
                                <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: lang.color }}></span>
                                <span className="text-slate-700 dark:text-slate-350 text-[11px] truncate max-w-[200px]">{lang.name}</span>
                              </span>
                              <span className="text-slate-500 text-[11px] tabular-nums">{lang.percentage}%</span>
                            </div>
                            <div className="w-full bg-slate-200/50 dark:bg-slate-805 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{
                                  backgroundColor: lang.color,
                                  width: `${lang.percentage}%`
                                }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => setActiveTab("skills")}
                        id="view-full-skills-btn"
                        className="w-full mt-auto py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-350 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-150 dark:border-slate-750"
                      >
                        <span>查看完整技能列表</span>
                        <ChevronRight size={13} />
                      </button>
                    </div>

                    {/* 重点项目 - 展示前2个 */}
                    {resumeData.projects.filter(p => p.featured).slice(0, 2).map((proj) => (
                      <div key={proj.id} className="bg-gradient-to-br from-emerald-500/10 to-indigo-500/8 dark:from-emerald-950/15 dark:to-indigo-950/12 p-5 rounded-2xl border border-emerald-400/18 dark:border-emerald-600/15 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 mb-2.5">
                          <TrendingUp size={14} className="text-emerald-500" />
                          <span className="text-[10px] font-extrabold text-indigo-600 dark:text-emerald-400 tracking-wider uppercase">重点项目</span>
                        </div>
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug">{proj.title}</h4>
                        <p className="text-[11px] text-slate-550 dark:text-slate-330 mt-2 leading-relaxed truncate-3-lines">{proj.description}</p>

                        <div className="flex flex-wrap gap-1 mt-3">
                          {proj.techStack.slice(0, 3).map((t, idx) => (
                            <span key={idx} className="text-[9px] px-2 py-0.5 bg-white/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md border border-slate-150 dark:border-slate-750 font-bold">{t}</span>
                          ))}
                        </div>

                        <button
                          onClick={() => setActiveTab("projects")}
                          id="featured-proj-view-btn"
                          className="w-full mt-auto py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-950 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:shadow-sm transition-all"
                        >
                          <span>查看项目详情</span>
                          <ChevronRight size={13} />
                        </button>
                      </div>
                    ))}

                  </div>

                </div>

              </div>
            )}


            {/* ==================== TAB 2: SKILLS (COMPETENCIES) ==================== */}
            {activeTab === "skills" && (
              <div className="space-y-6 md:space-y-8 animate-fade-in print:hidden">
                
                {/* Advanced filter panels */}
                <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-150/60 dark:border-slate-850 flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div className="flex flex-wrap gap-1.5">
                    {["All", "薪酬福利规划", "HRBP业务协同", "组织效能与绩效激活", "人力数字化与用工合规"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSkillCategoryFilter(cat)}
                        id={`skill-filter-btn-${cat}`}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          skillCategoryFilter === cat
                            ? "bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950"
                            : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200/50 dark:border-slate-700/80"
                        }`}
                      >
                        {categoryDisplayMap[cat] || cat}
                      </button>
                    ))}
                  </div>

                  {/* Competency Mastery Threshold Slider */}
                  <div className="flex items-center gap-3 w-full md:w-64">
                    <span className="text-xs font-semibold text-slate-500 whitespace-nowrap min-w-[75px]">掌握度 ≥ {minSkillLevel}%</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={minSkillLevel}
                      onChange={(e) => setMinSkillLevel(Number(e.target.value))}
                      className="w-full accent-emerald-500 h-1 bg-slate-200 dark:bg-slate-750 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* Grid represent representing Competency Items */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredSkills.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-slate-400 text-xs">
                      没有检索到符合过滤条件的专业技能指标
                    </div>
                  ) : (
                    filteredSkills.map((skill, index) => (
                      <div
                        key={index}
                        className="bg-slate-55/30 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-150/50 dark:border-slate-850/80 hover:border-teal-400/30 hover:bg-white dark:hover:bg-slate-850/50 transition-all group"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <span className="text-xs font-extrabold text-slate-800 dark:text-white">{skill.name}</span>
                            <span className="text-[9px] ml-2 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded border border-slate-200/20 font-bold">资历 {skill.yearsOfExp}年</span>
                          </div>
                          <span className="text-xs font-bold text-teal-600 dark:text-teal-450">{skill.level}%</span>
                        </div>

                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-slate-900 dark:bg-emerald-500 h-full rounded-full transition-all duration-1000 group-hover:opacity-85"
                            style={{
                              width: `${skill.level}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footnote card for competency strategy */}
                <div className="p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-150/60 dark:border-slate-850 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">高级精通模块 (Mastery ≥ 90)</h4>
                    <p className="text-xl font-extrabold text-slate-850 dark:text-white mt-1">
                      {resumeData.skills.filter((s) => s.level >= 90).length} 项高能战略胜任力
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">核心领域聚焦</h4>
                    <p className="text-xs text-slate-655 dark:text-slate-350 mt-1.5 leading-relaxed font-bold">
                      宽带合合薪重构、全面绩效多阶闭环规划、中高层胜任力高品质盘点及组织重建
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">数智化工具特长</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                      PowerBI 组织人效建模清洗, 飞书多维表格与OKR高级系统深度打通。
                    </p>
                  </div>
                </div>

              </div>
            )}


            {/* ==================== TAB 3: EXPERIENCE ==================== */}
            {activeTab === "experience" && (
              <div className="space-y-6 md:space-y-8 animate-fade-in print:hidden">
                
                {/* Milestone Vertical Timeline path */}
                <div className="relative pl-6 md:pl-8 border-l border-slate-200 dark:border-slate-800 space-y-8 md:space-y-12">
                  
                  {resumeData.experience.map((exp) => (
                    <div key={exp.id} className="relative group experience-node">
                      
                      {/* Timeline Bullet node */}
                      <span className="absolute -left-10 md:-left-12 top-1.5 w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-900 dark:border-emerald-500 flex items-center justify-center transition-all group-hover:scale-105 group-hover:bg-slate-900 dark:group-hover:bg-emerald-500">
                        <Briefcase size={12} className="text-slate-900 dark:text-emerald-450 group-hover:text-white dark:group-hover:text-slate-900" />
                      </span>

                      {/* Header context */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 mb-2.5">
                        <div>
                          <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-wide group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                            {exp.role}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{exp.company}</span>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <MapPin size={10} />
                              {exp.location}
                            </span>
                          </div>
                        </div>

                        {/* Tenure date */}
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-[10px] font-extrabold border border-slate-200/50 dark:border-slate-750 self-start md:self-center select-none">
                          <Calendar size={10} />
                          <span>{exp.startDate} 至 {exp.endDate}</span>
                        </span>
                      </div>

                      {/* Description Bullet achievements */}
                      <div className="bg-slate-50/40 dark:bg-slate-900/35 p-4.5 rounded-xl border border-slate-150/60 dark:border-slate-850/80 space-y-2 mt-2">
                        {exp.description.map((bullet, idx) => (
                          <div key={idx} className="flex gap-2.5 items-start">
                            <span className="text-emerald-500 font-extrabold text-xs mt-0.5">•</span>
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-[11.5px]">{bullet}</p>
                          </div>
                        ))}
                      </div>

                      {/* Stack highlights tags */}
                      <div className="flex flex-wrap gap-1.5 mt-3 pl-1">
                        {exp.techStack.map((tech, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-450 rounded-md border border-slate-200/50 dark:border-slate-750 font-bold"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>

                    </div>
                  ))}
                </div>

              </div>
            )}


            {/* ==================== TAB 4: PROJECTS (STRATEGIC INITIATIVES) ==================== */}
            {activeTab === "projects" && (
              <div className="space-y-6 md:space-y-8 animate-fade-in print:hidden">
                
                {/* Custom search matrix bar */}
                <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-150/60 dark:border-slate-850 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  <div className="flex flex-wrap gap-1.5">
                    {["All", "薪酬", "绩效", "人才", "数字化", "评估"].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setProjectCategoryFilter(tag)}
                        id={`proj-filter-btn-${tag}`}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          projectCategoryFilter === tag
                            ? "bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950"
                            : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200/50 dark:border-slate-700/80"
                        }`}
                      >
                        {tag === "All" ? "全部专项" : tag}
                      </button>
                    ))}
                  </div>

                  <div className="relative w-full md:w-64">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Search size={13} />
                    </span>
                    <input
                      type="text"
                      placeholder="检索主导工程方法论或关键字..."
                      value={projectSearch}
                      onChange={(e) => setProjectSearch(e.target.value)}
                      className="w-full text-xs pl-9 pr-4 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Grid implementation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredProjects.length === 0 ? (
                    <div className="col-span-full text-center py-16 text-slate-400 text-xs">
                      没有检索到符合条件的主导人资工程案例
                    </div>
                  ) : (
                    filteredProjects.map((proj) => {
                      const isExpanded = expandedProjectId === proj.id;
                      return (
                        <div
                          key={proj.id}
                          className={`bg-slate-50/40 dark:bg-slate-900/40 rounded-2xl border transition-all flex flex-col project-card cursor-pointer ${
                            isExpanded 
                              ? "border-emerald-400/60 dark:border-emerald-600/50 shadow-lg ring-1 ring-emerald-400/20 md:col-span-2" 
                              : "border-slate-150/60 dark:border-slate-850/80 hover:shadow-lg hover:border-emerald-300/40 dark:hover:border-emerald-700/40"
                          }`}
                          onClick={() => setExpandedProjectId(isExpanded ? null : proj.id)}
                        >
                          {/* 卡片头部 — 始终显示 */}
                          <div className="p-6">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-[9px] px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900 font-extrabold rounded-full">
                                {proj.category}
                              </span>
                              <div className="flex items-center gap-2">
                                {proj.featured && (
                                  <span className="text-[9px] px-2 py-0.5 bg-amber-50 dark:bg-amber-950/35 text-amber-700 dark:text-amber-400 border border-amber-100/30 rounded font-extrabold flex items-center gap-1.5 select-none animate-pulse">
                                    <Flame size={9} />
                                    <span>标杆主推</span>
                                  </span>
                                )}
                                <span className={`text-[10px] text-slate-400 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}>
                                  <ChevronDown size={14} />
                                </span>
                              </div>
                            </div>

                            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
                              {proj.title}
                            </h3>
                            
                            {/* 角色与周期 */}
                            {(proj.role || proj.timeline) && (
                              <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400 font-bold">
                                {proj.role && (
                                  <span className="flex items-center gap-1">
                                    <User size={10} />
                                    {proj.role}
                                  </span>
                                )}
                                {proj.timeline && (
                                  <span className="flex items-center gap-1">
                                    <Calendar size={10} />
                                    {proj.timeline}
                                  </span>
                                )}
                              </div>
                            )}

                            <p className="text-[11.5px] text-slate-650 dark:text-slate-300 mt-2.5 leading-relaxed font-normal">
                              {proj.description}
                            </p>

                            {/* 收起状态：只显示 highlights 摘要前1条 */}
                            {!isExpanded && proj.highlights?.length > 0 && (
                              <div className="mt-3 border-l-2 border-emerald-400/40 dark:border-emerald-600/40 pl-3">
                                <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 font-medium italic line-clamp-2">
                                  {proj.highlights[0]}
                                </p>
                                {proj.highlights.length > 1 && (
                                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 inline-block">
                                    +{proj.highlights.length - 1} 项成果，点击展开详情 ↗
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* ====== 展开详情区域 ====== */}
                          {isExpanded && (
                            <div className="px-6 pb-6 space-y-5 animate-fade-in">
                              
                              {/* 项目背景 */}
                              {proj.background && (
                                <div className="bg-slate-100/60 dark:bg-slate-800/50 rounded-xl p-4">
                                  <div className="flex items-center gap-1.5 mb-2">
                                    <Target size={12} className="text-indigo-500" />
                                    <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">项目背景</span>
                                  </div>
                                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">{proj.background}</p>
                                </div>
                              )}

                              {/* 项目目标 */}
                              {proj.objective && (
                                <div className="bg-emerald-50/60 dark:bg-emerald-950/20 rounded-xl p-4">
                                  <div className="flex items-center gap-1.5 mb-2">
                                    <Crosshair size={12} className="text-emerald-500" />
                                    <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">项目目标</span>
                                  </div>
                                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">{proj.objective}</p>
                                </div>
                              )}

                              {/* 关键行动 */}
                              {proj.actions && proj.actions.length > 0 && (
                                <div>
                                  <div className="flex items-center gap-1.5 mb-3">
                                    <Zap size={12} className="text-amber-500" />
                                    <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider">关键行动</span>
                                  </div>
                                  <div className="space-y-2">
                                    {proj.actions.map((action, idx) => (
                                      <div key={idx} className="flex gap-2.5 items-start">
                                        <span className="shrink-0 w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 text-[9px] font-extrabold flex items-center justify-center mt-0.5">
                                          {idx + 1}
                                        </span>
                                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">{action}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* 量化成果 */}
                              {proj.outcomes && proj.outcomes.length > 0 && (
                                <div className="bg-gradient-to-r from-emerald-50/40 to-teal-50/40 dark:from-emerald-950/15 dark:to-teal-950/15 rounded-xl p-4 border border-emerald-200/40 dark:border-emerald-800/30">
                                  <div className="flex items-center gap-1.5 mb-3">
                                    <TrendingUp size={12} className="text-emerald-500" />
                                    <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">量化成果</span>
                                  </div>
                                  <div className="space-y-2">
                                    {proj.outcomes.map((outcome, idx) => (
                                      <div key={idx} className="flex gap-2 items-start">
                                        <span className="text-emerald-500 font-extrabold text-xs shrink-0">✓</span>
                                        <p className="text-[11px] text-slate-700 dark:text-slate-200 leading-relaxed font-medium">{outcome}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Highlights（兼容旧数据） */}
                              {proj.highlights?.length > 0 && (
                                <div>
                                  <div className="flex items-center gap-1.5 mb-3">
                                    <Star size={12} className="text-indigo-500" />
                                    <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">核心亮点</span>
                                  </div>
                                  <div className="space-y-2 border-l-2 border-indigo-300/40 dark:border-indigo-600/40 pl-3">
                                    {proj.highlights.map((hl, hlIdx) => (
                                      <p key={hlIdx} className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 font-medium italic">
                                        "{hl}"
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* 技术栈 / 方法论 */}
                              <div>
                                <div className="flex items-center gap-1.5 mb-2">
                                  <Wrench size={12} className="text-slate-400" />
                                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">方法论 & 工具</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {proj.techStack.map((tech, idx) => (
                                    <span
                                      key={idx}
                                      className="text-[9px] font-bold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md border border-slate-200/50 dark:border-slate-700/50"
                                    >
                                      {tech}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* Project link */}
                              {proj.demoUrl && (
                                <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-850 text-xs">
                                  <span className="text-[10px] text-slate-400 font-bold">项目链接: </span>
                                  <a
                                    href={proj.demoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] text-teal-600 dark:text-teal-400 font-extrabold hover:underline flex items-center gap-1"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <ExternalLink size={9} />
                                    <span>{proj.title}</span>
                                  </a>
                                </div>
                              )}
                              {proj.githubRepo && !proj.demoUrl && (
                                <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-850 text-xs">
                                  <span className="text-[10px] text-slate-400 font-bold">代码仓库: </span>
                                  <span className="text-[10px] text-slate-400 font-bold">{proj.githubRepo}</span>
                                </div>
                              )}

                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

              </div>
            )}


            {/* ==================== TAB 5: EDUCATION ==================== */}
            {activeTab === "education" && (
              <div className="space-y-6 md:space-y-8 animate-fade-in print:hidden">
                
                <div className="space-y-6">
                  {resumeData.education.map((edu) => (
                    <div key={edu.id} className="bg-slate-50/40 dark:bg-slate-900/35 p-6 rounded-2xl border border-slate-150/65 dark:border-slate-850 flex flex-col md:flex-row justify-between gap-4">
                      
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400 font-extrabold text-[10px] tracking-widest uppercase">
                          <GraduationCap size={14} className="text-teal-550" />
                          <span>教育与专业资格资质</span>
                        </div>
                        
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                          {edu.institution}
                        </h3>
                        
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {edu.degree} • {edu.major}
                        </p>
                        
                        {edu.highlights && edu.highlights.length > 0 && (
                          <div className="space-y-1.5 pt-2 mt-2 border-t border-slate-200/60 dark:border-slate-800/80 max-w-2xl">
                            {edu.highlights.map((h, idx) => (
                              <p key={idx} className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed flex gap-2">
                                <span className="text-emerald-500 font-extrabold">✓</span>
                                <span>{h}</span>
                              </p>
                            ))}
                          </div>
                        )}
                      </div>

                      <span className="self-start px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-550 dark:text-slate-400 font-bold rounded-lg text-[10px] border border-slate-200/50">
                        {edu.startDate} 至 {edu.endDate}
                      </span>

                    </div>
                  ))}
                </div>

              </div>
            )}


            {/* ==================== TAB 6: CONTACT ==================== */}
            {activeTab === "contact" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in print:hidden">
                
                {/* Form column */}
                <div className="lg:col-span-7 bg-slate-50/30 dark:bg-slate-900/25 p-6 rounded-2xl border border-slate-150/60 dark:border-slate-850 space-y-5">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      给 {resumeData.personalInfo.name} 留信提意向
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      欢迎您提出管理诊断诉求、全盘人力体系（宽带薪酬、期权分配、动态绩效闭环考核）变革专项合作或发出中高管面试沟通邀请。
                    </p>
                  </div>

                  {formStatus.text && (
                    <div className={`p-4 rounded-xl text-xs font-bold ${
                      formStatus.type === "success"
                        ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 border border-emerald-100/30"
                        : "bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-450 border border-rose-100/30"
                    }`}>
                      {formStatus.text}
                    </div>
                  )}

                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">您的姓名/机构 <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          required
                          value={formInput.name}
                          onChange={(e) => setFormInput({ ...formInput, name: e.target.value })}
                          className="w-full text-xs px-3 py-2.5 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:border-emerald-500"
                          placeholder="王总 / 猎头顾问 / HR"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">联络常用邮箱 <span className="text-red-500">*</span></label>
                        <input
                          type="email"
                          required
                          value={formInput.email}
                          onChange={(e) => setFormInput({ ...formInput, email: e.target.value })}
                          className="w-full text-xs px-3 py-2.5 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:border-emerald-500"
                          placeholder="boss@company.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">商谈咨询主题</label>
                      <input
                        type="text"
                        value={formInput.subject}
                        onChange={(e) => setFormInput({ ...formInput, subject: e.target.value })}
                        className="w-full text-xs px-3 py-2.5 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:border-emerald-500"
                        placeholder="多品牌薪资对标、HRBP项目、千人级薪酬挂钩激励专项等..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">详情留言说明 <span className="text-red-500">*</span></label>
                      <textarea
                        required
                        rows={4}
                        value={formInput.message}
                        onChange={(e) => setFormInput({ ...formInput, message: e.target.value })}
                        className="w-full text-xs px-3 py-2.5 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
                        placeholder="请输入合作需求或意向留言..."
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      id="submit-contact-form"
                      className="w-full py-3 bg-slate-900 dark:bg-emerald-500 hover:bg-slate-800 dark:hover:bg-emerald-450 text-white dark:text-slate-950 text-xs font-bold rounded-lg tracking-wider transition-all cursor-pointer min-h-[44px]"
                    >
                      安全投递消息
                    </button>

                  </form>
                </div>

                {/* Right profile detail box */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="bg-slate-50/40 dark:bg-slate-900/35 p-6 rounded-2xl border border-slate-150/60 dark:border-slate-850 space-y-4">
                    <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">即时行政档案卡</h3>
                    
                    <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-350 pl-1">
                      <div className="flex gap-2.5 items-center">
                        <MapPin size={13} className="text-emerald-500 flex-shrink-0" />
                        <span>工作定居属地：{resumeData.personalInfo.location || "中国 · 深圳"}</span>
                      </div>
                      <div className="flex gap-2.5 items-center">
                        <Mail size={13} className="text-emerald-500 flex-shrink-0" />
                        <span>邮箱信箱专线：{resumeData.personalInfo.email}</span>
                      </div>
                      <div className="flex gap-2.5 items-center">
                        <Phone size={13} className="text-emerald-500 flex-shrink-0" />
                        <span>直连电话热线：{resumeData.personalInfo.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-teal-50 to-teal-100/50 dark:from-slate-900 dark:to-slate-800 p-5 rounded-2xl border border-teal-100 dark:border-slate-750 text-xs text-teal-900 dark:text-slate-300 leading-relaxed">
                    <p className="font-extrabold mb-1.5 text-teal-950 dark:text-emerald-400">⚡ 安全沙盒离线保存提示：</p>
                    <p>为展现友好便捷的交互，您投递的意向留言会被即刻安全注册保存在本地网页数据库（localStorage），信息完全离线保密，绝无信息外泄，请放心体验。</p>
                  </div>
                </div>

              </div>
            )}


          </div>

          {/* ==================== PRINT ONLY: Standard A4 Resume ==================== */}
          <div className="hidden print:block print-resume-sheet">

            {/* ── 姓名 + 基本信息（居中） ── */}
            <div className="print-header">
              <h1 className="print-name">{resumeData.personalInfo.name}</h1>
              <div className="print-title">{resumeData.personalInfo.title}</div>
              <div className="print-contact-line">
                <span>{resumeData.personalInfo.phone}</span>
                <span>{resumeData.personalInfo.email}</span>
                <span>{resumeData.personalInfo.location}</span>
              </div>
            </div>

            {/* ── 个人简介 ── */}
            <div className="print-section">
              <div className="print-section-title">个人简介</div>
              <div className="print-body">
                <p>{resumeData.personalInfo.bio}</p>
              </div>
            </div>

            {/* ── 专业技能 ── */}
            <div className="print-section">
              <div className="print-section-title">专业技能</div>
              <div className="print-body">
                {(["薪酬福利规划", "HRBP业务协同", "组织效能与绩效激活", "人力数字化与用工合规"] as const).map(cat => {
                  const catSkills = resumeData.skills.filter(s => s.category === cat);
                  if (catSkills.length === 0) return null;
                  return (
                    <div key={cat} className="print-skill-group">
                      <span className="print-skill-category">{categoryDisplayMap[cat]}：</span>
                      <span className="print-skill-items">{catSkills.map(s => s.name).join("、")}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── 工作经历 ── */}
            <div className="print-section">
              <div className="print-section-title">工作经历</div>
              <div className="print-body">
                {resumeData.experience.map(exp => (
                  <div key={exp.id} style={{ marginBottom: "6pt" }}>
                    <div className="print-exp-header">
                      <span>
                        <span className="print-exp-company">{exp.company}</span>
                        {"　"}
                        <span className="print-exp-role">{exp.role}</span>
                      </span>
                      <span className="print-exp-date">{exp.startDate} — {exp.endDate}</span>
                    </div>
                    <ul>
                      {exp.description.map((desc, idx) => (
                        <li key={idx}>{desc}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* ── 核心项目 ── */}
            <div className="print-section">
              <div className="print-section-title">核心项目</div>
              <div className="print-body">
                {resumeData.projects.map(proj => (
                  <div key={proj.id} style={{ marginBottom: "5pt" }}>
                    <div style={{ marginBottom: "2pt" }}>
                      <span className="print-project-title">{proj.title}</span>
                      <span className="print-project-tag">{proj.category}</span>
                    </div>
                    {proj.description && <p>{proj.description}</p>}
                    {proj.outcomes && proj.outcomes.length > 0 && (
                      <ul className="print-project-outcomes">
                        {proj.outcomes.map((o, i) => <li key={i}>{o}</li>)}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ── 教育背景 ── */}
            <div className="print-section">
              <div className="print-section-title">教育背景</div>
              <div className="print-body">
                {resumeData.education.map(edu => (
                  <div key={edu.id} className="print-edu-row">
                    <span>
                      <span className="print-edu-institution">{edu.institution}</span>
                      <span className="print-edu-detail">　{edu.degree} · {edu.major}</span>
                    </span>
                    <span className="print-edu-detail">{edu.startDate} — {edu.endDate}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </main>

      </div>

      <footer className="py-5 mt-auto text-center text-[11px] text-slate-400 dark:text-slate-500 print:hidden">
        <p>© 2026 {resumeData.personalInfo.name}</p>
      </footer>

    </div>
  );
}
