import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../backend/.env'), quiet: true });

// Los specs registran usuarios reales (vía POST /api/register) con
// username prefijado "e2e_" para poder identificarlos. Al borrar la fila
// de `perfil`, el ON DELETE CASCADE de `usuarios` (y de ahí el de
// `favoritos`/`compras_guardadas`) se lleva puesto todo lo demás.
export default async function globalTeardown() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });
  try {
    const [result] = await conn.query(
      `DELETE p FROM perfil p
       INNER JOIN usuarios u ON u.perfil_id_perfil = p.id_perfil
       WHERE u.username LIKE 'e2e\\_%'`
    );
    console.log(`[e2e teardown] usuarios de prueba eliminados: ${result.affectedRows}`);
  } finally {
    await conn.end();
  }
}
