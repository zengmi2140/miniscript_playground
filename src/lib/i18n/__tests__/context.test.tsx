import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { I18nProvider, useI18n, type I18nKey } from '../context';

function TranslationProbe() {
  const { t } = useI18n();

  return (
    <div>
      {t('{name} / {name}' as I18nKey, { name: 'Alice' })}
    </div>
  );
}

describe('I18nProvider', () => {
  it('replaces every occurrence of the same interpolation token', () => {
    render(
      <I18nProvider>
        <TranslationProbe />
      </I18nProvider>,
    );

    expect(screen.getByText('Alice / Alice')).toBeInTheDocument();
  });
});
