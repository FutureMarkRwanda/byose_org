import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "highlight.js/styles/github.css";
import "katex/dist/katex.min.css";

export default function Markdown({ content }) {
    const [plugins, setPlugins] = useState({
        remark: [remarkGfm],
        rehype: []
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Dynamically import heavy plugins
        const loadPlugins = async () => {
            try {
                const [rehypeHighlight, remarkMath, rehypeKatex] = await Promise.all([
                    import("rehype-highlight").then(m => m.default),
                    import("remark-math").then(m => m.default),
                    import("rehype-katex").then(m => m.default)
                ]);

                setPlugins({
                    remark: [remarkGfm, remarkMath],
                    rehype: [rehypeHighlight, rehypeKatex]
                });
            } catch (error) {
                console.error("Failed to load markdown plugins:", error);
                // Fallback to basic plugins
                setPlugins({
                    remark: [remarkGfm],
                    rehype: []
                });
            } finally {
                setIsLoading(false);
            }
        };

        loadPlugins();
    }, []);

    if (isLoading) {
        return (
            <div className="markdown-body md:text-2xl text-xl xl:w-[70%] mx-auto">
                Loading...
            </div>
        );
    }

    return (
        <div className="markdown-body md:text-2xl text-xl xl:w-[70%] mx-auto">
            <ReactMarkdown
                className="flex flex-col"
                remarkPlugins={plugins.remark}
                rehypePlugins={plugins.rehype}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}