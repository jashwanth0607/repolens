"use client";

import { FormEvent, useState } from "react";
import {
  Bot,
  Send,
  User,
  Loader2,
  AlertCircle,
} from "lucide-react";

import type { Repository } from "../lib/types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://repolens-n8j1.onrender.com";

type AIAssistantProps = {
  repository: Repository;
};

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function AIAssistant({
  repository,
}: AIAssistantProps) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hello! I am the RepoLens Assistant. I can use the current analysis summary, scores, architecture, dependencies, and findings for ${repository.full_name}. Ask me what to fix first, how to interpret the score, or where the biggest risks are.`,
    },
  ]);

  const [error, setError] = useState("");

  const askAI = async (event: FormEvent) => {
    event.preventDefault();
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || loading) return;

    const userMessage: Message = {
      role: "user",
      content: trimmedQuestion,
    };

    setMessages((current) => [...current, userMessage]);
    setQuestion("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: trimmedQuestion,
          repository_context: buildRepositoryContext(repository),
          history: messages
            .slice(1)
            .slice(-8)
            .map((message) => ({
              role: message.role,
              content: message.content,
            })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || "AI query failed.");
      }

      const answer = data.answer || data.response || data.message;
      if (!answer) throw new Error("Empty AI response.");

      setMessages((current) => [
        ...current,
        { role: "assistant", content: answer },
      ]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Request failed.");
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: `Chat cleared. Ready for questions on ${repository.full_name}.`,
      },
    ]);
    setError("");
    setQuestion("");
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-zinc-800/80 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-400">
            <Bot className="h-5 w-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold font-mono text-sm text-white">
                RepoLens Assistant
              </h3>
              <span className="rounded bg-purple-500/10 border border-purple-500/20 px-2 py-0.2 font-mono text-[10px] text-purple-400 font-semibold">
                Groq LLM
              </span>
            </div>
            <p className="text-xs font-mono text-zinc-400">
              {repository.full_name}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={clearChat}
          className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 transition hover:bg-zinc-700 hover:text-white"
        >
          Clear Chat
        </button>
      </div>

      <div className="max-h-[550px] min-h-[420px] space-y-4 overflow-y-auto p-6">
        {messages.map((message, index) => {
          const isUser = message.role === "user";

          return (
            <div
              key={`${message.role}-${index}`}
              className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
            >
              {!isUser && (
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-purple-500/20 bg-purple-500/10 text-purple-400">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] text-xs leading-relaxed ${
                  isUser
                    ? "rounded-xl bg-blue-600 px-4 py-3 text-white shadow"
                    : "rounded-xl border border-zinc-800 bg-zinc-950/80 px-4 py-3 text-zinc-200"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>

              {isUser && (
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-400">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3">
            <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-purple-500/20 bg-purple-500/10 text-purple-400">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-xs text-zinc-400">
              <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
              <span>Analyzing code context...</span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mx-6 mb-3 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      <div className="border-t border-zinc-800/80 px-6 py-3 bg-zinc-950/30">
        <p className="mb-2 text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-400">
          SUGGESTED PROMPTS
        </p>

        <div className="flex flex-wrap gap-2">
          <Suggestion text="What should I fix first?" onClick={setQuestion} />
          <Suggestion text="Explain the score breakdown" onClick={setQuestion} />
          <Suggestion text="Prioritize the top security risks" onClick={setQuestion} />
          <Suggestion text="Give me a remediation plan" onClick={setQuestion} />
        </div>
      </div>

      <form onSubmit={askAI} className="border-t border-zinc-800/80 p-4">
        <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 p-2 focus-within:border-purple-500/60">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
            placeholder="Ask a question about this repository..."
            rows={1}
            disabled={loading}
            className="flex-1 resize-none bg-transparent px-2 py-1 text-xs text-white outline-none placeholder:text-zinc-600 disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={loading || question.trim().length === 0}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-600 text-white transition hover:bg-purple-500 disabled:opacity-40"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </form>
    </div>
  );
}

function buildRepositoryContext(repository: Repository) {
  const prioritizedIssues = [...repository.issues]
    .sort((a, b) => {
      const rank = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      return rank[a.severity] - rank[b.severity];
    })
    .slice(0, 15)
    .map((issue) => ({
      severity: issue.severity,
      category: issue.category,
      title: issue.title,
      file: issue.file,
      line: issue.line,
      description: issue.description,
      suggestion: issue.suggestion,
      tool: issue.tool,
    }));

  return {
    repository: {
      name: repository.name,
      full_name: repository.full_name,
      description: repository.description,
      default_branch: repository.default_branch,
      language: repository.language,
      html_url: repository.html_url,
      stars: repository.stars,
      forks: repository.forks,
      open_issues: repository.open_issues,
      private: repository.private,
    },
    scan_summary: {
      files_scanned: repository.files_scanned,
      issues_found: repository.issues_found,
      severity_counts: repository.severity_counts,
      category_counts: repository.category_counts,
    },
    dependencies: repository.dependencies,
    scores: repository.scores ?? null,
    architecture: repository.architecture
      ? {
          directories: repository.architecture.directories.slice(0, 25),
          main_files: repository.architecture.main_files.slice(0, 25),
          file_types: repository.architecture.file_types,
        }
      : null,
    prioritized_issues: prioritizedIssues,
    context_limits: {
      prioritized_issues_included: prioritizedIssues.length,
      total_issues_available: repository.issues.length,
      note: "Only a bounded sample of findings is included in chat context.",
    },
  };
}

function Suggestion({ text, onClick }: { text: string; onClick: (text: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onClick(text)}
      className="rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-400 transition hover:border-zinc-700 hover:text-zinc-200 font-mono"
    >
      {text}
    </button>
  );
}
