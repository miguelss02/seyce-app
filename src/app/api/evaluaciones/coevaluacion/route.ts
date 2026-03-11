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
    const coevaluaciones = await prisma.coevaluacion.findMany({
      where: {
        evaluadorId: session.user.id,
        unidadId,
      },
      include: {
        evaluado: {
          select: { id: true, nombre: true, apellidos: true },
        },
      },
    });

    return NextResponse.json(coevaluaciones);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener coevaluaciones" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const { evaluadoId, unidadId, puntaje, comentario } = await request.json();

    if (!evaluadoId || !unidadId || puntaje === undefined) {
      return NextResponse.json({ error: "evaluadoId, unidadId y puntaje son requeridos" }, { status: 400 });
    }

    const coevaluacion = await prisma.coevaluacion.upsert({
      where: {
        evaluadorId_evaluadoId_unidadId: {
          evaluadorId: session.user.id,
          evaluadoId,
          unidadId,
        },
      },
      update: {
        puntaje,
        comentario: comentario || null,
      },
      create: {
        evaluadorId: session.user.id,
        evaluadoId,
        unidadId,
        puntaje,
        comentario: comentario || null,
      },
    });

    return NextResponse.json(coevaluacion);
  } catch (error) {
    return NextResponse.json({ error: "Error al guardar coevaluación" }, { status: 500 });
  }
}
