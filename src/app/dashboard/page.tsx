"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  Users,
  BookOpen,
  ClipboardList,
  BarChart3,
  GraduationCap,
  TrendingUp,
  CheckCircle,
  Clock,
} from "lucide-react";

interface Stats {
  grupos: number;
  alumnos: number;
  equipos: number;
  actividades: number;
  evaluacionesPendientes: number;
  calificacionesConfirmadas: number;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  const isDocente = session?.user?.role === "docente" || session?.user?.role === "admin";

  const cards = isDocente
    ? [
        { label: "Grupos Activos", value: stats?.grupos ?? 0, icon: BookOpen, color: "bg-blue-500" },
        { label: "Alumnos", value: stats?.alumnos ?? 0, icon: Users, color: "bg-emerald-500" },
        { label: "Equipos", value: stats?.equipos ?? 0, icon: GraduationCap, color: "bg-violet-500" },
        { label: "Actividades", value: stats?.actividades ?? 0, icon: ClipboardList, color: "bg-amber-500" },
      ]
    : [
        { label: "Mis Materias", value: stats?.grupos ?? 0, icon: BookOpen, color: "bg-blue-500" },
        { label: "Mi Equipo", value: stats?.equipos ?? 0, icon: Users, color: "bg-emerald-500" },
        { label: "Actividades", value: stats?.actividades ?? 0, icon: ClipboardList, color: "bg-violet-500" },
        { label: "Calificaciones", value: stats?.calificacionesConfirmadas ?? 0, icon: CheckCircle, color: "bg-amber-500" },
      ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Bienvenido, {session?.user?.name?.split(" ")[0]}
        </h1>
        <p className="text-gray-500 mt-1">
          {isDocente
            ? "Panel de control del docente"
            : "Tu panel de actividades y evaluaciones"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`${card.color} p-2.5 rounded-lg`}>
                  <Icon size={20} className="text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      {isDocente && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Acciones Rápidas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { label: "Registrar Actividad", href: "/dashboard/actividades", icon: ClipboardList, desc: "Crear nueva tarea, examen o práctica" },
              { label: "Ver Registro Diario", href: "/dashboard/registro", icon: Clock, desc: "Consultar asistencia y participación" },
              { label: "Calcular Calificaciones", href: "/dashboard/calificaciones", icon: TrendingUp, desc: "Generar calificaciones por unidad" },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <a
                  key={action.label}
                  href={action.href}
                  className="flex items-start gap-3 p-4 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-colors"
                >
                  <Icon size={20} className="text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{action.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{action.desc}</p>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
