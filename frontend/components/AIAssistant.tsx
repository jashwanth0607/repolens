"use client";

import { FormEvent, useState } from "react";
import {
  Bot,
  Send,
  Sparkles,
  User,
  Loader2,
  AlertCircle,
} from "lucide-react";

import type { Repository } from "../lib/types";

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
      content:
        `Hi! I’m RepoLens AI. I can help you understand the analysis of ${repository.full_name}. Ask me about its issues, security findings, code quality, dependencies, or possible fixes.`,
    },
  ]);

  const [error, setError] = useState("");

  const askAI = async (event: FormEvent) => {
    event.preventDefault();

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || loading) {
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: trimmedQuestion,
    };

    setMessages((current) => [
      ...current,
      userMessage,
    ]);

    setQuestion("");
    setError("");
    setLoading(true);

    try {
      const repositoryContext = `
Repository:
${repository.full_name}

Description:
${repository.description || "No description available"}

Primary language:
${repository.language || "Unknown"}

Default branch:
${repository.default_branch}

Files scanned:
${repository.files_scanned}

Total issues:
${repository.issues_found}

High severity issues:
${repository.severity_counts.HIGH}

Medium severity issues:
${repository.severity_counts.MEDIUM}

Low severity issues:
${repository.severity_counts.LOW}

Python dependencies:
${repository.dependencies.python}

JavaScript dependencies:
${repository.dependencies.javascript}

Total dependencies:
${repository.dependencies.total}

Category counts:
${JSON.stringify(repository.category_counts)}
`;

      const response = await fetch(
        "http://127.0.0.1:8000/api/ai/explain",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            issue: {
              severity: "LOW",
              category: "Repository Assistant",
              title: "Repository Question",
              file: repository.name,
              line: 1,
              description: `
The user is asking a general question about this analyzed repository.

${repositoryContext}

User question:
${trimmedQuestion}
`,
              suggestion:
                "Answer the user's question using the repository information provided above. Do not invent repository details.",
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.message ||
            "AI request failed."
        );
      }

      const answer =
        data.answer ||
        data.response ||
        data.message;

      if (!answer) {
        throw new Error(
          "The AI returned an empty response."
        );
      }

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: answer,
        },
      ]);
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Something went wrong.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content:
          `Chat cleared. Ask me anything about ${repository.full_name}.`,
      },
    ]);

    setError("");
    setQuestion("");
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10">
            <Bot className="h-6 w-6 text-purple-400" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white">
                RepoLens AI
              </h3>

              <span className="inline-flex items-center gap-1 rounded-full border border-purple-500/20 bg-purple-500/5 px-2 py-1 text-[10px] text-purple-400">
                <Sparkles className="h-3 w-3" />
                AI
              </span>
            </div>

            <p className="text-xs text-slate-500">
              {repository.full_name}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={clearChat}
          className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-400 transition hover:border-slate-600 hover:text-white"
        >
          Clear Chat
        </button>
      </div>

      {/* Chat */}
      <div className="max-h-[580px] min-h-[440px] space-y-6 overflow-y-auto p-6">
        {messages.map((message, index) => {
          const isUser =
            message.role === "user";

          return (
            <div
              key={`${message.role}-${index}`}
              className={`flex gap-3 ${
                isUser
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              {!isUser && (
                <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/10">
                  <Bot className="h-4 w-4 text-purple-400" />
                </div>
              )}

              <div
                className={`max-w-[85%] ${
                  isUser
                    ? "rounded-2xl rounded-tr-md bg-blue-500 px-4 py-3 text-white"
                    : "rounded-2xl rounded-tl-md border border-slate-800 bg-[#0a1020] px-5 py-5 text-slate-300"
                }`}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap text-sm leading-6">
                    {message.content}
                  </p>
                ) : (
                  <AIFormattedResponse
                    content={message.content}
                  />
                )}
              </div>

              {isUser && (
                <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
                  <User className="h-4 w-4 text-blue-400" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3">
            <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/10">
              <Bot className="h-4 w-4 text-purple-400" />
            </div>

            <div className="flex items-center gap-2 rounded-2xl rounded-tl-md border border-slate-800 bg-[#0a1020] px-5 py-4 text-sm text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
              RepoLens AI is thinking...
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mx-6 mb-4 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />

          <span>{error}</span>
        </div>
      )}

      {/* Suggestions */}
      <div className="border-t border-slate-800 px-6 py-4">
        <p className="mb-3 text-xs uppercase tracking-wider text-slate-500">
          Suggested questions
        </p>

        <div className="flex flex-wrap gap-2">
          <Suggestion
            text="What are the most important issues?"
            onClick={setQuestion}
          />

          <Suggestion
            text="Explain the security findings"
            onClick={setQuestion}
          />

          <Suggestion
            text="How can I improve code quality?"
            onClick={setQuestion}
          />

          <Suggestion
            text="What dependencies does this project use?"
            onClick={setQuestion}
          />
        </div>
      </div>

      {/* Input */}
      <form
        onSubmit={askAI}
        className="border-t border-slate-800 p-4"
      >
        <div className="flex items-end gap-3 rounded-xl border border-slate-700 bg-slate-950 p-2 transition focus-within:border-purple-500/50">
          <textarea
            value={question}
            onChange={(event) =>
              setQuestion(event.target.value)
            }
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey
              ) {
                event.preventDefault();

                event.currentTarget.form?.requestSubmit();
              }
            }}
            placeholder="Ask RepoLens AI about this repository..."
            rows={2}
            disabled={loading}
            className="min-h-[50px] flex-1 resize-none bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={
              loading ||
              question.trim().length === 0
            }
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500 text-white transition hover:bg-purple-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>

        <p className="mt-2 text-[11px] text-slate-600">
          Press Enter to send • Shift + Enter for a new line
        </p>
      </form>
    </div>
  );
}

/* -------------------------------------------------------
   AI RESPONSE FORMATTER
------------------------------------------------------- */

function AIFormattedResponse({
  content,
}: {
  content: string;
}) {
  const lines = content
    .replace(/\r\n/g, "\n")
    .split("\n");

  const elements: React.ReactNode[] = [];

  let paragraphLines: string[] = [];
  let listItems: string[] = [];
  let numberedItems: {
    number: string;
    text: string;
  }[] = [];

  const flushParagraph = () => {
    if (paragraphLines.length === 0) {
      return;
    }

    const text = paragraphLines.join(" ").trim();

    if (text) {
      elements.push(
        <p
          key={`paragraph-${elements.length}`}
          className="text-sm leading-7 text-slate-300"
        >
          {formatInlineText(text)}
        </p>
      );
    }

    paragraphLines = [];
  };

  const flushLists = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul
          key={`list-${elements.length}`}
          className="space-y-2.5 pl-5"
        >
          {listItems.map((item, index) => (
            <li
              key={index}
              className="relative text-sm leading-6 text-slate-300"
            >
              <span className="absolute -left-4 top-3 h-1.5 w-1.5 rounded-full bg-purple-400" />

              {formatInlineText(item)}
            </li>
          ))}
        </ul>
      );

      listItems = [];
    }

    if (numberedItems.length > 0) {
      elements.push(
        <ol
          key={`numbered-${elements.length}`}
          className="space-y-3 pl-2"
        >
          {numberedItems.map((item, index) => (
            <li
              key={index}
              className="flex gap-3 text-sm leading-6 text-slate-300"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-xs font-semibold text-purple-400">
                {item.number}
              </span>

              <span className="pt-0.5">
                {formatInlineText(item.text)}
              </span>
            </li>
          ))}
        </ol>
      );

      numberedItems = [];
    }
  };

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushLists();
      return;
    }

    /* Heading: ## What was detected */
    if (/^#{1,4}\s+/.test(line)) {
      flushParagraph();
      flushLists();

      const heading = line
        .replace(/^#{1,4}\s+/, "")
        .replace(/\*\*/g, "");

      elements.push(
        <div
          key={`heading-${index}`}
          className="border-b border-slate-800 pb-2 pt-2"
        >
          <h4 className="text-base font-semibold text-white">
            {heading}
          </h4>
        </div>
      );

      return;
    }

    /* Heading written as **What was detected** */
    if (
      /^\*\*[^*]+\*\*$/.test(line)
    ) {
      flushParagraph();
      flushLists();

      const heading = line.replace(
        /^\*\*|\*\*$/g,
        ""
      );

      elements.push(
        <div
          key={`bold-heading-${index}`}
          className="border-b border-slate-800 pb-2 pt-2"
        >
          <h4 className="text-base font-semibold text-white">
            {heading}
          </h4>
        </div>
      );

      return;
    }

    /* Numbered list */
    const numberedMatch =
      line.match(/^(\d+)\.\s+(.*)$/);

    if (numberedMatch) {
      flushParagraph();

      numberedItems.push({
        number: numberedMatch[1],
        text: numberedMatch[2],
      });

      return;
    }

    /* Bullet list */
    const bulletMatch =
      line.match(/^[-*•]\s+(.*)$/);

    if (bulletMatch) {
      flushParagraph();

      listItems.push(bulletMatch[1]);

      return;
    }

    /* Normal paragraph */
    flushLists();

    paragraphLines.push(line);

    /* Last line */
    if (index === lines.length - 1) {
      flushParagraph();
    }
  });

  flushParagraph();
  flushLists();

  return (
    <div className="space-y-4">
      {elements}
    </div>
  );
}

/* -------------------------------------------------------
   INLINE MARKDOWN
------------------------------------------------------- */

function formatInlineText(
  text: string
): React.ReactNode {
  const parts = text.split(
    /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g
  );

  return parts.map((part, index) => {
    if (
      part.startsWith("**") &&
      part.endsWith("**")
    ) {
      return (
        <strong
          key={index}
          className="font-semibold text-white"
        >
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (
      part.startsWith("`") &&
      part.endsWith("`")
    ) {
      return (
        <code
          key={index}
          className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-purple-300"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    if (
      part.startsWith("*") &&
      part.endsWith("*")
    ) {
      return (
        <em
          key={index}
          className="text-slate-200"
        >
          {part.slice(1, -1)}
        </em>
      );
    }

    return (
      <span key={index}>
        {part}
      </span>
    );
  });
}

/* -------------------------------------------------------
   SUGGESTION BUTTON
------------------------------------------------------- */

function Suggestion({
  text,
  onClick,
}: {
  text: string;
  onClick: (text: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(text)}
      className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-400 transition hover:border-purple-500/30 hover:bg-purple-500/5 hover:text-purple-300"
    >
      {text}
    </button>
  );
}