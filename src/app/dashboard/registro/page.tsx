"use client";

import { useEffect, useState } from "react";
import { ClipboardCheck, Save, CheckCircle } from "lucide-react";

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

interface Actividad {
  id: string;
  nombre: string;
  tipo: string;
}

interface Alumno {
  id: string;
  nombre: string;
  apellido: string;
}

interface RegistroRow {
  alumnoId: string;
  nombre: string;
  apellido: string;
  asistencia: boolean;
  participacion: boolean;
  calificacion: number;
  observaciones: string;
}

export default function RegistroPage() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [selectedGrupo, setSelectedGrupo] = useState("");
  const [selectedUnidad, setSelectedUnidad] = useState("");
  const [selectedActividad, setSelectedActividad] = useState("");
  const [registros, setRegistros] = useState<RegistroRow[]>([]);
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
      setActividades([]);
      setSelectedActividad("");
      return;
    }
    fetch(`/api/actividades?unidadId=${selectedUnidad}`)
      .then((r) => r.json())
      .then(setActividades)
      .catch(() => {});
    setSelectedActividad("");
  }, [selectedUnidad]);

  useEffect(() => {
    if (!selectedActividad || !selectedGrupo) {
      setRegistros([]);
      return;
    }
    loadRegistros();
  }, [selectedActividad]);

  const loadRegistros = async () => {
    setLoading(true);
    try {
      // Fetch alumnos from grupo
      const grupoRes = await fetch(`/api/grupos/${selectedGrupo}`);
      const grupoData = await grupoRes.json();
      const alumnos: Alumno[] = (grupoData.inscripciones || []).map(
        (i: { alumno: Alumno }) => i.alumno
      );

      // Fetch existing registros
      const regRes = await fetch(
        `/api/registro?actividadId=${selectedActividad}&grupoId=${selectedGrupo}`
      );
      const existingRegs = await regRes.json();
      const regMap = new Map<string, RegistroRow>();
      if (Array.isArray(existingRegs)) {
        existingRegs.forEach((r: RegistroRow & { alumnoId: string }) => {
          regMap.set(r.alumnoId, r);
        });
      }

      const rows: RegistroRow[] = alumnos.map((a) => {
        const existing = regMap.get(a.id);
        return {
          alumnoId: a.id,
          nombre: a.nombre,
          apellido: a.apellido,
          asistencia: existing?.asistencia ?? false,
          participacion: existing?.participacion ?? false,
          calificacion: existing?.calificacion ?? 0,
          observaciones: existing?.observaciones ?? "",
        };
      });

      setRegistros(rows);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const updateRow = (idx: number, field: keyof RegistroRow, value: unknown) => {
    setRegistros((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
    setSaved(false);
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actividadId: selectedActividad,
          grupoId: selectedGrupo,
          registros: registros.map((r) => ({
            alumnoId: r.alumnoId,
            asistencia: r.asistencia,
            participacion: r.participacion,
            calificacion: r.calificacion,
            observaciones: r.observaciones,
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Registro Diario</h1>
          <p className="text-gray-500 mt-1">
            Registra asistencia, participacion y calificaciones
          </p>
        </div>
        {registros.length > 0 && (
          <button
            onClick={handleSaveAll}
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
                {saving ? "Guardando..." : "Guardar Todo"}
              </>
            )}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Actividad</label>
          <select
            value={selectedActividad}
            onChange={(e) => setSelectedActividad(e.target.value)}
            disabled={!selectedUnidad}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:text-gray-400"
          >
            <option value="">Selecciona una actividad</option>
            {actividades.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nombre} ({a.tipo})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {!selectedActividad ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <ClipboardCheck size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">
            Selecciona grupo, unidad y actividad para comenzar el registro
          </p>
        </div>
      ) : loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : registros.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No hay alumnos inscritos en este grupo</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Alumno
                </th>
                <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Asistencia
                </th>
                <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Participacion
                </th>
                <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Calificacion
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Observaciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {registros.map((r, idx) => (
                <tr key={r.alumnoId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                    {r.nombre} {r.apellido}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={r.asistencia}
                      onChange={(e) => updateRow(idx, "asistencia", e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={r.participacion}
                      onChange={(e) => updateRow(idx, "participacion", e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="number"
                      value={r.calificacion}
                      onChange={(e) => updateRow(idx, "calificacion", Number(e.target.value))}
                      min={0}
                      max={10}
                      step={0.1}
                      className="w-20 border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={r.observaciones}
                      onChange={(e) => updateRow(idx, "observaciones", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Observaciones..."
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
