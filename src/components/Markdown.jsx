// eslint-disable-next-line no-unused-vars
import React from "react";
import ReactMarkdown from "react-markdown";
import "highlight.js/styles/github.css"; // Light mode version
import "katex/dist/katex.min.css"; // Import KaTeX CSS


// eslint-disable-next-line react/prop-types
export default function Markdown({content}) {
    return (
        <div className="markdown-body md:text-2xl text-xl xl:w-[70%] mx-auto">
            <ReactMarkdown
                class="flex flex-col"
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}