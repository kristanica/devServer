import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import openAiRoute from "./Routes/openAi";

dotenv.config();

const PORT = process.env.PORT || 8082;
const corsOptions = {
  origin: "*",
}; //temporary

const app = express();
app.use(cors(corsOptions));

app.use(express.json());
app.use("/openAI", openAiRoute);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
