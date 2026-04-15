import type { SpendingPath, PathLabelVariant } from './types';
import type { I18nKey } from '@/lib/i18n/context';

type Translate = (key: I18nKey, params?: Record<string, string | number>) => string;

function labelVariantDescription(v: PathLabelVariant, t: Translate): string {
  switch (v.kind) {
    case 'signatures':
      return t('playground.paths.labelDesc.signatures', { names: v.names.join(' + ') });
    case 'timelock_recovery':
      return t('playground.paths.labelDesc.timelockRecovery');
    case 'timelock_only':
      return t('playground.paths.labelDesc.timelockOnly');
    case 'hashlock':
      return t('playground.paths.labelDesc.hashlock');
    case 'generic':
      return t('playground.paths.labelDesc.generic');
  }
}

/** Locale-aware path card / status banner title. */
export function formatSpendingPathLabel(path: SpendingPath, t: Translate): string {
  const description = labelVariantDescription(path.labelVariant, t);
  return t('playground.paths.labelLine', { index: path.index, description });
}
