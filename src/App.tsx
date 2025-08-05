import React, { useState } from 'react';

// --- Type Definitions ---
// Props for the CodeDisplay component
interface CodeDisplayProps {
  code: string;
}

// Type for the analysis mode
type AnalysisMode = 'explain' | 'suggest';

// --- Helper Components ---

// Simple loading spinner component
const Spinner: React.FC = () => (
  <div className="flex justify-center items-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
  </div>
);

// Component to render the generated Terraform code
const CodeDisplay: React.FC<CodeDisplayProps> = ({ code }) => (
  <pre className="bg-gray-800 text-white p-4 rounded-lg overflow-x-auto text-sm">
    <code>{code}</code>
  </pre>
);

// --- Main App Component ---

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [analysis, setAnalysis] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Define the backend API URL
  const backendUrl: string = 'http://localhost:3001/api/generate';

  // Function to call our backend API
  const callBackendAPI = async (requestPrompt: string, mode: 'generate' | AnalysisMode): Promise<string> => {
    try {
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: requestPrompt, mode: mode }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Backend API request failed');
      }

      const result = await response.json();
      return result.text;

    } catch (err: unknown) { // Catch as 'any' to access err.message
      console.error(err);
      throw err; // Re-throw to be caught by the calling function
    }
  };

  // --- Event Handlers ---

  const handleGenerateCode = async (): Promise<void> => {
    if (!prompt.trim()) {
      setError('Please enter a description of the infrastructure you want to create.');
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
        console.log(err.message); // All good!
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
      // For analysis, the "prompt" is the generated code itself
      const result = await callBackendAPI(generatedCode, mode);
      setAnalysis(result);
    } catch (err: unknown) {
      if (err instanceof Error) {
    console.log(err.message); // All good!
  }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyToClipboard = (): void => {
    if (!generatedCode) return;
    
    const textArea = document.createElement('textarea');
    textArea.value = generatedCode;
    textArea.style.position = 'absolute';
    textArea.style.left = '-9999px';
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);
    textArea.select();

    try {
      document.execCommand('copy');
      const notification = document.createElement('div');
      notification.textContent = 'Copied to clipboard!';
      notification.className = 'fixed bottom-5 left-1/2 -translate-x-1/2 bg-gray-700 text-white py-2 px-4 rounded-lg shadow-lg transition-opacity duration-300';
      document.body.appendChild(notification);
      setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => document.body.removeChild(notification), 300);
      }, 2000);
    } catch (err: unknown) {
      if (err instanceof Error) {
    console.log(err.message); // All good!
  }
    } finally {
      document.body.removeChild(textArea);
    }
  };

  // Typed event handler for the textarea
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setPrompt(e.target.value);
  };

  // --- Render Method ---

  return (
    <div className="bg-gray-900 min-h-screen min-w-screen flex flex-col items-center text-white font-sans p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl">

        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-indigo-400">Terrific</h1>
          <p className="text-gray-400 mt-2">Generate, explain, and improve Terraform code with AI.</p>
        </header>

        {/* Input Section */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg bg-center">
          <label htmlFor="prompt-input" className="block text-lg font-medium text-gray-300 mb-2">
            Describe your infrastructure:
          </label>
          <textarea
            id="prompt-input"
            value={prompt}
            onChange={handlePromptChange}
            className="w-full h-24 p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition duration-200 resize-none"
            placeholder="e.g., 'Create a secure S3 bucket for private data' or 'Provision a small EC2 instance for a web server'"
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

        {/* Output Section */}
        {generatedCode && (
          <div className="mt-8 bg-gray-800 p-6 rounded-xl shadow-lg animate-fade-in">
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
                  ✨ Explain Code
                </button>
                <button
                  onClick={() => handleAnalyzeCode('suggest')}
                  disabled={isAnalyzing}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-500 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                >
                  ✨ Suggest Improvements
                </button>
            </div>
          </div>
        )}

        {/* Analysis Section */}
        {(isAnalyzing || analysis) && (
            <div className="mt-8 bg-gray-800 p-6 rounded-xl shadow-lg animate-fade-in">
                 <h2 className="text-2xl font-semibold text-gray-300 mb-4">AI Analysis</h2>
                 {isAnalyzing ? (
                    <div className="flex justify-center items-center h-24">
                        <Spinner />
                    </div>
                 ) : (
                    <div className="text-gray-300 whitespace-pre-wrap prose prose-invert max-w-none">{analysis}</div>
                 )}
            </div>
        )}
        
        <style>{`
            .prose { white-space: pre-wrap; }
            .prose h3 { margin-top: 1em; margin-bottom: 0.5em; }
            .prose ul { margin-left: 1.5em; list-style-type: disc; }
            .animate-fade-in { animation: fadeIn 0.5s ease-in-out; }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </div>
    </div>
  );
};

export default App;
