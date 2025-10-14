import { DeepSeekClient, DeepSeekArticleRequest } from '../src/lib/deepseek';
import { RakutenClient } from '../src/lib/rakuten';
import { UnsplashClient } from '../src/lib/unsplash';
import { MockAffiliateService } from '../src/lib/mock-affiliate';
import { DuplicateChecker } from '../src/lib/duplicate-checker';
import { freeImageGenerator } from '../src/lib/free-image-generator';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { format } from 'date-fns';
import dotenv from 'dotenv';

// 環境変数を読み込む
dotenv.config();

interface GeneratedArticle {
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  category: string;
  date: string;
  slug: string;
  affiliateProducts: {
    rakuten: any[];
    amazon: any[];
  };
}

class ArticleGenerator {
  private deepSeek: DeepSeekClient;
  private rakuten?: RakutenClient;
  private unsplash: UnsplashClient;
  private mockAffiliate: MockAffiliateService;
  private duplicateChecker: DuplicateChecker;
  private useMockAffiliate: boolean = false;

  constructor() {
    // 環境変数からAPIキーを取得
    const deepSeekApiKey = process.env.DEEPSEEK_API_KEY;
    const rakutenAppId = process.env.RAKUTEN_APPLICATION_ID;
    const rakutenAffiliateId = process.env.RAKUTEN_AFFILIATE_ID;
    const unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY || 'your_unsplash_access_key';

    if (!deepSeekApiKey) {
      throw new Error('DEEPSEEK_API_KEY environment variable is required');
    }

    this.deepSeek = new DeepSeekClient(deepSeekApiKey);
    this.unsplash = new UnsplashClient(unsplashAccessKey);
    this.duplicateChecker = new DuplicateChecker();
    this.mockAffiliate = MockAffiliateService.getInstance();

    // 楽天APIの初期化
    const hasValidRakutenConfig = rakutenAppId && rakutenAffiliateId &&
                                 !rakutenAppId.includes('test') &&
                                 !rakutenAffiliateId.includes('test');

    if (hasValidRakutenConfig) {
      this.rakuten = new RakutenClient(rakutenAppId, rakutenAffiliateId);
      console.log('✅ 楽天APIクライアントを初期化しました');
    } else {
      console.log('⚠️ 楽天APIの設定が無効です。モックサービスを使用します');
      this.useMockAffiliate = true;
    }

    // Amazon APIは削除済み
    console.log('ℹ️ Amazonアソシエイト機能は削除されました');

    if (this.useMockAffiliate) {
      console.log('🔧 モックアフィリエイトサービスを有効化しました');
    }
  }

  async generateArticle(): Promise<GeneratedArticle | null> {
    try {
      console.log('🔍 記事テーマを生成中...');
      
      // ユニークなテーマを生成
      const theme = await this.generateUniqueTheme();
      if (!theme) {
        console.log('❌ ユニークなテーマが見つかりませんでした');
        return null;
      }

      console.log(`📝 テーマ決定: ${theme}`);

      // カテゴリとタグを決定
      const category = await this.selectCategory();
      const tags = await this.generateTags(theme);

      console.log(`🏷️ カテゴリ: ${category}, タグ: ${tags.join(', ')}`);

      // 記事生成リクエストを作成
      const articleRequest: DeepSeekArticleRequest = {
        theme,
        category,
        tags,
        wordCount: 1000
      };

      console.log('🤖 DeepSeek APIで記事を生成中...');
      
      // 記事を生成
      const article = await this.deepSeek.generateArticle(articleRequest);
      
      console.log('✅ 記事生成完了');

      // 画像を挿入
      console.log('🖼️ 画像を挿入中...');
      let articleWithImages = await this.insertImages(article.content, theme);
      // 既存の記事からもexample.comの画像URLを除去
      articleWithImages = this.removeInvalidImageUrls(articleWithImages);
      
      console.log('✅ 画像挿入完了');

      // アフィリエイト商品を検索
      console.log('🛒 関連商品を検索中...');
      const affiliateProducts = await this.searchAffiliateProducts(article.content);
      
      console.log('✅ 商品検索完了');

      // 最終的な記事データを作成
      const generatedArticle: GeneratedArticle = {
        title: article.title,
        content: articleWithImages,
        excerpt: article.excerpt,
        tags: article.tags,
        category: article.category,
        date: format(new Date(), 'yyyy-MM-dd'),
        slug: this.generateSlug(article.title),
        affiliateProducts
      };

      return generatedArticle;

    } catch (error) {
      console.error('❌ 記事生成エラー:', error);
      return null;
    }
  }

