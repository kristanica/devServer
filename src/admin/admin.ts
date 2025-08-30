import admin from "firebase-admin";
import serviceAccount from "../../serviceAccount.json";
import { ServiceAccount } from "firebase-admin";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as ServiceAccount),
});

const auth = admin.auth();

export default auth;
