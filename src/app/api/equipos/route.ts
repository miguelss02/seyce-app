import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const grupoId = request.nextUrl.searchParams.get("grupoId");

  if (!grupoId) {
    return NextResponse.json({ error: "grupoId es requerido" }, { status: 400 });
  }

  try {
    const equipos = await prisma.equipo.findMany({
      where: { grupoId },
      include: {
        miembros: {
          include: {
            alumno: {
              select: { id: true, nombre: true, apellidos: true, email: true },
            },
          },
        },
      },
    });

    return NextResponse.json(equipos);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener equipos" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const { nombre, grupoId } = await request.json();

    if (!nombre || !grupoId) {
      return NextResponse.json({ error: "Nombre y grupoId son requeridos" }, { status: 400 });
    }

    const equipo = await prisma.equipo.create({
      data: { nombre, grupoId },
      include: {
        miembros: {
          include: {
            alumno: {
              select: { id: true, nombre: true, apellidos: true, email: true },
            },
          },
        },
      },
    });

    return NextResponse.json(equipo, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error al crear equipo" }, { status: 500 });
  }
}
