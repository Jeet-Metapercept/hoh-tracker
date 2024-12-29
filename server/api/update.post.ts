import { useTurso } from "../utils/turso";

export default defineEventHandler(async (event) => {
  const client = useTurso();
  const body = await readBody(event);

  if (!body.id || typeof body.status !== "boolean" || !body.step) {
    throw createError({
      statusCode: 400,
      message: "Missing or invalid required fields: id, status, or step",
    });
  }

  const query = `
    UPDATE hoh_tracker
    SET status = ?, step = ?, updated_at = CURRENT_TIMESTAMP
    ${body.process !== undefined ? ", process = ?" : ""}
    WHERE id = ?;
  `;

  try {
    const args = body.process !== undefined 
      ? [body.status, body.step, body.process, body.id]
      : [body.status, body.step, body.id];

    const result = await client.execute({ sql: query, args });

    if (result.rowsAffected === 0) {
      throw createError({
        statusCode: 404,
        message: `Row with id ${body.id} not found in 'hoh_tracker'.`,
      });
    }

    return {
      success: true,
      message: `Row with id ${body.id} updated successfully in 'hoh_tracker'.`,
    };
  } catch (error) {
    console.error("Error updating row in 'hoh_tracker':", error);
    throw createError({
      statusCode: 500,
      message: `Failed to update row with id ${body.id} in 'hoh_tracker'.`,
    });
  }
});
