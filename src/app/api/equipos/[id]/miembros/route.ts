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

  const { id: equipoId } = await params;

  try {
    const { alumnoId, esJefe } = await request.json();

    if (!alumnoId) {
      return NextResponse.json({ error: "alumnoId es requerido" }, { status: 400 });
    }

    const miembro = await prisma.miembroEquipo.create({
      data: {
        alumnoId,
        equipoId,
        esJefe: esJefe || false,
      },
      include: {
        alumno: {
          select: { id: true, nombre: true, apellidos: true, email: true },
        },
      },
    });

    return NextResponse.json(miembro, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error al agregar miembro" }, { status: 500 });
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

  const { id: equipoId } = await params;

  try {
    const { alumnoId } = await request.json();

    if (!alumnoId) {
      return NextResponse.json({ error: "alumnoId es requerido" }, { status: 400 });
    }

    await prisma.miembroEquipo.delete({
      where: { alumnoId_equipoId: { alumnoId, equipoId } },
    });

    return NextResponse.json({ message: "Miembro eliminado" });
  } catch (error) {
    return NextResponse.json({ error: "Error al eliminar miembro" }, { status: 500 });
  }
}
