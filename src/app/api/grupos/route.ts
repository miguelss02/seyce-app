import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const grupos = await prisma.grupo.findMany({
      where: { docenteId: session.user.id },
      include: {
        materia: { select: { nombre: true } },
        _count: { select: { inscripciones: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(grupos);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener grupos" }, { status: 500 });
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
    const { nombre, periodo, materiaId } = await request.json();

    if (!nombre || !periodo || !materiaId) {
      return NextResponse.json({ error: "Nombre, periodo y materiaId son requeridos" }, { status: 400 });
    }

    const grupo = await prisma.grupo.create({
      data: {
        nombre,
        periodo,
        materiaId,
        docenteId: session.user.id,
      },
      include: {
        materia: { select: { nombre: true } },
      },
    });

    return NextResponse.json(grupo, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error al crear grupo" }, { status: 500 });
  }
}
