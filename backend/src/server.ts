import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import routes from "./routes/index";
import { PORT_BACKEND, FE_URL } from "./config";

const app = express();
app.use(cors({ origin: FE_URL }));
app.use(bodyParser.json({ limit: "1mb" }));

async function main() {
  app.use("/api", routes);
  app.listen(PORT_BACKEND, () =>
    console.log(`Server listening on port ${PORT_BACKEND}`)
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
