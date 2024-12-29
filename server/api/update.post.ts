import { useTurso } from "../utils/turso";

export default defineEventHandler(async (event) => {
  const client = useTurso();
  const body = await readBody(event);

  if (typeof body.status !== "boolean" || !body.step || !body.started_at) {
    throw createError({
      statusCode: 400,
      message: "Missing or invalid required fields: status, step, or started_at",
    });
  }

  const query = `
    UPDATE hoh_tracker
    SET status = ?, step = ?, updated_at = CURRENT_TIMESTAMP
    ${body.process !== undefined ? ", process = ?" : ""}
    WHERE started_at = ?;
  `;

  try {
    const args = [
      body.status,
      body.step,
      ...(body.process !== undefined ? [body.process] : []),
      body.started_at,
    ];

    const result = await client.execute({ sql: query, args });

    if (result.rowsAffected === 0) {
      throw createError({
        statusCode: 404,
        message: `Row with started_at '${body.started_at}' not found in 'hoh_tracker'.`,
      });
    }

    return {
      success: true,
      message: `Row with started_at '${body.started_at}' updated successfully in 'hoh_tracker'.`,
    };
  } catch (error) {
    console.error("Error updating row in 'hoh_tracker':", error);
    throw createError({
      statusCode: 500,
      message: `Failed to update row with started_at '${body.started_at}' in 'hoh_tracker'.`,
    });
  }
});

// curl -X POST http://localhost:3000/api/update \
// -H "Authorization: 9238d426c848f353b965975532ea8a618c129300854614d5f69587d4ff2ef7d1" \
// -H "Content-Type: application/json" \
// -d '{
//   "id": 1,
//   "status": true,
//   "step": "Updated process step",
//   "process": 50
// }'
