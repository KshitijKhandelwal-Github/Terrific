import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

import { Amplify } from 'aws-amplify';

// --- CONFIGURE AMPLIFY HERE ---
// This connects your frontend to the Cognito User Pool you created.
Amplify.configure({
  Auth: {
    Cognito: {
      // Replace with your actual User Pool ID from the AWS Cognito Console
      userPoolId: import.meta.env.VITE_AWS_COGNITO_USER_POOL_ID, 
      
      // Replace with your actual App Client ID from the AWS Cognito Console
      userPoolClientId: import.meta.env.VITE_AWS_COGNITO_APP_CLIENT_ID,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);