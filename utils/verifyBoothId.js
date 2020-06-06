import database from "../firebase/firebase";

export default async (boothId) => {
  try {
    console.log("Verify booth id and both", boothId);

    const snapshot = await database
      .ref(`admin`)
      .orderByChild("boothId")
      .equalTo(boothId)
      .once("value");

    if (
      snapshot.exists() &&
      snapshot.val()[Object.keys(snapshot.val())[0]].boothId === boothId
    ) {
      return true;
    }

    throw new Error("boothId doesn't exist");
  } catch (e) {
    console.log(e);
    throw new Error(e);
  }
};
