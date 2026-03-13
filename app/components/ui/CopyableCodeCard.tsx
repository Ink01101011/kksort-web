import type { ReactNode } from "react";
import { useState } from "react";

type CopyableCodeCardProps = {
  title: string;
  code: string;
  titleAs?: "h2" | "h3";
  copyAriaLabel?: string;
  cardClassName?: string;
  titleClassName?: string;
  codeScrollClassName?: string;
  codeBlockClassName?: string;
  footer?: ReactNode;
};

function mergeClassNames(...classNames: Array<string | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}

export default function CopyableCodeCard({
  title,
  code,
  titleAs = "h3",
  copyAriaLabel,
  cardClassName,
  titleClassName,
  codeScrollClassName,
  codeBlockClassName,
  footer,
}: CopyableCodeCardProps) {
  const [copied, setCopied] = useState(false);
  const TitleTag = titleAs;

  async function handleCopy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  return (
    <article className={mergeClassNames("home-card p-5", cardClassName)}>
      <div className="section-head">
        <TitleTag className={mergeClassNames("text-sm font-semibold tracking-wide uppercase", titleClassName)}>
          {title}
        </TitleTag>
        <button
          type="button"
          className={`copy-code-btn ${copied ? "copied" : ""}`}
          onClick={handleCopy}
          aria-label={copyAriaLabel ?? `Copy ${title}`}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div className={mergeClassNames("mt-3", codeScrollClassName)}>
        <pre className={mergeClassNames("terminal-block", codeBlockClassName)}>
          <code>{code}</code>
        </pre>
      </div>

      {footer}
    </article>
  );
}
