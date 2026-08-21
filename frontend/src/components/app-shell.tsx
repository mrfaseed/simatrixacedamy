import React, { useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  BarChart3,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  LogOut,
  User,
  ChevronsLeft,
  GraduationCap,
  HelpCircle,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Simatrix Academy brand palette (matched to logo, light theme only)
// Bright blue  -> #1358E0
// Blue-violet  -> #4B3CC7
// Violet       -> #7C3AED

interface NavItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  active?: boolean;
  children?: { label: string; href: string }[];
}

const navigation: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "#", active: true },
  {
    label: "Courses",
    icon: BookOpen,
    children: [
      { label: "All Courses", href: "#" },
      { label: "Categories", href: "#" },
      { label: "Add New", href: "#" },
    ],
  },
  {
    label: "Students",
    icon: Users,
    children: [
      { label: "All Students", href: "#" },
      { label: "Enrollments", href: "#" },
      { label: "Certificates", href: "#" },
    ],
  },
  { label: "Analytics", icon: BarChart3, href: "#" },
  { label: "Awards", icon: Award, href: "#" },
  { label: "Help Center", icon: HelpCircle, href: "#" },
  { label: "Settings", icon: Settings, href: "#" },
];

function SidebarNavItem({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const [open, setOpen] = useState(false);

  if (item.children) {
    return (
      <Collapsible open={open && !collapsed} onOpenChange={setOpen}>
        <CollapsibleTrigger
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            "text-slate-600 hover:bg-[#1358E0]/5 hover:text-[#1358E0]",
            collapsed && "justify-center px-2"
          )}
        >
          <item.icon className="h-5 w-5 shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">{item.label}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform duration-200",
                  open && "rotate-180"
                )}
              />
            </>
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-[collapse_200ms] data-[state=open]:animate-[expand_200ms]">
          <div className="ml-8 mt-1 flex flex-col gap-0.5 border-l border-[#1358E0]/15 pl-3">
            {item.children.map((child) => (
              <a
                key={child.label}
                href={child.href}
                className="rounded-md px-3 py-1.5 text-sm text-slate-500 transition-colors hover:bg-[#1358E0]/5 hover:text-[#1358E0]"
              >
                {child.label}
              </a>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <a
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        item.active
          ? "bg-gradient-to-r from-[#1358E0] to-[#4B3CC7] text-white shadow-sm shadow-[#1358E0]/20"
          : "text-slate-600 hover:bg-[#1358E0]/5 hover:text-[#1358E0]",
        collapsed && "justify-center px-2"
      )}
    >
      <item.icon className="h-5 w-5 shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </a>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#F7F9FF]">
      {/* ---- Mobile overlay ---- */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ---- Sidebar ---- */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-white transition-all duration-300 lg:relative lg:z-auto",
          sidebarOpen ? "w-64" : "w-[68px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#1358E0] to-[#7C3AED] shadow-sm shadow-[#7C3AED]/25">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <h1 className="truncate text-base font-bold tracking-tight text-slate-900">
                Simatrix
              </h1>
              <p className="truncate text-[11px] text-slate-400">Academy Dashboard</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto hidden rounded-md p-1 text-slate-400 transition-colors hover:bg-[#1358E0]/5 hover:text-[#1358E0] lg:flex"
          >
            <ChevronsLeft
              className={cn(
                "h-4 w-4 transition-transform duration-300",
                !sidebarOpen && "rotate-180"
              )}
            />
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto rounded-md p-1 text-slate-400 hover:text-[#1358E0] lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="flex flex-col gap-1">
            {navigation.map((item) => (
              <SidebarNavItem key={item.label} item={item} collapsed={!sidebarOpen} />
            ))}
          </div>
        </nav>

        {/* Bottom user card */}
        <div className="border-t border-slate-200 p-3">
          <div
            className={cn(
              "flex items-center gap-3 rounded-lg px-2 py-2",
              !sidebarOpen && "justify-center px-0"
            )}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            {sidebarOpen && (
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-slate-900">Admin User</p>
                <p className="truncate text-xs text-slate-500">admin@simatrix.edu</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ---- Main area ---- */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-slate-200 bg-white px-4 lg:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-md p-1.5 text-slate-500 hover:bg-[#1358E0]/5 hover:text-[#1358E0] lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search courses, students…"
              className="h-9 w-full rounded-lg border border-slate-200 bg-[#F7F9FF] pl-9 pr-4 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-[#1358E0]/40 focus:bg-white focus:ring-1 focus:ring-[#1358E0]/15"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <button className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-[#1358E0]/5 hover:text-[#1358E0]">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#7C3AED]" />
            </button>

            <Separator orientation="vertical" className="mx-1 h-6" />

            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-[#1358E0]/5 focus:outline-none">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face" />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
                <span className="hidden font-medium text-slate-700 md:inline-block">
                  Admin
                </span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-rose-600 focus:text-rose-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AppShell;