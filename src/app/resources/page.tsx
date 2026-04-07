'use client';

import { useState } from 'react';
import { ChevronDown, BookOpen, ExternalLink, HelpCircle, Link2 } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils/cn';

const FAQ_SECTIONS = [
  {
    title: 'resources.faq.section.start',
    items: [
      { q: 'resources.faq.q1', a: 'resources.faq.a1' },
      { q: 'resources.faq.q2', a: 'resources.faq.a2' },
      { q: 'resources.faq.q9', a: 'resources.faq.a9' },
      { q: 'resources.faq.q5', a: 'resources.faq.a5' },
    ],
  },
  {
    title: 'resources.faq.section.language',
    items: [
      { q: 'resources.faq.q3', a: 'resources.faq.a3' },
      { q: 'resources.faq.q4', a: 'resources.faq.a4' },
      { q: 'resources.faq.q11', a: 'resources.faq.a11' },
      { q: 'resources.faq.q12', a: 'resources.faq.a12' },
    ],
  },
  {
    title: 'resources.faq.section.practice',
    items: [
      { q: 'resources.faq.q13', a: 'resources.faq.a13' },
      { q: 'resources.faq.q8', a: 'resources.faq.a8' },
      { q: 'resources.faq.q6', a: 'resources.faq.a6' },
      { q: 'resources.faq.q10', a: 'resources.faq.a10' },
    ],
  },
  {
    title: 'resources.faq.section.safety',
    items: [
      { q: 'resources.faq.q7', a: 'resources.faq.a7' },
      { q: 'resources.faq.q14', a: 'resources.faq.a14' },
      { q: 'resources.faq.q15', a: 'resources.faq.a15' },
      { q: 'resources.faq.q16', a: 'resources.faq.a16' },
      { q: 'resources.faq.q17', a: 'resources.faq.a17' },
      { q: 'resources.faq.q18', a: 'resources.faq.a18' },
    ],
  },
] as const;

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  // Render rich text: backticks, bold, lists, and paragraphs
  const renderAnswer = (text: string) => {
    // Split by double newlines for paragraphs
    const paragraphs = text.split('\n\n');

    return paragraphs.map((para, paraIdx) => {
      // Check if paragraph is a list
      const isListPara = para.trim().split('\n').every((line) => line.trim().startsWith('-'));

      if (isListPara) {
        const items = para.trim().split('\n');
        return (
          <ul key={paraIdx} className="my-3 space-y-2">
            {items.map((item, i) => {
              const content = item.trim().substring(1).trim(); // Remove leading dash
              return (
                <li key={i} className="ml-1 flex items-start gap-2.5">
                  <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-btc-500"></span>
                  <span className="flex-1 text-[14px] leading-relaxed text-text-secondary">
                    {renderInlineContent(content)}
                  </span>
                </li>
              );
            })}
          </ul>
        );
      }

      // Regular paragraph
      return (
        <p key={paraIdx} className="my-3 text-[14px] leading-relaxed text-text-secondary">
          {renderInlineContent(para.trim())}
        </p>
      );
    });
  };

  // Helper to render inline elements: **bold**, `code`
  const renderInlineContent = (text: string) => {
    // Pattern: backticks or bold
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        // Bold
        return (
          <strong key={i} className="font-semibold text-text-primary">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        // Code
        return (
          <code
            key={i}
            className="rounded bg-surface-elevated px-1.5 py-0.5 font-mono text-[12px] text-btc-500"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div className="border-b border-border-subtle last:border-b-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-surface-elevated"
        aria-expanded={open}
      >
        <span className="text-[14px] font-medium leading-relaxed text-text-primary">
          {question}
        </span>
        <ChevronDown
          className={cn(
            'mt-0.5 h-4 w-4 flex-shrink-0 text-text-muted transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>
      {open && <div className="px-6 pb-5">{renderAnswer(answer)}</div>}
    </div>
  );
}

export default function ResourcesPage() {
  const { t } = useI18n();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 md:py-16">
      {/* Page header */}
      <div className="mb-12 text-center">
        <h1 className="mb-3 text-balance text-2xl font-bold text-text-primary md:text-3xl">
          {t('resources.title')}
        </h1>
        <p className="mx-auto max-w-xl text-pretty text-sm leading-relaxed text-text-secondary md:text-base">
          {t('resources.subtitle')}
        </p>
      </div>

      {/* FAQ Section */}
      <section className="mb-14">
        <div className="mb-6">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-btc-500/20 bg-btc-500/10 px-3 py-1 text-xs font-medium text-btc-500">
            <HelpCircle className="h-3 w-3" />
            {t('resources.faq.label')}
          </span>
          <h2 className="mb-2 text-xl font-semibold text-text-primary">
            {t('resources.faq.title')}
          </h2>
          <p className="text-sm leading-relaxed text-text-secondary">
            {t('resources.faq.subtitle')}
          </p>
        </div>

        <div className="space-y-4">
          {FAQ_SECTIONS.map((section) => (
            <div key={section.title} className="overflow-hidden rounded-2xl border border-border-subtle bg-surface-base">
              <div className="border-b border-border-subtle px-6 py-4">
                <h3 className="text-sm font-semibold text-text-primary">{t(section.title)}</h3>
              </div>
              <div>
                {section.items.map(({ q, a }) => (
                  <FaqItem key={q} question={t(q)} answer={t(a)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Resources Section */}
      <section>
        <div className="mb-6">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-btc-500/20 bg-btc-500/10 px-3 py-1 text-xs font-medium text-btc-500">
            <Link2 className="h-3 w-3" />
            {t('resources.links.label')}
          </span>
          <h2 className="mb-2 text-xl font-semibold text-text-primary">
            {t('resources.links.title')}
          </h2>
          <p className="text-sm leading-relaxed text-text-secondary">
            {t('resources.links.subtitle')}
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border-subtle bg-surface-base">
          {/* Placeholder state */}
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-elevated">
              <BookOpen className="h-6 w-6 text-text-muted" />
            </div>
            <p className="text-sm text-text-muted">{t('resources.links.placeholder')}</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-16 border-t border-border-subtle pt-8 text-center">
        <p className="text-xs text-text-muted">{t('footer.description')}</p>
        <p className="mt-1 text-xs text-text-muted">{t('footer.rights')}</p>
      </footer>
    </div>
  );
}
