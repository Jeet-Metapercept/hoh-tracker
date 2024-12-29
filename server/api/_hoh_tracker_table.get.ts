import { useTurso } from "../utils/turso";

export default defineEventHandler(async (_event) => {
  const client = useTurso();

  const query = `
    CREATE TABLE IF NOT EXISTS hoh_tracker (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      status BOOLEAN NOT NULL DEFAULT 0,
      step TEXT NOT NULL
    );
  `;

  try {
    await client.execute(query);
    return {
      success: true,
      message: "Table 'hoh_tracker' created successfully or already exists.",
    };
  } catch (error) {
    console.error("Error creating table:", error);
    throw createError({
      statusCode: 500,
      message: "Failed to create 'hoh_tracker' table.",
    });
  }
});
