# Terrific - AI-Powered Infrastructure Code Generator

<p align="center">
  <img src="./public/assets/android-chrome-512x512.png" alt="Terrific Logo" width="120">
</p>

<p align="center">
  <strong>Generate, explain, and improve Terraform code with the power of AI.</strong>
</p>

---

Terrific is a full-stack web application designed to streamline the DevOps workflow by leveraging AI. Users can describe their desired cloud infrastructure in plain English, and Terrific will generate the corresponding Terraform code. The app also provides AI-driven explanations and suggestions for improving existing code.

The application features a secure authentication system, allowing users to sign up, log in, and manage their work in a protected environment.

## ✨ Features

* **Secure User Authentication:** Full sign-up and sign-in functionality powered by AWS Cognito, including social sign-in with Google.
* **AI Code Generation:** Describe infrastructure requirements in natural language (e.g., "Create a secure S3 bucket") and receive ready-to-use Terraform code.
* **AI Code Analysis:**
    * **Explain Code:** Get a detailed, line-by-line explanation of what a piece of Terraform code does.
    * **Suggest Improvements:** Receive AI-powered suggestions on how to improve the security, performance, or syntax of your code.
* **Responsive UI:** A clean, modern, and dark-mode interface built with React and Tailwind CSS.
* **Protected API:** The backend API is secured, ensuring only authenticated users can access the AI generation services.

## 🛠️ Tech Stack

This project is built with a modern, full-stack JavaScript architecture.

* **Frontend:**
    * **Framework:** [React](https://reactjs.org/)
    * **Build Tool:** [Vite](https://vitejs.dev/)
    * **Language:** [TypeScript](https://www.typescriptlang.org/)
    * **Styling:** [Tailwind CSS](https://tailwindcss.com/)
    * **Authentication UI:** [AWS Amplify UI for React](https://ui.docs.amplify.aws/)

* **Backend:**
    * **Runtime:** [Node.js](https://nodejs.org/)
    * **Framework:** [Express.js](https://expressjs.com/)
    * **AI Service:** [Google Gemini API](https://ai.google.dev/)

* **Authentication:**
    * **Service:** [AWS Cognito](https://aws.amazon.com/cognito/)

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

* [Node.js](https://nodejs.org/) (version 18 or later)
* [Git](https://git-scm.com/)
* An [AWS Account](https://aws.amazon.com/)
* A [Google Cloud Platform Account](https://cloud.google.com/) (for the Gemini API key)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/KshitijKhandelwal-Github/Terrific.git](https://github.com/KshitijKhandelwal-Github/Terrific.git)
    ```

2.  **Navigate into the project directory:**
    ```bash
    cd Terrific
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    ```

4.  **Set up Environment Variables:**

    This project requires several secret keys and public identifiers to connect to the backend services.

    * Create a `.env` file by making a copy of the example file:
        ```bash
        cp .env.example .env
        ```
    * Now, open the newly created `.env` file and fill in the values:

        #### **Google Gemini API Key**

        * `GEMINI_API_KEY`: Get your key from [Google AI Studio](https://aistudio.google.com/app/apikey).

        #### **AWS Cognito Variables**

        You will need to create an **AWS Cognito User Pool** and an **App Client**. Follow the project's setup guide or the official AWS documentation.

        * `AWS_COGNITO_USER_POOL_ID`: The ID of your Cognito User Pool (used by the backend).
        * `VITE_AWS_COGNITO_USER_POOL_ID`: The same ID, but prefixed with `VITE_` for frontend access.
        * `VITE_AWS_COGNITO_APP_CLIENT_ID`: The ID of the App Client associated with your User Pool.

    * Your final `.env` file should look like this:
        ```dotenv
        # Backend secret keys
        GEMINI_API_KEY="AIzaSy...your...gemini...key"
        AWS_COGNITO_USER_POOL_ID="ap-south-1_xxxxxxxxx"
        
        # Frontend public variables
        VITE_AWS_COGNITO_USER_POOL_ID="ap-south-1_xxxxxxxxx"
        VITE_AWS_COGNITO_APP_CLIENT_ID="xxxxxxxxxxxxxxxxxxxxxx"
        ```

5.  **Run the Application:**

    You need to run the backend and frontend servers in two separate terminals.

    * **Terminal 1: Start the backend server**
        ```bash
        npm run start:server
        ```

    * **Terminal 2: Start the frontend dev server**
        ```bash
        npm run dev
        ```

    Your application should now be running. Open your browser to the local address provided by the `npm run dev` command (usually `http://localhost:5173`).

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
☁️ Deployment:
This application is ready for deployment to platforms like Vercel, Render, or AWS Amplify Hosting.

When deploying, you do not upload the `.env` file. Instead, you must configure the environment variables directly in your hosting provider's dashboard. Ensure you set all four variables (`GEMINI_API_KEY`, `AWS_COGNITO_USER_POOL_ID`, `VITE_AWS_COGNITO_USER_POOL_ID`, and `VITE_AWS_COGNITO_APP_CLIENT_ID`) in the deployment environment settings.

---

*This project was created by [Kshitij Khandelwal](https://github.com/KshitijKhandelwal-Github).*