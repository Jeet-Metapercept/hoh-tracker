export default defineEventHandler(async (event) => {
    const apiKeyHeader = getHeader(event, "Authorization");
  
    const runtimeConfig = useRuntimeConfig();
    const validApiKey = runtimeConfig.apiKey;
  
    if (!apiKeyHeader || apiKeyHeader !== validApiKey) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized: Invalid or missing API key",
      });
    }
  });
  