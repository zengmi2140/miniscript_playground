'use client';

import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

interface Wallet {
  name: string;
  url: string;
  logoUrl: string;
  initials: string;
  accentBg: string;
  accentText: string;
}

const SOFTWARE_WALLETS: Wallet[] = [
  {
    name: 'Bitcoin Core',
    url: 'https://bitcoincore.org',
    logoUrl: 'https://www.google.com/s2/favicons?domain=bitcoincore.org&sz=128',
    initials: 'BC',
    accentBg: 'bg-btc-500/15',
    accentText: 'text-btc-500',
  },
  {
    name: 'Liana',
    url: 'https://wizardsardine.com/liana/',
    logoUrl: 'https://www.google.com/s2/favicons?domain=wizardsardine.com&sz=128',
    initials: 'Li',
    accentBg: 'bg-emerald-400/15',
    accentText: 'text-emerald-400',
  },
  {
    name: 'Nunchuk',
    url: 'https://nunchuk.io',
    logoUrl: 'https://www.google.com/s2/favicons?domain=nunchuk.io&sz=128',
    initials: 'Nu',
    accentBg: 'bg-violet-400/15',
    accentText: 'text-violet-400',
  },
  {
    name: 'Bitcoin Keeper',
    url: 'https://bitcoinkeeper.app',
    logoUrl: 'https://www.google.com/s2/favicons?domain=bitcoinkeeper.app&sz=128',
    initials: 'BK',
    accentBg: 'bg-yellow-400/15',
    accentText: 'text-yellow-400',
  },
  {
    name: 'MyCitadel',
    url: 'https://mycitadel.io',
    logoUrl: 'https://www.google.com/s2/favicons?domain=mycitadel.io&sz=128',
    initials: 'MC',
    accentBg: 'bg-blue-400/15',
    accentText: 'text-blue-400',
  },
];

const HARDWARE_WALLETS: Wallet[] = [
  {
    name: 'Ledger',
    url: 'https://www.ledger.com',
    logoUrl: 'https://www.google.com/s2/favicons?domain=ledger.com&sz=128',
    initials: 'Le',
    accentBg: 'bg-text-primary/10',
    accentText: 'text-text-primary',
  },
  {
    name: 'Coldcard',
    url: 'https://coldcard.com',
    logoUrl: 'https://www.google.com/s2/favicons?domain=coldcard.com&sz=128',
    initials: 'CC',
    accentBg: 'bg-emerald-400/15',
    accentText: 'text-emerald-400',
  },
  {
    name: 'Jade',
    url: 'https://blockstream.com/jade/',
    logoUrl: 'https://www.google.com/s2/favicons?domain=blockstream.com&sz=128',
    initials: 'Ja',
    accentBg: 'bg-btc-500/15',
    accentText: 'text-btc-500',
  },
  {
    name: 'Specter-DIY',
    url: 'https://github.com/cryptoadvance/specter-diy',
    logoUrl: 'https://www.google.com/s2/favicons?domain=github.com&sz=128',
    initials: 'Sp',
    accentBg: 'bg-violet-400/15',
    accentText: 'text-violet-400',
  },
  {
    name: 'Krux',
    url: 'https://selfcustody.github.io/krux/',
    logoUrl: 'https://www.google.com/s2/favicons?domain=selfcustody.github.io&sz=128',
    initials: 'Kr',
    accentBg: 'bg-yellow-400/15',
    accentText: 'text-yellow-400',
  },
  {
    name: 'BitBox02',
    url: 'https://shiftcrypto.ch/bitbox02/',
    logoUrl: 'https://www.google.com/s2/favicons?domain=shiftcrypto.ch&sz=128',
    initials: 'BB',
    accentBg: 'bg-blue-400/15',
    accentText: 'text-blue-400',
  },
  {
    name: 'TAPSIGNER',
    url: 'https://tapsigner.com',
    logoUrl: 'https://www.google.com/s2/favicons?domain=tapsigner.com&sz=128',
    initials: 'TS',
    accentBg: 'bg-red-400/15',
    accentText: 'text-red-400',
  },
];

function WalletCard({ wallet }: { wallet: Wallet }) {
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <a
      href={wallet.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col items-center gap-3 rounded-xl border border-border-default bg-surface-card p-4 text-center transition-all hover:-translate-y-0.5 hover:border-border-hover hover:shadow-lg hover:shadow-black/20"
    >
      <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl ${wallet.accentBg}`}>
        {!logoFailed ? (
          <img
            src={wallet.logoUrl}
            alt={wallet.name}
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
            onError={() => setLogoFailed(true)}
          />
        ) : (
          <span className={`text-sm font-bold ${wallet.accentText}`}>
            {wallet.initials}
          </span>
        )}
      </div>

      <div className="flex-1">
        <p className="text-xs font-medium leading-snug text-text-primary">
          {wallet.name}
        </p>
      </div>

      <ExternalLink className="h-3 w-3 text-text-muted opacity-0 transition-opacity group-hover:opacity-100" />
    </a>
  );
}

function WalletGroup({ labelKey, wallets }: { labelKey: string; wallets: Wallet[] }) {
  const { t } = useI18n();

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <span className="text-xs font-medium text-text-muted">
          {t(labelKey)}
        </span>
        <div className="h-px flex-1 bg-border-subtle" />
      </div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
        {wallets.map((wallet) => (
          <WalletCard key={wallet.name} wallet={wallet} />
        ))}
      </div>
    </div>
  );
}

export function HomepageWallets() {
  const { t } = useI18n();

  return (
    <section className="border-b border-border-subtle bg-surface-base py-14 md:py-20">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-10 text-center md:mb-14">
          <span className="mb-3 inline-block rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-400">
            {t('home.wallets.label')}
          </span>
          <h2 className="mb-3 text-2xl font-bold text-text-primary md:text-3xl">
            {t('home.wallets.title')}
          </h2>
          <p className="mx-auto max-w-xl text-sm text-text-secondary md:text-base">
            {t('home.wallets.subtitle')}
          </p>
        </div>

        <div className="flex flex-col gap-10">
          <WalletGroup labelKey="home.wallets.software" wallets={SOFTWARE_WALLETS} />
          <WalletGroup labelKey="home.wallets.hardware" wallets={HARDWARE_WALLETS} />
        </div>
      </div>
    </section>
  );
}
