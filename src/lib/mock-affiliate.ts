import { RakutenProduct } from './rakuten';

export class MockAffiliateService {
  private static instance: MockAffiliateService;

  static getInstance(): MockAffiliateService {
    if (!MockAffiliateService.instance) {
      MockAffiliateService.instance = new MockAffiliateService();
    }
    return MockAffiliateService.instance;
  }

  async getMockRakutenProducts(keyword: string): Promise<RakutenProduct[]> {
    console.log(`🔍 Mock Rakuten API: Searching for "${keyword}"`);
    
    const mockProducts: RakutenProduct[] = [
      {
        itemName: `${keyword}関連の技術書`,
        itemPrice: 1980,
        itemUrl: `https://books.rakuten.co.jp/search?g=001&s=${encodeURIComponent(keyword)}&k=0&v=3&sp=1&f=0&o=0&e=0&l=00`,
        affiliateUrl: `https://books.rakuten.co.jp/search?g=001&s=${encodeURIComponent(keyword)}&k=0&v=3&sp=1&f=0&o=0&e=0&l=00&m=mock-affiliate-id&pc=mock-affiliate-id`,
        imageUrl: 'https://via.placeholder.com/150x200?text=Tech+Book',
        shopName: '楽天ブックス',
        reviewAverage: 4.2,
        reviewCount: 15
      },
      {
        itemName: `${keyword}学習教材`,
        itemPrice: 3480,
        itemUrl: `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(keyword)}/`,
        affiliateUrl: `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(keyword)}/?m=mock-affiliate-id&pc=mock-affiliate-id`,
        imageUrl: 'https://via.placeholder.com/150x200?text=Learning',
        shopName: '楽天市場',
        reviewAverage: 4.0,
        reviewCount: 8
      },
      {
        itemName: `${keyword}関連グッズ`,
        itemPrice: 1280,
        itemUrl: `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(keyword)}+グッズ/`,
        affiliateUrl: `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(keyword)}+グッズ/?m=mock-affiliate-id&pc=mock-affiliate-id`,
        imageUrl: 'https://via.placeholder.com/150x200?text=Goods',
        shopName: '楽天市場',
        reviewAverage: 3.8,
        reviewCount: 12
      }
    ];

    // ランダムな遅延を追加（API呼び出しを模倣）
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));
    
    return mockProducts;
  }

  async getRelatedProducts(articleContent: string): Promise<{
    rakuten: RakutenProduct[];
  }> {
    const keywords = this.extractKeywords(articleContent);
    const primaryKeyword = keywords.length > 0 ? keywords[0] : 'AI';

    const rakutenProducts = await this.getMockRakutenProducts(primaryKeyword);

    return {
      rakuten: rakutenProducts
    };
  }

  private extractKeywords(content: string): string[] {
    const words = content
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);

    const wordCount: Record<string, number> = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    const techKeywords = [
      'ai', '人工知能', '機械学習', '深層学習', '自然言語処理', 'コンピュータビジョン',
      'プログラミング', 'python', 'javascript', 'typescript', 'react', 'nextjs',
      'クラウド', 'aws', 'azure', 'gcp', 'データベース', 'api',
      'スマートフォン', 'pc', 'ノートパソコン', 'タブレット', 'ウェアラブル',
      'カメラ', 'ヘッドフォン', 'キーボード', 'マウス', 'モニター'
    ];

    const relevantKeywords = techKeywords.filter(keyword => 
      content.toLowerCase().includes(keyword)
    );

    const frequentWords = Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);

    return [...new Set([...relevantKeywords, ...frequentWords])].slice(0, 5);
  }
}