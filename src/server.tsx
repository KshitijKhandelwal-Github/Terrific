// Import necessary types and packages
import express, { type Express, type Request, type Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import cors from 'cors';
import dotenv from 'dotenv';
// Load environment variables from .env file
dotenv.config();

// --- Basic Setup ---
const app: Express = express();
const port: number = 3001; // Port for the backend server

// --- Middleware ---
// Enable CORS (Cross-Origin Resource Sharing) to allow requests from your frontend
app.use(cors());
// Enable Express to parse JSON request bodies
app.use(express.json());

// --- Gemini API Initialization ---
// Make sure your GEMINI_API_KEY is set in your .env file
if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in the .env file.");
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });

// --- Type Definition for Request Body ---
interface GenerateRequestBody {
  prompt: string;
  mode: 'generate' | 'explain' | 'suggest';
}

// --- API Endpoint ---
app.post('/api/generate', async (
  req: Request<Record<string, never>, Record<string, never>, GenerateRequestBody>, 
  res: Response
) => {
  try {
    // Get the prompt and mode from the request body sent by the frontend
    const { prompt, mode } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    let fullPrompt: string = '';

    // Create the appropriate prompt for Gemini based on the mode
    if (mode === 'generate') {
      fullPrompt = `
        You are an expert in Terraform and Infrastructure as Code.
        Your task is to generate valid Terraform HCL code based on the user's request.
        Only output the raw code block, without any explanation, comments, or markdown formatting like \`\`\`hcl.
        User request: "${prompt}"
      `;
    } else if (mode === 'explain') {
      fullPrompt = `
        You are a helpful assistant who explains technical concepts simply.
        Explain the following Terraform code block. Describe what each resource does and what the overall configuration achieves. Format the output clearly.
        Terraform Code:\n---\n${prompt}\n---
      `;
    } else if (mode === 'suggest') {
      fullPrompt = `
        You are a DevOps security and performance expert.
        Review this Terraform code and suggest improvements for security, cost-effectiveness, and performance.
        Provide actionable feedback in a structured list. If the code is already good, state that and explain why.
        Terraform Code:\n---\n${prompt}\n---
      `;
    } else {
      return res.status(400).json({ error: 'Invalid mode specified.' });
    }

    // Call the Gemini API
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text().replace(/```hcl\n|```terraform\n|```/g, '').trim();

    // Send the generated text back to the frontend
    res.json({ text });

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ error: 'Failed to generate content from AI. Please check the backend server logs.' });
  }
});

// --- Start the Server ---
app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
