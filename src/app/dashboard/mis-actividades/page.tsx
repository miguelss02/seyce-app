"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ClipboardList, Check, X, BookOpen } from "lucide-react";

interface Registro {
  id: string;
  fecha: string;
  asistencia: boolean;
  participacion: boolean;
  calificacion: number | null;
  observaciones: string | null;
  actividad: {
    nombre: string;
    tipo: string;
    fecha: string;
    valorMax: number;
  };
}

export default function MisActividadesPage() {
  const { data: session } = useSession();
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    fetch("/api/mis-actividades")
      .then((r) => r.json())
      .then((data) => setRegistros(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session]);

  if (loading) return <div className="p-8 text-gray-500">Cargando...</div>;

  const tipoLabel: Record<string, string> = {
    tarea: "Tarea",
    practica: "Práctica",
    examen: "Examen",
    proyecto: "Proyecto",
    participacion: "Participación",
    ejercicio: "Ejercicio",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mis Actividades</h1>

      {registros.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
          No hay actividades registradas aún.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Actividad</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Tipo</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Asistencia</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Participación</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Calificación</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Observaciones</th>
              </tr>
            </thead>
            <tbody>
              {registros.map((r) => (
                <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{r.actividad.nombre}</td>
                  <td className="px-4 py-3">
                    <span className="bg-blue-50 text-blue-700 rounded-full px-2.5 py-0.5 text-xs font-medium">
                      {tipoLabel[r.actividad.tipo] || r.actividad.tipo}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(r.actividad.fecha).toLocaleDateString("es-MX")}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {r.asistencia ? (
                      <Check size={16} className="text-green-600 mx-auto" />
                    ) : (
                      <X size={16} className="text-red-500 mx-auto" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {r.participacion ? (
                      <Check size={16} className="text-green-600 mx-auto" />
                    ) : (
                      <X size={16} className="text-gray-300 mx-auto" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-center font-medium">
                    {r.calificacion !== null ? (
                      <span className={r.calificacion >= 6 ? "text-green-700" : "text-red-600"}>
                        {r.calificacion} / {r.actividad.valorMax}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{r.observaciones || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
