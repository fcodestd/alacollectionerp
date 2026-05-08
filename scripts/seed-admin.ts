import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../lib/schema";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function main() {
  console.log("⏳ Sedang membuat akun superadmin...");

  const passwordHashed = await bcrypt.hash("admin123", 10);

  try {
    await db.insert(schema.pengguna).values({
      namaPengguna: "superadmin",
      namaLengkap: "Fadillah Maulana",
      kataSandi: passwordHashed,
      peran: "superadmin",
    });
    console.log("✅ Berhasil! User: superadmin | Pass: admin123");
  } catch (error) {
    console.error("❌ Gagal seeding (mungkin user sudah ada):", error);
  }
}

main();