  private async generateUniqueTheme(): Promise<string | null> {
    // テーマアイデアを生成
    const themeIdeas = await this.deepSeek.generateThemeIdeas(10);
    
    // 重複チェック
    for (const theme of themeIdeas) {
      const isDuplicate = await this.duplicateChecker.isDuplicateArticle({
        theme,
        category: '',
        tags: []
      });

      if (!isDuplicate.isDuplicate) {
        return theme;
      }
    }

    return null;
  }

  private async selectCategory(): Promise<string> {
    const availableCategories = await this.duplicateChecker.getAvailableCategories();
    
    if (availableCategories.length > 0) {
      return availableCategories[0];
    }

    // ガジェットブログ向けカテゴリ
    const gadgetCategories = [
      'スマートフォン',
      'ウェアラブル',
      'オーディオ',
      'スマートホーム',
      'PC・周辺機器',
      'カメラ',
      'ゲーム',
      '家電',
      'ガジェット'
    ];

    return gadgetCategories[Math.floor(Math.random() * gadgetCategories.length)];
  }

  private async generateTags(theme: string): Promise<string[]> {
    return await this.duplicateChecker.getSuggestedTags(theme);
  }

  private async searchAffiliateProducts(articleContent: string): Promise<{ rakuten: any[]; amazon: any[] }> {
    // モックサービスを使用する場合
    if (this.useMockAffiliate) {
      console.log('🛒 モックサービスで関連商品を検索中...');
      try {
        const products = await this.mockAffiliate.getMockRakutenProducts('ai');
        return { rakuten: products, amazon: [] };
      } catch (error) {
        console.error('モックアフィリエイトサービスエラー:', error);
        return { rakuten: [], amazon: [] };
      }
    }

    // 実際のAPIを使用する場合（楽天のみ）
    const products = {
      rakuten: [] as any[],
      amazon: [] as any[]
    };

    try {
      if (this.rakuten) {
        console.log('🛒 楽天市場で関連商品を検索中...');
        // 記事内の具体的な製品を優先的に検索
        products.rakuten = await this.rakuten.getRelatedProducts(articleContent, 5);
        
        if (products.rakuten.length > 0) {
          console.log(`✅ ${products.rakuten.length}件の関連商品が見つかりました`);
          
          // 記事内の具体的な製品が含まれているか確認
          const articleProducts = this.extractProductsFromArticle(articleContent);
          if (articleProducts.length > 0) {
            console.log(`🔍 記事内の製品: ${articleProducts.join(', ')}`);
          }
        } else {
          console.log('⚠️ 関連商品が見つかりませんでした');
        }
      }
      
      // Amazon商品は完全に削除
      console.log('ℹ️ Amazon商品セクションは削除されました');
      
    } catch (error) {
      console.error('アフィリエイト商品検索エラー:', error);
      // エラー時はモックサービスにフォールバック
      console.log('🔄 モックサービスにフォールバックします...');
      const fallbackProducts = await this.mockAffiliate.getMockRakutenProducts('ai');
      return { rakuten: fallbackProducts, amazon: [] };
    }

    return products;
  }

