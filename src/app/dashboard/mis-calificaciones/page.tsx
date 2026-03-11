"use client";

import { useEffect, useState } from "react";
import { GraduationCap, CheckCircle, Clock } from "lucide-react";

interface CalificacionUnidad {
  id: string;
  unidad: { id: string; nombre: string; numero: number };
  actitudinal: number | null;
  desempeno: number | null;
  heteroevaluacion: number | null;
  evidencias: number | null;
  calificacionFinal: number | null;
  confirmada: boolean;
}

export default function MisCalificacionesPage() {
  const [calificaciones, setCalificaciones] = useState<CalificacionUnidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const fetchCalificaciones = () => {
    setLoading(true);
    fetch("/api/calificaciones")
      .then((r) => r.json())
      .then((data) => setCalificaciones(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCalificaciones();
  }, []);

  const handleConfirmar = async (calId: string) => {
    setConfirmingId(calId);
    try {
      const res = await fetch("/api/calificaciones/confirmar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ calificacionId: calId }),
      });
      if (res.ok) {
        fetchCalificaciones();
      }
    } catch {
      // handle error
    } finally {
      setConfirmingId(null);
    }
  };

  const formatNum = (n: number | null) => (n != null ? n.toFixed(1) : "—");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mis Calificaciones</h1>
        <p className="text-gray-500 mt-1">Consulta y confirma tus calificaciones por unidad</p>
      </div>

      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : calificaciones.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <GraduationCap size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No tienes calificaciones disponibles</p>
        </div>
      ) : (
        <div className="space-y-4">
          {calificaciones
            .sort((a, b) => a.unidad.numero - b.unidad.numero)
            .map((cal) => (
              <div
                key={cal.id}
                className="bg-white rounded-xl border border-gray-200 p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      Unidad {cal.unidad.numero}: {cal.unidad.nombre}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-bold ${
                        (cal.calificacionFinal ?? 0) >= 6
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      Final: {formatNum(cal.calificacionFinal)}
                    </span>
                    {cal.confirmada ? (
                      <span className="bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-0.5 text-xs font-medium inline-flex items-center gap-1">
                        <CheckCircle size={12} />
                        Confirmada
                      </span>
                    ) : (
                      <button
                        onClick={() => handleConfirmar(cal.id)}
                        disabled={confirmingId === cal.id}
                        className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle size={12} />
                        {confirmingId === cal.id ? "Confirmando..." : "Confirmar"}
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500 mb-1">Actitudinal</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatNum(cal.actitudinal)}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500 mb-1">Desempeno</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatNum(cal.desempeno)}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500 mb-1">Heteroevaluacion</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatNum(cal.heteroevaluacion)}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500 mb-1">Evidencias</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatNum(cal.evidencias)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
