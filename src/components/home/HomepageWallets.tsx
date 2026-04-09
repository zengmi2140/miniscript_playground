'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n/context';

interface Wallet {
  name: string;
  url: string;
  logoUrl: string;
  initials: string;
}

const SOFTWARE_WALLETS: Wallet[] = [
  { name: 'Bitcoin Core', url: 'https://bitcoincore.org', logoUrl: 'https://www.google.com/s2/favicons?domain=bitcoincore.org&sz=128', initials: 'BC' },
  { name: 'Liana', url: 'https://wizardsardine.com/liana/', logoUrl: 'https://www.google.com/s2/favicons?domain=wizardsardine.com&sz=128', initials: 'Li' },
  { name: 'Nunchuk', url: 'https://nunchuk.io', logoUrl: 'https://www.google.com/s2/favicons?domain=nunchuk.io&sz=128', initials: 'Nu' },
  { name: 'Bitcoin Keeper', url: 'https://bitcoinkeeper.app', logoUrl: 'https://www.google.com/s2/favicons?domain=bitcoinkeeper.app&sz=128', initials: 'BK' },
  { name: 'MyCitadel', url: 'https://mycitadel.io', logoUrl: 'https://www.google.com/s2/favicons?domain=mycitadel.io&sz=128', initials: 'MC' },
];

const HARDWARE_WALLETS: Wallet[] = [
  { name: 'Ledger', url: 'https://www.ledger.com', logoUrl: 'https://www.google.com/s2/favicons?domain=ledger.com&sz=128', initials: 'Le' },
  { name: 'Coldcard', url: 'https://coldcard.com', logoUrl: 'https://www.google.com/s2/favicons?domain=coldcard.com&sz=128', initials: 'CC' },
  { name: 'Jade', url: 'https://blockstream.com/jade/', logoUrl: 'https://www.google.com/s2/favicons?domain=blockstream.com&sz=128', initials: 'Ja' },
  { name: 'Specter-DIY', url: 'https://github.com/cryptoadvance/specter-diy', logoUrl: 'https://www.google.com/s2/favicons?domain=github.com&sz=128', initials: 'Sp' },
  { name: 'Krux', url: 'https://selfcustody.github.io/krux/', logoUrl: 'https://www.google.com/s2/favicons?domain=selfcustody.github.io&sz=128', initials: 'Kr' },
  { name: 'BitBox02', url: 'https://shiftcrypto.ch/bitbox02/', logoUrl: 'https://www.google.com/s2/favicons?domain=shiftcrypto.ch&sz=128', initials: 'BB' },
  { name: 'TAPSIGNER', url: 'https://tapsigner.com', logoUrl: 'https://www.google.com/s2/favicons?domain=tapsigner.com&sz=128', initials: 'TS' },
];

function WalletPill({ wallet }: { wallet: Wallet }) {
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <a
      href={wallet.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex shrink-0 items-center gap-2.5 rounded-full border border-border-subtle bg-surface-elevated px-4 py-2 text-sm text-text-secondary transition-all duration-200 hover:border-btc-500/50 hover:bg-btc-500/10 hover:text-text-primary"
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full">
        {!logoFailed ? (
          <img
            src={wallet.logoUrl}
            alt={wallet.name}
            width={20}
            height={20}
            className="h-5 w-5 object-contain opacity-60 transition-opacity duration-200 group-hover:opacity-100"
            onError={() => setLogoFailed(true)}
          />
        ) : (
          <span className="text-[9px] font-bold text-text-muted">{wallet.initials}</span>
        )}
      </span>
      <span className="whitespace-nowrap font-medium">{wallet.name}</span>
    </a>
  );
}

function MarqueeRow({ wallets, reverse = false, label }: { wallets: Wallet[]; reverse?: boolean; label: string }) {
  const doubled = [...wallets, ...wallets, ...wallets, ...wallets];

  return (
    <div className="flex items-center gap-5">
      <span className="w-24 shrink-0 text-right text-xs font-medium text-text-muted">{label}</span>

      <div
        className="marquee-track relative min-w-0 flex-1 overflow-hidden"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
        }}
      >
        <div className={`flex gap-3 ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'}`} style={{ width: 'max-content' }}>
          {doubled.map((wallet, i) => (
            <WalletPill key={`${wallet.name}-${i}`} wallet={wallet} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function HomepageWallets() {
  const { t } = useI18n();

  return (
    <section className="border-b border-border-subtle bg-surface-base py-14 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-10 text-center md:mb-12">
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

        <div className="flex flex-col gap-4">
          <MarqueeRow wallets={SOFTWARE_WALLETS} label={t('home.wallets.software')} />
          <MarqueeRow wallets={HARDWARE_WALLETS} reverse label={t('home.wallets.hardware')} />
        </div>
      </div>
    </section>
  );
}
