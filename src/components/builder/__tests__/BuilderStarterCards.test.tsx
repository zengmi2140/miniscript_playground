import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BuilderStarterCards } from '@/components/builder/BuilderStarterCards';
import { I18nProvider } from '@/lib/i18n/context';

function renderWithI18n(ui: React.ReactElement) {
  return render(<I18nProvider>{ui}</I18nProvider>);
}

describe('BuilderStarterCards', () => {
  it('renders the three MVP starter skeletons', () => {
    renderWithI18n(<BuilderStarterCards onSelect={() => {}} />);
    expect(screen.getByTestId('builder-starter-single-control')).toBeInTheDocument();
    expect(screen.getByTestId('builder-starter-shared-control')).toBeInTheDocument();
    expect(screen.getByTestId('builder-starter-recovery')).toBeInTheDocument();
  });

  it('calls onSelect with correct starter id when clicked', () => {
    const onSelect = vi.fn();
    renderWithI18n(<BuilderStarterCards onSelect={onSelect} />);

    const clickStarter = (id: string) => {
      const nodes = screen.getAllByTestId(`builder-starter-${id}`);
      fireEvent.click(nodes[nodes.length - 1]!);
    };

    clickStarter('single-control');
    expect(onSelect).toHaveBeenCalledWith('single-control');

    clickStarter('shared-control');
    expect(onSelect).toHaveBeenCalledWith('shared-control');

    clickStarter('recovery');
    expect(onSelect).toHaveBeenCalledWith('recovery');
  });

  it('starter cards are keyboard accessible', () => {
    const onSelect = vi.fn();
    renderWithI18n(<BuilderStarterCards onSelect={onSelect} />);

    const nodes = screen.getAllByTestId('builder-starter-single-control');
    const single = nodes[nodes.length - 1]!;
    single.focus();
    expect(document.activeElement).toBe(single);
  });
});
