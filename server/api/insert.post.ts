import { useTurso } from "../utils/turso";

export default defineEventHandler(async (event) => {
  const client = useTurso();
  const body = await readBody(event);

  if (!body.status || typeof body.status !== "boolean" || !body.step) {
    throw createError({
      statusCode: 400,
      message: "Missing required fields: status or step",
    });
  }

  const query = `
    INSERT INTO hoh_tracker (status, step)
    VALUES (?, ?);
  `;

  try {
    await client.execute({ sql: query, args: [body.status, body.step] });
    return {
      success: true,
      message: "Row inserted successfully into 'hoh_tracker'.",
    };
  } catch (error) {
    console.error("Error inserting row into 'hoh_tracker':", error);
    throw createError({
      statusCode: 500,
      message: "Failed to insert row into 'hoh_tracker'.",
    });
  }
});
