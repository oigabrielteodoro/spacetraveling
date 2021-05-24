declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PRISMIC_API_ENDPOINT: string;
      PRISMIC_ACCESS_TOKEN: string;
      NEXT_PUBLIC_UTTERANCE_URL: string;
      NEXT_PUBLIC_UTTERANCE_NODE_ID: string;
      NEXT_PUBLIC_UTTERANCE_REPO_NAME: string;
    }
  }
}

export {};
