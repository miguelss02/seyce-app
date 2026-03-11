"use client";

import { useEffect, useState } from "react";
import { Users, Save, CheckCircle, Star } from "lucide-react";

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

interface Teammate {
  alumnoId: string;
  nombre: string;
  apellido: string;
  puntaje: number;
  comentario: string;
}

export default function CoevaluacionPage() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [selectedGrupo, setSelectedGrupo] = useState("");
  const [selectedUnidad, setSelectedUnidad] = useState("");
  const [teammates, setTeammates] = useState<Teammate[]>([]);
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
    if (!selectedUnidad || !selectedGrupo) {
      setTeammates([]);
      return;
    }
    loadTeammates();
  }, [selectedUnidad]);

  const loadTeammates = async () => {
    setLoading(true);
    try {
      // Get grupo detail to find the user's equipo and teammates
      const grupoRes = await fetch(`/api/grupos/${selectedGrupo}`);
      const grupoData = await grupoRes.json();

      // Get existing coevaluaciones
      const coRes = await fetch(
        `/api/evaluaciones/coevaluacion?unidadId=${selectedUnidad}&grupoId=${selectedGrupo}`
      );
      const coData = await coRes.json();
      const coMap = new Map<string, { puntaje: number; comentario: string }>();
      if (Array.isArray(coData)) {
        coData.forEach((c: { evaluado?: { id: string }; evaluadoId?: string; puntaje: number; comentario: string | null }) => {
          const evalId = c.evaluado?.id || c.evaluadoId;
          if (evalId) coMap.set(evalId, { puntaje: c.puntaje, comentario: c.comentario || "" });
        });
      }

      // Find teammates - the API should provide equipo members
      // We look through all equipos to find the user's equipo
      const allMembers: Teammate[] = [];
      if (grupoData.equipos) {
        for (const equipo of grupoData.equipos) {
          if (equipo.miembros) {
            // Check if user is in this equipo (we check all equipos, the API
            // might filter for us, or we show all equipo members)
            for (const m of equipo.miembros) {
              const existing = coMap.get(m.alumno.id);
              allMembers.push({
                alumnoId: m.alumno.id,
                nombre: m.alumno.nombre,
                apellido: m.alumno.apellido,
                puntaje: existing?.puntaje ?? 0,
                comentario: existing?.comentario ?? "",
              });
            }
          }
        }
      }

      setTeammates(allMembers);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const updateTeammate = (idx: number, field: "puntaje" | "comentario", value: string | number) => {
    setTeammates((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/evaluaciones/coevaluacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unidadId: selectedUnidad,
          grupoId: selectedGrupo,
          evaluaciones: teammates.map((t) => ({
            evaluadoId: t.alumnoId,
            puntaje: t.puntaje,
            comentario: t.comentario,
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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Coevaluacion</h1>
        <p className="text-gray-500 mt-1">Evalua el desempeno de tus companeros de equipo</p>
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
          <Users size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Selecciona un grupo y una unidad para evaluar a tus companeros</p>
        </div>
      ) : loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : teammates.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Users size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No se encontraron companeros de equipo</p>
        </div>
      ) : (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={handleSave}
              disabled={saving}
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

          <div className="space-y-4">
            {teammates.map((t, idx) => (
              <div
                key={t.alumnoId}
                className="bg-white rounded-xl border border-gray-200 p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-gray-900">
                    {t.nombre} {t.apellido}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Star size={16} className="text-amber-400" />
                    <span className="bg-amber-50 text-amber-700 rounded-full px-2.5 py-0.5 text-xs font-bold">
                      {t.puntaje}/10
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Puntaje (0-10)
                    </label>
                    <input
                      type="number"
                      value={t.puntaje}
                      onChange={(e) => updateTeammate(idx, "puntaje", Number(e.target.value))}
                      min={0}
                      max={10}
                      step={0.5}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Comentario
                    </label>
                    <input
                      type="text"
                      value={t.comentario}
                      onChange={(e) => updateTeammate(idx, "comentario", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Comenta sobre el desempeno de tu companero..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
