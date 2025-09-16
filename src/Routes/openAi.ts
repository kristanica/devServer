import express from "express";
import { middleWare } from "../Middleware/middleWare";
import { gamePrompt } from "../Controllers/openAi/gamePrompt";
import { brainBytesPrompts } from "../Controllers/openAi/brainBytesPrompts";
import { lessonPrompt } from "../Controllers/openAi/lessonPrompt";

const openAiRoute = express.Router();

//Still untested
openAiRoute.post("/gamePrompt", middleWare, gamePrompt);
openAiRoute.post("/lessonPrompt", middleWare, lessonPrompt);
openAiRoute.post("/evaluate", middleWare, brainBytesPrompts);

export default openAiRoute;
