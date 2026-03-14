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
    expect(screen.getByText(/单人控制/i)).toBeInTheDocument();
    expect(screen.getByText(/多人共管/i)).toBeInTheDocument();
    expect(screen.getByText(/带恢复路径/i)).toBeInTheDocument();
  });

  it('calls onSelect with correct starter id when clicked', () => {
    const onSelect = vi.fn();
    renderWithI18n(<BuilderStarterCards onSelect={onSelect} />);

    fireEvent.click(screen.getByText(/单人控制/i));
    expect(onSelect).toHaveBeenCalledWith('single-control');

    fireEvent.click(screen.getByText(/多人共管/i));
    expect(onSelect).toHaveBeenCalledWith('shared-control');

    fireEvent.click(screen.getByText(/带恢复路径/i));
    expect(onSelect).toHaveBeenCalledWith('recovery');
  });

  it('starter cards are keyboard accessible', () => {
    const onSelect = vi.fn();
    renderWithI18n(<BuilderStarterCards onSelect={onSelect} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);

    buttons[0].focus();
    expect(document.activeElement).toBe(buttons[0]);
  });
});
