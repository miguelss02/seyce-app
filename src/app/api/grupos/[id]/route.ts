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

  const { id } = await params;

  try {
    const grupo = await prisma.grupo.findUnique({
      where: { id },
      include: {
        materia: true,
        inscripciones: {
          include: {
            alumno: {
              select: { id: true, nombre: true, apellidos: true, email: true },
            },
          },
        },
        equipos: {
          include: {
            miembros: {
              include: {
                alumno: {
                  select: { id: true, nombre: true, apellidos: true, email: true },
                },
              },
            },
          },
        },
        unidades: {
          orderBy: { numero: "asc" },
        },
      },
    });

    if (!grupo) {
      return NextResponse.json({ error: "Grupo no encontrado" }, { status: 404 });
    }

    return NextResponse.json(grupo);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener grupo" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const data = await request.json();

    const grupo = await prisma.grupo.update({
      where: { id },
      data,
    });

    return NextResponse.json(grupo);
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar grupo" }, { status: 500 });
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

  const { id } = await params;

  try {
    await prisma.grupo.delete({ where: { id } });
    return NextResponse.json({ message: "Grupo eliminado" });
  } catch (error) {
    return NextResponse.json({ error: "Error al eliminar grupo" }, { status: 500 });
  }
}
