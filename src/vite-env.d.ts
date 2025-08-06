interface ImportMetaEnv {
  CLIENT_ID: string;
  USER_POOL_ID: string;
  readonly VITE_AWS_COGNITO_USER_POOL_ID: string;
  readonly VITE_AWS_COGNITO_APP_CLIENT_ID: string;
  readonly VITE_TEST_MESSAGE: string; // <-- Add this line
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
/// <reference types="vite/client" />
