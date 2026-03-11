"use client";

import { useEffect, useState } from "react";
import { Calculator, RefreshCw, CheckCircle } from "lucide-react";

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

interface Criterio {
  id: string;
  nombre: string;
  porcentaje: number;
}

interface Calificacion {
  id: string;
  alumno: { id: string; nombre: string; apellido: string };
  actitudinal: number | null;
  desempeno: number | null;
  heteroevaluacion: number | null;
  evidencias: number | null;
  calificacionFinal: number | null;
  confirmada: boolean;
}

export default function CalificacionesPage() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [criterios, setCriterios] = useState<Criterio[]>([]);
  const [calificaciones, setCalificaciones] = useState<Calificacion[]>([]);
  const [selectedGrupo, setSelectedGrupo] = useState("");
  const [selectedUnidad, setSelectedUnidad] = useState("");
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);

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
      setCalificaciones([]);
      setCriterios([]);
      return;
    }
    fetchData();
  }, [selectedUnidad]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [calRes, critRes] = await Promise.all([
        fetch(`/api/calificaciones?unidadId=${selectedUnidad}`),
        fetch(`/api/unidades/${selectedUnidad}/criterios`),
      ]);
      const calData = await calRes.json();
      const critData = await critRes.json();
      setCalificaciones(Array.isArray(calData) ? calData : []);
      setCriterios(Array.isArray(critData) ? critData : []);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const handleCalcular = async () => {
    setCalculating(true);
    try {
      const res = await fetch("/api/calificaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unidadId: selectedUnidad, grupoId: selectedGrupo }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch {
      // handle error
    } finally {
      setCalculating(false);
    }
  };

  const formatNum = (n: number | null) => (n != null ? n.toFixed(1) : "—");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calificaciones</h1>
          <p className="text-gray-500 mt-1">Calcula y consulta calificaciones por unidad</p>
        </div>
        {selectedUnidad && (
          <button
            onClick={handleCalcular}
            disabled={calculating}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Calculator size={16} />
            {calculating ? "Calculando..." : "Calcular Calificaciones"}
          </button>
        )}
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
          <Calculator size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Selecciona un grupo y una unidad</p>
        </div>
      ) : loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : (
        <>
          {/* Criterios Summary */}
          {criterios.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Criterios de Evaluacion</h3>
              <div className="flex flex-wrap gap-2">
                {criterios.map((c) => (
                  <span
                    key={c.id}
                    className="bg-blue-50 text-blue-700 rounded-full px-2.5 py-0.5 text-xs font-medium"
                  >
                    {c.nombre}: {c.porcentaje}%
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
            {calificaciones.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">
                No hay calificaciones calculadas. Presiona &quot;Calcular Calificaciones&quot;.
              </p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                      Alumno
                    </th>
                    <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                      Actitudinal
                    </th>
                    <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                      Desempeno
                    </th>
                    <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                      Heteroevaluacion
                    </th>
                    <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                      Evidencias
                    </th>
                    <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                      Final
                    </th>
                    <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {calificaciones.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {c.alumno.nombre} {c.alumno.apellido}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-700">
                        {formatNum(c.actitudinal)}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-700">
                        {formatNum(c.desempeno)}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-700">
                        {formatNum(c.heteroevaluacion)}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-700">
                        {formatNum(c.evidencias)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            (c.calificacionFinal ?? 0) >= 6
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {formatNum(c.calificacionFinal)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {c.confirmada ? (
                          <span className="bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-0.5 text-xs font-medium inline-flex items-center gap-1">
                            <CheckCircle size={12} />
                            Confirmada
                          </span>
                        ) : (
                          <span className="bg-amber-50 text-amber-700 rounded-full px-2.5 py-0.5 text-xs font-medium">
                            Pendiente
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
