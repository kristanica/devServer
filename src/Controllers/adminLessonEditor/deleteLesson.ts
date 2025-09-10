import { Request, Response } from "express";
import { db } from "../../admin/admin";
export const deleteLesson = async (req: Request, res: Response) => {
  try {
    const { category, lessonId } = req.body;
    const lessonRef = await db
      .collection(category)
      .doc(lessonId)
      .collection("Levels")
      .get();

    if (lessonRef.empty) {
      return res.status(400).json({ message: "There are no lesson to delete" });
    }

    const batch = db.batch();

    lessonRef.docs.forEach((doc) => {
      batch.delete(doc.ref);
    }); //pragmatically deletes all the Levels within lessons

    await batch.commit(); //commits the deletion

    const lessonDelete = db.collection(category).doc(lessonId);

    await lessonDelete.delete();

    return res
      .status(200)
      .json({ message: "Successfully delete lesson " + lessonId });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};
