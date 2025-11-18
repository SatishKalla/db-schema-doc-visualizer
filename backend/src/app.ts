import "express-async-errors";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import bodyParser from "body-parser";
import routes from "./routes/index";
import { FE_URL } from "./config";
import { requestLogger } from "./middlewares/request-logger";
import notFound from "./middlewares/not-found";
import errorHandler from "./middlewares/error-handler";

const app = express();

app.use(helmet());
app.use(cors({ origin: FE_URL }));
app.use(bodyParser.json({ limit: "1mb" }));
app.use(requestLogger);

// API routes
app.use("/api", routes);

// 404 and error handlers
app.use(notFound);
app.use(errorHandler);

export default app;
