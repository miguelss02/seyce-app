"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
  GraduationCap,
  UserCheck,
  FileCheck,
  Calculator,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const docenteLinks = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/dashboard/materias", label: "Materias", icon: BookOpen },
  { href: "/dashboard/grupos", label: "Grupos", icon: Users },
  { href: "/dashboard/equipos", label: "Equipos", icon: GraduationCap },
  { href: "/dashboard/actividades", label: "Actividades", icon: ClipboardList },
  { href: "/dashboard/registro", label: "Registro Diario", icon: FileCheck },
  { href: "/dashboard/evaluaciones", label: "Evaluaciones", icon: UserCheck },
  { href: "/dashboard/calificaciones", label: "Calificaciones", icon: Calculator },
  { href: "/dashboard/reportes", label: "Reportes", icon: BarChart3 },
];

const alumnoLinks = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/dashboard/mi-equipo", label: "Mi Equipo", icon: Users },
  { href: "/dashboard/mis-actividades", label: "Mis Actividades", icon: ClipboardList },
  { href: "/dashboard/autoevaluacion", label: "Autoevaluación", icon: UserCheck },
  { href: "/dashboard/coevaluacion", label: "Coevaluación", icon: FileCheck },
  { href: "/dashboard/mis-calificaciones", label: "Mis Calificaciones", icon: Calculator },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const isDocente = session?.user?.role === "docente" || session?.user?.role === "admin";
  const links = isDocente ? docenteLinks : alumnoLinks;

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 md:hidden bg-white p-2 rounded-lg shadow-md"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r border-gray-200
        transform transition-transform duration-200 ease-in-out
        ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-5 border-b border-gray-200">
            <h1 className="text-lg font-bold text-blue-800">SEYCE</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Sistema de Evaluación y Calificación en Equipo
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {links.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${active
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                >
                  <Icon size={18} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">
                {session?.user?.name?.[0] || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{session?.user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{session?.user?.role}</p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors w-full px-2 py-1.5 rounded hover:bg-red-50"
            >
              <LogOut size={16} />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
