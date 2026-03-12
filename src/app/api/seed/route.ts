import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const force = searchParams.get("force") === "true";

    // Si force=true, limpiar toda la base de datos
    if (force) {
      await prisma.calificacionFinal.deleteMany();
      await prisma.heteroevaluacion.deleteMany();
      await prisma.coevaluacion.deleteMany();
      await prisma.autoevaluacion.deleteMany();
      await prisma.registroDiarioAlumno.deleteMany();
      await prisma.actividad.deleteMany();
      await prisma.criterioEvaluacion.deleteMany();
      await prisma.unidad.deleteMany();
      await prisma.miembroEquipo.deleteMany();
      await prisma.equipo.deleteMany();
      await prisma.inscripcion.deleteMany();
      await prisma.grupo.deleteMany();
      await prisma.materia.deleteMany();
      await prisma.user.deleteMany();
    } else {
      const existingUsers = await prisma.user.count();
      if (existingUsers > 0) {
        return NextResponse.json({ message: "La base de datos ya tiene datos. Usa ?force=true para reiniciar." }, { status: 400 });
      }
    }

    const hashedPassword = await bcrypt.hash("password123", 10);

    // ==================== DOCENTES ====================
    const docente1 = await prisma.user.create({
      data: {
        email: "docente@seyce.edu",
        password: hashedPassword,
        nombre: "María",
        apellidos: "González López",
        role: "docente",
      },
    });

    const docente2 = await prisma.user.create({
      data: {
        email: "roberto@seyce.edu",
        password: hashedPassword,
        nombre: "Roberto",
        apellidos: "Sánchez Morales",
        role: "docente",
      },
    });

    const admin = await prisma.user.create({
      data: {
        email: "admin@seyce.edu",
        password: hashedPassword,
        nombre: "Administrador",
        apellidos: "del Sistema",
        role: "admin",
      },
    });

    // ==================== ALUMNOS (30 alumnos) ====================
    const alumnosData = [
      { nombre: "Carlos", apellidos: "Hernández Ruiz", email: "carlos@seyce.edu" },
      { nombre: "Ana", apellidos: "Martínez Flores", email: "ana@seyce.edu" },
      { nombre: "Luis", apellidos: "García Pérez", email: "luis@seyce.edu" },
      { nombre: "Sofía", apellidos: "López Sánchez", email: "sofia@seyce.edu" },
      { nombre: "Diego", apellidos: "Rodríguez Díaz", email: "diego@seyce.edu" },
      { nombre: "Valentina", apellidos: "Torres Ramírez", email: "valentina@seyce.edu" },
      { nombre: "Miguel", apellidos: "Jiménez Castro", email: "miguel@seyce.edu" },
      { nombre: "Fernanda", apellidos: "Morales Vargas", email: "fernanda@seyce.edu" },
      { nombre: "Andrés", apellidos: "Gutiérrez Mendoza", email: "andres@seyce.edu" },
      { nombre: "Camila", apellidos: "Ortiz Rivera", email: "camila@seyce.edu" },
      { nombre: "Javier", apellidos: "Ramírez Luna", email: "javier@seyce.edu" },
      { nombre: "Isabella", apellidos: "Cruz Hernández", email: "isabella@seyce.edu" },
      { nombre: "Ricardo", apellidos: "Mendoza Ríos", email: "ricardo@seyce.edu" },
      { nombre: "Mariana", apellidos: "Vega Castillo", email: "mariana@seyce.edu" },
      { nombre: "Sebastián", apellidos: "Flores Aguilar", email: "sebastian@seyce.edu" },
      { nombre: "Paula", apellidos: "Navarro Delgado", email: "paula@seyce.edu" },
      { nombre: "Emilio", apellidos: "Herrera Soto", email: "emilio@seyce.edu" },
      { nombre: "Regina", apellidos: "Domínguez Peña", email: "regina@seyce.edu" },
      { nombre: "Daniel", apellidos: "Reyes Medina", email: "daniel@seyce.edu" },
      { nombre: "Alejandra", apellidos: "Salazar Rojas", email: "alejandra@seyce.edu" },
      { nombre: "Héctor", apellidos: "Vargas Contreras", email: "hector@seyce.edu" },
      { nombre: "Lucía", apellidos: "Guerrero Silva", email: "lucia@seyce.edu" },
      { nombre: "Fernando", apellidos: "Espinoza Campos", email: "fernando@seyce.edu" },
      { nombre: "Daniela", apellidos: "Ramos Figueroa", email: "daniela@seyce.edu" },
      { nombre: "Óscar", apellidos: "Cortés Acosta", email: "oscar@seyce.edu" },
      { nombre: "Renata", apellidos: "Sandoval Mora", email: "renata@seyce.edu" },
      { nombre: "Iván", apellidos: "Peña Carrillo", email: "ivan@seyce.edu" },
      { nombre: "Valeria", apellidos: "Molina Estrada", email: "valeria@seyce.edu" },
      { nombre: "Tomás", apellidos: "León Ibarra", email: "tomas@seyce.edu" },
      { nombre: "Ximena", apellidos: "Chávez Paredes", email: "ximena@seyce.edu" },
    ];

    const alumnos = [];
    for (const data of alumnosData) {
      const alumno = await prisma.user.create({
        data: { ...data, password: hashedPassword, role: "alumno" },
      });
      alumnos.push(alumno);
    }

    // ==================== MATERIAS ====================
    const materia1 = await prisma.materia.create({
      data: {
        nombre: "Programación Web",
        horasSemana: 6,
        descripcion: "Desarrollo de aplicaciones web con tecnologías modernas como React, Next.js y bases de datos",
        docenteId: docente1.id,
      },
    });

    const materia2 = await prisma.materia.create({
      data: {
        nombre: "Bases de Datos",
        horasSemana: 5,
        descripcion: "Diseño, implementación y administración de bases de datos relacionales y NoSQL",
        docenteId: docente1.id,
      },
    });

    const materia3 = await prisma.materia.create({
      data: {
        nombre: "Ingeniería de Software",
        horasSemana: 4,
        descripcion: "Metodologías ágiles, análisis de requerimientos y gestión de proyectos de software",
        docenteId: docente2.id,
      },
    });

    // ==================== GRUPOS ====================
    // Grupo 3A - Programación Web (docente1) - 15 alumnos
    const grupo3A = await prisma.grupo.create({
      data: {
        nombre: "3A",
        periodo: "Ene-Jun 2026",
        materiaId: materia1.id,
        docenteId: docente1.id,
      },
    });

    // Grupo 3B - Programación Web (docente1) - 15 alumnos
    const grupo3B = await prisma.grupo.create({
      data: {
        nombre: "3B",
        periodo: "Ene-Jun 2026",
        materiaId: materia1.id,
        docenteId: docente1.id,
      },
    });

    // Grupo 5A - Bases de Datos (docente1) - 10 alumnos
    const grupo5A = await prisma.grupo.create({
      data: {
        nombre: "5A",
        periodo: "Ene-Jun 2026",
        materiaId: materia2.id,
        docenteId: docente1.id,
      },
    });

    // Grupo 7A - Ingeniería de Software (docente2) - 10 alumnos
    const grupo7A = await prisma.grupo.create({
      data: {
        nombre: "7A",
        periodo: "Ene-Jun 2026",
        materiaId: materia3.id,
        docenteId: docente2.id,
      },
    });

    // ==================== INSCRIPCIONES ====================
    // Grupo 3A: alumnos 0-14
    for (let i = 0; i < 15; i++) {
      await prisma.inscripcion.create({
        data: { alumnoId: alumnos[i].id, grupoId: grupo3A.id },
      });
    }
    // Grupo 3B: alumnos 15-29
    for (let i = 15; i < 30; i++) {
      await prisma.inscripcion.create({
        data: { alumnoId: alumnos[i].id, grupoId: grupo3B.id },
      });
    }
    // Grupo 5A: alumnos 0-9
    for (let i = 0; i < 10; i++) {
      await prisma.inscripcion.create({
        data: { alumnoId: alumnos[i].id, grupoId: grupo5A.id },
      });
    }
    // Grupo 7A: alumnos 20-29
    for (let i = 20; i < 30; i++) {
      await prisma.inscripcion.create({
        data: { alumnoId: alumnos[i].id, grupoId: grupo7A.id },
      });
    }

    // ==================== EQUIPOS GRUPO 3A ====================
    const equipoAlpha = await prisma.equipo.create({ data: { nombre: "Equipo Alpha", grupoId: grupo3A.id } });
    const equipoBeta = await prisma.equipo.create({ data: { nombre: "Equipo Beta", grupoId: grupo3A.id } });
    const equipoGamma = await prisma.equipo.create({ data: { nombre: "Equipo Gamma", grupoId: grupo3A.id } });

    // Alpha: alumnos 0-4 (Carlos es jefe)
    for (let i = 0; i < 5; i++) {
      await prisma.miembroEquipo.create({
        data: { alumnoId: alumnos[i].id, equipoId: equipoAlpha.id, esJefe: i === 0 },
      });
    }
    // Beta: alumnos 5-9 (Valentina es jefe)
    for (let i = 5; i < 10; i++) {
      await prisma.miembroEquipo.create({
        data: { alumnoId: alumnos[i].id, equipoId: equipoBeta.id, esJefe: i === 5 },
      });
    }
    // Gamma: alumnos 10-14 (Javier es jefe)
    for (let i = 10; i < 15; i++) {
      await prisma.miembroEquipo.create({
        data: { alumnoId: alumnos[i].id, equipoId: equipoGamma.id, esJefe: i === 10 },
      });
    }

    // ==================== EQUIPOS GRUPO 3B ====================
    const equipoDelta = await prisma.equipo.create({ data: { nombre: "Equipo Delta", grupoId: grupo3B.id } });
    const equipoEpsilon = await prisma.equipo.create({ data: { nombre: "Equipo Epsilon", grupoId: grupo3B.id } });
    const equipoZeta = await prisma.equipo.create({ data: { nombre: "Equipo Zeta", grupoId: grupo3B.id } });

    for (let i = 15; i < 20; i++) {
      await prisma.miembroEquipo.create({
        data: { alumnoId: alumnos[i].id, equipoId: equipoDelta.id, esJefe: i === 15 },
      });
    }
    for (let i = 20; i < 25; i++) {
      await prisma.miembroEquipo.create({
        data: { alumnoId: alumnos[i].id, equipoId: equipoEpsilon.id, esJefe: i === 20 },
      });
    }
    for (let i = 25; i < 30; i++) {
      await prisma.miembroEquipo.create({
        data: { alumnoId: alumnos[i].id, equipoId: equipoZeta.id, esJefe: i === 25 },
      });
    }

    // ==================== EQUIPOS GRUPO 5A ====================
    const equipoSQL = await prisma.equipo.create({ data: { nombre: "Equipo SQL Masters", grupoId: grupo5A.id } });
    const equipoNoSQL = await prisma.equipo.create({ data: { nombre: "Equipo NoSQL Pros", grupoId: grupo5A.id } });

    for (let i = 0; i < 5; i++) {
      await prisma.miembroEquipo.create({
        data: { alumnoId: alumnos[i].id, equipoId: equipoSQL.id, esJefe: i === 0 },
      });
    }
    for (let i = 5; i < 10; i++) {
      await prisma.miembroEquipo.create({
        data: { alumnoId: alumnos[i].id, equipoId: equipoNoSQL.id, esJefe: i === 5 },
      });
    }

    // ==================== EQUIPOS GRUPO 7A ====================
    const equipoScrum = await prisma.equipo.create({ data: { nombre: "Equipo Scrum", grupoId: grupo7A.id } });
    const equipoKanban = await prisma.equipo.create({ data: { nombre: "Equipo Kanban", grupoId: grupo7A.id } });

    for (let i = 20; i < 25; i++) {
      await prisma.miembroEquipo.create({
        data: { alumnoId: alumnos[i].id, equipoId: equipoScrum.id, esJefe: i === 20 },
      });
    }
    for (let i = 25; i < 30; i++) {
      await prisma.miembroEquipo.create({
        data: { alumnoId: alumnos[i].id, equipoId: equipoKanban.id, esJefe: i === 25 },
      });
    }

    // ==================== UNIDADES Y CRITERIOS - GRUPO 3A ====================
    const unidad1_3A = await prisma.unidad.create({
      data: { nombre: "Unidad 1 - Fundamentos Web", numero: 1, grupoId: grupo3A.id },
    });
    const unidad2_3A = await prisma.unidad.create({
      data: { nombre: "Unidad 2 - Frontend con React", numero: 2, grupoId: grupo3A.id },
    });
    const unidad3_3A = await prisma.unidad.create({
      data: { nombre: "Unidad 3 - Backend y APIs", numero: 3, grupoId: grupo3A.id, activa: false },
    });

    // Criterios para cada unidad del grupo 3A
    for (const unidad of [unidad1_3A, unidad2_3A, unidad3_3A]) {
      await prisma.criterioEvaluacion.createMany({
        data: [
          { nombre: "Actitudinal", porcentaje: 20, unidadId: unidad.id },
          { nombre: "Desempeño", porcentaje: 30, unidadId: unidad.id },
          { nombre: "Heteroevaluación", porcentaje: 30, unidadId: unidad.id },
          { nombre: "Evidencias de Producto", porcentaje: 20, unidadId: unidad.id },
        ],
      });
    }

    // ==================== UNIDADES Y CRITERIOS - GRUPO 3B ====================
    const unidad1_3B = await prisma.unidad.create({
      data: { nombre: "Unidad 1 - Fundamentos Web", numero: 1, grupoId: grupo3B.id },
    });
    const unidad2_3B = await prisma.unidad.create({
      data: { nombre: "Unidad 2 - Frontend con React", numero: 2, grupoId: grupo3B.id },
    });

    for (const unidad of [unidad1_3B, unidad2_3B]) {
      await prisma.criterioEvaluacion.createMany({
        data: [
          { nombre: "Actitudinal", porcentaje: 20, unidadId: unidad.id },
          { nombre: "Desempeño", porcentaje: 30, unidadId: unidad.id },
          { nombre: "Heteroevaluación", porcentaje: 30, unidadId: unidad.id },
          { nombre: "Evidencias de Producto", porcentaje: 20, unidadId: unidad.id },
        ],
      });
    }

    // ==================== UNIDADES Y CRITERIOS - GRUPO 5A ====================
    const unidad1_5A = await prisma.unidad.create({
      data: { nombre: "Unidad 1 - Modelo Relacional", numero: 1, grupoId: grupo5A.id },
    });
    const unidad2_5A = await prisma.unidad.create({
      data: { nombre: "Unidad 2 - SQL Avanzado", numero: 2, grupoId: grupo5A.id },
    });

    for (const unidad of [unidad1_5A, unidad2_5A]) {
      await prisma.criterioEvaluacion.createMany({
        data: [
          { nombre: "Actitudinal", porcentaje: 15, unidadId: unidad.id },
          { nombre: "Desempeño", porcentaje: 25, unidadId: unidad.id },
          { nombre: "Heteroevaluación", porcentaje: 35, unidadId: unidad.id },
          { nombre: "Evidencias de Producto", porcentaje: 25, unidadId: unidad.id },
        ],
      });
    }

    // ==================== UNIDADES Y CRITERIOS - GRUPO 7A ====================
    const unidad1_7A = await prisma.unidad.create({
      data: { nombre: "Unidad 1 - Metodologías Ágiles", numero: 1, grupoId: grupo7A.id },
    });

    await prisma.criterioEvaluacion.createMany({
      data: [
        { nombre: "Actitudinal", porcentaje: 25, unidadId: unidad1_7A.id },
        { nombre: "Desempeño", porcentaje: 25, unidadId: unidad1_7A.id },
        { nombre: "Heteroevaluación", porcentaje: 25, unidadId: unidad1_7A.id },
        { nombre: "Evidencias de Producto", porcentaje: 25, unidadId: unidad1_7A.id },
      ],
    });

    // ==================== ACTIVIDADES - UNIDAD 1 GRUPO 3A ====================
    const actividades1_3A = [
      { nombre: "Práctica: Estructura HTML5", tipo: "practica", fecha: new Date("2026-01-20"), descripcion: "Crear estructura semántica de un sitio web completo", valorMax: 10 },
      { nombre: "Ejercicio: Selectores CSS", tipo: "ejercicio", fecha: new Date("2026-01-23"), descripcion: "Aplicar selectores avanzados CSS para estilizar componentes", valorMax: 10 },
      { nombre: "Tarea: Diseño Responsivo", tipo: "tarea", fecha: new Date("2026-01-27"), descripcion: "Implementar diseño responsivo con media queries y flexbox", valorMax: 10 },
      { nombre: "Práctica: JavaScript DOM", tipo: "practica", fecha: new Date("2026-02-03"), descripcion: "Manipulación del DOM con JavaScript vanilla", valorMax: 10 },
      { nombre: "Participación: Debate sobre Frameworks", tipo: "participacion", fecha: new Date("2026-02-06"), descripcion: "Debate grupal comparando frameworks frontend modernos", valorMax: 10 },
      { nombre: "Proyecto: Landing Page", tipo: "proyecto", fecha: new Date("2026-02-10"), descripcion: "Diseñar y desarrollar una landing page completa responsive", valorMax: 10 },
      { nombre: "Examen Parcial 1", tipo: "examen", fecha: new Date("2026-02-14"), descripcion: "Evaluación teórico-práctica de HTML, CSS y JavaScript básico", valorMax: 10 },
    ];

    const actividadesCreadas1_3A = [];
    for (const act of actividades1_3A) {
      const created = await prisma.actividad.create({
        data: { ...act, unidadId: unidad1_3A.id },
      });
      actividadesCreadas1_3A.push(created);
    }

    // ==================== ACTIVIDADES - UNIDAD 2 GRUPO 3A ====================
    const actividades2_3A = [
      { nombre: "Práctica: Componentes React", tipo: "practica", fecha: new Date("2026-02-17"), descripcion: "Crear componentes funcionales con props y children", valorMax: 10 },
      { nombre: "Ejercicio: useState y useEffect", tipo: "ejercicio", fecha: new Date("2026-02-20"), descripcion: "Implementar estado y efectos en componentes React", valorMax: 10 },
      { nombre: "Tarea: Formularios React", tipo: "tarea", fecha: new Date("2026-02-24"), descripcion: "Crear formularios controlados con validación", valorMax: 10 },
      { nombre: "Práctica: React Router", tipo: "practica", fecha: new Date("2026-03-02"), descripcion: "Implementar navegación SPA con React Router", valorMax: 10 },
      { nombre: "Proyecto: Dashboard React", tipo: "proyecto", fecha: new Date("2026-03-06"), descripcion: "Desarrollar un dashboard interactivo con múltiples vistas", valorMax: 10 },
      { nombre: "Examen Parcial 2", tipo: "examen", fecha: new Date("2026-03-10"), descripcion: "Evaluación de React: componentes, hooks, routing y estado", valorMax: 10 },
    ];

    const actividadesCreadas2_3A = [];
    for (const act of actividades2_3A) {
      const created = await prisma.actividad.create({
        data: { ...act, unidadId: unidad2_3A.id },
      });
      actividadesCreadas2_3A.push(created);
    }

    // ==================== ACTIVIDADES - UNIDAD 1 GRUPO 5A ====================
    const actividades1_5A = [
      { nombre: "Práctica: Diagrama ER", tipo: "practica", fecha: new Date("2026-01-21"), descripcion: "Diseñar diagrama entidad-relación para sistema bancario", valorMax: 10 },
      { nombre: "Ejercicio: Normalización", tipo: "ejercicio", fecha: new Date("2026-01-28"), descripcion: "Aplicar 1FN, 2FN y 3FN a tablas desnormalizadas", valorMax: 10 },
      { nombre: "Tarea: Creación de BD", tipo: "tarea", fecha: new Date("2026-02-04"), descripcion: "Crear base de datos en PostgreSQL con constraints", valorMax: 10 },
      { nombre: "Examen: Modelo Relacional", tipo: "examen", fecha: new Date("2026-02-11"), descripcion: "Evaluación teórica del modelo relacional", valorMax: 10 },
    ];

    const actividadesCreadas1_5A = [];
    for (const act of actividades1_5A) {
      const created = await prisma.actividad.create({
        data: { ...act, unidadId: unidad1_5A.id },
      });
      actividadesCreadas1_5A.push(created);
    }

    // ==================== ACTIVIDADES - UNIDAD 1 GRUPO 7A ====================
    const actividades1_7A = [
      { nombre: "Práctica: Scrum Simulación", tipo: "practica", fecha: new Date("2026-01-22"), descripcion: "Simular sprint planning, daily y retrospectiva", valorMax: 10 },
      { nombre: "Tarea: Product Backlog", tipo: "tarea", fecha: new Date("2026-01-29"), descripcion: "Crear product backlog con historias de usuario para proyecto real", valorMax: 10 },
      { nombre: "Proyecto: Sprint 1", tipo: "proyecto", fecha: new Date("2026-02-12"), descripcion: "Ejecutar primer sprint completo del proyecto del curso", valorMax: 10 },
    ];

    for (const act of actividades1_7A) {
      await prisma.actividad.create({
        data: { ...act, unidadId: unidad1_7A.id },
      });
    }

    // ==================== REGISTROS DIARIOS - UNIDAD 1 GRUPO 3A (COMPLETA) ====================
    // Simular calificaciones variadas y realistas para los 15 alumnos del grupo 3A
    const calificacionesBase = [
      // Carlos - Excelente alumno
      [9.5, 10, 9, 9.5, 10, 9.8, 9],
      // Ana - Muy buena alumna
      [9, 8.5, 9, 9, 8, 9.5, 8.5],
      // Luis - Buen alumno
      [8, 7.5, 8.5, 7, 9, 8, 7.5],
      // Sofía - Alumna destacada
      [10, 9.5, 10, 9, 10, 10, 9.5],
      // Diego - Alumno regular
      [7, 6.5, 7, 7.5, 8, 7, 6],
      // Valentina - Buena alumna
      [8.5, 9, 8, 8.5, 7, 8.5, 8],
      // Miguel - Alumno irregular
      [6, 8, 5, 9, 7, 6.5, 5.5],
      // Fernanda - Muy buena alumna
      [9, 9.5, 8.5, 9, 9, 9, 8],
      // Andrés - Alumno promedio
      [7.5, 7, 7.5, 8, 7, 7, 7],
      // Camila - Alumna destacada
      [9.5, 9, 9.5, 9, 10, 9.5, 9],
      // Javier - Buen alumno
      [8, 8.5, 8, 7.5, 8, 8, 7.5],
      // Isabella - Alumna excelente
      [10, 9, 9.5, 10, 9, 10, 9.5],
      // Ricardo - Alumno regular
      [7, 6, 7.5, 6.5, 7, 7, 6.5],
      // Mariana - Buena alumna
      [8.5, 8, 9, 8, 8.5, 8.5, 8],
      // Sebastián - Alumno promedio
      [7.5, 7, 6.5, 8, 7.5, 7, 7],
    ];

    for (let alumnoIdx = 0; alumnoIdx < 15; alumnoIdx++) {
      for (let actIdx = 0; actIdx < actividadesCreadas1_3A.length; actIdx++) {
        const asistencia = Math.random() > 0.05; // 95% asistencia
        const participacion = Math.random() > 0.4; // 60% participación
        await prisma.registroDiarioAlumno.create({
          data: {
            fecha: actividadesCreadas1_3A[actIdx].fecha,
            alumnoId: alumnos[alumnoIdx].id,
            actividadId: actividadesCreadas1_3A[actIdx].id,
            asistencia,
            participacion,
            calificacion: asistencia ? calificacionesBase[alumnoIdx][actIdx] : 0,
            observaciones: !asistencia ? "Falta justificada" :
              participacion ? "Buena participación en clase" : null,
          },
        });
      }
    }

    // ==================== REGISTROS DIARIOS - UNIDAD 2 GRUPO 3A (PARCIAL - en curso) ====================
    // Solo las primeras 4 actividades tienen calificaciones (las últimas 2 aún no)
    const calificacionesU2 = [
      [9, 9.5, 8.5, 9],    // Carlos
      [8.5, 8, 9, 8],      // Ana
      [7.5, 7, 8, 7.5],    // Luis
      [10, 9.5, 9, 10],    // Sofía
      [6.5, 7, 6, 7],      // Diego
      [8, 8.5, 8, 7.5],    // Valentina
      [7, 5.5, 7, 6],      // Miguel
      [9, 9, 8.5, 9],      // Fernanda
      [7, 7.5, 7, 8],      // Andrés
      [9.5, 9, 9.5, 9],    // Camila
      [8, 7.5, 8, 8.5],    // Javier
      [9.5, 10, 9, 9.5],   // Isabella
      [6.5, 7, 6, 7],      // Ricardo
      [8, 8.5, 8, 8],      // Mariana
      [7, 6.5, 7.5, 7],    // Sebastián
    ];

    for (let alumnoIdx = 0; alumnoIdx < 15; alumnoIdx++) {
      for (let actIdx = 0; actIdx < 4; actIdx++) {
        const asistencia = Math.random() > 0.08;
        const participacion = Math.random() > 0.45;
        await prisma.registroDiarioAlumno.create({
          data: {
            fecha: actividadesCreadas2_3A[actIdx].fecha,
            alumnoId: alumnos[alumnoIdx].id,
            actividadId: actividadesCreadas2_3A[actIdx].id,
            asistencia,
            participacion,
            calificacion: asistencia ? calificacionesU2[alumnoIdx][actIdx] : 0,
            observaciones: !asistencia ? "Falta sin justificar" : null,
          },
        });
      }
    }

    // ==================== REGISTROS DIARIOS - GRUPO 5A ====================
    const calificaciones5A = [
      [9, 8.5, 9, 8],     // Carlos
      [8.5, 9, 8, 7.5],   // Ana
      [7, 7.5, 7, 7],     // Luis
      [10, 10, 9.5, 9],   // Sofía
      [6.5, 6, 7, 6],     // Diego
      [8, 8, 8.5, 7.5],   // Valentina
      [5.5, 7, 6, 5],     // Miguel
      [9, 8.5, 9, 8.5],   // Fernanda
      [7.5, 7, 7.5, 7],   // Andrés
      [9, 9.5, 9, 9],     // Camila
    ];

    for (let alumnoIdx = 0; alumnoIdx < 10; alumnoIdx++) {
      for (let actIdx = 0; actIdx < actividadesCreadas1_5A.length; actIdx++) {
        const asistencia = Math.random() > 0.07;
        await prisma.registroDiarioAlumno.create({
          data: {
            fecha: actividadesCreadas1_5A[actIdx].fecha,
            alumnoId: alumnos[alumnoIdx].id,
            actividadId: actividadesCreadas1_5A[actIdx].id,
            asistencia,
            participacion: Math.random() > 0.5,
            calificacion: asistencia ? calificaciones5A[alumnoIdx][actIdx] : 0,
          },
        });
      }
    }

    // ==================== AUTOEVALUACIONES - UNIDAD 1 GRUPO 3A ====================
    const reflexiones = [
      "Considero que me esforcé mucho en esta unidad. Aprendí bastante sobre HTML y CSS, aunque me costó un poco JavaScript.",
      "Creo que mi desempeño fue bueno. Participé en todas las actividades y ayudé a mis compañeros cuando tenían dudas.",
      "Fue una unidad difícil para mí, pero logré completar todas las tareas. Necesito mejorar en la parte práctica.",
      "Estoy muy satisfecha con mi trabajo. Dediqué tiempo extra a practicar y eso se reflejó en mis calificaciones.",
      "Me costó mantener el ritmo al inicio pero mejoré conforme avanzó la unidad. Debo ser más constante.",
      "Trabajé de forma consistente. Mi participación en el debate fue uno de los mejores momentos de la unidad.",
      "Reconozco que no di mi mejor esfuerzo en algunas actividades. Para la siguiente unidad me comprometo a mejorar.",
      "Disfruté mucho las prácticas. El proyecto de landing page fue desafiante pero muy gratificante.",
      "Mi rendimiento fue regular. Cumplí con lo mínimo pero sé que puedo dar más en la siguiente unidad.",
      "Estoy orgullosa de mi trabajo en equipo. Colaboré activamente y aprendí mucho de mis compañeros.",
      "Las prácticas fueron lo que más me gustó. Necesito mejorar en los exámenes teóricos.",
      "Fue una excelente unidad. Me encantó el proyecto y las prácticas. Mi punto débil fue la participación oral.",
      "Tuve dificultades con algunos temas pero busqué ayuda y logré entender. Debo organizar mejor mi tiempo.",
      "Me sentí cómoda con los temas. La parte de CSS fue mi favorita y donde mejor me desempeñé.",
      "Fue mi primera experiencia con desarrollo web. Me siento motivado aunque sé que debo mejorar la calidad de mi código.",
    ];

    const autoevalPuntajes = [9, 8.5, 7, 9.5, 7, 8, 6.5, 9, 7.5, 9, 8, 9.5, 7, 8.5, 7.5];

    for (let i = 0; i < 15; i++) {
      await prisma.autoevaluacion.create({
        data: {
          alumnoId: alumnos[i].id,
          unidadId: unidad1_3A.id,
          puntaje: autoevalPuntajes[i],
          reflexion: reflexiones[i],
        },
      });
    }

    // ==================== AUTOEVALUACIONES - UNIDAD 1 GRUPO 5A ====================
    const reflexiones5A = [
      "El modelo relacional me pareció fascinante. Las prácticas de normalización fueron muy útiles.",
      "Me costó la normalización al principio pero con práctica logré entenderla bien.",
      "Unidad interesante. Necesito practicar más los diagramas ER.",
      "Excelente unidad, me encantó el diseño de bases de datos desde cero.",
      "Fue difícil pero aprendí mucho sobre diseño de tablas.",
      "Buen desempeño en general, me faltó profundizar en las constraints.",
      "Me costó bastante esta unidad. Necesito repasar los fundamentos.",
      "Muy buena experiencia, las prácticas en PostgreSQL fueron geniales.",
      "Rendimiento aceptable, debo mejorar en el siguiente parcial.",
      "Me fue muy bien, el diagrama ER es mi parte favorita del curso.",
    ];

    for (let i = 0; i < 10; i++) {
      await prisma.autoevaluacion.create({
        data: {
          alumnoId: alumnos[i].id,
          unidadId: unidad1_5A.id,
          puntaje: [9, 8, 7.5, 10, 6.5, 8, 6, 9, 7, 9.5][i],
          reflexion: reflexiones5A[i],
        },
      });
    }

    // ==================== COEVALUACIONES - UNIDAD 1 GRUPO 3A ====================
    // Cada miembro evalúa a los otros miembros de su equipo
    const comentariosCoe = [
      "Excelente compañero, siempre apoya al equipo y cumple con sus responsabilidades.",
      "Buen trabajo en equipo, aunque a veces se atrasa con las entregas.",
      "Muy participativo y creativo. Aporta ideas valiosas al equipo.",
      "Cumple con lo asignado pero podría involucrarse más en las discusiones.",
      "Líder natural, organiza bien las tareas y motiva al equipo.",
      "Trabajador constante, siempre dispuesto a ayudar a los demás.",
      "Necesita mejorar su comunicación con el equipo y cumplir los plazos.",
      "Gran aporte técnico al equipo, domina bien los temas.",
      "Responsable y puntual, aunque podría tomar más iniciativa.",
      "Colaborador excepcional, siempre busca que todo el equipo entienda.",
    ];

    // Equipo Alpha (alumnos 0-4)
    for (let evaluador = 0; evaluador < 5; evaluador++) {
      for (let evaluado = 0; evaluado < 5; evaluado++) {
        if (evaluador === evaluado) continue;
        const basePuntaje = [9, 8.5, 7.5, 9.5, 7][evaluado];
        const variacion = (Math.random() - 0.5) * 1.5;
        const puntaje = Math.min(10, Math.max(5, Math.round((basePuntaje + variacion) * 10) / 10));
        await prisma.coevaluacion.create({
          data: {
            evaluadorId: alumnos[evaluador].id,
            evaluadoId: alumnos[evaluado].id,
            unidadId: unidad1_3A.id,
            puntaje,
            comentario: comentariosCoe[Math.floor(Math.random() * comentariosCoe.length)],
          },
        });
      }
    }

    // Equipo Beta (alumnos 5-9)
    for (let evaluador = 5; evaluador < 10; evaluador++) {
      for (let evaluado = 5; evaluado < 10; evaluado++) {
        if (evaluador === evaluado) continue;
        const basePuntaje = [8.5, 6.5, 9, 7.5, 9][evaluado - 5];
        const variacion = (Math.random() - 0.5) * 1.5;
        const puntaje = Math.min(10, Math.max(5, Math.round((basePuntaje + variacion) * 10) / 10));
        await prisma.coevaluacion.create({
          data: {
            evaluadorId: alumnos[evaluador].id,
            evaluadoId: alumnos[evaluado].id,
            unidadId: unidad1_3A.id,
            puntaje,
            comentario: comentariosCoe[Math.floor(Math.random() * comentariosCoe.length)],
          },
        });
      }
    }

    // Equipo Gamma (alumnos 10-14)
    for (let evaluador = 10; evaluador < 15; evaluador++) {
      for (let evaluado = 10; evaluado < 15; evaluado++) {
        if (evaluador === evaluado) continue;
        const basePuntaje = [8, 9.5, 7, 8.5, 7.5][evaluado - 10];
        const variacion = (Math.random() - 0.5) * 1.5;
        const puntaje = Math.min(10, Math.max(5, Math.round((basePuntaje + variacion) * 10) / 10));
        await prisma.coevaluacion.create({
          data: {
            evaluadorId: alumnos[evaluador].id,
            evaluadoId: alumnos[evaluado].id,
            unidadId: unidad1_3A.id,
            puntaje,
            comentario: comentariosCoe[Math.floor(Math.random() * comentariosCoe.length)],
          },
        });
      }
    }

    // ==================== HETEROEVALUACIONES - UNIDAD 1 GRUPO 3A ====================
    const heteroTipos: Array<"examen" | "rubrica" | "lista_cotejo" | "guia_observacion"> = ["examen", "rubrica", "lista_cotejo", "guia_observacion"];
    const heteroPuntajes = [
      [9, 9.5, 9, 10],      // Carlos
      [8.5, 8, 9, 8.5],     // Ana
      [7.5, 7, 8, 7],       // Luis
      [9.5, 10, 9.5, 10],   // Sofía
      [6, 7, 6.5, 7.5],     // Diego
      [8, 8.5, 8, 8],       // Valentina
      [5.5, 6, 7, 6.5],     // Miguel
      [8, 9, 8.5, 9],       // Fernanda
      [7, 7, 7.5, 7],       // Andrés
      [9, 9.5, 9, 9.5],     // Camila
      [7.5, 8, 8, 7.5],     // Javier
      [9.5, 9, 10, 9.5],    // Isabella
      [6.5, 6, 7, 6.5],     // Ricardo
      [8, 8.5, 8, 8.5],     // Mariana
      [7, 7, 7.5, 7],       // Sebastián
    ];

    for (let i = 0; i < 15; i++) {
      for (let t = 0; t < heteroTipos.length; t++) {
        await prisma.heteroevaluacion.create({
          data: {
            alumnoId: alumnos[i].id,
            unidadId: unidad1_3A.id,
            puntaje: heteroPuntajes[i][t],
            tipo: heteroTipos[t],
          },
        });
      }
    }

    // ==================== HETEROEVALUACIONES - UNIDAD 1 GRUPO 5A ====================
    for (let i = 0; i < 10; i++) {
      for (let t = 0; t < 2; t++) {
        await prisma.heteroevaluacion.create({
          data: {
            alumnoId: alumnos[i].id,
            unidadId: unidad1_5A.id,
            puntaje: calificaciones5A[i][t + 2],
            tipo: heteroTipos[t],
          },
        });
      }
    }

    // ==================== CALIFICACIONES FINALES - UNIDAD 1 GRUPO 3A ====================
    const calFinales3A = [
      { actitudinal: 9.5, desempeno: 9.4, hetero: 9.4, evidencias: 9.8, final: 9.5, confirmada: true, obs: "Alumno sobresaliente, mantener el ritmo" },
      { actitudinal: 8.5, desempeno: 8.7, hetero: 8.5, evidencias: 8.5, final: 8.6, confirmada: true, obs: "Muy buen desempeño general" },
      { actitudinal: 7.5, desempeno: 7.8, hetero: 7.4, evidencias: 8.0, final: 7.7, confirmada: true, obs: "Buen alumno, puede mejorar en participación" },
      { actitudinal: 10, desempeno: 9.8, hetero: 9.8, evidencias: 10, final: 9.9, confirmada: true, obs: "Excelencia académica, felicidades" },
      { actitudinal: 7.0, desempeno: 7.0, hetero: 6.8, evidencias: 7.0, final: 6.9, confirmada: true, obs: "Necesita mejorar constancia y dedicación" },
      { actitudinal: 8.5, desempeno: 8.3, hetero: 8.1, evidencias: 8.5, final: 8.3, confirmada: true, obs: "Buen trabajo, participación activa" },
      { actitudinal: 6.0, desempeno: 6.8, hetero: 6.3, evidencias: 6.5, final: 6.4, confirmada: false, obs: "Requiere mayor compromiso con las actividades" },
      { actitudinal: 9.0, desempeno: 9.0, hetero: 8.6, evidencias: 9.0, final: 8.9, confirmada: true, obs: "Excelente desempeño, muy responsable" },
      { actitudinal: 7.5, desempeno: 7.3, hetero: 7.1, evidencias: 7.0, final: 7.2, confirmada: true, obs: "Rendimiento aceptable, buscar mejoría" },
      { actitudinal: 9.5, desempeno: 9.5, hetero: 9.3, evidencias: 9.5, final: 9.4, confirmada: true, obs: "Destacada en todas las áreas" },
      { actitudinal: 8.0, desempeno: 8.0, hetero: 7.9, evidencias: 8.0, final: 8.0, confirmada: true, obs: "Buen alumno, constante en su trabajo" },
      { actitudinal: 10, desempeno: 9.6, hetero: 9.5, evidencias: 10, final: 9.7, confirmada: true, obs: "Excelente, modelo a seguir para el grupo" },
      { actitudinal: 6.5, desempeno: 6.8, hetero: 6.5, evidencias: 7.0, final: 6.7, confirmada: false, obs: "Debe mejorar organización y puntualidad" },
      { actitudinal: 8.5, desempeno: 8.4, hetero: 8.3, evidencias: 8.5, final: 8.4, confirmada: true, obs: "Muy buen trabajo, especialmente en CSS" },
      { actitudinal: 7.0, desempeno: 7.2, hetero: 7.1, evidencias: 7.0, final: 7.1, confirmada: true, obs: "Promedio aceptable, tiene potencial para más" },
    ];

    for (let i = 0; i < 15; i++) {
      const cf = calFinales3A[i];
      await prisma.calificacionFinal.create({
        data: {
          alumnoId: alumnos[i].id,
          unidadId: unidad1_3A.id,
          calActitudinal: cf.actitudinal,
          calDesempeno: cf.desempeno,
          calHeteroevaluacion: cf.hetero,
          calEvidencias: cf.evidencias,
          calFinal: cf.final,
          confirmada: cf.confirmada,
          observaciones: cf.obs,
        },
      });
    }

    // ==================== CALIFICACIONES FINALES - UNIDAD 1 GRUPO 5A ====================
    const calFinales5A = [
      { actitudinal: 9.0, desempeno: 8.8, hetero: 9.0, evidencias: 8.5, final: 8.8, confirmada: true },
      { actitudinal: 8.5, desempeno: 8.3, hetero: 8.0, evidencias: 8.0, final: 8.2, confirmada: true },
      { actitudinal: 7.0, desempeno: 7.1, hetero: 7.0, evidencias: 7.5, final: 7.1, confirmada: true },
      { actitudinal: 10, desempeno: 9.9, hetero: 9.5, evidencias: 10, final: 9.8, confirmada: true },
      { actitudinal: 6.5, desempeno: 6.3, hetero: 7.0, evidencias: 6.0, final: 6.5, confirmada: false },
      { actitudinal: 8.0, desempeno: 8.1, hetero: 8.5, evidencias: 8.0, final: 8.2, confirmada: true },
      { actitudinal: 5.5, desempeno: 6.1, hetero: 6.0, evidencias: 5.5, final: 5.8, confirmada: false },
      { actitudinal: 9.0, desempeno: 8.8, hetero: 9.0, evidencias: 9.0, final: 8.9, confirmada: true },
      { actitudinal: 7.5, desempeno: 7.3, hetero: 7.5, evidencias: 7.0, final: 7.3, confirmada: true },
      { actitudinal: 9.5, desempeno: 9.4, hetero: 9.0, evidencias: 9.5, final: 9.3, confirmada: true },
    ];

    for (let i = 0; i < 10; i++) {
      const cf = calFinales5A[i];
      await prisma.calificacionFinal.create({
        data: {
          alumnoId: alumnos[i].id,
          unidadId: unidad1_5A.id,
          calActitudinal: cf.actitudinal,
          calDesempeno: cf.desempeno,
          calHeteroevaluacion: cf.hetero,
          calEvidencias: cf.evidencias,
          calFinal: cf.final,
          confirmada: cf.confirmada,
        },
      });
    }

    return NextResponse.json({
      message: "Base de datos poblada exitosamente con datos extensos de demo",
      resumen: {
        usuarios: { docentes: 2, admin: 1, alumnos: 30 },
        materias: 3,
        grupos: 4,
        equipos: 10,
        unidades: 8,
        actividades: "24 actividades distribuidas en múltiples unidades",
        registrosDiarios: "290+ registros de calificaciones",
        autoevaluaciones: 25,
        coevaluaciones: "60 evaluaciones entre pares",
        heteroevaluaciones: "80 evaluaciones del docente",
        calificacionesFinales: 25,
      },
      credenciales: {
        docente1: "docente@seyce.edu / password123",
        docente2: "roberto@seyce.edu / password123",
        admin: "admin@seyce.edu / password123",
        alumnoEjemplo: "carlos@seyce.edu / password123",
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al crear datos de prueba", details: String(error) }, { status: 500 });
  }
}
