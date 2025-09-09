import express, { Request, Response } from "express";
import { adminMiddleWare, middleWare } from "../Middleware/middleWare";

import { db } from "../admin/admin";

import * as admin from "firebase-admin";
import { editStage } from "../Controllers/adminStageEditor/editStage";
import { deleteStage } from "../Controllers/adminStageEditor/deleteStage";
import { getStageData } from "../Controllers/adminStageEditor/getStageData";

import { addLevel } from "../Controllers/adminLessonEditor/addLevel";

import { addLesson } from "../Controllers/adminLessonEditor/addLesson";
import { deleteLesson } from "../Controllers/adminLessonEditor/deleteLesson";
import { getLevelData } from "../Controllers/adminLessonEditor/getLevelData";

const fireBaseAdminRoute = express();

//Still not inused kasi need ata naka deploy na server dito
fireBaseAdminRoute.post(
  "/setAdmin",
  middleWare,

  async (req: Request, res: Response) => {
    try {
      const { uid } = req.body;
      await admin.auth().setCustomUserClaims(uid, { admin: true });

      return res
        .status(200)
        .json({ message: "Admin has been set successully" });
    } catch (error) {
      console.log(error);

      return res.status(500).json({ message: error });
    }
  }
);

//Gets all levels per specific category
fireBaseAdminRoute.get("/getAllLevel/:category", middleWare, getLevelData);
//Adding a level
fireBaseAdminRoute.post("/addLevel", middleWare, addLevel);

//Adding a lesson
fireBaseAdminRoute.post("/addLesson", middleWare, addLesson);
//Deleting lessons
fireBaseAdminRoute.post("/deleteLessons", middleWare, deleteLesson);

//Stage Editor routes. Might still be unstable. Untested
//Gets all specific data of specific stage
fireBaseAdminRoute.get(
  "/getStage/:category/:lessonId/:levelId/:stageId",
  middleWare,
  getStageData
);
//Editing a stage
fireBaseAdminRoute.post("/editStage", middleWare, editStage);
//Deleting a stage and reordering them automatically
fireBaseAdminRoute.post("/deleteStage", middleWare, deleteStage);

export default fireBaseAdminRoute;
