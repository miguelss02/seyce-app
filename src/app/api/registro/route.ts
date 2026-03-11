import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const actividadId = request.nextUrl.searchParams.get("actividadId");

  if (!actividadId) {
    return NextResponse.json({ error: "actividadId es requerido" }, { status: 400 });
  }

  try {
    const registros = await prisma.registroDiarioAlumno.findMany({
      where: { actividadId },
      include: {
        alumno: {
          select: { id: true, nombre: true, apellidos: true },
        },
      },
      orderBy: { alumno: { apellidos: "asc" } },
    });

    return NextResponse.json(registros);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener registros" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const { alumnoId, actividadId, fecha, asistencia, participacion, calificacion, observaciones } =
      await request.json();

    if (!alumnoId || !actividadId || !fecha) {
      return NextResponse.json({ error: "alumnoId, actividadId y fecha son requeridos" }, { status: 400 });
    }

    const registro = await prisma.registroDiarioAlumno.upsert({
      where: {
        alumnoId_actividadId: { alumnoId, actividadId },
      },
      update: {
        fecha: new Date(fecha),
        asistencia: asistencia ?? true,
        participacion: participacion ?? false,
        calificacion: calificacion ?? null,
        observaciones: observaciones ?? null,
      },
      create: {
        alumnoId,
        actividadId,
        fecha: new Date(fecha),
        asistencia: asistencia ?? true,
        participacion: participacion ?? false,
        calificacion: calificacion ?? null,
        observaciones: observaciones ?? null,
      },
      include: {
        alumno: {
          select: { id: true, nombre: true, apellidos: true },
        },
      },
    });

    return NextResponse.json(registro);
  } catch (error) {
    return NextResponse.json({ error: "Error al guardar registro" }, { status: 500 });
  }
}
