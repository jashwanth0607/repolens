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
  Code2,
  CheckCircle2,
  Terminal,
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
      title: "ANALYSIS & AUDIT",
      items: [
        {
          name: "Dashboard",
          icon: LayoutDashboard,
        },
        {
          name: "Bug Diagnosis",
          icon: Bug,
          badge: "Diagnostic",
          badgeColor: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
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
      title: "INTELLIGENCE",
      items: [
        {
          name: "Architecture",
          icon: Network,
        },
        {
          name: "AI Assistant",
          icon: Bot,
          badge: "LLM",
          badgeColor: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
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
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-zinc-800/80 bg-zinc-950/95 backdrop-blur-md">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-zinc-800/80 px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-400 shadow-sm">
            <Code2 className="h-4 w-4" />
          </div>

          <div>
            <h1 className="text-sm font-bold tracking-tight text-white font-mono">
              RepoLens
            </h1>
            <p className="text-[10px] text-zinc-400 font-mono">
              Code Intelligence v1.0
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {sections.map((section) => (
          <div key={section.title} className="space-y-1">
            <p className="px-3 text-[10px] font-semibold tracking-wider text-zinc-500 font-mono">
              {section.title}
            </p>

            <div className="mt-1 space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.name;

                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => onNavigate(item.name)}
                    className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-zinc-800/90 text-white border border-zinc-700/80 shadow-sm"
                        : "text-zinc-400 hover:bg-zinc-900/80 hover:text-zinc-200"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`h-4 w-4 transition-colors ${
                          isActive
                            ? "text-blue-400"
                            : "text-zinc-500 group-hover:text-zinc-300"
                        }`}
                      />
                      <span>{item.name}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`rounded px-1.5 py-0.2 text-[9px] font-mono font-semibold ${item.badgeColor}`}
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

      {/* Bottom Footer Section */}
      <div className="border-t border-zinc-800/80 p-3 space-y-2">
        <button
          type="button"
          onClick={() => onNavigate("Settings")}
          className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
            activePage === "Settings"
              ? "bg-zinc-800 text-white"
              : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
          }`}
        >
          <Settings className="h-4 w-4 text-zinc-500" />
          <span>Settings</span>
        </button>

        {/* Engine Status Card */}
        <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/50 p-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[11px] font-mono font-medium text-zinc-300">
                Engine Active
              </span>
            </div>
            <Terminal className="h-3 w-3 text-zinc-500" />
          </div>

          <p className="mt-1 text-[10px] text-zinc-400 font-mono">
            FastAPI • AST Analyzer
          </p>
        </div>
      </div>
    </aside>
  );
}
