// apply-migration.js — Crea todas las tablas en Turso desde cero
const fs = require("fs")
const path = require("path")

// Leer .env manualmente
const envPath = path.join(process.cwd(), ".env")
const envContent = fs.readFileSync(envPath, "utf-8")
envContent.split("\n").forEach(line => {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith("#")) return
  const eqIdx = trimmed.indexOf("=")
  if (eqIdx === -1) return
  const key = trimmed.slice(0, eqIdx).trim()
  const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "")
  process.env[key] = val
})

const { createClient } = require("@libsql/client")

const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN,
})

// SQL completo del schema nuevo — ejecutado statement por statement
const statements = [
  // Borrar tablas viejas (en orden para respetar foreign keys)
  "DROP TABLE IF EXISTS Asistencia",
  "DROP TABLE IF EXISTS Link",
  "DROP TABLE IF EXISTS Dia",
  "DROP TABLE IF EXISTS Semana",
  "DROP TABLE IF EXISTS AlumnoPlan",
  "DROP TABLE IF EXISTS TipoPlan",
  "DROP TABLE IF EXISTS RM",
  "DROP TABLE IF EXISTS Comentario",
  "DROP TABLE IF EXISTS Pago",
  "DROP TABLE IF EXISTS User",

  // Crear tabla User
  `CREATE TABLE IF NOT EXISTS User (
    id TEXT NOT NULL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    nombre TEXT NOT NULL,
    avatar TEXT,
    gimnasio TEXT,
    estado TEXT,
    cuota REAL,
    vencimiento DATETIME,
    telefono TEXT,
    fechaInicio DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,

  // Crear tabla TipoPlan
  `CREATE TABLE IF NOT EXISTS TipoPlan (
    id TEXT NOT NULL PRIMARY KEY,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    color TEXT NOT NULL DEFAULT '#f97316',
    icono TEXT NOT NULL DEFAULT 'dumbbell'
  )`,

  // Crear tabla AlumnoPlan (relacion N:M)
  `CREATE TABLE IF NOT EXISTS AlumnoPlan (
    id TEXT NOT NULL PRIMARY KEY,
    userId TEXT NOT NULL,
    tipoPlanId TEXT NOT NULL,
    CONSTRAINT AlumnoPlan_userId_fkey FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT AlumnoPlan_tipoPlanId_fkey FOREIGN KEY (tipoPlanId) REFERENCES TipoPlan(id) ON DELETE CASCADE ON UPDATE CASCADE
  )`,

  "CREATE UNIQUE INDEX IF NOT EXISTS AlumnoPlan_userId_tipoPlanId_key ON AlumnoPlan(userId, tipoPlanId)",

  // Crear tabla Semana
  `CREATE TABLE IF NOT EXISTS Semana (
    id TEXT NOT NULL PRIMARY KEY,
    titulo TEXT NOT NULL,
    numero INTEGER NOT NULL,
    estado TEXT NOT NULL,
    fechaInicio DATETIME NOT NULL,
    tipoPlanId TEXT NOT NULL,
    CONSTRAINT Semana_tipoPlanId_fkey FOREIGN KEY (tipoPlanId) REFERENCES TipoPlan(id) ON DELETE CASCADE ON UPDATE CASCADE
  )`,

  // Crear tabla Dia
  `CREATE TABLE IF NOT EXISTS Dia (
    id TEXT NOT NULL PRIMARY KEY,
    semanaId TEXT NOT NULL,
    nombre TEXT NOT NULL,
    descanso BOOLEAN NOT NULL DEFAULT false,
    contenido TEXT NOT NULL DEFAULT '',
    orden INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT Dia_semanaId_fkey FOREIGN KEY (semanaId) REFERENCES Semana(id) ON DELETE CASCADE ON UPDATE CASCADE
  )`,

  // Crear tabla Link
  `CREATE TABLE IF NOT EXISTS Link (
    id TEXT NOT NULL PRIMARY KEY,
    diaId TEXT NOT NULL,
    titulo TEXT NOT NULL,
    url TEXT NOT NULL,
    CONSTRAINT Link_diaId_fkey FOREIGN KEY (diaId) REFERENCES Dia(id) ON DELETE CASCADE ON UPDATE CASCADE
  )`,

  // Crear tabla RM
  `CREATE TABLE IF NOT EXISTS RM (
    id TEXT NOT NULL PRIMARY KEY,
    userId TEXT NOT NULL,
    ejercicio TEXT NOT NULL,
    kg REAL NOT NULL,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT RM_userId_fkey FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE ON UPDATE CASCADE
  )`,

  // Crear tabla Comentario
  `CREATE TABLE IF NOT EXISTS Comentario (
    id TEXT NOT NULL PRIMARY KEY,
    userId TEXT NOT NULL,
    semanaNumero INTEGER NOT NULL,
    diaNombre TEXT NOT NULL,
    texto TEXT NOT NULL,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    rol TEXT NOT NULL,
    CONSTRAINT Comentario_userId_fkey FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE ON UPDATE CASCADE
  )`,

  // Crear tabla Pago
  `CREATE TABLE IF NOT EXISTS Pago (
    id TEXT NOT NULL PRIMARY KEY,
    userId TEXT NOT NULL,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    monto REAL NOT NULL,
    estado TEXT NOT NULL,
    metodo TEXT NOT NULL,
    nota TEXT,
    CONSTRAINT Pago_userId_fkey FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE ON UPDATE CASCADE
  )`,

  // Crear tabla Asistencia
  `CREATE TABLE IF NOT EXISTS Asistencia (
    id TEXT NOT NULL PRIMARY KEY,
    userId TEXT NOT NULL,
    diaId TEXT NOT NULL,
    completado BOOLEAN NOT NULL DEFAULT false,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT Asistencia_userId_fkey FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT Asistencia_diaId_fkey FOREIGN KEY (diaId) REFERENCES Dia(id) ON DELETE CASCADE ON UPDATE CASCADE
  )`,

  "CREATE UNIQUE INDEX IF NOT EXISTS Asistencia_userId_diaId_key ON Asistencia(userId, diaId)",
]

async function main() {
  console.log(`🚀 Aplicando ${statements.length} sentencias SQL en Turso...`)
  let ok = 0, fail = 0

  for (const stmt of statements) {
    try {
      await client.execute(stmt)
      ok++
      process.stdout.write(".")
    } catch (e) {
      console.error(`\n❌ Error: ${e.message}`)
      console.error(`   SQL: ${stmt.substring(0, 100)}`)
      fail++
    }
  }

  console.log(`\n\n✅ Migración completada — ${ok} OK, ${fail} errores`)
}

main().catch(console.error).finally(() => client.close())
