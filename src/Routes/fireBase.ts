import express, { Request, Response } from "express";
import { middleWare } from "../Middleware/middleWare";

import { db } from "../admin/admin";
import { messaging } from "firebase-admin";
import * as admin from "firebase-admin";
interface IUserRequest extends express.Request {
  user?: any;
}
const fireBaseRoute = express();

//Gets all stages within specific category, lesson and level
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

fireBaseRoute.post(
  "/purchaseItem",
  middleWare,
  async (req: IUserRequest, res: Response) => {
    const uid = req.user?.uid; // userid
    const { itemid, itemCost } = req.body;

    try {
      const userRef = db.collection("Users").doc(uid);
      const userSnap = await userRef.get();
      if (!userSnap.exists) {
        return res.status(404).json({ message: "User does not exist" });
      }

      const userData = userSnap.data();

      if (userData?.coins < itemCost) {
        return res.status(401).json({ message: "Not enough coins" });
      }
      await userRef.update({
        coins: admin.firestore.FieldValue.increment(-Number(itemCost)),
      });

      const inventoryRef = db
        .collection("Users")
        .doc(uid)
        .collection("Inventory")
        .doc(itemid);

      const inventorySnap = await inventoryRef.get();

      if (inventorySnap.exists) {
        await inventoryRef.update({
          quantity: admin.firestore.FieldValue.increment(1),
        });
      } else {
        await inventoryRef.set({ quantity: 1 });
      }

      return res.status(200).json({
        message: "sucess on purchasing item",
        newCoins: userData?.coins - itemCost,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Failed when purchasing an item" });
    }
  }
);
//get specific user information
fireBaseRoute.get(
  "/getSpecificUser/:uid",
  middleWare,
  async (req: Request, res: Response) => {
    try {
      const { uid } = req.params;

      const userRef = db.collection("Users").doc(uid);

      const userData = await userRef.get();

      if (!userData.exists) {
        return res.status(400).json({ message: "This user does not exist" });
      }
      return res.status(200).json(userData.data());
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message:
          "Something went wrong when fetching this specified user's data",
      });
    }
  }
);

//gets all progress of user
type progressType = Record<string, boolean>;
fireBaseRoute.get(
  "/userProgres/:subject",
  middleWare,
  async (req: IUserRequest, res: Response) => {
    try {
      const uid = req.user?.uid;
      const { subject } = req.params;
      const allProgress: progressType = {};
      const allStages: progressType = {};

      let completedLevels = 0;
      let completedStages = 0;

      const lessonRef = await db.collection(subject).get();
      for (const lessonTemp of lessonRef.docs) {
        const lessonId = lessonTemp.id;

        const levelsDoc = await db
          .collection("Users")
          .doc(uid)
          .collection("Progress")
          .doc(subject)
          .collection("Lessons")
          .doc(lessonId)
          .collection("Levels")
          .get();
        for (const levelsTemp of levelsDoc.docs) {
          const levelId = levelsTemp.id;
          const status = levelsTemp.data().status; // gets the status for each levels per specific user
          allProgress[`${lessonId}-${levelId}`] = status;

          if (status === true) completedLevels += 1;

          const stagesDoc = await db
            .collection("Users")
            .doc(uid)
            .collection("Progress")
            .doc(subject)
            .collection("Lessons")
            .doc(lessonId)
            .collection("Levels")
            .doc(levelId)
            .collection("Stages")
            .get();

          stagesDoc.forEach((stagesTemp) => {
            const stageStatus = stagesTemp.data().status;
            allStages[`${lessonId}-${levelId}-${stagesTemp.id}`] = stageStatus; //gets the status for each stages per specific user
            if (stageStatus === true) completedStages += 1;
          });
        }
      }
      return res.status(200).json({
        allProgress,
        allStages,
        completedLevels,
        completedStages,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Something went wrong when fetching user progress" + error,
      });
    }
  }
);
//gets ALL
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
      return res.status(500).json({
        message: "Somethign went wrong when fetching the lesson " + error,
      });
    }
  }
);

//Fetches all Shop items

