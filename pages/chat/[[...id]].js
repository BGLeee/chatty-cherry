import Head from "next/head";
import { ChatSidebar } from "components/ChatSidebar";
import { useEffects, use, useState } from "react";
import { streamReader } from "openai-edge-stream";
import { Message } from "components/Message";
import { v4 as uuid } from "uuid";
export default function ChatPage() {
  const [incomingText, setIncomingText] = useState("");
  const [messageText, setMessageText] = useState("");
  const [newMessages, setNewMessages] = useState([]);
  const [gettingResponse, setGettingResponse] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

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
    const response = await fetch("/api/chat/createNewChat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: messageText,
      }),
    });
    const json = await response.json();
    console.log("New chat: ", json);

    // if (messageText.length > 1) {
    //   const userMessage = { role: "user", content: messageText };
    //   setMessages((prevMessages) => [...prevMessages, userMessage]);

    //   const botTypingMessage = { role: "assistant", content: "..." };
    //   setMessages((prevMessages) => [...prevMessages, botTypingMessage]);

    //   // Simulate a delay for the bot's response
    //   setTimeout(() => {
    //     // Replace the bot "typing" message with the actual bot response
    //     const botMessage = {
    //       role: "assistant",
    //       content: "Sorry, can't do that now.",
    //     };
    //     setMessages((prevMessages) => {
    //       // Remove the "typing" message and add the bot's final response
    //       const updatedMessages = [...prevMessages];
    //       updatedMessages.pop(); // Remove the "typing" message
    //       return [...updatedMessages, botMessage];
    //     });
    //   }, 3000);
    //   // setMessageText("");
    // }
    // try {
    //   const res = await fetch("/api/chat/sendMessage", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({
    //       message: messageText,
    //     }),
    //   });

    //   const data = res.body;
    //   if (!res.body) {
    //     console.log("No response body from server");

    //     return;
    //   }
    //   console.log("something bruv ", data);

    //   const reader = res.body.getReader();
    //   await streamReader(reader, async ({ content }) => {
    //     setIncomingText((s) => `${s}${message.content}`);
    //     console.log("New incoming message: ", content);
    //   });
    // } catch (error) {
    //   console.error("Error:", error.message);
    // }
  };
  return (
    <>
      <Head>
        <title>New chat</title>
      </Head>
      <div className="grid h-screen grid-cols-[260px_1fr]">
        <ChatSidebar />
        <div className="flex flex-col overflow-hidden bg-gray-700">
          <div className="flex-1 overflow-auto  text-white">
            {newMessages.map((message) => (
              <Message
                key={message._id}
                content={message.content}
                role={message.role}
              />
            ))}
            {!!incomingText && (
              <Message content={incomingText} role="assistant" />
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
