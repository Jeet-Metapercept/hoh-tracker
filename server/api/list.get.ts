import type { HohTrackerRow, ListApiResponse } from "~/shared/types";
import { useTurso } from "../utils/turso";



export default defineEventHandler(async (event): Promise<ListApiResponse> => {
  const client = useTurso();

  const query = getQuery(event);
  const limit = Number(query.limit) || 10;

  if (limit < 1 || limit > 100) {
    throw createError({
      statusCode: 400,
      message: "Invalid 'limit' value. It must be between 1 and 100.",
    });
  }

  const sqlQuery = `
    SELECT * FROM hoh_tracker
    ORDER BY created_at DESC
    LIMIT ?;
  `;

  try {
    const result = await client.execute({ sql: sqlQuery, args: [limit] });

    const data: HohTrackerRow[] = result.rows.map((row) => ({
      id: row.id as number,
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
      status: !!row.status,
      step: row.step as string,
      process: row.process as number,
    }));

    return {
      success: true,
      message: `Latest ${limit} rows retrieved successfully from 'hoh_tracker'.`,
      data,
    };
  } catch (error) {
    console.error("Error retrieving latest rows from 'hoh_tracker':", error);
    throw createError({
      statusCode: 500,
      message: "Failed to retrieve latest rows from 'hoh_tracker'.",
    });
  }
});
