import { useTurso } from "../utils/turso";

export default defineEventHandler(async (_event) => {
    const client = useTurso(/* event */);
    const { rows } = await client.execute("select * from processed_bugreports limit 10;");
  
    return {
      data: {
        items: rows,
      },
    };
  });
  