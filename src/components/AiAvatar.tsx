import React from "react";

const AiAvatar: React.FC = () => (
  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-3 flex-shrink-0">
    <svg
      className="w-5 h-5 text-indigo-400"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5V13H9.5v-2H11V9.5h2V11h1.5v2H13v3.5h-2zm1-8.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
    </svg>
  </div>
);

export default AiAvatar;
