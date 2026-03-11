import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    // Verificar si ya existen usuarios
    const existingUsers = await prisma.user.count();
    if (existingUsers > 0) {
      return NextResponse.json({ message: "La base de datos ya tiene datos" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash("password123", 10);

    // Crear docente
    const docente = await prisma.user.create({
      data: {
        email: "docente@sece.edu",
        password: hashedPassword,
        nombre: "María",
        apellidos: "González López",
        role: "docente",
      },
    });

    // Crear alumnos
    const alumnosData = [
      { nombre: "Carlos", apellidos: "Hernández Ruiz", email: "carlos@sece.edu" },
      { nombre: "Ana", apellidos: "Martínez Flores", email: "ana@sece.edu" },
      { nombre: "Luis", apellidos: "García Pérez", email: "luis@sece.edu" },
      { nombre: "Sofía", apellidos: "López Sánchez", email: "sofia@sece.edu" },
      { nombre: "Diego", apellidos: "Rodríguez Díaz", email: "diego@sece.edu" },
      { nombre: "Valentina", apellidos: "Torres Ramírez", email: "valentina@sece.edu" },
      { nombre: "Miguel", apellidos: "Jiménez Castro", email: "miguel@sece.edu" },
      { nombre: "Fernanda", apellidos: "Morales Vargas", email: "fernanda@sece.edu" },
      { nombre: "Andrés", apellidos: "Gutiérrez Mendoza", email: "andres@sece.edu" },
      { nombre: "Camila", apellidos: "Ortiz Rivera", email: "camila@sece.edu" },
    ];

    const alumnos = [];
    for (const data of alumnosData) {
      const alumno = await prisma.user.create({
        data: { ...data, password: hashedPassword, role: "alumno" },
      });
      alumnos.push(alumno);
    }

    // Crear materia
    const materia = await prisma.materia.create({
      data: {
        nombre: "Programación Web",
        horasSemana: 6,
        descripcion: "Desarrollo de aplicaciones web con tecnologías modernas",
        docenteId: docente.id,
      },
    });

    // Crear grupo
    const grupo = await prisma.grupo.create({
      data: {
        nombre: "3A",
        periodo: "Ene-Jun 2026",
        materiaId: materia.id,
        docenteId: docente.id,
      },
    });

    // Inscribir alumnos
    for (const alumno of alumnos) {
      await prisma.inscripcion.create({
        data: { alumnoId: alumno.id, grupoId: grupo.id },
      });
    }

    // Crear equipos
    const equipo1 = await prisma.equipo.create({
      data: { nombre: "Equipo Alpha", grupoId: grupo.id },
    });
    const equipo2 = await prisma.equipo.create({
      data: { nombre: "Equipo Beta", grupoId: grupo.id },
    });

    // Asignar miembros (5 por equipo, primero es jefe)
    for (let i = 0; i < 5; i++) {
      await prisma.miembroEquipo.create({
        data: {
          alumnoId: alumnos[i].id,
          equipoId: equipo1.id,
          esJefe: i === 0,
        },
      });
    }
    for (let i = 5; i < 10; i++) {
      await prisma.miembroEquipo.create({
        data: {
          alumnoId: alumnos[i].id,
          equipoId: equipo2.id,
          esJefe: i === 5,
        },
      });
    }

    // Crear unidad con criterios
    const unidad = await prisma.unidad.create({
      data: {
        nombre: "Unidad 1 - Fundamentos",
        numero: 1,
        grupoId: grupo.id,
      },
    });

    await prisma.criterioEvaluacion.createMany({
      data: [
        { nombre: "Actitudinal", porcentaje: 20, unidadId: unidad.id },
        { nombre: "Desempeño", porcentaje: 30, unidadId: unidad.id },
        { nombre: "Heteroevaluación", porcentaje: 30, unidadId: unidad.id },
        { nombre: "Evidencias de Producto", porcentaje: 20, unidadId: unidad.id },
      ],
    });

    return NextResponse.json({ message: "Datos de prueba creados exitosamente", docente: docente.email });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al crear datos de prueba" }, { status: 500 });
  }
}
