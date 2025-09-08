import express, { Request, Response } from "express";
import { adminMiddleWare, middleWare } from "../Middleware/middleWare";

import { db } from "../admin/admin";

import * as admin from "firebase-admin";

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
fireBaseAdminRoute.get(
  "/getAllLevel/:category",
  middleWare,

  async (req: Request, res: Response) => {
    try {
      const { category } = req.params;

      const subjectRef = (await db.collection(category).get()).docs;

      const lessonData = await Promise.all(
        subjectRef.map(async (lessonDoc) => {
          const levelRef = (
            await db
              .collection(category)
              .doc(lessonDoc.id)
              .collection("Levels")
              .get()
          ).docs;
          const levels = levelRef.map((levelDoc) => ({
            id: levelDoc.id,
            ...levelDoc.data(),
          }));
          return {
            id: lessonDoc.id,
            levelsData: levels,
            ...lessonDoc.data(),
          };
        })
      );
      return res.status(200).json(lessonData);
    } catch (error) {
      return res.status(500).json({ message: error });
    }
  }
);

//Adding a level
fireBaseAdminRoute.post(
  "/addLevel",
  middleWare,
  async (req: Request, res: Response) => {
    const {
      category,
      lessonId,
    }: {
      category: string;
      lessonId: string;
    } = req.body;
    try {
      const lessonsData = (
        await db.collection(category).doc(lessonId).collection("Levels").get()
      ).docs;

      const newLevelNumber = lessonsData.map((item) => {
        const match = item.id.match(/Level(\d+)/);
        return match ? parseInt(match[1]) : 0;
      });

      //gets the next number
      const nextNumber =
        (newLevelNumber!.length > 0 ? Math.max(...newLevelNumber!) : 0) + 1;

      const newLevelid = `Level${nextNumber}`;

      await db
        .collection(category)
        .doc(lessonId)
        .collection("Levels")
        .doc(newLevelid)
        .set({
          Level: nextNumber,
          createdAt: new Date(),
        });

      return res.status(200).json({
        message: `Sucessfully added Level ${nextNumber} under ${lessonId}!`,
      });
    } catch (error) {
      return res.status(500).json({ message: error });
    }
  }
);

//Adding a lesson
fireBaseAdminRoute.post(
  "/addLesson",
  middleWare,
  async (req: Request, res: Response) => {
    const { category }: { category: string } = req.body;
    try {
      const lessonData = (await db.collection(category).get()).docs;
      const newLessonNumber = lessonData.map((item) => {
        const match = item.id.match(/Lesson(\d+)/);
        return match ? parseInt(match[1]) : 0;
      });

      //gets the next number
      const nextNumber =
        (newLessonNumber!.length > 0 ? Math.max(...newLessonNumber!) : 0) + 1;

      const newLessonId = `Lesson${nextNumber}`;

      await db.collection(category).doc(newLessonId).set({
        Lesson: nextNumber,
        createdAt: new Date(),
      });

      await db
        .collection(category)
        .doc(newLessonId)
        .collection("Levels")
        .doc("Level1")
        .set({
          lesson: 1,
          createdAt: new Date(),
        });

      return res
        .status(200)
        .json({ message: `Lesson ${nextNumber} has been added sucessfully!` });
    } catch (error) {
      return res.status(500).json({ message: error });
    }
  }
);

//Deleting lessons
fireBaseAdminRoute.post(
  "/deleteLessons",
  middleWare,
  async (req: Request, res: Response) => {
    try {
      const { category, lessonId } = req.body;
      const lessonRef = await db
        .collection(category)
        .doc(lessonId)
        .collection("Levels")
        .get();

      if (lessonRef.empty) {
        return res
          .status(400)
          .json({ message: "There are no lesson to delete" });
      }

      const batch = admin.firestore().batch();

      lessonRef.docs.forEach((doc) => {
        batch.delete(doc.ref);
      }); //pragmatically deletes all the Levels within lessons

      await batch.commit(); //commits the deletion

      return res
        .status(200)
        .json({ message: "Successfully delete lesson " + lessonId });
    } catch (error) {
      return res.status(500).json({ message: error });
    }
  }
);

//Get's specific stage data
fireBaseAdminRoute.get(
  "/getStage/:category/:lessonId/:levelId/:stageId",
  middleWare,
  async (req: Request, res: Response) => {
    const { category, lessonId, levelId, stageId } = req.params;
    try {
      const stageSnap = await db
        .collection(category)
        .doc(lessonId)
        .collection("Levels")
        .doc(levelId)
        .collection("Stages")
        .doc(stageId)
        .get();
      if (!stageSnap.exists) {
        return res.status(404).json({ message: "Stage does not exist" });
      }

      const stageData = stageSnap.data();
      return res.status(200).json(stageData);
    } catch (error) {
      return res.status(500).json({ message: error });
    }
  }
);

export default fireBaseAdminRoute;
