// lib/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";
import ws from "ws";

// Set WebSocket constructor untuk Neon di lingkungan Node.js
neonConfig.webSocketConstructor = ws;

// Gunakan Pool agar koneksi tetap terbuka dan mendukung Transaction
const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

export const db = drizzle(pool, { schema });
