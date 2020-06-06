import database from "../../firebase/firebase";

export default async (req, res) => {
  if (req.method === "POST") {
    try {
      let { boothId, adminToken } = req.body;

      if (adminToken && adminToken !== process.env.adminMapperToken) {
        throw "Token not valid";
      }
      if (typeof boothId !== "string" || !boothId.trim()) {
        throw "BoothID not provided";
      }

      const snapshot = await database
        .ref("admin")
        .orderByChild("boothId")
        .equalTo(boothId)
        .once("value");

      const userExist = snapshot.exists();
      if (userExist) {
        res.status(400).send({ message: "User exists!" });
      }

      const user = {
        boothId: boothId.trim(),
      };

      const userSanp = await database.ref(`admin`).push(user);
      user.adminId = userSanp.getKey();

      return res.send({ user });
    } catch (e) {
      console.log(e);
      return res.status(500).send({ message: "Something went wrong" });
    }
  }
};
