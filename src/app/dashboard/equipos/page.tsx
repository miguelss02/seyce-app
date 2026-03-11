"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Plus,
  Crown,
  Trash2,
  UserPlus,
  UserMinus,
  ChevronDown,
} from "lucide-react";

interface Alumno {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
}

interface Miembro {
  id: string;
  esJefe: boolean;
  alumno: Alumno;
}

interface Equipo {
  id: string;
  nombre: string;
  miembros: Miembro[];
}

interface Grupo {
  id: string;
  nombre: string;
  periodo: string;
  materia: { nombre: string };
  _count: { inscripciones: number };
}

interface GrupoDetalle {
  id: string;
  inscripciones: { id: string; alumno: Alumno }[];
}

export default function EquiposPage() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [grupoId, setGrupoId] = useState("");
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [grupoDetalle, setGrupoDetalle] = useState<GrupoDetalle | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCrear, setShowCrear] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [showAgregar, setShowAgregar] = useState<string | null>(null);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState("");

  useEffect(() => {
    fetch("/api/grupos")
      .then((r) => r.json())
      .then((data) => setGrupos(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!grupoId) {
      setEquipos([]);
      setGrupoDetalle(null);
      return;
    }
    setLoading(true);
    Promise.all([
      fetch(`/api/equipos?grupoId=${grupoId}`).then((r) => r.json()),
      fetch(`/api/grupos/${grupoId}`).then((r) => r.json()),
    ])
      .then(([eqs, det]) => {
        setEquipos(Array.isArray(eqs) ? eqs : []);
        setGrupoDetalle(det);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [grupoId]);

  const crearEquipo = async () => {
    if (!nuevoNombre.trim() || !grupoId) return;
    const res = await fetch("/api/equipos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: nuevoNombre, grupoId }),
    });
    if (res.ok) {
      const eq = await res.json();
      setEquipos((prev) => [...prev, eq]);
      setNuevoNombre("");
      setShowCrear(false);
    }
  };

  const eliminarEquipo = async (id: string) => {
    if (!confirm("¿Eliminar este equipo?")) return;
    const res = await fetch(`/api/equipos/${id}`, { method: "DELETE" });
    if (res.ok) setEquipos((prev) => prev.filter((e) => e.id !== id));
  };

  const agregarMiembro = async (equipoId: string) => {
    if (!alumnoSeleccionado) return;
    const res = await fetch(`/api/equipos/${equipoId}/miembros`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alumnoId: alumnoSeleccionado, esJefe: false }),
    });
    if (res.ok) {
      refreshEquipos();
      setAlumnoSeleccionado("");
      setShowAgregar(null);
    } else {
      const data = await res.json();
      alert(data.error || "Error al agregar miembro");
    }
  };

  const quitarMiembro = async (equipoId: string, alumnoId: string) => {
    const res = await fetch(`/api/equipos/${equipoId}/miembros`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alumnoId }),
    });
    if (res.ok) refreshEquipos();
  };

  const hacerJefe = async (equipoId: string, alumnoId: string) => {
    // Remove jefe from all, set new jefe
    const equipo = equipos.find((e) => e.id === equipoId);
    if (!equipo) return;

    // Quitar jefe actual
    const jefeActual = equipo.miembros.find((m) => m.esJefe);
    if (jefeActual) {
      await fetch(`/api/equipos/${equipoId}/miembros`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alumnoId: jefeActual.alumno.id }),
      });
      await fetch(`/api/equipos/${equipoId}/miembros`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alumnoId: jefeActual.alumno.id, esJefe: false }),
      });
    }

    // Quitar y re-agregar como jefe
    await fetch(`/api/equipos/${equipoId}/miembros`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alumnoId }),
    });
    await fetch(`/api/equipos/${equipoId}/miembros`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alumnoId, esJefe: true }),
    });

    refreshEquipos();
  };

  const refreshEquipos = () => {
    fetch(`/api/equipos?grupoId=${grupoId}`)
      .then((r) => r.json())
      .then((eqs) => setEquipos(Array.isArray(eqs) ? eqs : []))
      .catch(() => {});
  };

  // Alumnos no asignados a ningún equipo
  const alumnosAsignados = new Set(
    equipos.flatMap((e) => e.miembros.map((m) => m.alumno.id))
  );
  const alumnosDisponibles =
    grupoDetalle?.inscripciones
      .map((i) => i.alumno)
      .filter((a) => !alumnosAsignados.has(a.id)) ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Equipos</h1>
      </div>

      {/* Selector de grupo */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Seleccionar Grupo
        </label>
        <div className="relative max-w-md">
          <select
            value={grupoId}
            onChange={(e) => setGrupoId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white"
          >
            <option value="">-- Selecciona un grupo --</option>
            {grupos.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nombre} - {g.materia.nombre} ({g.periodo})
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>
      </div>

      {!grupoId && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
          Selecciona un grupo para ver y gestionar sus equipos.
        </div>
      )}

      {grupoId && loading && (
        <div className="text-gray-500">Cargando...</div>
      )}

      {grupoId && !loading && (
        <>
          {/* Header con botón crear */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-500">
              {equipos.length} equipo(s) &middot;{" "}
              {alumnosDisponibles.length} alumno(s) sin asignar
            </div>
            <button
              onClick={() => setShowCrear(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              Nuevo Equipo
            </button>
          </div>

          {/* Form crear equipo */}
          {showCrear && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del equipo
                  </label>
                  <input
                    value={nuevoNombre}
                    onChange={(e) => setNuevoNombre(e.target.value)}
                    placeholder="Ej: Equipo Gamma"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <button
                  onClick={crearEquipo}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                >
                  Crear
                </button>
                <button
                  onClick={() => {
                    setShowCrear(false);
                    setNuevoNombre("");
                  }}
                  className="px-4 py-2 text-gray-600 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Lista de equipos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {equipos.map((equipo) => (
              <div
                key={equipo.id}
                className="bg-white rounded-xl border border-gray-200 p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users size={18} className="text-violet-600" />
                    <h3 className="font-semibold text-gray-900">
                      {equipo.nombre}
                    </h3>
                    <span className="bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 text-xs">
                      {equipo.miembros.length} miembros
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        setShowAgregar(
                          showAgregar === equipo.id ? null : equipo.id
                        )
                      }
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Agregar miembro"
                    >
                      <UserPlus size={16} />
                    </button>
                    <button
                      onClick={() => eliminarEquipo(equipo.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar equipo"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Agregar miembro */}
                {showAgregar === equipo.id && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Alumno disponible
                        </label>
                        <select
                          value={alumnoSeleccionado}
                          onChange={(e) =>
                            setAlumnoSeleccionado(e.target.value)
                          }
                          className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm outline-none"
                        >
                          <option value="">Seleccionar...</option>
                          {alumnosDisponibles.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.nombre} {a.apellidos}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={() => agregarMiembro(equipo.id)}
                        className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                      >
                        Agregar
                      </button>
                    </div>
                    {alumnosDisponibles.length === 0 && (
                      <p className="text-xs text-gray-500 mt-2">
                        Todos los alumnos ya están asignados.
                      </p>
                    )}
                  </div>
                )}

                {/* Lista de miembros */}
                <div className="space-y-1.5">
                  {equipo.miembros.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-xs font-bold">
                          {m.alumno.nombre[0]}
                        </div>
                        <div>
                          <span className="text-sm font-medium">
                            {m.alumno.nombre} {m.alumno.apellidos}
                          </span>
                          {m.esJefe && (
                            <span className="ml-2 inline-flex items-center gap-0.5 bg-amber-100 text-amber-700 rounded-full px-2 py-0.5 text-xs font-medium">
                              <Crown size={10} />
                              Jefe
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {!m.esJefe && (
                          <button
                            onClick={() =>
                              hacerJefe(equipo.id, m.alumno.id)
                            }
                            className="p-1 text-amber-600 hover:bg-amber-50 rounded transition-colors"
                            title="Hacer jefe de equipo"
                          >
                            <Crown size={14} />
                          </button>
                        )}
                        <button
                          onClick={() =>
                            quitarMiembro(equipo.id, m.alumno.id)
                          }
                          className="p-1 text-red-400 hover:bg-red-50 rounded transition-colors"
                          title="Quitar del equipo"
                        >
                          <UserMinus size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {equipo.miembros.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-2">
                      Sin miembros aún
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {equipos.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
              No hay equipos en este grupo. Crea uno para empezar.
            </div>
          )}
        </>
      )}
    </div>
  );
}
