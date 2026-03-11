import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    if (data.fecha) {
      data.fecha = new Date(data.fecha);
    }

    const actividad = await prisma.actividad.update({
      where: { id },
      data,
    });

    return NextResponse.json(actividad);
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar actividad" }, { status: 500 });
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
    await prisma.actividad.delete({ where: { id } });
    return NextResponse.json({ message: "Actividad eliminada" });
  } catch (error) {
    return NextResponse.json({ error: "Error al eliminar actividad" }, { status: 500 });
  }
}
