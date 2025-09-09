import { db } from "../../admin/admin";
import { Request, Response } from "express";
import admin from "firebase-admin";
export const deleteStage = async (req: Request, res: Response) => {
  const { category, lessonId, levelId, stageId, state, stageType } =
    req.body as {
      category: string;
      lessonId: string;
      levelId: string;
      stageId: string;
      state: any;
      stageType?: string;
    };

  try {
    const specificStageRef = db
      .collection(category)
      .doc(lessonId)
      .collection("Levels")
      .doc(levelId)
      .collection("Stages")
      .doc(stageId);

    await specificStageRef.delete();

    const stageRef = db
      .collection(category)
      .doc(lessonId)
      .collection("Levels")
      .doc(levelId)
      .collection("Stages");

    const queryByOrder = stageRef.orderBy("order", "asc");
    const snapShot = await queryByOrder.get();
    const batch = db.batch();

    snapShot.docs.forEach((queryDoc, index) => {
      batch.update(queryDoc.ref, {
        order: index + 1,
      });
    });

    await batch.commit();

    return res.status(200).json({
      message: "Stage has been deleted and all stages have been reordered",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something when wrong when deleting" + error });
  }
};
