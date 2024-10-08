import { getSession } from "@auth0/nextjs-auth0";
import clientPromise from "lib/mongodb";
export default async function handler(req, res) {
  try {
    const { user } = await getSession(req, res);
    const { message } = req.body;
    const newUserMessage = {
      role: "user",
      content: message,
    };
    const client = await clientPromise;

    const db = client.db("ChattyCherry");
    const chat = await db.collection("chats").insertOne({
      userId: user.sub,
      messages: [newUserMessage],
      title: message,
    });
    res.status(200).json({
      _id: chat.insertedId.toString(),
      message: [newUserMessage],
      title: message,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An Error occurred when creating a new chat" });
    console.log("ERROR OCCURRED IN CREATE NEW CHAT: ", error);
  }
}
