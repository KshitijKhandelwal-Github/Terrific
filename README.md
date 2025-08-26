# Terrific - AI-Powered Infrastructure Code Generator

<p align="center">
  <img src="./public/assets/android-chrome-512x512.png" alt="Terrific Logo" width="120">
</p>

<p align="center">
<strong>Generate Terraform code with the power of AI</strong>
</p>

<p align="center">
  <a href="https://terrific-app.vercel.app" target="_blank">🚀 Live Demo</a>
</p>

---

## About Terrific

Terrific is an AI-powered web application that transforms natural language descriptions into production-ready Terraform code. Simply describe your cloud infrastructure needs in plain English, and Terrific generates the corresponding Infrastructure as Code (IaC) using Google's Gemini AI.

**Key Features:**

- 🤖 **AI Code Generation** - Convert natural language to Terraform HCL
- 🔐 **Secure Authentication** - AWS Cognito with social sign-in
- 💬 **Conversational Interface** - Iterative code refinement through chat
- 📋 **One-Click Copy** - Easy code copying with visual feedback
- 🎨 **Modern UI** - Clean, responsive design with dark mode

**Try it live:** [terrific-app.vercel.app](https://terrific-app.vercel.app)

## How It Works

1. **Sign In** - Authenticate securely with AWS Cognito
2. **Describe** - Tell Terrific what infrastructure you need in natural language
3. **Generate** - Get instant Terraform code powered by Google Gemini AI
4. **Iterate** - Refine and modify through conversational prompts
5. **Deploy** - Copy the generated code and use it in your projects

## Example Usage

```
User: "Create an S3 bucket with versioning enabled"

Terrific: Generates complete Terraform configuration with:
- S3 bucket resource
- Versioning configuration
- Best practice settings
```

---

## Technical Details

### Architecture

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express.js
- **AI**: Google Gemini 2.5 Flash API
- **Authentication**: AWS Cognito
- **Deployment**: Vercel

### Tech Stack

- **Framework**: [React](https://reactjs.org/) with [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Authentication**: [AWS Amplify UI](https://ui.docs.amplify.aws/) + [AWS Cognito](https://aws.amazon.com/cognito/)
- **AI Service**: [Google Gemini API](https://ai.google.dev/)
- **Backend**: [Express.js](https://expressjs.com/)

## 🚀 Live Application

The application is deployed and ready to use at [terrific-app.vercel.app](https://terrific-app.vercel.app).

All environment variables and API keys are configured on Vercel for seamless operation.

### Local Development

For local development, you can clone and run the project:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/KshitijKhandelwal-Github/Terrific.git
   cd Terrific
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   Create a `.env` file in the root directory with the following variables:

   ```env
   # Google Gemini AI API Key
   GEMINI_API_KEY="your-gemini-api-key"

   # AWS Cognito Configuration
   VITE_AWS_COGNITO_USER_POOL_ID="your-user-pool-id"
   VITE_AWS_COGNITO_APP_CLIENT_ID="your-app-client-id"
   VITE_AWS_REGION="your-aws-region"
   ```

   **Required API Keys:**

   - **Gemini API Key**: Get from [Google AI Studio](https://aistudio.google.com/app/apikey)
   - **AWS Cognito**: Create a User Pool in [AWS Cognito Console](https://console.aws.amazon.com/cognito/)

4. **Run the development servers:**

   ```bash
   # Terminal 1: Backend server
   npm run start:server

   # Terminal 2: Frontend dev server
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

📁 Project Structure

```
├── public/           # Static assets like favicons
│   └── assets/       # Image assets for the app
├── src/
│   ├── components/   # Reusable UI components (if any)
│   ├── pages/        # Main page components (LandingPage, GeneratorPage)
│   ├── App.tsx       # Main application router
│   ├── main.tsx      # Application entry point (React render, Amplify config)
│   └── server.tsx    # Backend Express.js server logic
├── .env              # Local environment variables (ignored by Git)
├── .env.example      # Example environment file
├── package.json      # Project dependencies and scripts
└── README.md         # This file
```

---

## ☁️ Deployment

The application is currently deployed on [Vercel](https://vercel.com) with all necessary environment variables configured:

- `GEMINI_API_KEY` - Google Gemini AI API key
- `VITE_AWS_COGNITO_USER_POOL_ID` - AWS Cognito User Pool ID
- `VITE_AWS_COGNITO_APP_CLIENT_ID` - AWS Cognito App Client ID
- `VITE_AWS_REGION` - AWS region configuration

The deployment automatically handles both frontend and backend services for optimal performance.

---

_This project was created by [Kshitij Khandelwal](https://github.com/KshitijKhandelwal-Github/Kshitij-Khandelwal)._
