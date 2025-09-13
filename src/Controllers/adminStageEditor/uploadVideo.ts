import { Request, Response } from "express";
import { bucket, db } from "../../admin/admin";
export const uploadVideo = async (req: Request, res: Response) => {
  const { category, lessonId, levelId, stageId } = req.body as {
    category: string;
    lessonId: string;
    levelId: string;
    stageId: string;
  };
  const stageRef = db
    .collection(category)
    .doc(lessonId)
    .collection("Levels")
    .doc(levelId)
    .collection("Stages")
    .doc(stageId);
  const destination = `stageFiles/${category}/${lessonId}/${levelId}/${stageId}/video${stageId}video.mp4`;
  const file = bucket.file(destination);
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }
  await file.save(req.file.buffer, {
    metadata: {
      contentType: req.file.mimetype,
    },
    resumable: false,
  });
  //Might still change
  const [signedUrl] = await file.getSignedUrl({
    action: "read",
    expires: "03-01-2030",
  });
  await stageRef.set(
    {
      videoPresentation: signedUrl,
    },
    {
      merge: true,
    }
  );
  return res.status(200).json({
    message: "Video uploaded successfully",
    url: signedUrl,
    path: destination,
  });
};