  private extractProductsFromArticle(content: string): string[] {
    // 記事本文から具体的な製品名を抽出
    const products: string[] = [];
    
    // 製品名のパターンを抽出（例：Sony WH-1000XM5, Apple AirPods Max, Oura Ring）
    const productPatterns = [
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:WH-)?\d+[A-Z]*)/g, // Sony WH-1000XM5
      /([A-Z][a-z]+\s+(?:AirPods|iPhone|iPad|MacBook|Galaxy|Xperia|Oura|Ultrahuman|RingConn))/g, // Apple AirPods, Oura Ring
      /((?:Sony|Apple|Samsung|Google|Microsoft|Amazon|Bose|JBL|Anker|Belkin|Mophie)\s+[A-Za-z0-9\s\-]+)/g, // ブランド名 + 製品名
      /([A-Z][a-z]+\s+(?:Ring|Watch|Phone|Pad|Book|Pods|Buds|Speaker|Charger))/g // 一般的な製品カテゴリ
    ];

    for (const pattern of productPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        products.push(...matches.map(p => p.trim()));
      }
    }

    // 重複を除去して返す
    return [...new Set(products)].filter(p => p.length > 5); // 短すぎるものは除外
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
  }

  private async insertImages(content: string, theme: string): Promise<string> {
    try {
      // まず無料画像生成APIを使用（より関連性の高い画像を提供）
      console.log(`🖼️ 無料画像生成APIで画像を生成中: ${theme}`);
      const generatedImages = await freeImageGenerator.generateImages(theme, 3);
      
      if (generatedImages.length > 0) {
        console.log(`✅ ${generatedImages.length}枚の画像を生成しました`);
        return this.insertGeneratedImages(content, generatedImages);
      }

      // 無料画像生成が失敗した場合はUnsplashを試す
      console.log(`🔄 Unsplashで画像を検索中: ${theme}`);
      const unsplashImages = await this.unsplash.searchImages(theme, 3);
      
      if (unsplashImages.length > 0) {
        console.log(`✅ ${unsplashImages.length}枚の画像を取得しました`);
        return this.insertGeneratedImages(content, unsplashImages);
      }

      console.log('⚠️ 画像が見つかりませんでした。画像なしで記事を保存します');
      // 利用できないexample.comの画像URLを除去
      return this.removeInvalidImageUrls(content);
    } catch (error) {
      console.error('画像挿入エラー:', error);
      console.log('⚠️ 画像生成に失敗しました。画像なしで記事を保存します');
      // エラー時も利用できない画像URLを除去
      return this.removeInvalidImageUrls(content);
    }
  }

  private removeInvalidImageUrls(content: string): string {
    // example.comなどの利用できない画像URLを除去
    return content.replace(/!\[.*?\]\(https?:\/\/example\.com\/[^)]+\)/g, '');
  }

  private insertGeneratedImages(content: string, images: any[]): string {
    let articleWithImages = content;
    
    // 記事の冒頭にメイン画像を挿入
    if (images[0]) {
      const mainImage = `\n\n![${images[0].altText}](${images[0].url})\n\n`;
      articleWithImages = articleWithImages.replace(/^#\s+.+$/m, (match) => match + mainImage);
    }

    // 記事の中間部分に画像を挿入
    if (images[1]) {
      const middleImage = `\n\n![${images[1].altText}](${images[1].url})\n\n`;
      // 記事の約1/3の位置に挿入
      const lines = articleWithImages.split('\n');
      const insertPosition = Math.floor(lines.length / 3);
      lines.splice(insertPosition, 0, middleImage);
      articleWithImages = lines.join('\n');
    }

    // 記事の終わり近くに画像を挿入
    if (images[2]) {
      const endImage = `\n\n![${images[2].altText}](${images[2].url})\n\n`;
      // 記事の約2/3の位置に挿入
      const lines = articleWithImages.split('\n');
      const insertPosition = Math.floor(lines.length * 2 / 3);
      lines.splice(insertPosition, 0, endImage);
      articleWithImages = lines.join('\n');
    }

    return articleWithImages;
  }

  saveArticle(article: GeneratedArticle): void {
    const contentDir = join(process.cwd(), 'content');
    
    // contentディレクトリが存在しない場合は作成
    if (!existsSync(contentDir)) {
      mkdirSync(contentDir, { recursive: true });
    }

    // マークダウンファイルを作成
    const frontMatter = `---
title: "${article.title}"
date: "${article.date}"
tags: ${JSON.stringify(article.tags)}
category: "${article.category}"
excerpt: "${article.excerpt}"
---

${article.content}

<!-- アフィリエイト商品 -->
${this.generateAffiliateSection(article.affiliateProducts)}
`;

    const filePath = join(contentDir, `${article.slug}.md`);
    writeFileSync(filePath, frontMatter, 'utf8');
    
    console.log(`📄 記事を保存しました: ${filePath}`);
  }

  private generateAffiliateSection(affiliateProducts: { rakuten: any[]; amazon: any[] }): string {
    let section = '';

    // 楽天商品のみ
    if (affiliateProducts.rakuten.length > 0) {
      section += '## おすすめ商品\n\n';
      section += '### 楽天市場のおすすめ\n\n';
      affiliateProducts.rakuten.forEach(product => {
        section += `- [${product.itemName}](${product.affiliateUrl}) - ¥${product.itemPrice.toLocaleString()}\n`;
      });
      section += '\n';
    }

    // Amazon商品セクションは完全に削除
    return section;
  }
}

// メイン実行関数
async function main() {
  console.log('🚀 自動記事生成を開始します...\n');

  const generator = new ArticleGenerator();
  const article = await generator.generateArticle();

  if (article) {
    generator.saveArticle(article);
    console.log('\n🎉 記事生成が完了しました！');
  } else {
    console.log('\n❌ 記事生成に失敗しました');
    process.exit(1);
  }
}

// スクリプト実行
if (require.main === module) {
  main().catch(error => {
    console.error('致命的なエラー:', error);
    process.exit(1);
  });
}

export { ArticleGenerator };
export type { GeneratedArticle };