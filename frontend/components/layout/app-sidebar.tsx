"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Ticket,
  Package,
  CalendarDays,
  Settings,
  CalendarCheck,
  ChartNoAxesCombined,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Activity,
  UserCircle,
} from "lucide-react";
import {api} from "@/lib/api";

type Role = "USER" | "ADMIN";

type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

const userLinks = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Tickets", href: "/dashboard", icon: Ticket },
  { label: "Resources", href: "/resources", icon: Package },
  { label: "My Bookings", href: "/bookings", icon: CalendarDays },
];

const adminLinks = [
  { label: "Admin Resources", href: "/resources", icon: Settings },
  { label: "Manage Bookings", href: "/admin/bookings", icon: CalendarCheck },
  { label: "Analytics", href: "/admin", icon: ChartNoAxesCombined },
];

export default function AppSidebar({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;

    async function fetchUser() {
      try {
        const response = await api.get("/auth/me");

        if (active) {
          setUser(response.data.user);
        }
      } catch {
        router.replace("/login");
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchUser();

    return () => {
      active = false;
    };
  }, [router]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  async function handleLogout() {
    setLoggingOut(true);

    try {
      // JWT is stored client-side; remove it using your existing auth helper.
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");

      router.replace("/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  const links = [
    ...userLinks,
    ...(user?.role === "ADMIN" ? adminLinks : []),
  ];

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
      </div>
    );
  }

  function isActive(href: string) {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    if (href === "/admin") {
      return pathname === "/admin";
    }

    if (href === "/resources") {
      return pathname.startsWith("/resources");
    }

    if (href === "/admin/bookings") {
      return pathname.startsWith("/admin/bookings");
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile header */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
            <Activity size={20} />
          </div>
          <span className="text-lg font-bold text-slate-900">
            Triage<span className="text-blue-600">Sync</span>
          </span>
        </Link>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">
          <Link href="/dashboard" className="flex items-center gap-3">
           

            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                Triage<span className="text-blue-600">Sync</span>
              </h1>
            
            </div>
          </Link>

          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 lg:hidden"
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-7">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Workspace
          </p>

          <div className="space-y-1">
            {userLinks.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon
                    size={19}
                    className={
                      active
                        ? "text-blue-600"
                        : "text-slate-400 group-hover:text-slate-600"
                    }
                  />
                  <span>{item.label}</span>

                  {active && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-600" />
                  )}
                </Link>
              );
            })}
          </div>

          {user.role === "ADMIN" && (
            <div className="mt-9">
              <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Administration
              </p>

              <div className="space-y-1">
                {adminLinks.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                        active
                          ? "bg-blue-50 text-blue-700"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <Icon
                        size={19}
                        className={
                          active
                            ? "text-blue-600"
                            : "text-slate-400 group-hover:text-slate-600"
                        }
                      />
                      <span>{item.label}</span>

                      {active && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-600" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </nav>

        {/* User profile */}
        <div className="border-t border-slate-100 p-4">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
              <UserCircle size={23} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">
                {user.name}
              </p>
              <p className="truncate text-xs text-slate-500">
                {user.email}
              </p>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                {user.role}
              </span>
            </div>

            <ChevronDown size={15} className="text-slate-400" />
          </div>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
          >
            <LogOut size={18} />
            {loggingOut ? "Logging out..." : "Sign out"}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="min-h-screen lg:pl-64">
        {children}
      </main>
    </div>
  );
}