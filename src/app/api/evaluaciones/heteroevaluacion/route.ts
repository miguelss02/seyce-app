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
  const alumnoId = request.nextUrl.searchParams.get("alumnoId");

  if (!unidadId) {
    return NextResponse.json({ error: "unidadId es requerido" }, { status: 400 });
  }

  try {
    const where: { unidadId: string; alumnoId?: string } = { unidadId };
    if (alumnoId) {
      where.alumnoId = alumnoId;
    }

    const heteroevaluaciones = await prisma.heteroevaluacion.findMany({
      where,
      include: {
        alumno: {
          select: { id: true, nombre: true, apellidos: true },
        },
      },
    });

    return NextResponse.json(heteroevaluaciones);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener heteroevaluaciones" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const { alumnoId, unidadId, puntaje, tipo } = await request.json();

    if (!alumnoId || !unidadId || puntaje === undefined || !tipo) {
      return NextResponse.json({ error: "alumnoId, unidadId, puntaje y tipo son requeridos" }, { status: 400 });
    }

    const heteroevaluacion = await prisma.heteroevaluacion.upsert({
      where: {
        alumnoId_unidadId_tipo: { alumnoId, unidadId, tipo },
      },
      update: { puntaje },
      create: {
        alumnoId,
        unidadId,
        puntaje,
        tipo,
      },
    });

    return NextResponse.json(heteroevaluacion);
  } catch (error) {
    return NextResponse.json({ error: "Error al guardar heteroevaluación" }, { status: 500 });
  }
}
