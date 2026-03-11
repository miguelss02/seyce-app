import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({}, { status: 401 });

  const isDocente = session.user.role === "docente" || session.user.role === "admin";

  if (isDocente) {
    const [grupos, alumnos, equipos, actividades] = await Promise.all([
      prisma.grupo.count({ where: { docenteId: session.user.id, activo: true } }),
      prisma.inscripcion.count({
        where: { grupo: { docenteId: session.user.id, activo: true } },
      }),
      prisma.equipo.count({
        where: { grupo: { docenteId: session.user.id, activo: true } },
      }),
      prisma.actividad.count({
        where: { unidad: { grupo: { docenteId: session.user.id } } },
      }),
    ]);

    return NextResponse.json({ grupos, alumnos, equipos, actividades });
  } else {
    const [grupos, equipos, actividades, calificacionesConfirmadas] = await Promise.all([
      prisma.inscripcion.count({ where: { alumnoId: session.user.id } }),
      prisma.miembroEquipo.count({ where: { alumnoId: session.user.id } }),
      prisma.registroDiarioAlumno.count({ where: { alumnoId: session.user.id } }),
      prisma.calificacionFinal.count({
        where: { alumnoId: session.user.id, confirmada: true },
      }),
    ]);

    return NextResponse.json({ grupos, equipos, actividades, calificacionesConfirmadas });
  }
}
