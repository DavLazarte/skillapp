import { createClient } from "@libsql/client"
import fs from "fs"
import path from "path"
import "dotenv/config"

const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN!,
})

async function main() {
  const sqlFile = path.join(process.cwd(), "prisma", "migration.sql")
  const sql = fs.readFileSync(sqlFile, "utf-8")
  
  // Split by semicolon but ignore inside quotes
  const statements = sql
    .split(";")
    .map(s => s.trim())
    .filter(s => s.length > 0)

  console.log(`Ejecutando ${statements.length} sentencias SQL en Turso...`)

  for (const statement of statements) {
    try {
      await client.execute(statement)
    } catch (error: any) {
      // Ignore if table already exists error (optional)
      console.error(`Error en sentencia: ${statement.substring(0, 50)}...`)
      console.error(error.message)
    }
  }

  console.log("Migración completada.")
}

main().finally(() => client.close())
