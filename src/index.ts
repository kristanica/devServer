import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import OpenAI from "openai";
import admin from "firebase-admin";
import serviceAccount from "../ServiceAccount.json";
import { ServiceAccount } from "firebase-admin";
interface IUserRequest extends express.Request {
  user?: any;
}
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.API_KEY,
});
const PORT = 8081;
const corsOptions = {
  origin: "*",
};
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as ServiceAccount),
});

const auth = admin.auth();
const app = express();

app.use(cors(corsOptions));

app.use(express.json());

const middleWare = async (
  req: IUserRequest,
  res: Response,
  next: NextFunction
) => {
  const { authorization } = req.headers;
  try {
    const token = authorization?.split("Bearer ")[1];
    if (!token) {
      return res.status(400).json({ message: "Invalid Token" });
    }
    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch {
    return res.status(401).json({ message: "You are not authorized" });
  }
};

app.post("/evaluate", middleWare, async (req: Request, res: Response) => {
  const { prompt } = req.body;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });
  if (!response) {
    return res.status(400).send({ message: "cant call" });
  }

  const reply = response.choices[0].message.content;
  console.log(reply);
  res.send({ response: reply });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
