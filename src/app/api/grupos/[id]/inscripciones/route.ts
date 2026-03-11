import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id: grupoId } = await params;

  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "El email es requerido" }, { status: 400 });
    }

    const alumno = await prisma.user.findFirst({
      where: { email, role: "alumno" },
    });

    if (!alumno) {
      return NextResponse.json({ error: "No se encontró un alumno con ese email" }, { status: 404 });
    }

    const existente = await prisma.inscripcion.findUnique({
      where: { alumnoId_grupoId: { alumnoId: alumno.id, grupoId } },
    });

    if (existente) {
      return NextResponse.json({ error: "El alumno ya está inscrito en este grupo" }, { status: 409 });
    }

    const inscripcion = await prisma.inscripcion.create({
      data: {
        alumnoId: alumno.id,
        grupoId,
      },
      include: {
        alumno: {
          select: { id: true, nombre: true, apellidos: true, email: true },
        },
      },
    });

    return NextResponse.json(inscripcion, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error al inscribir alumno" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id: grupoId } = await params;

  try {
    const { alumnoId } = await request.json();

    if (!alumnoId) {
      return NextResponse.json({ error: "El alumnoId es requerido" }, { status: 400 });
    }

    await prisma.inscripcion.delete({
      where: { alumnoId_grupoId: { alumnoId, grupoId } },
    });

    return NextResponse.json({ message: "Inscripción eliminada" });
  } catch (error) {
    return NextResponse.json({ error: "Error al eliminar inscripción" }, { status: 500 });
  }
}
