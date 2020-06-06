import database from "../../firebase/firebase";
import VerifyAdminId from "../../utils/verifyAdminToken";

export default async (req, res) => {
  if (req.method === "POST") {
    try {
      const { msg, userId, boothId, adminId } = req.body;

      if (adminId) {
        await VerifyAdminId(boothId, adminId);
      }

      if ((userId && typeof userId !== "string") || !msg) {
        return res.status(400).send({});
      }

      let dbUserId = userId;
      if (!userId) {
        const response = await database.ref(`${boothId}`).push({
          resolved: false,
          messages: [
            {
              text: msg,
              isAdmin: !!adminId,
            },
          ],
        });
        dbUserId = response.getKey();
      } else {
        const userSnapshot = await database
          .ref(`${boothId}/${userId}`)
          .limitToLast(1)
          .once("value");
        if (!userSnapshot.exists()) {
          return res.status(400).send("User doen't exists");
        }

        await database.ref(`${boothId}/${userId}/messages`).push({
          text: msg,
          isAdmin: !!adminId,
        });
      }
      res.status(200).send(JSON.stringify({ userId: dbUserId }));
    } catch (e) {
      res.status(500).send({});
    }
  }

  if (req.method === "PATCH") {
    try {
      const { uid, adminId } = req.body;
      console.log(uid, adminId);

      if (!adminId || adminId !== "QXNodXRvc2gsU2luZ2g=") {
        return res.status(401).send();
      }
      await database.ref(`users/${uid}`).update({
        resolved: true,
      });
      res.status(200).send(JSON.stringify({ status: "SUCCESS" }));
    } catch (e) {
      console.log(e);
      res.status(400).send(JSON.stringify({ status: "FAILED" }));
    }
  }
};
