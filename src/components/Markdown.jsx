import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "highlight.js/styles/github.css";
import "katex/dist/katex.min.css";
import remarkGfm from "remark-gfm";

export default function Markdown({ content }) {
    const needsLightweightMode = useMemo(() => {
        if (typeof window === 'undefined') return false;

        // Check for TV browsers
        const isTVBrowser = /TV|SmartTV|AppleTV|GoogleTV|WebOS|Tizen|NetCast/i.test(navigator.userAgent);
        if (isTVBrowser) return true;

        // Check for iOS 15 and below
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        if (isIOS) {
            const match = navigator.userAgent.match(/OS (\d+)_/);
            if (match) {
                const iOSVersion = parseInt(match[1], 10);
                return iOSVersion <= 16; // iOS 15 and below need lightweight mode
            }
        }

        return false;
    }, []);

    if (!content) {
        return null;
    }

    return (
        <div className="markdown-body md:text-2xl text-xl xl:w-[70%] mx-auto">
            <ReactMarkdown
                class="flex flex-col"
                remarkPlugins={needsLightweightMode ? [remarkGfm] : [remarkGfm, remarkMath]}
                rehypePlugins={needsLightweightMode ? [] : [rehypeHighlight, rehypeKatex]}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}