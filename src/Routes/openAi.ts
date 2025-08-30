import express, { Request, Response, NextFunction } from "express";
import middleWare from "../Middleware/middleWare";
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const openAiRoute = express();

const openai = new OpenAI({
  apiKey: process.env.API_KEY,
});

openAiRoute.post(
  "/evaluate",
  middleWare,
  async (req: Request, res: Response) => {
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
  }
);

export default openAiRoute;
