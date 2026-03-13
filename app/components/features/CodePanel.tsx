import CopyableCodeCard from "@/components/ui/CopyableCodeCard";

type CodePanelProps = {
  title: string;
  code: string;
};

export default function CodePanel({ title, code }: CodePanelProps) {
  return (
    <CopyableCodeCard
      title={title}
      code={code}
      copyAriaLabel={`Copy ${title} code`}
      cardClassName="kksort-code-panel p-4 sm:p-5"
      titleClassName="kksort-code-title text-xs sm:text-sm"
      codeScrollClassName="kksort-code-scroll -mx-1 overflow-x-auto px-1 sm:mx-0 sm:px-0"
      codeBlockClassName="kksort-code-block mt-0"
    />
  );
}
