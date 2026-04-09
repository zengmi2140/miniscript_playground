/**
 * 推荐阅读：标题在 zh.ts / en.ts；中文站与原文链接分栏维护。
 */
export type RecommendedReadingArticle = {
  hrefZh: string;
  hrefEn: string;
  titleKey: string;
  sourceKey: string;
};

export const RECOMMENDED_READING_ARTICLES: RecommendedReadingArticle[] = [
  {
    hrefZh: 'https://www.btcstudy.org/2022/06/26/hidden-power-of-bitcoin/',
    hrefEn: 'https://bitcoindevkit.org/blog/hidden-power-of-bitcoin/',
    titleKey: 'resources.reading.articles.bdkHidden.title',
    sourceKey: 'resources.reading.articles.bdkHidden.source',
  },
  {
    hrefZh: 'https://www.btcstudy.org/2025/09/03/miniscript-101-a-technical-guide-by-nunchuk/',
    hrefEn: 'https://nunchuk.io/blog/miniscript101',
    titleKey: 'resources.reading.articles.nunchuk101.title',
    sourceKey: 'resources.reading.articles.nunchuk101.source',
  },
  {
    hrefZh: 'https://www.btcstudy.org/2023/03/16/understanding-bitcoin-miniscript-part-1/',
    hrefEn: 'https://blog.bitbox.swiss/en/understanding-bitcoin-miniscript-part-1/',
    titleKey: 'resources.reading.articles.bitboxP1.title',
    sourceKey: 'resources.reading.articles.bitboxP1.source',
  },
  {
    hrefZh: 'https://www.btcstudy.org/2023/03/22/understanding-bitcoin-miniscript-part-2/',
    hrefEn: 'https://blog.bitbox.swiss/en/understanding-bitcoin-miniscript-part-2/',
    titleKey: 'resources.reading.articles.bitboxP2.title',
    sourceKey: 'resources.reading.articles.bitboxP2.source',
  },
  {
    hrefZh:
      'https://www.btcstudy.org/2022/11/16/miniscript-composable-analyzable-and-smarter-bitcoin-script/',
    hrefEn:
      'https://btctranscripts.com/advancing-bitcoin/2022/2022-03-03-sanket-kanjalkar-miniscript',
    titleKey: 'resources.reading.articles.advancingBm.title',
    sourceKey: 'resources.reading.articles.advancingBm.source',
  },
];
