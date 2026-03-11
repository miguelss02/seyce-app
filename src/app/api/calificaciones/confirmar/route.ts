import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const { calificacionId } = await request.json();

    if (!calificacionId) {
      return NextResponse.json({ error: "calificacionId es requerido" }, { status: 400 });
    }

    const calificacion = await prisma.calificacionFinal.findUnique({
      where: { id: calificacionId },
    });

    if (!calificacion) {
      return NextResponse.json({ error: "Calificación no encontrada" }, { status: 404 });
    }

    if (calificacion.alumnoId !== session.user.id) {
      return NextResponse.json({ error: "No autorizado para confirmar esta calificación" }, { status: 403 });
    }

    const updated = await prisma.calificacionFinal.update({
      where: { id: calificacionId },
      data: { confirmada: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Error al confirmar calificación" }, { status: 500 });
  }
}
