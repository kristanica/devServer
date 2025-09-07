import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import openAiRoute from "./Routes/openAi";
import fireBaseRoute from "./Routes/fireBase";
import fireBaseAdminRoute from "./Routes/fireBaseAdmin";
dotenv.config();

const PORT = process.env.PORT || 8082;
const corsOptions = {
  origin: "*",
}; //temporary

const app = express();
app.use(cors(corsOptions));

app.use(express.json());
app.use("/openAI", openAiRoute);
app.use("/fireBase", fireBaseRoute);
app.use("/fireBaseAdmin", fireBaseAdminRoute);
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
