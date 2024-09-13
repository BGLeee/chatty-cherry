import { headers } from "next/dist/client/components/headers";
import { OpenAIEdgeStream } from "openai-edge-stream";
import { streamReader } from "openai-edge-stream";
// import { Configuration, OpenAIApi } from "openai-edge";

export const runtime = "edge";

// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// const openai = new OpenAIApi(configuration);
export default async function handler(req) {
  const { message } = await req.json();

  console.log("Here also: ", message);

  try {
    const stream = await OpenAIEdgeStream(
      "https://api.openai.com/v1/chat/completions",
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          message: [{ role: "user", content: message }],
          stream: true,
        }),
      }
    );

    return new Response(stream);
  } catch (error) {
    console.error("Error in API:", error.message);
    return new Response("Error: " + error.message, { status: 500 });
  }
}
