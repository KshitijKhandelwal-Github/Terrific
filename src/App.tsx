import React, { useState, useRef, useEffect } from 'react';
import { withAuthenticator, Button, WithAuthenticatorProps } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { fetchUserAttributes } from 'aws-amplify/auth';

// --- Type Definitions ---
interface Message {
  sender: 'user' | 'ai';
  text: string;
}

// --- Helper Components ---

const Spinner: React.FC = () => (
  <div className="flex justify-center items-center p-2">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-400"></div>
  </div>
);

const AiAvatar: React.FC = () => (
    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-3 flex-shrink-0">
        <svg className="w-5 h-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5V13H9.5v-2H11V9.5h2V11h1.5v2H13v3.5h-2zm1-8.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
        </svg>
    </div>
);

const CodeDisplay: React.FC<{ code: string; onCopy: (code: string) => void }> = ({ code, onCopy }) => (
  <div className="relative bg-gray-900/70 rounded-lg">
     <button 
        onClick={() => onCopy(code)} 
        className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-400 hover:text-white transition-colors"
        aria-label="Copy code"
    >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
            <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zM-1 7a.5.5 0 0 1 .5-.5h15a.5.5 0 0 1 0 1H-.5A.5.5 0 0 1-1 7z"/>
        </svg>
    </button>
    <pre className="text-white p-4 rounded-lg overflow-x-auto text-sm pt-10">
        <code>{code}</code>
    </pre>
  </div>
);

// --- Main App Component (Now wrapped with Authenticator) ---
const App: React.FC<WithAuthenticatorProps> = ({ signOut, user }) => {
  const [conversation, setConversation] = useState<Message[]>([]);
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const backendUrl: string = 'http://localhost:3001/api/generate';

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation, isLoading]);

  useEffect(() => {
    const fetchName = async () => {
      try {
        const attributes = await fetchUserAttributes();
        setDisplayName(attributes.name || user?.username || '');
      } catch (error) {
        console.error("Error fetching user attributes:", error);
        setDisplayName(user?.username || '');
      }
    };
    if (user) {
      fetchName();
    }
  }, [user]);

  const callBackendAPI = async (history: Message[]): Promise<string> => {
    try {
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Backend API request failed');
      }

      const result = await response.json();
      return result.text;
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  };

  const handleSendMessage = async () => {
    if (!inputPrompt.trim() || isLoading) return;

    const newUserMessage: Message = { sender: 'user', text: inputPrompt };
    const updatedConversation = [...conversation, newUserMessage];
    setConversation(updatedConversation);
    setInputPrompt('');
    setIsLoading(true);
    setError(null);

    try {
      const aiResponseText = await callBackendAPI(updatedConversation);
      const newAiMessage: Message = { sender: 'ai', text: aiResponseText };
      setConversation([...updatedConversation, newAiMessage]);
    } catch (err: any) {
      setError(`Failed to get response. ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = (code: string): void => {
    if (!code) return;
    navigator.clipboard.writeText(code).then(
      () => {
        const notification = document.createElement('div');
        notification.textContent = 'Copied to clipboard!';
        notification.className = 'fixed top-5 left-1/2 -translate-x-1/2 bg-gray-700 text-white py-2 px-4 rounded-lg shadow-lg animate-fade-in';
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 2000);
      },
      (err) => setError('Failed to copy text.')
    );
  };

  return (
    <div className="bg-gray-900 h-dvh w-dvw flex flex-col text-white font-sans">
      <header className="w-full flex justify-between items-center p-4 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50">
        <h1 className="text-xl font-bold text-gray-200 ">Terrific</h1>
        <div className="flex items-center gap-4">
            <span className="text-gray-300 hidden sm:block">Hello, {displayName}</span>
            <Button onClick={signOut} variation="primary" size="small">Sign Out</Button>
        </div>
      </header>
      
      <main className="w-full max-w-4xl mx-auto flex-1 flex flex-col p-4 overflow-y-auto">
        <div className="flex-1 space-y-6 pb-24">
          {conversation.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === 'ai' && <AiAvatar />}
              <div className={`rounded-xl p-4 max-w-2xl ${msg.sender === 'user' ? 'bg-indigo-600' : 'bg-gray-800'}`}>
                {msg.sender === 'ai' ? <CodeDisplay code={msg.text} onCopy={handleCopyToClipboard} /> : <p className="text-white">{msg.text}</p>}
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
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
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
        {error && <p className="text-red-400 text-center absolute bottom-20 left-1/2 -translate-x-1/2">{error}</p>}
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
      label: 'Full Name',
      placeholder: 'Enter your full name',
      isRequired: true,
      order: 1,
    },
    email: { order: 2 },
    password: { order: 3 },
    confirm_password: { order: 4 },
  },
};

// Wrap the App component with the Authenticator
export default withAuthenticator(App, {
  formFields,
  loginMechanisms: ['email'],
  signUpAttributes: ['name'],
});
