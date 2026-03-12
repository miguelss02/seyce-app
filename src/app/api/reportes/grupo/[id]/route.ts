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
                calificacionesFinales: {
                  where: {
                    unidad: { grupoId },
                  },
                  select: {
                    unidadId: true,
                    calFinal: true,
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

    const unidadNombres = grupo.unidades.map((u) => u.nombre);

    const alumnos = grupo.inscripciones.map((insc) => {
      const calificaciones = grupo.unidades.map((u) => {
        const cal = insc.alumno.calificacionesFinales.find((c) => c.unidadId === u.id);
        return {
          unidad: u.nombre,
          calificacionFinal: cal?.calFinal ?? null,
        };
      });

      const calsConNota = calificaciones.filter((c) => c.calificacionFinal !== null);
      const promedio =
        calsConNota.length > 0
          ? calsConNota.reduce((sum, c) => sum + (c.calificacionFinal ?? 0), 0) / calsConNota.length
          : null;

      return {
        alumnoId: insc.alumno.id,
        nombre: insc.alumno.nombre,
        apellido: insc.alumno.apellidos,
        calificaciones,
        promedio,
      };
    });

    const alumnosConPromedio = alumnos.filter((a) => a.promedio !== null);
    const promedioGeneral =
      alumnosConPromedio.length > 0
        ? alumnosConPromedio.reduce((sum, a) => sum + (a.promedio ?? 0), 0) / alumnosConPromedio.length
        : 0;

    const reporte = {
      grupo: {
        nombre: grupo.nombre,
        periodo: grupo.periodo,
        materia: grupo.materia.nombre,
      },
      unidades: unidadNombres,
      alumnos,
      resumen: {
        totalAlumnos: alumnos.length,
        promedioGeneral,
        aprobados: alumnosConPromedio.filter((a) => (a.promedio ?? 0) >= 6).length,
        reprobados: alumnosConPromedio.filter((a) => (a.promedio ?? 0) < 6).length,
      },
    };

    return NextResponse.json(reporte);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al generar reporte" }, { status: 500 });
  }
}
