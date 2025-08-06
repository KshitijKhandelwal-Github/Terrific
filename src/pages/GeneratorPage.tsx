/* eslint-disable react-refresh/only-export-components */
import React, { useState, useEffect } from 'react';
import { withAuthenticator, Button, WithAuthenticatorProps } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { fetchAuthSession, fetchUserAttributes } from 'aws-amplify/auth';

// --- Type Definitions ---
interface CodeDisplayProps {
  code: string;
}
type AnalysisMode = 'explain' | 'suggest';

// --- Helper Components ---
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

// --- Configuration for the Sign-Up Form ---
const formFields = {
  signUp: {
    name: {
      label: 'Full Name',
      placeholder: 'Enter your full name',
      isRequired: true,
      order: 1,
    },
    email: {
      order: 2,
    },
    password: {
      order: 3,
    },
    confirm_password: {
      order: 4,
    },
  },
};

// --- Main Page Component ---
const GeneratorPage = ({ signOut, user }: WithAuthenticatorProps) => {
  const [displayName, setDisplayName] = useState('');
  const [prompt, setPrompt] = useState<string>('');
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [analysis, setAnalysis] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

  const callBackendAPI = async (requestPrompt: string, mode: 'generate' | AnalysisMode): Promise<string> => {
    try {
      const { tokens } = await fetchAuthSession();
      const token = tokens?.idToken?.toString();
      if (!token) throw new Error("Authentication token not found.");

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt: requestPrompt, mode: mode }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Backend API request failed');
      }

      const result = await response.json();
      return result.generatedText || result.text;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

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
        <header className="w-full grid grid-cols-3 items-center mb-4 pt-15">
          <div></div>
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-indigo-400">Terrific</h1>
          </div>
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-4 z-10">
              <span className="text-gray-300 hidden sm:block">Hello, {displayName}</span>
              <Button onClick={signOut} variation="primary" size="small">Sign Out</Button>
          </div>
        </header>
        <p className="text-gray-400 text-center mb-8">Generate, explain, and improve Terraform code with AI.</p>

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
