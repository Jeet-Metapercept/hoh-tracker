import { useTurso } from "../utils/turso";

export default defineEventHandler(async (event) => {
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
    return {
      success: true,
      message: `Latest ${limit} rows retrieved successfully from 'hoh_tracker'.`,
      data: result.rows,
    };
  } catch (error) {
    console.error("Error retrieving latest rows from 'hoh_tracker':", error);
    throw createError({
      statusCode: 500,
      message: "Failed to retrieve latest rows from 'hoh_tracker'.",
    });
  }
});

// curl -X GET "http://localhost:3000/api/list?limit=5" \
// -H "Authorization: 9238d426c848f353b965975532ea8a618c129300854614d5f69587d4ff2ef7d1" \
// -H "Content-Type: application/json"

// {
//     "success": true,
//     "message": "Latest 5 rows retrieved successfully from 'hoh_tracker'.",
//     "data": [
//       {
//         "id": 4,
//         "created_at": "2024-12-29 18:37:11",
//         "updated_at": "2024-12-29 18:37:11",
//         "status": 1,
//         "step": "Initialize process",
//         "process": 10
//       },
//       ...
//     ]
//   }⏎
