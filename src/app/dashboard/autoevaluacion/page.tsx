"use client";

import { useEffect, useState } from "react";
import { Star, Save, CheckCircle } from "lucide-react";

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

interface AutoEvalExisting {
  id: string;
  puntaje: number;
  reflexion: string | null;
}

export default function AutoevaluacionPage() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [selectedGrupo, setSelectedGrupo] = useState("");
  const [selectedUnidad, setSelectedUnidad] = useState("");
  const [puntaje, setPuntaje] = useState<number>(0);
  const [reflexion, setReflexion] = useState("");
  const [existing, setExisting] = useState<AutoEvalExisting | null>(null);
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
    if (!selectedUnidad) {
      setExisting(null);
      setPuntaje(0);
      setReflexion("");
      return;
    }
    setLoading(true);
    fetch(`/api/evaluaciones/autoevaluacion?unidadId=${selectedUnidad}`)
      .then((r) => r.json())
      .then((data) => {
        if (data && !Array.isArray(data) && data.id) {
          setExisting(data);
          setPuntaje(data.puntaje);
          setReflexion(data.reflexion || "");
        } else if (Array.isArray(data) && data.length > 0) {
          // If API returns the user's own eval
          const own = data[0];
          setExisting(own);
          setPuntaje(own.puntaje);
          setReflexion(own.reflexion || "");
        } else {
          setExisting(null);
          setPuntaje(0);
          setReflexion("");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedUnidad]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/evaluaciones/autoevaluacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unidadId: selectedUnidad,
          grupoId: selectedGrupo,
          puntaje,
          reflexion,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        const data = await res.json();
        setExisting(data);
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
        <h1 className="text-2xl font-bold text-gray-900">Autoevaluacion</h1>
        <p className="text-gray-500 mt-1">Evalua tu propio desempeno en la unidad</p>
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
          <p className="text-gray-500">Selecciona un grupo y una unidad para autoevaluarte</p>
        </div>
      ) : loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-xl">
          {existing && (
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                Ya tienes una autoevaluacion registrada. Puedes actualizarla.
              </p>
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Puntaje (0-10)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={0.5}
                  value={puntaje}
                  onChange={(e) => setPuntaje(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="bg-blue-50 text-blue-700 rounded-full px-3 py-1 text-sm font-bold min-w-[3rem] text-center">
                  {puntaje}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reflexion
              </label>
              <textarea
                value={reflexion}
                onChange={(e) => setReflexion(e.target.value)}
                rows={5}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Reflexiona sobre tu desempeno en esta unidad..."
              />
            </div>

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
                  {saving ? "Guardando..." : "Guardar Autoevaluacion"}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
