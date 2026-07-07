// GET /api/atlantis/battle-log — recent events, newest-first (client filters/paginates).
// Cached at the Netlify Edge via routeRules swr. Read logic: server/utils/atlantis-data.
export default defineEventHandler(() => readBattleLog());
