import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mainRoutes from "./routes/index";
import { PORT_BACKEND } from "./config";

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(bodyParser.json({ limit: "1mb" }));
const PORT = PORT_BACKEND || 3000;

async function main() {
  app.use("/main-routes", mainRoutes);
  app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
