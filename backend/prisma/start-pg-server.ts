import { PGlite } from "@electric-sql/pglite";
import { fromNodeSocket } from "pg-gateway/node";
import net from "net";
import path from "path";

const dbPath = path.join(__dirname, "dev.db");
const db = new PGlite(dbPath);

const server = net.createServer((socket) => {
  fromNodeSocket(socket, async (query: string) => {
    try {
      const res = await db.query(query);
      return {
        rows: res.rows,
        fields: res.fields?.map(f => ({ name: f.name, dataTypeID: f.dataTypeID })),
      };
    } catch (err: any) {
      console.error("DB Query error:", err);
      throw err;
    }
  });
});

const PORT = 5432;
server.listen(PORT, "127.0.0.1", () => {
  console.log(`🚀 Workstation Local PostgreSQL Server active on 127.0.0.1:${PORT}`);
});
