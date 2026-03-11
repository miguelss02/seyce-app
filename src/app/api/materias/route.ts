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
    const materias = await prisma.materia.findMany({
      where: { docenteId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(materias);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener materias" }, { status: 500 });
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
    const { nombre, horasSemana, descripcion } = await request.json();

    if (!nombre) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
    }

    const materia = await prisma.materia.create({
      data: {
        nombre,
        horasSemana: horasSemana || 5,
        descripcion: descripcion || null,
        docenteId: session.user.id,
      },
    });

    return NextResponse.json(materia, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error al crear materia" }, { status: 500 });
  }
}
