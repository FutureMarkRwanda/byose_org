// eslint-disable-next-line no-unused-vars
import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "highlight.js/styles/github.css"; // Light mode version
import "katex/dist/katex.min.css"; // Import KaTeX CSS
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

// eslint-disable-next-line react/prop-types
export default function Markdown({content}) {
    return (
        <div className="markdown-body md:text-2xl text-xl xl:w-[70%] mx-auto">
            <ReactMarkdown
                class="flex flex-col"
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[
                    [rehypeSanitize], // ✅ Safe fallback for old iOS
                    rehypeHighlight,
                    rehypeKatex,
                ]}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}