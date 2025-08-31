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

export default fireBaseRoute;
