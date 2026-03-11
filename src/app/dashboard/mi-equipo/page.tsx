"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Users, Crown, BookOpen } from "lucide-react";

interface Miembro {
  id: string;
  esJefe: boolean;
  alumno: { id: string; nombre: string; apellidos: string; email: string };
}

interface Equipo {
  id: string;
  nombre: string;
  miembros: Miembro[];
}

interface GrupoInfo {
  grupoNombre: string;
  materiaNombre: string;
  periodo: string;
  equipo: Equipo | null;
}

export default function MiEquipoPage() {
  const { data: session } = useSession();
  const [grupos, setGrupos] = useState<GrupoInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    fetch("/api/mi-equipo")
      .then((r) => r.json())
      .then((data) => setGrupos(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session]);

  if (loading) return <div className="p-8 text-gray-500">Cargando...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mi Equipo</h1>

      {grupos.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
          No estás inscrito en ningún grupo o equipo.
        </div>
      ) : (
        <div className="space-y-6">
          {grupos.map((g, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen size={18} className="text-blue-600" />
                <h2 className="text-lg font-semibold">{g.materiaNombre}</h2>
                <span className="text-sm text-gray-500">
                  - {g.grupoNombre} ({g.periodo})
                </span>
              </div>

              {g.equipo ? (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Users size={16} className="text-violet-600" />
                    <span className="font-medium">{g.equipo.nombre}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {g.equipo.miembros.map((m) => (
                      <div
                        key={m.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border ${
                          m.alumno.id === session?.user?.id
                            ? "border-blue-200 bg-blue-50"
                            : "border-gray-100"
                        }`}
                      >
                        <div className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold">
                          {m.alumno.nombre[0]}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {m.alumno.nombre} {m.alumno.apellidos}
                          </p>
                          <p className="text-xs text-gray-500">{m.alumno.email}</p>
                        </div>
                        {m.esJefe && (
                          <span className="flex items-center gap-1 bg-amber-100 text-amber-700 rounded-full px-2.5 py-0.5 text-xs font-medium">
                            <Crown size={12} />
                            Jefe
                          </span>
                        )}
                        {m.alumno.id === session?.user?.id && (
                          <span className="bg-blue-100 text-blue-700 rounded-full px-2.5 py-0.5 text-xs font-medium">
                            Tú
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Aún no has sido asignado a un equipo en este grupo.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
