import React from "react";

const Spinner: React.FC = () => (
  <div className="flex justify-center items-center p-2">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-400"></div>
  </div>
);

export default Spinner;
