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

  const { id: unidadId } = await params;

  try {
    const criterios = await prisma.criterioEvaluacion.findMany({
      where: { unidadId },
    });

    return NextResponse.json(criterios);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener criterios" }, { status: 500 });
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

  const { id: unidadId } = await params;

  try {
    const { criterios } = await request.json();

    if (!criterios || !Array.isArray(criterios)) {
      return NextResponse.json({ error: "Se requiere un array de criterios" }, { status: 400 });
    }

    // Validate total percentage
    const total = criterios.reduce((sum: number, c: { porcentaje: number }) => sum + c.porcentaje, 0);
    if (Math.abs(total - 100) > 0.01) {
      return NextResponse.json({ error: "Los porcentajes deben sumar 100%" }, { status: 400 });
    }

    const updated = await Promise.all(
      criterios.map((c: { id: string; porcentaje: number }) =>
        prisma.criterioEvaluacion.update({
          where: { id: c.id },
          data: { porcentaje: c.porcentaje },
        })
      )
    );

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar criterios" }, { status: 500 });
  }
}
