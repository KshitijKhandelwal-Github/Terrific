import React from "react";

interface CodeDisplayProps {
  code: string;
  onCopy: (code: string) => void;
}

const CodeDisplay: React.FC<CodeDisplayProps> = ({ code, onCopy }) => (
  <div className="relative bg-gray-900/70 rounded-lg">
    <button
      onClick={() => onCopy(code)}
      className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-400 hover:text-white transition-colors"
      aria-label="Copy code"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        viewBox="0 0 16 16"
      >
        <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z" />
        <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zM-1 7a.5.5 0 0 1 .5-.5h15a.5.5 0 0 1 0 1H-.5A.5.5 0 0 1-1 7z" />
      </svg>
    </button>
    <pre className="text-white p-4 rounded-lg overflow-x-auto text-sm pt-10">
      <code>{code}</code>
    </pre>
  </div>
);

export default CodeDisplay;
