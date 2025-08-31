import express, { Request, Response } from "express";
import middleWare from "../Middleware/middleWare";

import { db } from "../admin/admin";

const fireBaseRoute = express();

fireBaseRoute.get(
  "/getSpecificStage/:category/:lessonId/:levelId",
  middleWare,
  async (req: Request, res: Response) => {
    try {
      const { category, lessonId, levelId } = req.params;

      const stagesRef = db
        .collection(category)
        .doc(lessonId)
        .collection("Levels")
        .doc(levelId)
        .collection("Stages");

      const queryByOrder = stagesRef.orderBy("order");

      const queriedData = await queryByOrder.get();
      const allStages = queriedData.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as {
          isHidden: boolean;
          order: number;
          codingInterface?: string;
          description: string;
          instruction: string;
          title: string | undefined | null;
        }),
      }));
      return res.status(200).json(allStages);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Failed to fetch the stages " + error });
    }
  }
);

fireBaseRoute.get(
  "/getAllData/:subject",
  middleWare,
  async (req: Request, res: Response) => {
    try {
      const { subject } = req.params;

      const lessonRef = db.collection(subject);

      const lessonSnapShot = await lessonRef.get();

      const lesson = await Promise.all(
        lessonSnapShot.docs.map(async (lessonDoc) => {
          const levelsRef = db
            .collection(subject)
            .doc(lessonDoc.id)
            .collection("Levels");

          const levelSnapShot = await levelsRef.get();

          const levels = await Promise.all(
            levelSnapShot.docs.map(async (levelDoc) => {
              const stagesRef = db
                .collection(subject)
                .doc(lessonDoc.id)
                .collection("Levels")
                .doc(levelDoc.id)
                .collection("Stages");

              const stagesSnapShot = await stagesRef.get();
              const stages = stagesSnapShot.docs.map((stageDoc) => ({
                id: stageDoc.id,
                ...stageDoc.data(),
              }));

              return {
                id: levelDoc.id,
                ...levelDoc.data(),
                stages,
              };
            })
          );
          return {
            id: lessonDoc.id,
            ...lessonDoc.data(),
            levels,
          };
        })
      );

      return res.status(200).json(lesson);
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({
          message: "Somethign went wrong when fetching the lesson " + error,
        });
    }
  }
);
export default fireBaseRoute;
