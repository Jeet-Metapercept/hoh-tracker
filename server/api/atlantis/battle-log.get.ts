// GET /api/atlantis/battle-log — recent events, newest-first (Edge-cached via swr).
export default defineEventHandler(() => readBattleLog());
