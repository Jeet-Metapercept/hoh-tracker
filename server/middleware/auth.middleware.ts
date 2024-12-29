export default defineEventHandler(async (event) => {
    const protectedRoutes = ['/api/insert', '/api/update'];
  
    if (!protectedRoutes.includes(event.path)) {
      return
    }

  const apiKeyHeader = getHeader(event, "Authorization");
  const runtimeConfig = useRuntimeConfig();
  const validApiKey = runtimeConfig.apiKey;

  if (!validApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: "Server configuration error: API key not set",
    });
  }

  if (!apiKeyHeader) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized: Missing API key",
    });
  }

  const providedKey = apiKeyHeader.startsWith('Bearer ') 
    ? apiKeyHeader.slice(7) 
    : apiKeyHeader;

  if (providedKey !== validApiKey) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized: Invalid API key",
    });
  }
});