import { buildServer } from "./server";

const PORT = Number(process.env.PORT ?? 4000);

const app = buildServer();
app.listen(PORT, () => {
  console.log(`Ops backend listening on http://localhost:${PORT}`);
});
