'use client';

import { GLOSSARY } from '@/lib/glossary/data';
import { useI18n } from '@/lib/i18n/context';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface GlossaryTooltipProps {
  glossaryKey: string;
  children: React.ReactNode;
  nodeValue?: string;
}

export function GlossaryTooltip({ glossaryKey, children, nodeValue }: GlossaryTooltipProps) {
  const { locale } = useI18n();
  const entry = GLOSSARY[glossaryKey];

  if (!entry) return <>{children}</>;

  const title = locale === 'zh' ? entry.zh : entry.en;
  const explanation = locale === 'zh' ? entry.explain_zh : entry.explain_en;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent
        side="top"
        align="center"
        className="max-w-[220px] rounded-[12px] border-[#44403C] bg-[#1C1917] px-3 py-2.5"
      >
        <p className="mb-1 text-[12px] font-semibold text-[#FAFAF9]">
          {nodeValue ? `${title}: ${nodeValue}` : title}
        </p>
        <p className="text-[11px] leading-relaxed text-[#A8A29E]">{explanation}</p>
      </TooltipContent>
    </Tooltip>
  );
}
