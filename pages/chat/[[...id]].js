import Head from "next/head";
import { ChatSidebar } from "components/ChatSidebar";
import { use, useState } from "react";
import { streamReader } from "openai-edge-stream";

export default function ChatPage() {
  const [incomingText, setIncomingText] = useState("");
  const [messageText, setMessageText] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Message: ", messageText);
    try {
      const res = await fetch("/api/chat/sendMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
        }),
      });

      const data = res.body;
      if (!data) {
        return;
      }
      const reader = data.getReader();
      await streamReader(reader, async (message) => {
        setIncomingText((s) => `${s}${message.content}`);
        console.log(message);
      });
    } catch (error) {
      console.error("Error:", error.message);
    }
  };
  return (
    <>
      <Head>
        <title>New chat</title>
      </Head>
      <div className="grid h-screen grid-cols-[260px_1fr]">
        <ChatSidebar />
        <div className="flex flex-col bg-gray-700 ">
          <div className="flex-1 text-white">{incomingText}</div>
          <footer className="bg-gray-800 p-10">
            <form onSubmit={handleSubmit}>
              <fieldset className="flex gap-2 ">
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="w-full resize-none rounded-md bg-gray-700 p-2 text-white  focus:border-emerald-500 focus:bg-gray-600 focus:outline focus:outline-emerald-500"
                  placeholder="Send a message..."
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
