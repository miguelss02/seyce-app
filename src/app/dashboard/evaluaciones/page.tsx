"use client";

import { useEffect, useState } from "react";
import { Star, Save, CheckCircle, Users } from "lucide-react";

interface Grupo {
  id: string;
  nombre: string;
  periodo: string;
}

interface Unidad {
  id: string;
  nombre: string;
  numero: number;
}

interface AutoEval {
  id: string;
  alumno: { id: string; nombre: string; apellido: string };
  puntaje: number;
  reflexion: string | null;
}

interface CoEval {
  id: string;
  evaluador: { id: string; nombre: string; apellido: string };
  evaluado: { id: string; nombre: string; apellido: string };
  puntaje: number;
  comentario: string | null;
}

interface HeteroEval {
  alumnoId: string;
  nombre: string;
  apellido: string;
  puntaje: number;
  tipo: string;
  id?: string;
}

type EvalTab = "auto" | "co" | "hetero";

const TIPOS_HETERO = [
  { value: "desempeno", label: "Desempeno" },
  { value: "actitudinal", label: "Actitudinal" },
  { value: "general", label: "General" },
];

export default function EvaluacionesPage() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [selectedGrupo, setSelectedGrupo] = useState("");
  const [selectedUnidad, setSelectedUnidad] = useState("");
  const [activeTab, setActiveTab] = useState<EvalTab>("auto");

  const [autoEvals, setAutoEvals] = useState<AutoEval[]>([]);
  const [coEvals, setCoEvals] = useState<CoEval[]>([]);
  const [heteroEvals, setHeteroEvals] = useState<HeteroEval[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/grupos")
      .then((r) => r.json())
      .then(setGrupos)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedGrupo) {
      setUnidades([]);
      setSelectedUnidad("");
      return;
    }
    fetch(`/api/unidades?grupoId=${selectedGrupo}`)
      .then((r) => r.json())
      .then(setUnidades)
      .catch(() => {});
    setSelectedUnidad("");
  }, [selectedGrupo]);

  useEffect(() => {
    if (!selectedUnidad || !selectedGrupo) return;
    fetchEvaluaciones();
  }, [selectedUnidad, activeTab]);

  const fetchEvaluaciones = async () => {
    setLoading(true);
    try {
      if (activeTab === "auto") {
        const res = await fetch(
          `/api/evaluaciones/autoevaluacion?unidadId=${selectedUnidad}&grupoId=${selectedGrupo}`
        );
        const data = await res.json();
        setAutoEvals(Array.isArray(data) ? data : []);
      } else if (activeTab === "co") {
        const res = await fetch(
          `/api/evaluaciones/coevaluacion?unidadId=${selectedUnidad}&grupoId=${selectedGrupo}`
        );
        const data = await res.json();
        setCoEvals(Array.isArray(data) ? data : []);
      } else {
        // Fetch alumnos and existing hetero evaluaciones
        const grupoRes = await fetch(`/api/grupos/${selectedGrupo}`);
        const grupoData = await grupoRes.json();
        const alumnos = (grupoData.inscripciones || []).map(
          (i: { alumno: { id: string; nombre: string; apellido: string } }) => i.alumno
        );

        const heteroRes = await fetch(
          `/api/evaluaciones/heteroevaluacion?unidadId=${selectedUnidad}&grupoId=${selectedGrupo}`
        );
        const existingHetero = await heteroRes.json();
        const heteroMap = new Map<string, HeteroEval>();
        if (Array.isArray(existingHetero)) {
          existingHetero.forEach((h: HeteroEval & { alumno?: { id: string } }) => {
            const aId = h.alumnoId || h.alumno?.id;
            if (aId) heteroMap.set(aId, h);
          });
        }

        setHeteroEvals(
          alumnos.map((a: { id: string; nombre: string; apellido: string }) => {
            const existing = heteroMap.get(a.id);
            return {
              alumnoId: a.id,
              nombre: a.nombre,
              apellido: a.apellido,
              puntaje: existing?.puntaje ?? 0,
              tipo: existing?.tipo ?? "general",
              id: existing?.id,
            };
          })
        );
      }
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHetero = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/evaluaciones/heteroevaluacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unidadId: selectedUnidad,
          grupoId: selectedGrupo,
          evaluaciones: heteroEvals.map((h) => ({
            alumnoId: h.alumnoId,
            puntaje: h.puntaje,
            tipo: h.tipo,
          })),
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      // handle error
    } finally {
      setSaving(false);
    }
  };

  const tabs: { key: EvalTab; label: string }[] = [
    { key: "auto", label: "Autoevaluaciones" },
    { key: "co", label: "Coevaluaciones" },
    { key: "hetero", label: "Heteroevaluaciones" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Evaluaciones</h1>
        <p className="text-gray-500 mt-1">Consulta y registra evaluaciones por unidad</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Unidad</label>
          <select
            value={selectedUnidad}
            onChange={(e) => setSelectedUnidad(e.target.value)}
            disabled={!selectedGrupo}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:text-gray-400"
          >
            <option value="">Selecciona una unidad</option>
            {unidades.map((u) => (
              <option key={u.id} value={u.id}>
                Unidad {u.numero}: {u.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!selectedUnidad ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Star size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Selecciona un grupo y una unidad para ver evaluaciones</p>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="text-gray-500">Cargando...</p>
          ) : (
            <>
              {/* Autoevaluaciones */}
              {activeTab === "auto" && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  {autoEvals.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-8">
                      No hay autoevaluaciones registradas
                    </p>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                            Alumno
                          </th>
                          <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                            Puntaje
                          </th>
                          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                            Reflexion
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {autoEvals.map((ae) => (
                          <tr key={ae.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                              {ae.alumno.nombre} {ae.alumno.apellido}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="bg-blue-50 text-blue-700 rounded-full px-2.5 py-0.5 text-xs font-medium">
                                {ae.puntaje}/10
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {ae.reflexion || "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* Coevaluaciones */}
              {activeTab === "co" && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  {coEvals.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-8">
                      No hay coevaluaciones registradas
                    </p>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                            Evaluador
                          </th>
                          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                            Evaluado
                          </th>
                          <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                            Puntaje
                          </th>
                          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                            Comentario
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {coEvals.map((ce) => (
                          <tr key={ce.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {ce.evaluador.nombre} {ce.evaluador.apellido}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {ce.evaluado.nombre} {ce.evaluado.apellido}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-0.5 text-xs font-medium">
                                {ce.puntaje}/10
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {ce.comentario || "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* Heteroevaluaciones */}
              {activeTab === "hetero" && (
                <div>
                  <div className="flex justify-end mb-4">
                    <button
                      onClick={handleSaveHetero}
                      disabled={saving || heteroEvals.length === 0}
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {saved ? (
                        <>
                          <CheckCircle size={16} />
                          Guardado
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          {saving ? "Guardando..." : "Guardar Evaluaciones"}
                        </>
                      )}
                    </button>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {heteroEvals.length === 0 ? (
                      <p className="text-gray-400 text-sm text-center py-8">
                        No hay alumnos en este grupo
                      </p>
                    ) : (
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                              Alumno
                            </th>
                            <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                              Tipo
                            </th>
                            <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                              Puntaje
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {heteroEvals.map((h, idx) => (
                            <tr key={h.alumnoId} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                {h.nombre} {h.apellido}
                              </td>
                              <td className="px-6 py-4 text-center">
                                <select
                                  value={h.tipo}
                                  onChange={(e) => {
                                    const updated = [...heteroEvals];
                                    updated[idx] = { ...updated[idx], tipo: e.target.value };
                                    setHeteroEvals(updated);
                                  }}
                                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                >
                                  {TIPOS_HETERO.map((t) => (
                                    <option key={t.value} value={t.value}>
                                      {t.label}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <input
                                  type="number"
                                  value={h.puntaje}
                                  onChange={(e) => {
                                    const updated = [...heteroEvals];
                                    updated[idx] = {
                                      ...updated[idx],
                                      puntaje: Number(e.target.value),
                                    };
                                    setHeteroEvals(updated);
                                  }}
                                  min={0}
                                  max={10}
                                  step={0.1}
                                  className="w-20 border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
