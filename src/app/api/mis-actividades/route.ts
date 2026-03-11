import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json([], { status: 401 });

  const registros = await prisma.registroDiarioAlumno.findMany({
    where: { alumnoId: session.user.id },
    include: {
      actividad: {
        select: { nombre: true, tipo: true, fecha: true, valorMax: true },
      },
    },
    orderBy: { fecha: "desc" },
  });

  return NextResponse.json(registros);
}
