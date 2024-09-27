import { ObjectId } from "mongodb";
import clientPromise from "lib/mongodb";
import { getSession } from "@auth0/nextjs-auth0";

export default async function handler(req, res) {
  try {
    const { user } = await getSession(req, res);
    const client = await clientPromise;
    const db = client.db("ChattyCherry");

    const { chatId, role = "user", content } = req.body;

    const chat = await db.collection("chats").findOneAndUpdate(
      {
        _id: new ObjectId(chatId),
        userId: user.sub,
      },
      {
        $push: {
          messages: {
            role,
            content,
          },
        },
      },
      {
        ReturnDocument: "after",
      }
    );
    console.log("This is a role: " + role);

    res.status(200).json({
      chat: {
        ...chat.value,
        _id: chat.value._id.toString(),
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occured when adding a message to a chat" });
  }
}
