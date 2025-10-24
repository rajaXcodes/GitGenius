import { GithubRepoLoader } from '@langchain/community/document_loaders/web/github'

export const LoadGithubRepo = async (githubUrl: string, githubToken?: string) => {
    const loader = new GithubRepoLoader(githubUrl, {
        accessToken: githubToken || '',
        branch: 'main',
        ignoreFiles: ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb'],
        recursive: true,
        unknown: 'warn',
        maxConcurrency: 5
    })
    const docs = await loader.load();
    return docs;
}

// [Document {
//     pageContent: "import { StrictMode } from 'react'\nimport { createRoot } from 'react-dom/client'\nimport './index.css'\nimport App from './App.tsx'\n\ncreateRoot(document.getElementById('root')!).render(\n  <StrictMode>\n    <App />\n  </StrictMode>,\n)\n",
//     metadata: {
//       source: "src/main.tsx",
//       repository: "https://github.com/rajaXcodes/interview_frontend",
//       branch: "main",
//     },
//     id: undefined,
//   }]

console.log(await LoadGithubRepo('https://github.com/rajaXcodes/interview_frontend'));