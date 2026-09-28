"use client";

import {
  LayoutDashboard,
  GitBranch,
  ShieldAlert,
  Network,
  Bot,
  FileText,
  Settings,
  Wrench,
  Bug,
  Sparkles,
} from "lucide-react";

type SidebarProps = {
  activePage: string;
  onNavigate: (page: string) => void;
};

export default function Sidebar({
  activePage,
  onNavigate,
}: SidebarProps) {
  const sections = [
    {
      title: "Core Platform",
      items: [
        {
          name: "Dashboard",
          icon: LayoutDashboard,
        },
        {
          name: "Bug Diagnosis",
          icon: Bug,
          badge: "New",
          badgeColor: "bg-[#0A84FF]/20 text-[#0A84FF] border border-[#0A84FF]/30",
        },
        {
          name: "Repositories",
          icon: GitBranch,
        },
        {
          name: "Issues",
          icon: ShieldAlert,
        },
      ],
    },
    {
      title: "Intelligence & Insights",
      items: [
        {
          name: "Architecture",
          icon: Network,
        },
        {
          name: "AI Assistant",
          icon: Bot,
          badge: "AI",
          badgeColor: "bg-[#BF5AF2]/20 text-[#BF5AF2] border border-[#BF5AF2]/30",
        },
        {
          name: "Reports",
          icon: FileText,
        },
        {
          name: "Tools",
          icon: Wrench,
        },
      ],
    },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-white/[0.08] bg-[#0c0d12]/80 backdrop-blur-2xl">
      {/* Brand & macOS Window Controls */}
      <div className="flex h-20 flex-col justify-center border-b border-white/[0.06] px-6">
        {/* macOS Traffic Lights */}
        <div className="flex items-center gap-2 mb-2.5">
          <div className="h-3 w-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/50" />
          <div className="h-3 w-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/50" />
          <div className="h-3 w-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/50" />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#0A84FF] to-[#5E5CE6] text-white shadow-md shadow-[#0A84FF]/20">
            <Sparkles className="h-4 w-4" />
          </div>

          <div>
            <h1 className="text-sm font-semibold tracking-tight text-white">
              RepoLens
            </h1>
            <p className="text-[10px] text-[#86868b]">
              Code Intelligence & Diagnostics
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
        {sections.map((section) => (
          <div key={section.title} className="space-y-1">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-[#86868b]/70">
              {section.title}
            </p>

            <div className="mt-2 space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.name;

                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => onNavigate(item.name)}
                    className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all ${
                      isActive
                        ? "bg-white/[0.08] text-white shadow-sm"
                        : "text-[#86868b] hover:bg-white/[0.04] hover:text-[#f5f5f7]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`h-4 w-4 transition-colors ${
                          isActive
                            ? "text-[#0A84FF]"
                            : "text-[#86868b] group-hover:text-[#f5f5f7]"
                        }`}
                      />
                      <span>{item.name}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Section with System Status */}
      <div className="border-t border-white/[0.06] p-4">
        <button
          type="button"
          onClick={() => onNavigate("Settings")}
          className={`mb-3 flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium transition ${
            activePage === "Settings"
              ? "bg-white/[0.08] text-white"
              : "text-[#86868b] hover:bg-white/[0.04] hover:text-white"
          }`}
        >
          <Settings className="h-4 w-4" />
          Settings
        </button>

        {/* Apple-styled System Status Card */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#30D158] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#30D158]" />
              </span>
              <span className="text-[11px] font-medium text-[#f5f5f7]">
                Engine Ready
              </span>
            </div>
            <span className="text-[9px] font-mono text-[#86868b]">FastAPI + Groq</span>
          </div>

          <p className="mt-1 text-[10px] text-[#86868b]">
            Diagnostics & code scanners online
          </p>
        </div>
      </div>
    </aside>
  );
}