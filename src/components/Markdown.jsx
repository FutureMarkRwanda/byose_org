import MarkdownIt from "markdown-it";
import mk from "markdown-it-katex";
import hljs from "markdown-it-highlightjs";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github.css";

export default function Markdown({ content }) {
  const md = new MarkdownIt({ html: true, linkify: true, breaks: true })
    .use(mk)
    .use(hljs);

  const html = md.render(content || "");

  return (
    <div
      className="markdown-body md:text-2xl text-xl xl:w-[70%] mx-auto"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
