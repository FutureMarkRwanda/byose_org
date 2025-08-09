// eslint-disable-next-line no-unused-vars
import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
// import "highlight.js/styles/github-dark.css";
import "highlight.js/styles/github.css"; // Light mode version
import "katex/dist/katex.min.css"; // Import KaTeX CSS
import remarkGfm from "remark-gfm";

// eslint-disable-next-line react/prop-types
export default function Markdown({ content }) {
    return (
        <div className="markdown-body md:text-2xl text-xl">
            <ReactMarkdown
                // className="flex flex-col gap-3"
                remarkPlugins={[remarkGfm, remarkMath]} // Add remarkMath
                rehypePlugins={[rehypeHighlight, rehypeKatex]} // Add rehypeKatex
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}