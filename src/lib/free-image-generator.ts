import axios from 'axios';

export interface GeneratedImage {
  url: string;
  description: string;
  altText: string;
}

export class FreeImageGenerator {
  private baseURL: string;

  constructor() {
    // 無料の画像生成APIを利用
    this.baseURL = 'https://picsum.photos';
  }

  /**
   * テーマに基づいて画像を生成
   * より関連性の高い画像を提供するために複数のソースを試す
   */
  async generateImages(theme: string, count: number = 3): Promise<GeneratedImage[]> {
    try {
      // まずUnsplashで関連画像を検索
      const unsplashImages = await this.tryUnsplash(theme, count);
      if (unsplashImages.length > 0) {
        return unsplashImages;
      }

      // Unsplashが失敗した場合はPexelsを試す
      const pexelsImages = await this.tryPexels(theme, count);
      if (pexelsImages.length > 0) {
        return pexelsImages;
      }

      // 最後にPicsum Photosを使用
      return this.getPicsumImages(theme, count);
    } catch (error) {
      console.error('画像生成エラー:', error);
      // エラー時はデフォルト画像を返す
      return this.getFallbackImages(theme, count);
    }
  }

  /**
   * Unsplash APIで画像を検索
   */
  private async tryUnsplash(theme: string, count: number): Promise<GeneratedImage[]> {
    try {
      // テーマから検索キーワードを抽出
      const keywords = this.extractKeywords(theme);
      const searchQuery = keywords.join(' ');
      
      // Unsplashの無料APIを使用（APIキーなし）
      const response = await axios.get(
        `https://api.unsplash.com/search/photos`,
        {
          params: {
            query: searchQuery,
            per_page: count,
            orientation: 'landscape',
            client_id: 'your_unsplash_access_key' // 実際のAPIキーが必要
          }
        }
      );

      if (response.data.results && response.data.results.length > 0) {
        return response.data.results.slice(0, count).map((photo: any) => ({
          url: photo.urls.regular,
          description: photo.description || photo.alt_description || `${theme}の画像`,
          altText: photo.alt_description || `${theme} - 関連画像`
        }));
      }
    } catch (error) {
      console.log('Unsplash APIエラー、次のソースを試します');
    }
    return [];
  }

  /**
   * Pexels APIで画像を検索
   */
  private async tryPexels(theme: string, count: number): Promise<GeneratedImage[]> {
    try {
      const keywords = this.extractKeywords(theme);
      const searchQuery = keywords.join(' ');
      
      // Pexelsの無料APIを使用（APIキーなし）
      const response = await axios.get(
        `https://api.pexels.com/v1/search`,
        {
          params: {
            query: searchQuery,
            per_page: count,
            orientation: 'landscape'
          },
          headers: {
            'Authorization': 'your_pexels_api_key' // 実際のAPIキーが必要
          }
        }
      );

      if (response.data.photos && response.data.photos.length > 0) {
        return response.data.photos.slice(0, count).map((photo: any) => ({
          url: photo.src.medium,
          description: photo.alt || `${theme}の画像`,
          altText: photo.alt || `${theme} - 関連画像`
        }));
      }
    } catch (error) {
      console.log('Pexels APIエラー、次のソースを試します');
    }
    return [];
  }

  /**
   * Picsum Photosでランダム画像を取得
   */
  private getPicsumImages(theme: string, count: number): GeneratedImage[] {
    const images: GeneratedImage[] = [];
    const keywords = this.extractKeywords(theme);
    
    for (let i = 0; i < count; i++) {
      // よりランダムな画像を提供するために、テーマとインデックスに基づいた画像IDを使用
      const imageId = this.getRandomImageIdByTheme(theme, i);
      const imageUrl = `https://picsum.photos/id/${imageId}/800/600`;
      
      images.push({
        url: imageUrl,
        description: `${keywords.join(' ')}に関する高品質な画像`,
        altText: `${theme} - ${keywords[0] || 'テクノロジー'}画像 ${i + 1}`
      });
    }
    
    return images;
  }

  /**
   * テーマに基づいてランダムな画像IDを選択
   */
  private getRandomImageIdByTheme(theme: string, index: number): number {
    // より広い範囲の画像IDを使用
    const techImages = [1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150];
    const gadgetImages = [160, 170, 180, 190, 200, 210, 220, 230, 240, 250, 260, 270, 280, 290, 300];
    const audioImages = [310, 320, 330, 340, 350, 360, 370, 380, 390, 400];
    const computerImages = [410, 420, 430, 440, 450, 460, 470, 480, 490, 500];
    const phoneImages = [510, 520, 530, 540, 550, 560, 570, 580, 590, 600];
    
    // テーマに基づいて適切な画像カテゴリを選択
    let imagePool: number[];
    if (theme.includes('ヘッドホン') || theme.includes('イヤホン') || theme.includes('オーディオ')) {
      imagePool = audioImages;
    } else if (theme.includes('スマートフォン') || theme.includes('iPhone') || theme.includes('Galaxy')) {
      imagePool = phoneImages;
    } else if (theme.includes('PC') || theme.includes('ノートパソコン') || theme.includes('ラップトップ')) {
      imagePool = computerImages;
    } else if (theme.includes('ガジェット') || theme.includes('デバイス') || theme.includes('テクノロジー')) {
      imagePool = gadgetImages;
    } else {
      imagePool = techImages;
    }
    
    // インデックスと現在のタイムスタンプを組み合わせてよりランダムな選択
    const seed = Date.now() % 1000;
    const poolIndex = (index + seed) % imagePool.length;
    return imagePool[poolIndex];
  }

  /**
   * テーマからキーワードを抽出
   */
  private extractKeywords(theme: string): string[] {
    const commonWords = ['の', 'と', 'を', 'に', 'で', 'が', 'は', 'も', 'から', 'まで', 'や', 'など'];
    
    return theme
      .replace(/[^\w\s\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '')
      .split(/\s+/)
      .filter(word =>
        word.length > 1 &&
        !commonWords.includes(word) &&
        !word.match(/^\d+$/)
      )
      .slice(0, 5);
  }

  /**
   * フォールバック画像を取得
   */
  private getFallbackImages(theme: string, count: number): GeneratedImage[] {
    const images: GeneratedImage[] = [];
    const keywords = this.extractKeywords(theme);
    
    for (let i = 0; i < count; i++) {
      const imageId = this.getRandomImageIdByTheme(theme, i);
      images.push({
        url: `https://picsum.photos/id/${imageId}/800/600`,
        description: `${keywords.join(' ')}に関する画像`,
        altText: `${theme} - 関連画像 ${i + 1}`
      });
    }
    
    return images;
  }

  /**
   * 特定のキーワードで画像を検索
   */
  async searchImages(keyword: string, count: number = 3): Promise<GeneratedImage[]> {
    return this.generateImages(keyword, count);
  }
}

// シングルトンインスタンス
export const freeImageGenerator = new FreeImageGenerator();