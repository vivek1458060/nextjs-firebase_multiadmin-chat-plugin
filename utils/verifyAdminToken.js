import database from "../firebase/firebase";

export default async (boothId, adminId) => {
  try {
    console.log("Verify admin id and both", boothId, adminId);

    const snapshot = await database.ref(`admin/${adminId}`).once("value");

    if (snapshot.exists() && snapshot.val().boothId === boothId) {
      return true;
    }

    throw new Error("boothId, adminId doesn't match");
  } catch (e) {
    console.log(e);
    throw new Error(e);
  }
};
