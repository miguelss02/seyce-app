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
    const autoevaluacion = await prisma.autoevaluacion.findUnique({
      where: {
        alumnoId_unidadId: { alumnoId: session.user.id, unidadId },
      },
    });

    return NextResponse.json(autoevaluacion);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener autoevaluación" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const { unidadId, puntaje, reflexion } = await request.json();

    if (!unidadId || puntaje === undefined) {
      return NextResponse.json({ error: "unidadId y puntaje son requeridos" }, { status: 400 });
    }

    const autoevaluacion = await prisma.autoevaluacion.upsert({
      where: {
        alumnoId_unidadId: { alumnoId: session.user.id, unidadId },
      },
      update: {
        puntaje,
        reflexion: reflexion || null,
      },
      create: {
        alumnoId: session.user.id,
        unidadId,
        puntaje,
        reflexion: reflexion || null,
      },
    });

    return NextResponse.json(autoevaluacion);
  } catch (error) {
    return NextResponse.json({ error: "Error al guardar autoevaluación" }, { status: 500 });
  }
}
