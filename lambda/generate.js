const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { history } = JSON.parse(event.body || "{}");

    if (!history || history.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Conversation history is required." }),
      };
    }

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set.");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-preview-05-20",
    });

    const systemInstruction = {
      role: "system",
      parts: [
        {
          text: `You are an expert in Terraform and Infrastructure as Code. 
                Your task is to generate and iteratively update Terraform HCL code based on the user's conversation.
                When generating code, only output the raw code block, without any explanation, comments, or markdown formatting.
                If the user asks for an explanation or a change, respond naturally, but always provide the complete, updated code block in your final response.`,
        },
      ],
    };

    const geminiHistory = history.map((msg) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    }));

    const chat = model.startChat({
      history: geminiHistory.slice(0, -1),
      systemInstruction: systemInstruction,
      generationConfig: {
        maxOutputTokens: 2048,
      },
    });

    const lastMessage = history[history.length - 1].text;
    const result = await chat.sendMessage(lastMessage);
    const response = await result.response;
    const text = response
      .text()
      .replace(/```hcl\n|```terraform\n|```/g, "")
      .trim();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ text }),
    };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to generate content from AI." }),
    };
  }
};
