import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const unidadId = request.nextUrl.searchParams.get("unidadId");

  if (!unidadId) {
    return NextResponse.json({ error: "unidadId es requerido" }, { status: 400 });
  }

  try {
    const calificaciones = await prisma.calificacionFinal.findMany({
      where: { unidadId },
      include: {
        alumno: {
          select: { id: true, nombre: true, apellidos: true },
        },
      },
      orderBy: { alumno: { apellidos: "asc" } },
    });

    return NextResponse.json(calificaciones);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener calificaciones" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (session.user.role !== "docente" && session.user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const { unidadId } = await request.json();

    if (!unidadId) {
      return NextResponse.json({ error: "unidadId es requerido" }, { status: 400 });
    }

    // Get unidad with grupo to find inscribed students
    const unidad = await prisma.unidad.findUnique({
      where: { id: unidadId },
      include: {
        grupo: {
          include: {
            inscripciones: { select: { alumnoId: true } },
          },
        },
        criterios: true,
        actividades: {
          include: {
            registros: true,
          },
        },
      },
    });

    if (!unidad) {
      return NextResponse.json({ error: "Unidad no encontrada" }, { status: 404 });
    }

    // Build criterios map (nombre -> porcentaje as decimal)
    const criteriosMap: Record<string, number> = {};
    for (const c of unidad.criterios) {
      criteriosMap[c.nombre] = c.porcentaje / 100;
    }

    const alumnoIds = unidad.grupo.inscripciones.map((i) => i.alumnoId);

    // Get heteroevaluaciones for this unidad
    const heteroevaluaciones = await prisma.heteroevaluacion.findMany({
      where: { unidadId, alumnoId: { in: alumnoIds } },
    });

    const heteroByAlumno: Record<string, number[]> = {};
    for (const h of heteroevaluaciones) {
      if (!heteroByAlumno[h.alumnoId]) heteroByAlumno[h.alumnoId] = [];
      heteroByAlumno[h.alumnoId].push(h.puntaje);
    }

    // Separate activities by type
    const allActividades = unidad.actividades;
    const proyectoActividades = allActividades.filter((a) => a.tipo === "proyecto");

    // Build registros indexed by alumnoId
    const registrosByAlumno: Record<string, { asistencia: boolean; participacion: boolean; calificacion: number | null; tipo: string }[]> = {};
    for (const act of allActividades) {
      for (const reg of act.registros) {
        if (!registrosByAlumno[reg.alumnoId]) registrosByAlumno[reg.alumnoId] = [];
        registrosByAlumno[reg.alumnoId].push({
          asistencia: reg.asistencia,
          participacion: reg.participacion,
          calificacion: reg.calificacion,
          tipo: act.tipo,
        });
      }
    }

    // Build proyecto registros by alumno
    const proyectoRegistrosByAlumno: Record<string, number[]> = {};
    for (const act of proyectoActividades) {
      for (const reg of act.registros) {
        if (reg.calificacion !== null) {
          if (!proyectoRegistrosByAlumno[reg.alumnoId]) proyectoRegistrosByAlumno[reg.alumnoId] = [];
          proyectoRegistrosByAlumno[reg.alumnoId].push(reg.calificacion);
        }
      }
    }

    const results = [];

    for (const alumnoId of alumnoIds) {
      const regs = registrosByAlumno[alumnoId] || [];

      // calActitudinal: average of asistencia (as 10/0) and participacion (as 10/0)
      let calActitudinal: number | null = null;
      if (regs.length > 0) {
        const asistenciaAvg = regs.reduce((sum, r) => sum + (r.asistencia ? 10 : 0), 0) / regs.length;
        const participacionAvg = regs.reduce((sum, r) => sum + (r.participacion ? 10 : 0), 0) / regs.length;
        calActitudinal = (asistenciaAvg + participacionAvg) / 2;
      }

      // calDesempeno: average of calificaciones from registros
      let calDesempeno: number | null = null;
      const calificaciones = regs.filter((r) => r.calificacion !== null).map((r) => r.calificacion as number);
      if (calificaciones.length > 0) {
        calDesempeno = calificaciones.reduce((sum, c) => sum + c, 0) / calificaciones.length;
      }

      // calHeteroevaluacion: average of heteroevaluacion puntajes
      let calHeteroevaluacion: number | null = null;
      const heteros = heteroByAlumno[alumnoId] || [];
      if (heteros.length > 0) {
        calHeteroevaluacion = heteros.reduce((sum, p) => sum + p, 0) / heteros.length;
      }

      // calEvidencias: average of proyecto calificaciones
      let calEvidencias: number | null = null;
      const proyectos = proyectoRegistrosByAlumno[alumnoId] || [];
      if (proyectos.length > 0) {
        calEvidencias = proyectos.reduce((sum, c) => sum + c, 0) / proyectos.length;
      }

      // calFinal: weighted average using criterios
      let calFinal: number | null = null;
      const components: { valor: number | null; peso: number }[] = [
        { valor: calActitudinal, peso: criteriosMap["Actitudinal"] || 0 },
        { valor: calDesempeno, peso: criteriosMap["Desempeño"] || 0 },
        { valor: calHeteroevaluacion, peso: criteriosMap["Heteroevaluación"] || 0 },
        { valor: calEvidencias, peso: criteriosMap["Evidencias"] || 0 },
      ];

      let totalPeso = 0;
      let totalValor = 0;
      for (const comp of components) {
        if (comp.valor !== null && comp.peso > 0) {
          totalValor += comp.valor * comp.peso;
          totalPeso += comp.peso;
        }
      }

      if (totalPeso > 0) {
        calFinal = totalValor / totalPeso;
      }

      const calificacion = await prisma.calificacionFinal.upsert({
        where: {
          alumnoId_unidadId: { alumnoId, unidadId },
        },
        update: {
          calActitudinal,
          calDesempeno,
          calHeteroevaluacion,
          calEvidencias,
          calFinal,
        },
        create: {
          alumnoId,
          unidadId,
          calActitudinal,
          calDesempeno,
          calHeteroevaluacion,
          calEvidencias,
          calFinal,
        },
        include: {
          alumno: {
            select: { id: true, nombre: true, apellidos: true },
          },
        },
      });

      results.push(calificacion);
    }

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ error: "Error al calcular calificaciones" }, { status: 500 });
  }
}
