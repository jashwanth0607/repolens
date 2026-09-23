"use client";

import {
  LayoutDashboard,
  GitBranch,
  ShieldAlert,
  Network,
  Bot,
  FileText,
  Settings,
  Activity,
  Wrench,
} from "lucide-react";

type SidebarProps = {
  activePage: string;
  onNavigate: (page: string) => void;
};

export default function Sidebar({
  activePage,
  onNavigate,
}: SidebarProps) {
  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Repositories",
      icon: GitBranch,
    },
    {
      name: "Issues",
      icon: ShieldAlert,
    },
    {
      name: "Architecture",
      icon: Network,
    },
    {
      name: "AI Assistant",
      icon: Bot,
    },
    {
      name: "Reports",
      icon: FileText,
    },
    {
      name: "Tools",
      icon: Wrench,
    },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-slate-800 bg-[#0b1120]">
      {/* Brand */}
      <div className="flex h-20 items-center gap-3 border-b border-slate-800 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
          <GitBranch className="h-6 w-6 text-blue-400" />
        </div>

        <div>
          <h1 className="text-lg font-bold text-white">
            RepoLens
          </h1>

          <p className="text-xs text-slate-500">
            AI Repository Analyzer
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.name;

          return (
            <button
              key={item.name}
              type="button"
              onClick={() => onNavigate(item.name)}
              className={`group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                isActive
                  ? "bg-blue-500/10 text-blue-400"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <Icon
                className={`h-5 w-5 ${
                  isActive
                    ? "text-blue-400"
                    : "text-slate-500 group-hover:text-slate-300"
                }`}
              />

              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-slate-800 p-4">
        <button
          type="button"
          onClick={() => onNavigate("Settings")}
          className={`mb-3 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
            activePage === "Settings"
              ? "bg-blue-500/10 text-blue-400"
              : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
          }`}
        >
          <Settings className="h-5 w-5" />
          Settings
        </button>

        {/* System status */}
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-400" />

            <span className="text-xs font-medium text-emerald-400">
              System Ready
            </span>
          </div>

          <p className="mt-1 text-[11px] text-slate-500">
            Scanner and AI services available
          </p>
        </div>
      </div>
    </aside>
  );
}