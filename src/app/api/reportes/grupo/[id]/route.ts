import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id: grupoId } = await params;

  try {
    const grupo = await prisma.grupo.findUnique({
      where: { id: grupoId },
      include: {
        materia: { select: { nombre: true } },
        unidades: {
          orderBy: { numero: "asc" },
          select: { id: true, nombre: true, numero: true },
        },
        inscripciones: {
          include: {
            alumno: {
              select: {
                id: true,
                nombre: true,
                apellidos: true,
                email: true,
                calificacionesFinales: {
                  where: {
                    unidad: { grupoId },
                  },
                  select: {
                    unidadId: true,
                    calActitudinal: true,
                    calDesempeno: true,
                    calHeteroevaluacion: true,
                    calEvidencias: true,
                    calFinal: true,
                    confirmada: true,
                  },
                },
              },
            },
          },
          orderBy: { alumno: { apellidos: "asc" } },
        },
      },
    });

    if (!grupo) {
      return NextResponse.json({ error: "Grupo no encontrado" }, { status: 404 });
    }

    const reporte = {
      grupo: {
        id: grupo.id,
        nombre: grupo.nombre,
        periodo: grupo.periodo,
        materia: grupo.materia.nombre,
      },
      unidades: grupo.unidades,
      alumnos: grupo.inscripciones.map((insc) => ({
        id: insc.alumno.id,
        nombre: insc.alumno.nombre,
        apellidos: insc.alumno.apellidos,
        email: insc.alumno.email,
        calificaciones: insc.alumno.calificacionesFinales,
      })),
    };

    return NextResponse.json(reporte);
  } catch (error) {
    return NextResponse.json({ error: "Error al generar reporte" }, { status: 500 });
  }
}
