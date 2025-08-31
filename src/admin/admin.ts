import admin from "firebase-admin";
import serviceAccount from "../../serviceAccount.json";
import { ServiceAccount } from "firebase-admin";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as ServiceAccount),
});

export const auth = admin.auth();

export const db = admin.firestore();
