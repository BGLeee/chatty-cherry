import Head from "next/head";
import { ChatSidebar } from "components/ChatSidebar";
import { useEffect, use, useState } from "react";
import { streamReader } from "openai-edge-stream";
import { Message } from "components/Message";
import { v4 as uuid } from "uuid";
import { useRouter } from "next/router";
import { getSession } from "@auth0/nextjs-auth0";
import { ObjectId } from "mongodb";
import clientPromise from "lib/mongodb";
import Image from "next/image";

export default function ChatPage({ chatId, title, messages = [] }) {
  // console.log("props: " + title + messages[0]);

  const [newChatId, setNewChatId] = useState(null);
  const [incomingText, setIncomingText] = useState("");
  const [messageText, setMessageText] = useState("");
  const [newMessages, setNewMessages] = useState([]);
  const [gettingResponse, setGettingResponse] = useState(false);
  const [fullMessage, setFullMessage] = useState("");
  const router = useRouter();

  //when our route changes we want to reset our state items
  useEffect(() => {
    setNewMessages([]), setNewChatId(null);
  }, [chatId]);

  //save the newly streamed message to new chat messages

  useEffect(() => {
    if (!gettingResponse && fullMessage) {
      setNewMessages((prev) => [
        ...prev,
        {
          _id: uuid(),
          role: "assistant",
          content: fullMessage,
        },
      ]);
      setFullMessage("");
    }
  }, [gettingResponse, fullMessage]);

  //if we've created a new chat then to navigate to that chat
  useEffect(() => {
    if (!gettingResponse && newChatId) {
      setNewChatId(null);
      router.push(`/chat/${newChatId}`);
    }
  }, [newChatId, gettingResponse, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGettingResponse(true);

    console.log("Message: ", messageText);
    setNewMessages((prev) => {
      const newMessages = [
        ...prev,
        {
          _id: uuid(),
          role: "user",
          content: messageText,
        },
      ];
      return newMessages;
    });
    setMessageText("");

    // if (messageText.length > 1) {
    //   const userMessage = { role: "user", content: messageText };
    //   setNewMessages((prevMessages) => [...prevMessages, userMessage]);

    //   const botTypingMessage = { role: "assistant", content: "..." };
    //   setNewMessages((prevMessages) => [...prevMessages, botTypingMessage]);

    //   // Simulate a delay for the bot's response
    //   setTimeout(() => {
    //     // Replace the bot "typing" message with the actual bot response
    //     const botMessage = {
    //       role: "assistant",
    //       content: "Sorry, can't do that now.",
    //     };
    //     setNewMessages((prevMessages) => {
    //       // Remove the "typing" message and add the bot's final response
    //       const updatedMessages = [...prevMessages];
    //       updatedMessages.pop(); // Remove the "typing" message
    //       return [...updatedMessages, botMessage];
    //     });
    //   }, 3000);

    //   setMessageText("");
    // }
    try {
      const res = await fetch("/api/chat/sendMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId,
          message: messageText,
        }),
      });

      const data = res.body;
      if (!res.body) {
        console.log("No response body from server");

        return;
      }

      const reader = res.body.getReader();
      let messageContent = "";
      setGettingResponse(false);

      await streamReader(reader, async ({ content }) => {
        if (content.event === "newChatId") {
          setNewChatId(content);
        } else {
          setIncomingText((s) => `${s}${content}`);
          messageContent = messageContent + content;
          setNewChatId(content);
        }
        setGettingResponse(false);

        console.log("New incoming message: ", content);
        setFullMessage(messageContent);
      });
      setIncomingText("");
      setGettingResponse(false);
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  const allMessages = [...messages, ...newMessages];
  return (
    <>
      <Head>
        <title>New chat</title>
      </Head>
      <div className="grid h-screen grid-cols-[260px_1fr]">
        <ChatSidebar chatId={chatId} />
        <div className="flex flex-col overflow-hidden bg-gray-700">
          <div
            className={`  flex-1 ${
              allMessages.length > 0 ? "" : "item-center flex justify-center"
            } overflow-auto text-white`}
          >
            {allMessages.length > 0 ? (
              <>
                {allMessages.map((message) => (
                  <Message
                    key={message._id}
                    content={message.content}
                    role={message.role}
                  />
                ))}
                {!!incomingText && (
                  <Message content={incomingText} role="assistant" />
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <Image
                  src={"/robot-img.png"}
                  width={100}
                  height={100}
                  alt="user avatar"
                />
                <h1 className="font-inter text-center text-4xl font-bold text-gray-300">
                  Ask me a question!
                </h1>
              </div>
            )}
          </div>
          <footer className="bg-gray-800 p-10">
            <form onSubmit={handleSubmit}>
              <fieldset className="flex gap-2 " disabled={gettingResponse}>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="w-full resize-none rounded-md bg-gray-700 p-2 text-white  focus:border-emerald-500 focus:bg-gray-600 focus:outline focus:outline-emerald-500"
                  placeholder={gettingResponse ? "" : "Send a message..."}
                />
                <button type="submit" className="btn">
                  Send
                </button>
              </fieldset>
            </form>
          </footer>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps = async (ctx) => {
  const chatId = ctx.params?.id?.[0] || null;
  if (chatId) {
    const { user } = await getSession(ctx.req, ctx.res);
    const client = await clientPromise;
    const db = client.db("ChattyCherry");
    const chat = await db.collection("chats").findOne({
      userId: user.sub,
      _id: new ObjectId(chatId),
    });
    return {
      props: {
        chatId,
        title: chat.title,
        messages: chat.messages.map((message) => ({
          ...message,
          _id: uuid(),
        })),
      },
    };
  }
  return {
    props: {},
  };
};
