"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Plus, X, BookOpen, Calendar } from "lucide-react";

interface Materia {
  id: string;
  nombre: string;
}

interface Grupo {
  id: string;
  nombre: string;
  periodo: string;
  materia: Materia;
  _count?: { inscripciones: number };
}

export default function GruposPage() {
  const router = useRouter();
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ nombre: "", periodo: "", materiaId: "" });
  const [saving, setSaving] = useState(false);

  const fetchGrupos = () => {
    setLoading(true);
    fetch("/api/grupos")
      .then((r) => r.json())
      .then((data) => setGrupos(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const fetchMaterias = () => {
    fetch("/api/materias")
      .then((r) => r.json())
      .then((data) => setMaterias(data))
      .catch(() => {});
  };

  useEffect(() => {
    fetchGrupos();
    fetchMaterias();
  }, []);

  const handleCreate = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/grupos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({ nombre: "", periodo: "", materiaId: "" });
        setShowModal(false);
        fetchGrupos();
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
          <h1 className="text-2xl font-bold text-gray-900">Grupos</h1>
          <p className="text-gray-500 mt-1">Administra tus grupos de clase</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Nuevo Grupo
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : grupos.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Users size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No hay grupos registrados</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 text-blue-600 text-sm font-medium hover:underline"
          >
            Crear el primer grupo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {grupos.map((g) => (
            <div
              key={g.id}
              onClick={() => router.push(`/dashboard/grupos/${g.id}`)}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="bg-blue-100 p-2.5 rounded-lg">
                  <BookOpen size={20} className="text-blue-600" />
                </div>
                <span className="bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-0.5 text-xs font-medium">
                  {g.periodo}
                </span>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">{g.nombre}</h3>
              <p className="text-sm text-gray-500 mb-3">{g.materia?.nombre}</p>
              <div className="flex items-center gap-1.5 text-sm text-gray-400">
                <Users size={14} />
                <span>{g._count?.inscripciones ?? 0} alumnos</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Nuevo Grupo</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Ej. ISC-601A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Periodo</label>
                <input
                  type="text"
                  value={form.periodo}
                  onChange={(e) => setForm({ ...form, periodo: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Ej. 2026-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Materia</label>
                <select
                  value={form.materiaId}
                  onChange={(e) => setForm({ ...form, materiaId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">Selecciona una materia</option>
                  {materias.map((m) => (
                    <option key={m.id} value={m.id}>{m.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={saving || !form.nombre || !form.periodo || !form.materiaId}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Crear Grupo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
