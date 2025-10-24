import { GoogleGenAI } from "@google/genai";


const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

const basePrompt = "You are an expert software engineer and technical documentation writer.\n\n" +
    "I will provide a git diff output. Your task is to read it carefully and produce a **concise, high-level summary** of what was changed, added, or removed. Focus on the intent and key effects, not line-by-line details.\n\n" +
    "### How to interpret the diff:\n" +
    "- Lines starting with '+' are **added**.\n" +
    "- Lines starting with '-' are **removed**.\n" +
    "- Lines without these symbols provide **context** (filenames, modes, unchanged lines).\n" +
    "- Each file change begins with: diff --git a/<old_file> b/<new_file>.\n" +
    "- Metadata lines like `new file mode`, `index`, `---` / `+++` indicate file creation, modification, or deletion.\n\n" +
    "### Your response should include:\n" +
    "1. **Summary (1–3 sentences)** — concise overview of the overall changes, new functionality, fixes, or docs.\n" +
    "2. **Optional file notes** — if relevant, 1 line per file describing its type or key change. Do not include full file details.\n" +
    "3. **Format example:**\n\n" +
    "**Summary:**\n" +
    "Adds a Linux installer for Ollama and WSL setup instructions.\n\n" +
    "**File notes:**\n" +
    "- install_ollama.sh: New shell script for Linux installation and systemd setup.\n" +
    "- running_on_wsl.md: New documentation for running the stack on Windows via WSL.\n\n" +
    "### Rules:\n" +
    "- Keep it short and informative.\n" +
    "- Focus on conceptual changes, new features, or docs.\n" +
    "- Use markdown (`**bold**, lists`).\n" +
    "- Do not echo the raw diff.\n\n";



export const aiSummariseCommit = async (diff: string) => {
    // Compose the full prompt dynamically with the diff
    const fullPrompt = `${basePrompt}\n\nNow, here is the diff:\n\n${diff}`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
        config: {
            temperature: 0.2,
            systemInstruction:
                "You are an expert developer assistant. Write a well-structured summary of this git diff using markdown.",
        },
    });

    const output = response.text || "No summary generated.";
    return output;
};