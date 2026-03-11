import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json([], { status: 401 });

  const inscripciones = await prisma.inscripcion.findMany({
    where: { alumnoId: session.user.id },
    include: {
      grupo: {
        include: {
          materia: true,
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
        },
      },
    },
  });

  const result = inscripciones.map((insc) => {
    const miEquipo = insc.grupo.equipos.find((eq) =>
      eq.miembros.some((m) => m.alumnoId === session.user.id)
    );

    return {
      grupoNombre: insc.grupo.nombre,
      materiaNombre: insc.grupo.materia.nombre,
      periodo: insc.grupo.periodo,
      equipo: miEquipo || null,
    };
  });

  return NextResponse.json(result);
}
