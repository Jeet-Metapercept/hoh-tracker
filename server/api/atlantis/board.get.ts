// GET /api/atlantis/board — raw energy-board data (client derives the countdown).
// Cached at the Netlify Edge via routeRules swr. Read logic: server/utils/atlantis-data.
export default defineEventHandler(() => readBoard());
