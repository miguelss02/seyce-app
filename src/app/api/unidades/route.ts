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
    const unidades = await prisma.unidad.findMany({
      where: { grupoId },
      include: { criterios: true },
      orderBy: { numero: "asc" },
    });

    return NextResponse.json(unidades);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener unidades" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const { nombre, numero, grupoId } = await request.json();

    if (!nombre || numero === undefined || !grupoId) {
      return NextResponse.json({ error: "nombre, numero y grupoId son requeridos" }, { status: 400 });
    }

    const unidad = await prisma.unidad.create({
      data: {
        nombre,
        numero,
        grupoId,
        criterios: {
          create: [
            { nombre: "Actitudinal", porcentaje: 20 },
            { nombre: "Desempeño", porcentaje: 30 },
            { nombre: "Heteroevaluación", porcentaje: 30 },
            { nombre: "Evidencias", porcentaje: 20 },
          ],
        },
      },
      include: { criterios: true },
    });

    return NextResponse.json(unidad, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error al crear unidad" }, { status: 500 });
  }
}
