import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const email = request.nextUrl.searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "email es requerido" }, { status: 400 });
  }

  try {
    const alumnos = await prisma.user.findMany({
      where: {
        role: "alumno",
        email: { contains: email },
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellidos: true,
      },
      take: 10,
    });

    return NextResponse.json(alumnos);
  } catch (error) {
    return NextResponse.json({ error: "Error al buscar alumnos" }, { status: 500 });
  }
}
