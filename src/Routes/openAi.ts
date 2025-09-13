import express from "express";
import { middleWare } from "../Middleware/middleWare";
import { mainPrompt } from "../Controllers/openAi/mainPrompt";
import { brainBytesPrompts } from "../Controllers/openAi/brainBytesPrompts";

const openAiRoute = express();

//Still untested
openAiRoute.post("/evaluate", middleWare, mainPrompt);
openAiRoute.post("/evaluate", middleWare, brainBytesPrompts);

export default openAiRoute;
