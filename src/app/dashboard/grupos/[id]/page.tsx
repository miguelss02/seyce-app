"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Users,
  Plus,
  X,
  Trash2,
  Crown,
  BookOpen,
  Layers,
  UserPlus,
  UserMinus,
} from "lucide-react";

interface Alumno {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
}

interface Inscripcion {
  id: string;
  alumno: Alumno;
}

interface MiembroEquipo {
  id: string;
  esJefe: boolean;
  alumno: Alumno;
}

interface Equipo {
  id: string;
  nombre: string;
  miembros: MiembroEquipo[];
}

interface Criterio {
  id: string;
  nombre: string;
  porcentaje: number;
}

interface Unidad {
  id: string;
  nombre: string;
  numero: number;
  criterios: Criterio[];
}

interface Materia {
  id: string;
  nombre: string;
}

interface Grupo {
  id: string;
  nombre: string;
  periodo: string;
  materia: Materia;
  inscripciones: Inscripcion[];
  equipos: Equipo[];
  unidades: Unidad[];
}

type Tab = "alumnos" | "equipos" | "unidades";

export default function GrupoDetailPage() {
  const params = useParams();
  const grupoId = params.id as string;

  const [grupo, setGrupo] = useState<Grupo | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("alumnos");

  // Alumnos
  const [emailAlumno, setEmailAlumno] = useState("");
  const [addingAlumno, setAddingAlumno] = useState(false);

  // Equipos
  const [showEquipoModal, setShowEquipoModal] = useState(false);
  const [equipoForm, setEquipoForm] = useState({ nombre: "" });
  const [savingEquipo, setSavingEquipo] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedEquipoId, setSelectedEquipoId] = useState("");
  const [memberAlumnoId, setMemberAlumnoId] = useState("");
  const [memberEsJefe, setMemberEsJefe] = useState(false);

  // Unidades
  const [showUnidadModal, setShowUnidadModal] = useState(false);
  const [unidadForm, setUnidadForm] = useState({ nombre: "", numero: 1 });
  const [savingUnidad, setSavingUnidad] = useState(false);
  const [editingCriterios, setEditingCriterios] = useState<string | null>(null);
  const [criteriosForm, setCriteriosForm] = useState<Criterio[]>([]);

  const fetchGrupo = () => {
    setLoading(true);
    fetch(`/api/grupos/${grupoId}`)
      .then((r) => r.json())
      .then((data) => setGrupo(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (grupoId) fetchGrupo();
  }, [grupoId]);

  const handleAddAlumno = async () => {
    if (!emailAlumno.trim()) return;
    setAddingAlumno(true);
    try {
      const res = await fetch(`/api/grupos/${grupoId}/inscripciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailAlumno }),
      });
      if (res.ok) {
        setEmailAlumno("");
        fetchGrupo();
      }
    } catch {
      // handle error
    } finally {
      setAddingAlumno(false);
    }
  };

  const handleRemoveAlumno = async (inscripcionId: string) => {
    try {
      await fetch(`/api/grupos/${grupoId}/inscripciones`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inscripcionId }),
      });
      fetchGrupo();
    } catch {
      // handle error
    }
  };

  const handleCreateEquipo = async () => {
    setSavingEquipo(true);
    try {
      const res = await fetch("/api/equipos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...equipoForm, grupoId }),
      });
      if (res.ok) {
        setEquipoForm({ nombre: "" });
        setShowEquipoModal(false);
        fetchGrupo();
      }
    } catch {
      // handle error
    } finally {
      setSavingEquipo(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedEquipoId || !memberAlumnoId) return;
    try {
      const res = await fetch(`/api/equipos/${selectedEquipoId}/miembros`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alumnoId: memberAlumnoId, esJefe: memberEsJefe }),
      });
      if (res.ok) {
        setShowAddMemberModal(false);
        setMemberAlumnoId("");
        setMemberEsJefe(false);
        fetchGrupo();
      }
    } catch {
      // handle error
    }
  };

  const handleRemoveMember = async (equipoId: string, miembroId: string) => {
    try {
      await fetch(`/api/equipos/${equipoId}/miembros`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ miembroId }),
      });
      fetchGrupo();
    } catch {
      // handle error
    }
  };

  const handleCreateUnidad = async () => {
    setSavingUnidad(true);
    try {
      const res = await fetch("/api/unidades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...unidadForm, grupoId }),
      });
      if (res.ok) {
        setUnidadForm({ nombre: "", numero: 1 });
        setShowUnidadModal(false);
        fetchGrupo();
      }
    } catch {
      // handle error
    } finally {
      setSavingUnidad(false);
    }
  };

  const handleSaveCriterios = async (unidadId: string) => {
    try {
      await fetch(`/api/unidades/${unidadId}/criterios`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ criterios: criteriosForm }),
      });
      setEditingCriterios(null);
      fetchGrupo();
    } catch {
      // handle error
    }
  };

  if (loading) return <p className="text-gray-500">Cargando...</p>;
  if (!grupo) return <p className="text-gray-500">Grupo no encontrado</p>;

  const alumnos = grupo.inscripciones.map((i) => ({ ...i.alumno, inscripcionId: i.id }));

  const tabs: { key: Tab; label: string; icon: typeof Users }[] = [
    { key: "alumnos", label: "Alumnos", icon: Users },
    { key: "equipos", label: "Equipos", icon: Layers },
    { key: "unidades", label: "Unidades", icon: BookOpen },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{grupo.nombre}</h1>
        <div className="flex items-center gap-3 mt-1">
          <span className="bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-0.5 text-xs font-medium">
            {grupo.periodo}
          </span>
          <span className="text-sm text-gray-500">{grupo.materia?.nombre}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Alumnos Tab */}
      {activeTab === "alumnos" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <input
              type="email"
              value={emailAlumno}
              onChange={(e) => setEmailAlumno(e.target.value)}
              placeholder="Email del alumno a inscribir"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <button
              onClick={handleAddAlumno}
              disabled={addingAlumno || !emailAlumno.trim()}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <UserPlus size={16} />
              {addingAlumno ? "Agregando..." : "Inscribir"}
            </button>
          </div>

          {alumnos.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No hay alumnos inscritos</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Nombre</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Email</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {alumnos.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 text-sm text-gray-900">{a.nombre} {a.apellido}</td>
                    <td className="py-3 text-sm text-gray-500">{a.email}</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleRemoveAlumno(a.inscripcionId)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Equipos Tab */}
      {activeTab === "equipos" && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowEquipoModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              Nuevo Equipo
            </button>
          </div>

          {grupo.equipos.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Layers size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No hay equipos creados</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {grupo.equipos.map((eq) => (
                <div key={eq.id} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-semibold text-gray-900">{eq.nombre}</h3>
                    <button
                      onClick={() => {
                        setSelectedEquipoId(eq.id);
                        setShowAddMemberModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                    >
                      <UserPlus size={14} />
                      Agregar
                    </button>
                  </div>
                  {eq.miembros.length === 0 ? (
                    <p className="text-sm text-gray-400">Sin miembros</p>
                  ) : (
                    <div className="space-y-2">
                      {eq.miembros.map((m) => (
                        <div key={m.id} className="flex items-center justify-between py-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-700">
                              {m.alumno.nombre} {m.alumno.apellido}
                            </span>
                            {m.esJefe && (
                              <span className="bg-amber-50 text-amber-700 rounded-full px-2.5 py-0.5 text-xs font-medium flex items-center gap-1">
                                <Crown size={10} />
                                Jefe
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemoveMember(eq.id, m.id)}
                            className="text-red-400 hover:text-red-600 transition-colors"
                          >
                            <UserMinus size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Create Equipo Modal */}
          {showEquipoModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/40" onClick={() => setShowEquipoModal(false)} />
              <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Nuevo Equipo</h2>
                  <button onClick={() => setShowEquipoModal(false)} className="text-gray-400 hover:text-gray-600">
                    <X size={20} />
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Equipo</label>
                  <input
                    type="text"
                    value={equipoForm.nombre}
                    onChange={(e) => setEquipoForm({ nombre: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Ej. Equipo Alpha"
                  />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowEquipoModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreateEquipo}
                    disabled={savingEquipo || !equipoForm.nombre}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {savingEquipo ? "Guardando..." : "Crear Equipo"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add Member Modal */}
          {showAddMemberModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/40" onClick={() => setShowAddMemberModal(false)} />
              <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Agregar Miembro</h2>
                  <button onClick={() => setShowAddMemberModal(false)} className="text-gray-400 hover:text-gray-600">
                    <X size={20} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alumno</label>
                    <select
                      value={memberAlumnoId}
                      onChange={(e) => setMemberAlumnoId(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      <option value="">Selecciona un alumno</option>
                      {alumnos.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.nombre} {a.apellido}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="esJefe"
                      checked={memberEsJefe}
                      onChange={(e) => setMemberEsJefe(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="esJefe" className="text-sm text-gray-700">Es jefe de equipo</label>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowAddMemberModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAddMember}
                    disabled={!memberAlumnoId}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    Agregar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Unidades Tab */}
      {activeTab === "unidades" && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowUnidadModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              Nueva Unidad
            </button>
          </div>

          {grupo.unidades.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No hay unidades creadas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {grupo.unidades
                .sort((a, b) => a.numero - b.numero)
                .map((u) => (
                  <div key={u.id} className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-semibold text-gray-900">
                        Unidad {u.numero}: {u.nombre}
                      </h3>
                      <button
                        onClick={() => {
                          if (editingCriterios === u.id) {
                            setEditingCriterios(null);
                          } else {
                            setEditingCriterios(u.id);
                            setCriteriosForm(
                              u.criterios.length > 0
                                ? u.criterios.map((c) => ({ ...c }))
                                : [
                                    { id: "", nombre: "Actitudinal", porcentaje: 20 },
                                    { id: "", nombre: "Desempeno", porcentaje: 20 },
                                    { id: "", nombre: "Heteroevaluacion", porcentaje: 20 },
                                    { id: "", nombre: "Evidencias", porcentaje: 40 },
                                  ]
                            );
                          }
                        }}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        {editingCriterios === u.id ? "Cancelar" : "Editar Criterios"}
                      </button>
                    </div>

                    {editingCriterios === u.id ? (
                      <div>
                        <div className="space-y-3">
                          {criteriosForm.map((c, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              <input
                                type="text"
                                value={c.nombre}
                                onChange={(e) => {
                                  const updated = [...criteriosForm];
                                  updated[idx] = { ...updated[idx], nombre: e.target.value };
                                  setCriteriosForm(updated);
                                }}
                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                placeholder="Nombre del criterio"
                              />
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  value={c.porcentaje}
                                  onChange={(e) => {
                                    const updated = [...criteriosForm];
                                    updated[idx] = { ...updated[idx], porcentaje: Number(e.target.value) };
                                    setCriteriosForm(updated);
                                  }}
                                  className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                  min={0}
                                  max={100}
                                />
                                <span className="text-sm text-gray-500">%</span>
                              </div>
                              <button
                                onClick={() => setCriteriosForm(criteriosForm.filter((_, i) => i !== idx))}
                                className="text-red-400 hover:text-red-600"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <button
                            onClick={() =>
                              setCriteriosForm([...criteriosForm, { id: "", nombre: "", porcentaje: 0 }])
                            }
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            + Agregar criterio
                          </button>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-500">
                              Total: {criteriosForm.reduce((s, c) => s + c.porcentaje, 0)}%
                            </span>
                            <button
                              onClick={() => handleSaveCriterios(u.id)}
                              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Guardar
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : u.criterios.length === 0 ? (
                      <p className="text-sm text-gray-400">Sin criterios definidos</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {u.criterios.map((c) => (
                          <span
                            key={c.id}
                            className="bg-gray-100 text-gray-700 rounded-full px-2.5 py-0.5 text-xs font-medium"
                          >
                            {c.nombre}: {c.porcentaje}%
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}

          {/* Create Unidad Modal */}
          {showUnidadModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/40" onClick={() => setShowUnidadModal(false)} />
              <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Nueva Unidad</h2>
                  <button onClick={() => setShowUnidadModal(false)} className="text-gray-400 hover:text-gray-600">
                    <X size={20} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Numero de Unidad</label>
                    <input
                      type="number"
                      value={unidadForm.numero}
                      onChange={(e) => setUnidadForm({ ...unidadForm, numero: Number(e.target.value) })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      min={1}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input
                      type="text"
                      value={unidadForm.nombre}
                      onChange={(e) => setUnidadForm({ ...unidadForm, nombre: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Ej. Fundamentos de Programacion"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowUnidadModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreateUnidad}
                    disabled={savingUnidad || !unidadForm.nombre}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {savingUnidad ? "Guardando..." : "Crear Unidad"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
