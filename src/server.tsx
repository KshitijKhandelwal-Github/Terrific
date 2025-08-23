import express, { Express, Request, Response } from "express";
import { GoogleGenerativeAI, Content } from "@google/generative-ai";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app: Express = express();
const port: number = 3001;

app.use(cors());
app.use(express.json());

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in the .env file.");
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-preview-05-20",
});

interface Message {
  sender: "user" | "ai";
  text: string;
}

interface GenerateRequestBody {
  history: Message[];
}

app.post(
  "/api/generate",
  async (req: Request<object, object, GenerateRequestBody>, res: Response) => {
    try {
      const { history } = req.body;

      if (!history || history.length === 0) {
        return res
          .status(400)
          .json({ error: "Conversation history is required." });
      }

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

      // Correctly map the message history to the format expected by the Gemini API
      const geminiHistory: Content[] = history.map((msg) => ({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
      }));

      const chat = model.startChat({
        // The history should be an array of Content objects
        history: geminiHistory.slice(0, -1), // All but the last message
        systemInstruction: systemInstruction,
        generationConfig: {
          maxOutputTokens: 2048,
        },
      });

      const lastMessage = history[history.length - 1].text;
      const result = await chat.sendMessage(lastMessage);
      const response = result.response;
      const text = response
        .text()
        .replace(/```hcl\n|```terraform\n|```/g, "")
        .trim();

      res.json({ text });
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      res.status(500).json({ error: "Failed to generate content from AI." });
    }
  }
);

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
