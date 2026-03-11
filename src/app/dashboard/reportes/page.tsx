"use client";

import { useEffect, useState } from "react";
import { BarChart3, FileText, Users, TrendingUp, TrendingDown } from "lucide-react";

interface Grupo {
  id: string;
  nombre: string;
  periodo: string;
}

interface AlumnoReporte {
  alumnoId: string;
  nombre: string;
  apellido: string;
  calificaciones: { unidad: string; calificacionFinal: number | null }[];
  promedio: number | null;
}

interface ReporteData {
  grupo: { nombre: string; periodo: string; materia: string };
  alumnos: AlumnoReporte[];
  resumen: {
    promedioGeneral: number;
    aprobados: number;
    reprobados: number;
    totalAlumnos: number;
  };
  unidades: string[];
}

export default function ReportesPage() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [selectedGrupo, setSelectedGrupo] = useState("");
  const [reporte, setReporte] = useState<ReporteData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/grupos")
      .then((r) => r.json())
      .then(setGrupos)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedGrupo) {
      setReporte(null);
      return;
    }
    setLoading(true);
    fetch(`/api/reportes/grupo/${selectedGrupo}`)
      .then((r) => r.json())
      .then(setReporte)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedGrupo]);

  const formatNum = (n: number | null) => (n != null ? n.toFixed(1) : "—");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
        <p className="text-gray-500 mt-1">Reporte integral de calificaciones por grupo</p>
      </div>

      {/* Filter */}
      <div className="max-w-sm mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Grupo</label>
        <select
          value={selectedGrupo}
          onChange={(e) => setSelectedGrupo(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        >
          <option value="">Selecciona un grupo</option>
          {grupos.map((g) => (
            <option key={g.id} value={g.id}>
              {g.nombre} - {g.periodo}
            </option>
          ))}
        </select>
      </div>

      {!selectedGrupo ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <BarChart3 size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Selecciona un grupo para ver el reporte</p>
        </div>
      ) : loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : !reporte ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No se pudo cargar el reporte</p>
        </div>
      ) : (
        <>
          {/* Grupo Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">{reporte.grupo.nombre}</h2>
            <p className="text-sm text-gray-500">
              {reporte.grupo.materia} &middot; {reporte.grupo.periodo}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-1">
                <Users size={16} className="text-gray-400" />
                <span className="text-xs text-gray-500 uppercase font-medium">Total Alumnos</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{reporte.resumen.totalAlumnos}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-1">
                <FileText size={16} className="text-gray-400" />
                <span className="text-xs text-gray-500 uppercase font-medium">Promedio General</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{reporte.resumen.promedioGeneral.toFixed(1)}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={16} className="text-emerald-500" />
                <span className="text-xs text-gray-500 uppercase font-medium">Aprobados</span>
              </div>
              <p className="text-2xl font-bold text-emerald-600">{reporte.resumen.aprobados}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown size={16} className="text-red-500" />
                <span className="text-xs text-gray-500 uppercase font-medium">Reprobados</span>
              </div>
              <p className="text-2xl font-bold text-red-600">{reporte.resumen.reprobados}</p>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Alumno
                  </th>
                  {reporte.unidades.map((u) => (
                    <th
                      key={u}
                      className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3"
                    >
                      {u}
                    </th>
                  ))}
                  <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Promedio
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reporte.alumnos.map((a) => (
                  <tr key={a.alumnoId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {a.nombre} {a.apellido}
                    </td>
                    {reporte.unidades.map((u) => {
                      const cal = a.calificaciones.find((c) => c.unidad === u);
                      const val = cal?.calificacionFinal;
                      return (
                        <td key={u} className="px-4 py-4 text-center text-sm text-gray-700">
                          {formatNum(val ?? null)}
                        </td>
                      );
                    })}
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          (a.promedio ?? 0) >= 6
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {formatNum(a.promedio)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
