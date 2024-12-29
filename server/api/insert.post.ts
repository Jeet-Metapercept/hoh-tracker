import { useTurso } from "../utils/turso";

export default defineEventHandler(async (event) => {
  const client = useTurso();
  const body = await readBody(event);

  if (typeof body.status !== "boolean" || !body.step) {
    throw createError({
      statusCode: 400,
      message: "Missing or invalid required fields: status or step",
    });
  }

  const query = `
    INSERT INTO hoh_tracker (status, step${body.process !== undefined ? ", process" : ""})
    VALUES (?, ?${body.process !== undefined ? ", ?" : ""})
    RETURNING id;
  `;

  try {
    const args = body.process !== undefined
      ? [body.status, body.step, body.process]
      : [body.status, body.step];

    const result = await client.execute({ sql: query, args });
    const generatedId = result.rows[0]?.id;

    if (!generatedId) {
      throw createError({
        statusCode: 500,
        message: "Failed to retrieve the generated id after insertion.",
      });
    }

    return {
      success: true,
      message: "Row inserted successfully into 'hoh_tracker'.",
      id: generatedId,
    };
  } catch (error) {
    console.error("Error inserting row into 'hoh_tracker':", error);
    throw createError({
      statusCode: 500,
      message: "Failed to insert row into 'hoh_tracker'.",
    });
  }
});

// curl -X POST http://localhost:3000/api/insert \
// -H "Content-Type: application/json" \
// -d '{
// "status": true,
// "step": "Initialize process",
// "process": 10
// }'

// {
// "success": true,
// "message": "Row inserted successfully into 'hoh_tracker'.",
// "id": 3
// }⏎