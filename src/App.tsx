import React, { useState, useRef, useEffect } from "react";
import {
  withAuthenticator,
  Button,
  WithAuthenticatorProps,
} from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { fetchUserAttributes } from "aws-amplify/auth";
import { Message } from "./types/Message";
import Spinner from "./components/Spinner";
import AiAvatar from "./components/AiAvatar";
import CodeDisplay from "./components/CodeDisplay";

// --- Main App Component (Now wrapped with Authenticator) ---
const App: React.FC<WithAuthenticatorProps> = ({ signOut, user }) => {
  const [conversation, setConversation] = useState<Message[]>([]);
  const [inputPrompt, setInputPrompt] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const backendUrl: string = "http://localhost:3001/api/generate";

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation, isLoading]);

  useEffect(() => {
    const fetchName = async () => {
      try {
        const attributes = await fetchUserAttributes();
        setDisplayName(attributes.name || user?.username || "");
      } catch (error) {
        console.error("Error fetching user attributes:", error);
        setDisplayName(user?.username || "");
      }
    };
    if (user) {
      fetchName();
    }
  }, [user]);

  const callBackendAPI = async (history: Message[]): Promise<string> => {
    try {
      const response = await fetch(backendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Backend API request failed");
      }

      const result = await response.json();
      return result.text;
    } catch (error: unknown) {
      console.error(error);
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (!inputPrompt.trim() || isLoading) return;

    const newUserMessage: Message = { sender: "user", text: inputPrompt };
    const updatedConversation = [...conversation, newUserMessage];
    setConversation(updatedConversation);
    setInputPrompt("");
    setIsLoading(true);
    setError(null);

    try {
      const aiResponseText = await callBackendAPI(updatedConversation);
      const newAiMessage: Message = { sender: "ai", text: aiResponseText };
      setConversation([...updatedConversation, newAiMessage]);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setError(`Failed to get response. ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = (code: string): void => {
    if (!code) return;
    navigator.clipboard.writeText(code).then(
      () => {
        const notification = document.createElement("div");
        notification.textContent = "Copied to clipboard!";
        notification.className =
          "fixed top-5 left-1/2 -translate-x-1/2 bg-gray-700 text-white py-2 px-4 rounded-lg shadow-lg animate-fade-in";
        document.body.appendChild(notification);
        setTimeout(() => {
          notification.style.opacity = "0";
          setTimeout(() => document.body.removeChild(notification), 300);
        }, 2000);
      },
      () => setError("Failed to copy text.")
    );
  };

  return (
    <div className="bg-gray-900 h-dvh w-dvw flex flex-col text-white font-sans">
      <header className="w-full flex justify-between items-center p-4 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50">
        <h1 className="text-xl font-bold text-gray-200 ">Terrific</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-300 hidden sm:block">
            Hello, {displayName}
          </span>
          <Button onClick={signOut} variation="primary" size="small">
            Sign Out
          </Button>
        </div>
      </header>

      <main className="w-full max-w-4xl mx-auto flex-1 flex flex-col p-4 overflow-y-auto">
        <div className="flex-1 space-y-6 pb-24">
          {conversation.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.sender === "ai" && <AiAvatar />}
              <div
                className={`rounded-xl p-4 max-w-2xl ${
                  msg.sender === "user" ? "bg-indigo-600" : "bg-gray-800"
                }`}
              >
                {msg.sender === "ai" ? (
                  <CodeDisplay code={msg.text} onCopy={handleCopyToClipboard} />
                ) : (
                  <p className="text-white">{msg.text}</p>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3 justify-start">
              <AiAvatar />
              <div className="bg-gray-800 rounded-xl p-3">
                <Spinner />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </main>

      <footer className="w-full flex justify-center p-4 fixed bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-transparent">
        <div className="w-full max-w-4xl relative">
          <textarea
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" &&
              !e.shiftKey &&
              (e.preventDefault(), handleSendMessage())
            }
            className="w-full bg-gray-800 border border-gray-700 rounded-2xl p-4 pr-24 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none shadow-2xl"
            placeholder="Describe your infrastructure (e.g., 'Create an S3 bucket.' or 'Now, add logging to that bucket.')"
            rows={1}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputPrompt.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 py-2 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors text-sm font-semibold"
            aria-label="Send message"
          >
            Send
          </button>
        </div>
        {error && (
          <p className="text-red-400 text-center absolute bottom-20 left-1/2 -translate-x-1/2">
            {error}
          </p>
        )}
      </footer>
      <style>{`
        .animate-fade-in { animation: fadeIn 0.5s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

// Configuration for the Sign-Up Form
const formFields = {
  signUp: {
    name: {
      label: "Full Name",
      placeholder: "Enter your full name",
      isRequired: true,
      order: 1,
    },
    email: { order: 2 },
    password: { order: 3 },
    confirm_password: { order: 4 },
  },
};

// Wrap the App component with the Authenticator
const AuthenticatedApp = withAuthenticator(App, {
  formFields,
  loginMechanisms: ["email"],
  signUpAttributes: ["name"],
});

export default AuthenticatedApp;
