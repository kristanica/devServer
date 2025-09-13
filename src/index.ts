import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import openAiRoute from "./Routes/openAi";
import fireBaseRoute from "./Routes/fireBase";
import fireBaseAdminRoute from "./Routes/fireBaseAdmin";
import compression from "compression";
dotenv.config();

const PORT = process.env.PORT || 8082;
const corsOptions = {
  origin: "*",
}; //temporary, will switch to real URL when deployed

const app = express();
app.use(compression()); //Compresses files daw e
app.use(cors(corsOptions));
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
// app.use(express.json());
app.use("/openAI", openAiRoute);
app.use("/fireBase", fireBaseRoute);

app.use("/fireBaseAdmin", fireBaseAdminRoute);
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

//sample lol, nag ppratice aq ng branching through GIT bash
