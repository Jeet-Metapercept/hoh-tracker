// GET /api/atlantis/board — raw energy-board data (Edge-cached via swr).
export default defineEventHandler(() => readBoard());
