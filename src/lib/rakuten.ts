import axios from 'axios';

export interface RakutenProduct {
  itemName: string;
  itemPrice: number;
  itemUrl: string;
  affiliateUrl: string;
  imageUrl: string;
  shopName: string;
  reviewAverage: number;
  reviewCount: number;
}

export interface RakutenSearchParams {
  keyword: string;
  genreId?: string;
  maxPrice?: number;
  minPrice?: number;
  hits?: number;
}

export class RakutenClient {
  private applicationId: string;
  private affiliateId: string;
  private baseURL: string;

  constructor(applicationId: string, affiliateId: string) {
    this.applicationId = applicationId;
    this.affiliateId = affiliateId;
    this.baseURL = 'https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706';
  }

  async searchProducts(params: RakutenSearchParams): Promise<RakutenProduct[]> {
    try {
      // 有効なアプリケーションIDが設定されているか確認
      if (!this.applicationId || !this.affiliateId) {
        console.warn('楽天API: 有効なAPIキーが設定されていません');
        return this.generateFallbackProducts(params.keyword);
      }

      const searchParams = new URLSearchParams({
        applicationId: this.applicationId,
        format: 'json',
        keyword: params.keyword,
        hits: String(params.hits || 10),
        sort: '-reviewAverage',
      });

      if (params.genreId) {
        searchParams.append('genreId', params.genreId);
      }
      if (params.maxPrice) {
        searchParams.append('maxPrice', String(params.maxPrice));
      }
      if (params.minPrice) {
        searchParams.append('minPrice', String(params.minPrice));
      }

      // レート制限対策: リトライロジックを追加
      const maxRetries = 3;
      let lastError: any;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          // レート制限対策: リクエスト間に遅延を追加
          if (attempt > 1) {
            const delay = Math.pow(2, attempt - 1) * 1000; // 指数バックオフ: 2秒, 4秒, 8秒
            console.log(`楽天API: リトライ ${attempt}/${maxRetries} (${delay}ms待機)`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }

          const response = await axios.get(`${this.baseURL}?${searchParams.toString()}`);

          if (response.data.Items && response.data.Items.length > 0) {
            return response.data.Items.map((item: any) => this.transformProduct(item));
          }

          return [];
        } catch (error: any) {
          lastError = error;
          
          // 429エラーの場合はリトライ
          if (error.response?.status === 429) {
            console.warn(`楽天API: レート制限エラー (${attempt}/${maxRetries})`);
            continue;
          }
          
          // その他のエラーは即時終了
          break;
        }
      }

      // すべてのリトライが失敗した場合
      console.error('楽天API: すべてのリトライが失敗しました', lastError);
      return this.generateFallbackProducts(params.keyword);
    } catch (error) {
      console.error('楽天API Error:', error);
      // フォールバックとしてダミーデータを返す
      return this.generateFallbackProducts(params.keyword);
    }
  }

  private transformProduct(item: any): RakutenProduct {
    const product = item.Item;
    
    return {
      itemName: product.itemName,
      itemPrice: product.itemPrice,
      itemUrl: product.itemUrl,
      affiliateUrl: this.generateAffiliateUrl(product.itemUrl),
      imageUrl: product.mediumImageUrls?.[0]?.imageUrl || product.smallImageUrls?.[0]?.imageUrl || '',
      shopName: product.shopName,
      reviewAverage: product.reviewAverage || 0,
      reviewCount: product.reviewCount || 0,
    };
  }

  private generateAffiliateUrl(itemUrl: string): string {
    // 楽天アフィリエイトURLを生成
    const baseUrl = new URL(itemUrl);
    baseUrl.searchParams.set('m', this.affiliateId);
    baseUrl.searchParams.set('pc', this.affiliateId);
    return baseUrl.toString();
  }

  async getRelatedProducts(articleContent: string, maxProducts: number = 5): Promise<RakutenProduct[]> {
    // 記事内容から具体的な製品名や機能を抽出
    const specificKeywords = this.extractSpecificKeywords(articleContent);
    const generalKeywords = this.extractKeywords(articleContent);
    
    // 具体的なキーワードを優先して検索
    let products: RakutenProduct[] = [];
    
    if (specificKeywords.length > 0) {
      // 具体的な製品名や機能で検索（リクエスト間に遅延を追加）
      for (const keyword of specificKeywords.slice(0, 2)) {
        const searchResults = await this.searchProducts({
          keyword: keyword,
          hits: Math.ceil(maxProducts / 2),
          maxPrice: 200000,
          minPrice: 1000,
        });
        products = [...products, ...searchResults];
        
        // 複数リクエスト時のレート制限対策: 1秒待機
        if (specificKeywords.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    // 具体的な検索結果が少ない場合は、一般的なキーワードで補完
    if (products.length < maxProducts && generalKeywords.length > 0) {
      const remainingCount = maxProducts - products.length;
      const generalResults = await this.searchProducts({
        keyword: generalKeywords[0],
        hits: remainingCount,
        maxPrice: 200000,
        minPrice: 1000,
      });
      products = [...products, ...generalResults];
    }
    
    // 重複を除去して返す
    const uniqueProducts = products.filter((product, index, self) =>
      index === self.findIndex(p => p.itemName === product.itemName)
    );
    
    return uniqueProducts.slice(0, maxProducts);
  }

  private extractSpecificKeywords(content: string): string[] {
    // 記事本文から具体的な製品名、モデル名、機能を抽出
    const specificPatterns = [
      // 製品名パターン
      /([A-Z][a-z]+)\s+([A-Z][a-z]+\s+)?[A-Z][a-z]+/g,
      // モデル番号パターン
      /[A-Z]{2,}-\w+/g,
      // 具体的な機能名
      /プロジェクター|レーザー|eSIM|マイクアレイ|スピーカー|バッテリー/g,
      // 価格帯の表現
      /\d+ドル|\d+万円/g,
    ];

    const specificKeywords: string[] = [];
    
    for (const pattern of specificPatterns) {
      const matches = content.match(pattern) || [];
      specificKeywords.push(...matches);
    }

    // 記事のタイトルから重要な単語を抽出
    const titleMatch = content.match(/^#+\s+(.+)$/m);
    if (titleMatch) {
      const titleWords = titleMatch[1].split(/\s+/).filter(word =>
        word.length > 2 && !['レビュー', '評価', '実用的', '自律型'].includes(word)
      );
      specificKeywords.push(...titleWords);
    }

    // 重複を除去して返す
    return [...new Set(specificKeywords)].slice(0, 5);
  }

  private extractKeywords(content: string): string[] {
    // 記事内容からキーワードを抽出
    const words = content
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);

    // 頻出単語をカウント
    const wordCount: Record<string, number> = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    // 関連性の高いガジェット・テクノロジー関連キーワード（優先順位付き）
    const gadgetKeywords = [
      // 高優先度キーワード
      'スマートフォン', 'スマホ', 'iphone', 'android', 'galaxy',
      'ノートパソコン', 'laptop', 'macbook', 'surface', 'thinkpad',
      'タブレット', 'ipad', 'galaxy tab',
      'ウェアラブル', 'スマートウォッチ', 'apple watch', 'fitbit', 'galaxy watch',
      'イヤホン', 'ヘッドフォン', 'airpods', 'ワイヤレスイヤホン', 'bluetooth',
      'カメラ', 'デジカメ', 'ミラーレス', '一眼レフ', 'アクションカメラ', 'gopro',
      // 中優先度キーワード
      'キーボード', 'マウス', 'モニター', 'ディスプレイ', 'テレビ', 'tv',
      'ゲーム', 'nintendo', 'playstation', 'xbox', 'vr', 'ar',
      'スマートホーム', 'スマートスピーカー', 'alexa', 'google home',
      'ドローン', 'ロボット', 'aiスピーカー', 'スマート家電',
      // 低優先度キーワード
      'framework', 'dell', 'lenovo', 'asus', 'acer', 'hp',
      'モジュラー', 'カスタマイズ', 'アップグレード', '修理', 'メンテナンス'
    ];

    // 記事タイトルから重要なキーワードを抽出
    const titleMatch = content.match(/^#+\s+(.+)$/m);
    const titleKeywords = titleMatch ?
      titleMatch[1].toLowerCase().split(/[^\w]+/).filter(word => word.length > 2) : [];

    // 関連キーワードを優先（記事内に存在するもの）
    const relevantKeywords = gadgetKeywords.filter(keyword =>
      content.toLowerCase().includes(keyword)
    );

    // 頻出単語から上位を選択
    const frequentWords = Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);

    // タイトルキーワード、関連キーワード、頻出単語を組み合わせ
    const allKeywords = [...new Set([
      ...titleKeywords.slice(0, 2), // タイトルから最大2つ
      ...relevantKeywords.slice(0, 3), // 関連キーワードから最大3つ
      ...frequentWords.slice(0, 2) // 頻出単語から最大2つ
    ])];

    return allKeywords.slice(0, 5);
  }

  private generateFallbackProducts(keyword: string): RakutenProduct[] {
    // ガジェット向けのフォールバック商品
    const gadgetProducts = [
      {
        itemName: '人気のノートパソコン',
        itemPrice: 99800,
        itemUrl: 'https://search.rakuten.co.jp/search/mall/ノートパソコン/',
        affiliateUrl: `https://search.rakuten.co.jp/search/mall/ノートパソコン/?m=${this.affiliateId}&pc=${this.affiliateId}`,
        imageUrl: 'https://via.placeholder.com/150x150?text=Laptop',
        shopName: '楽天市場',
        reviewAverage: 4.3,
        reviewCount: 25
      },
      {
        itemName: '最新スマートフォン',
        itemPrice: 79800,
        itemUrl: 'https://search.rakuten.co.jp/search/mall/スマートフォン/',
        affiliateUrl: `https://search.rakuten.co.jp/search/mall/スマートフォン/?m=${this.affiliateId}&pc=${this.affiliateId}`,
        imageUrl: 'https://via.placeholder.com/150x150?text=Smartphone',
        shopName: '楽天市場',
        reviewAverage: 4.1,
        reviewCount: 18
      },
      {
        itemName: 'ワイヤレスイヤホン',
        itemPrice: 24800,
        itemUrl: 'https://search.rakuten.co.jp/search/mall/ワイヤレスイヤホン/',
        affiliateUrl: `https://search.rakuten.co.jp/search/mall/ワイヤレスイヤホン/?m=${this.affiliateId}&pc=${this.affiliateId}`,
        imageUrl: 'https://via.placeholder.com/150x150?text=Earphones',
        shopName: '楽天市場',
        reviewAverage: 4.2,
        reviewCount: 32
      },
      {
        itemName: 'タブレット端末',
        itemPrice: 59800,
        itemUrl: 'https://search.rakuten.co.jp/search/mall/タブレット/',
        affiliateUrl: `https://search.rakuten.co.jp/search/mall/タブレット/?m=${this.affiliateId}&pc=${this.affiliateId}`,
        imageUrl: 'https://via.placeholder.com/150x150?text=Tablet',
        shopName: '楽天市場',
        reviewAverage: 4.0,
        reviewCount: 15
      },
      {
        itemName: 'スマートウォッチ',
        itemPrice: 32800,
        itemUrl: 'https://search.rakuten.co.jp/search/mall/スマートウォッチ/',
        affiliateUrl: `https://search.rakuten.co.jp/search/mall/スマートウォッチ/?m=${this.affiliateId}&pc=${this.affiliateId}`,
        imageUrl: 'https://via.placeholder.com/150x150?text=Smartwatch',
        shopName: '楽天市場',
        reviewAverage: 4.1,
        reviewCount: 20
      }
    ];

    return gadgetProducts.slice(0, 3); // 最大3商品を返す
  }
}