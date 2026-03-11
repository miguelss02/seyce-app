-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'alumno',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Materia" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "horasSemana" INTEGER NOT NULL DEFAULT 5,
    "descripcion" TEXT,
    "docenteId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Materia_docenteId_fkey" FOREIGN KEY ("docenteId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Grupo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "periodo" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "materiaId" TEXT NOT NULL,
    "docenteId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Grupo_materiaId_fkey" FOREIGN KEY ("materiaId") REFERENCES "Materia" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Grupo_docenteId_fkey" FOREIGN KEY ("docenteId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Inscripcion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "alumnoId" TEXT NOT NULL,
    "grupoId" TEXT NOT NULL,
    CONSTRAINT "Inscripcion_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Inscripcion_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "Grupo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Equipo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "grupoId" TEXT NOT NULL,
    CONSTRAINT "Equipo_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "Grupo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MiembroEquipo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "alumnoId" TEXT NOT NULL,
    "equipoId" TEXT NOT NULL,
    "esJefe" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "MiembroEquipo_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MiembroEquipo_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "Equipo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Unidad" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "grupoId" TEXT NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Unidad_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "Grupo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CriterioEvaluacion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "porcentaje" REAL NOT NULL,
    "unidadId" TEXT NOT NULL,
    CONSTRAINT "CriterioEvaluacion_unidadId_fkey" FOREIGN KEY ("unidadId") REFERENCES "Unidad" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Actividad" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "fecha" DATETIME NOT NULL,
    "descripcion" TEXT,
    "valorMax" REAL NOT NULL DEFAULT 10,
    "unidadId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Actividad_unidadId_fkey" FOREIGN KEY ("unidadId") REFERENCES "Unidad" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RegistroDiarioAlumno" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fecha" DATETIME NOT NULL,
    "alumnoId" TEXT NOT NULL,
    "actividadId" TEXT NOT NULL,
    "asistencia" BOOLEAN NOT NULL DEFAULT true,
    "participacion" BOOLEAN NOT NULL DEFAULT false,
    "calificacion" REAL,
    "observaciones" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RegistroDiarioAlumno_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RegistroDiarioAlumno_actividadId_fkey" FOREIGN KEY ("actividadId") REFERENCES "Actividad" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Autoevaluacion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "alumnoId" TEXT NOT NULL,
    "unidadId" TEXT NOT NULL,
    "puntaje" REAL NOT NULL,
    "reflexion" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Autoevaluacion_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Coevaluacion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "evaluadorId" TEXT NOT NULL,
    "evaluadoId" TEXT NOT NULL,
    "unidadId" TEXT NOT NULL,
    "puntaje" REAL NOT NULL,
    "comentario" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Coevaluacion_evaluadorId_fkey" FOREIGN KEY ("evaluadorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Coevaluacion_evaluadoId_fkey" FOREIGN KEY ("evaluadoId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Heteroevaluacion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "alumnoId" TEXT NOT NULL,
    "unidadId" TEXT NOT NULL,
    "puntaje" REAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Heteroevaluacion_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CalificacionFinal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "alumnoId" TEXT NOT NULL,
    "unidadId" TEXT NOT NULL,
    "calActitudinal" REAL,
    "calDesempeno" REAL,
    "calHeteroevaluacion" REAL,
    "calEvidencias" REAL,
    "calFinal" REAL,
    "confirmada" BOOLEAN NOT NULL DEFAULT false,
    "observaciones" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CalificacionFinal_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CalificacionFinal_unidadId_fkey" FOREIGN KEY ("unidadId") REFERENCES "Unidad" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Inscripcion_alumnoId_grupoId_key" ON "Inscripcion"("alumnoId", "grupoId");

-- CreateIndex
CREATE UNIQUE INDEX "MiembroEquipo_alumnoId_equipoId_key" ON "MiembroEquipo"("alumnoId", "equipoId");

-- CreateIndex
CREATE UNIQUE INDEX "RegistroDiarioAlumno_alumnoId_actividadId_key" ON "RegistroDiarioAlumno"("alumnoId", "actividadId");

-- CreateIndex
CREATE UNIQUE INDEX "Autoevaluacion_alumnoId_unidadId_key" ON "Autoevaluacion"("alumnoId", "unidadId");

-- CreateIndex
CREATE UNIQUE INDEX "Coevaluacion_evaluadorId_evaluadoId_unidadId_key" ON "Coevaluacion"("evaluadorId", "evaluadoId", "unidadId");

-- CreateIndex
CREATE UNIQUE INDEX "Heteroevaluacion_alumnoId_unidadId_tipo_key" ON "Heteroevaluacion"("alumnoId", "unidadId", "tipo");

-- CreateIndex
CREATE UNIQUE INDEX "CalificacionFinal_alumnoId_unidadId_key" ON "CalificacionFinal"("alumnoId", "unidadId");
