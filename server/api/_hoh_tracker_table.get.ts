import { useTurso } from "../utils/turso";

export default defineEventHandler(async (_event) => {
  const client = useTurso();

  const query = `
    CREATE TABLE IF NOT EXISTS hoh_tracker (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at DATETIME DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      updated_at DATETIME DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      status BOOLEAN NOT NULL DEFAULT 0,
      step TEXT NOT NULL,
      process INTEGER DEFAULT 0 CHECK (process >= 0 AND process <= 100)
    );
  `;

  try {
    await client.execute(query);
    return {
      success: true,
      message: "Table 'hoh_tracker' created successfully or already exists."
    };
  } catch (error) {
    console.error("Error creating table:", error);
    throw createError({
      statusCode: 500,
      message: "Failed to create 'hoh_tracker' table."
    });
  }
});
