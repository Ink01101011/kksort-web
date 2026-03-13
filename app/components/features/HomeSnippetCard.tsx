import CopyableCodeCard from "@/components/ui/CopyableCodeCard";

type HomeSnippetCardProps = {
  title: string;
  code: string;
  copyAriaLabel: string;
  description?: string;
};

export default function HomeSnippetCard({
  title,
  code,
  copyAriaLabel,
  description,
}: HomeSnippetCardProps) {
  return (
    <CopyableCodeCard
      title={title}
      titleAs="h2"
      code={code}
      copyAriaLabel={copyAriaLabel}
      cardClassName="home-snippet-card p-4 sm:p-5"
      titleClassName="text-lg font-semibold normal-case tracking-normal sm:text-xl"
      footer={
        description ? (
          <p className="mt-3 text-sm leading-relaxed">{description}</p>
        ) : undefined
      }
    />
  );
}
