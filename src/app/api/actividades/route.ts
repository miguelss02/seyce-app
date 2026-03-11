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
    const actividades = await prisma.actividad.findMany({
      where: { unidadId },
      orderBy: { fecha: "asc" },
    });

    return NextResponse.json(actividades);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener actividades" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const { nombre, tipo, fecha, descripcion, valorMax, unidadId } = await request.json();

    if (!nombre || !tipo || !fecha || !unidadId) {
      return NextResponse.json({ error: "nombre, tipo, fecha y unidadId son requeridos" }, { status: 400 });
    }

    const actividad = await prisma.actividad.create({
      data: {
        nombre,
        tipo,
        fecha: new Date(fecha),
        descripcion: descripcion || null,
        valorMax: valorMax || 10,
        unidadId,
      },
    });

    return NextResponse.json(actividad, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error al crear actividad" }, { status: 500 });
  }
}
