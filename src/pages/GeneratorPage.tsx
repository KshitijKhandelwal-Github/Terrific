/* eslint-disable react-refresh/only-export-components */
import React, { useEffect, useState } from 'react';
import { withAuthenticator, Button, Heading, Flex, WithAuthenticatorProps } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { fetchAuthSession, fetchUserAttributes } from 'aws-amplify/auth';

// --- Type Definitions ---
interface CodeDisplayProps {
  code: string;
}
type AnalysisMode = 'explain' | 'suggest';

// --- Helper Components (moved outside the main component for cleanliness) ---
const Spinner: React.FC = () => (
  <div className="flex justify-center items-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
  </div>
);

const CodeDisplay: React.FC<CodeDisplayProps> = ({ code }) => (
  <pre className="bg-gray-800 text-white p-4 rounded-lg overflow-x-auto text-sm">
    <code>{code}</code>
  </pre>
);

const formFields = {
  signUp: {
    email: {
        label: 'Email Address',
        Placeholder: "Enter your email address",
        order: 1
    },
    name: {
      label: 'Full Name',
      Placeholder: "Enter your full name",
      order: 0
    },
    password: {
      order: 2
    },
    confirm_password: {
      order: 3
    },
    username: {
        label: 'Username',
        Placeholder: "Enter your username",
        order: 4,
        isRequired: false, // Ensure username is required
        display: 'none'
        }
  },
};

// --- Main App Component ---
const GeneratorPage = ({ signOut, user }: WithAuthenticatorProps) => {
  const [prompt, setPrompt] = useState<string>('');
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [analysis, setAnalysis] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');

  // Use a relative path for the backend API URL
  const backendUrl: string = '/api/generate'; 

  // Function to call our backend API
  const callBackendAPI = async (requestPrompt: string, mode: 'generate' | AnalysisMode): Promise<string> => {
    try {
      // *** MODIFIED: Get the authentication token ***
      const { tokens } = await fetchAuthSession();
      const token = tokens?.idToken?.toString();
      if (!token) throw new Error("Authentication token not found.");

      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // *** MODIFIED: Add the token to the request headers ***
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt: requestPrompt, mode: mode }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Backend API request failed');
      }

      const result = await response.json();
      return result.generatedText || result.text; // Accommodate different backend responses

    } catch (err: unknown) {
      console.error(err);
      throw err;
    }
  };
  
  useEffect(() => {
    const fetchName = async () => {
      try {
        const attributes = await fetchUserAttributes();
        setDisplayName(attributes.name || user?.username || '');  // Use name, fallback to username
      } catch (error) {
        console.error("Error fetching user attributes:", error);
        setDisplayName(user?.username || ''); // Fallback on error
      }
    };

    if (user) {
      fetchName();
    }
  }, [user]);

  // --- Event Handlers ---
  const handleGenerateCode = async (): Promise<void> => {
    if (!prompt.trim()) {
      setError('Please enter a description.');
      return;
    }
    setIsGenerating(true);
    setError(null);
    setGeneratedCode('');
    setAnalysis('');

    try {
      const code = await callBackendAPI(prompt, 'generate');
      setGeneratedCode(code);
    } catch (err: unknown) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError('An unknown error occurred.');
        }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnalyzeCode = async (mode: AnalysisMode): Promise<void> => {
    if (!generatedCode || isAnalyzing) return;
    setIsAnalyzing(true);
    setAnalysis('');
    setError(null);

    try {
      const result = await callBackendAPI(generatedCode, mode);
      setAnalysis(result);
    } catch (err: unknown) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError('An unknown error occurred during analysis.');
        }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyToClipboard = (): void => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode).then(() => {
        // Simple alert for notification, can be replaced with a more elegant UI
        alert("Copied to clipboard!");
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setPrompt(e.target.value);
  };

  return (
    <div className="bg-gray-900 min-h-screen min-w-screen flex flex-col items-center text-white font-sans p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl">
        {/* Header from authentication flow */}
        <Flex as="header" justifyContent="space-between" alignItems="center" marginBottom="2rem">
            <Heading level={2} className="text-indigo-400">Terrific</Heading>
            <Flex alignItems="center">
                <p style={{marginRight: '1rem'}}>Hello, {displayName}</p>
                <Button onClick={signOut} variation="primary" size="small">Sign Out</Button>
            </Flex>
        </Flex>
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg bg-center">
          <label htmlFor="prompt-input" className="block text-lg font-medium text-gray-300 mb-2">
            Describe your infrastructure:
          </label>
          <textarea
            id="prompt-input"
            value={prompt}
            onChange={handlePromptChange}
            className="w-full h-24 p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition duration-200 resize-none"
            placeholder="e.g., 'Create a secure S3 bucket for private data'"
          />
          <button
            onClick={handleGenerateCode}
            disabled={isGenerating}
            className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-500 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center shadow-md"
          >
            {isGenerating ? <Spinner /> : '✨ Generate Code'}
          </button>
          {error && <p className="text-red-400 mt-4 text-center bg-red-900/50 p-3 rounded-lg">{error}</p>}
        </div>

        {generatedCode && (
          <div className="mt-8 bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
              <h2 className="text-2xl font-semibold text-gray-300">Generated Code</h2>
              <button
                onClick={handleCopyToClipboard}
                className="bg-gray-700 hover:bg-gray-600 text-gray-300 font-bold py-2 px-4 rounded-lg transition duration-300"
              >
                Copy
              </button>
            </div>
            <CodeDisplay code={generatedCode} />
            <div className="flex gap-4 mt-4 flex-wrap">
              <button
                onClick={() => handleAnalyzeCode('explain')}
                disabled={isAnalyzing}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-500 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition duration-300"
              >
                Explain Code
              </button>
              <button
                onClick={() => handleAnalyzeCode('suggest')}
                disabled={isAnalyzing}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-500 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition duration-300"
              >
                Suggest Improvements
              </button>
            </div>
          </div>
        )}

        {(isAnalyzing || analysis) && (
            <div className="mt-8 bg-gray-800 p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-semibold text-gray-300 mb-4">AI Analysis</h2>
                {isAnalyzing ? (
                    <div className="flex justify-center items-center h-24"><Spinner /></div>
                ) : (
                    <div className="text-gray-300 whitespace-pre-wrap">{analysis}</div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default withAuthenticator(GeneratorPage, {
  formFields,
  loginMechanisms: ['email'],    
  signUpAttributes: ['name'],    
});