fireBaseRoute.get("/Shop", middleWare, async (req: Request, res: Response) => {
  try {
    const shopSnapShot = await db.collection("Shop").get();

    if (shopSnapShot.empty) {
      return res.status(404).json({ message: "No shop items found" });
    }
    const itemList = shopSnapShot.docs.map((shopTemp) => ({
      id: shopTemp.id,
      ...shopTemp.data(),
    }));

    return res.status(200).json(itemList);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Something went wrong when fetchng shop" });
  }
});

//Unlock next stage
fireBaseRoute.post(
  "/unlockStage",
  middleWare,
  async (req: IUserRequest, res: Response) => {
    try {
      const uid = req.user?.uid;

      const { subject, lessonId, levelId, currentStageId } = req.body;

      const stageData = db
        .collection(subject)
        .doc(lessonId)
        .collection("Levels")
        .doc(levelId)
        .collection("Stages");
      const q = stageData.orderBy("order");
      const queriedData = await q.get();

      const mappedStages = queriedData.docs.map((temp) => ({
        id: temp.id,
        type: temp.data().type,
        ...temp.data(),
      }));
      const currentIndex = mappedStages.findIndex(
        (stage) => stage.id === currentStageId
      );

      if (currentIndex < mappedStages.length - 1) {
        const nextStage = mappedStages[currentIndex + 1];
        console.log(nextStage.id);
        const nextStageRef = db
          .collection("Users")
          .doc(uid)
          .collection("Progress")
          .doc(subject)
          .collection("Lessons")
          .doc(lessonId)
          .collection("Levels")
          .doc(levelId)
          .collection("Stages")
          .doc(nextStage.id);

        await nextStageRef.set(
          {
            status: true,
          },
          { merge: true }
        );

        return res.status(200).json({
          message: "Next stage unlocked",
          nextStageId: nextStage.id,
          nextStageType: nextStage.type,
        });
      } else {
        return res.status(200).json({
          message: "Level Completed",
          setLevelComplete: true,
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Something went wrong when fetching user progress" + error,
      });
    }
  }
);

type allProgressType = Record<
  string,
  Record<string, { rewardClaimed: boolean; status: boolean }>
>;

type allStagesType = Record<string, Record<string, { status: boolean }>>;

fireBaseRoute.get(
  "/userProgress",
  middleWare,
  async (req: IUserRequest, res: Response) => {
    try {
      const uid = req.user?.uid;
      console.log(uid);
      const allProgress: allProgressType = {};
      const allStages: allStagesType = {};

      let completedLevels = 0;
      let completedStages = 0;

      const subjectTemp = ["Html", "Css", "JavaScript", "Database"];

      for (const subjectLoop of subjectTemp) {
        allProgress[subjectLoop] = {};
        allStages[subjectLoop] = {};
        const lessonRef = await db.collection(subjectLoop).get();
        for (const lessonTemp of lessonRef.docs) {
          const lessonId = lessonTemp.id;

          const levelsDoc = await db
            .collection("Users")
            .doc(uid)
            .collection("Progress")
            .doc(subjectLoop)
            .collection("Lessons")
            .doc(lessonId)
            .collection("Levels")
            .get();
          for (const levelsTemp of levelsDoc.docs) {
            const levelId = levelsTemp.id;
            const status: boolean = levelsTemp.data().status; // gets the status for each levels per specific user
            allProgress[subjectLoop][`${lessonId}-${levelId}`] = {
              rewardClaimed: levelsTemp.data().rewardClaimed,
              status: status,
            };

            if (status === true) completedLevels += 1;

            const stagesDoc = await db
              .collection("Users")
              .doc(uid)
              .collection("Progress")
              .doc(subjectLoop)
              .collection("Lessons")
              .doc(lessonId)
              .collection("Levels")
              .doc(levelId)
              .collection("Stages")
              .get();

            stagesDoc.forEach((stagesTemp) => {
              const stageStatus: boolean = stagesTemp.data().status;
              allStages[subjectLoop][
                `${lessonId}-${levelId}-${stagesTemp.id}`
              ] = {
                status: stageStatus,
              }; //gets the status for each stages per specific user
              if (stageStatus === true) completedStages += 1;
            });
          }
        }
      }

      return res.status(200).json({
        allProgress,
        allStages,
        completedLevels,
        completedStages,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Something went wrong when fetching user progress" + error,
      });
    }
  }
);
export default fireBaseRoute;
