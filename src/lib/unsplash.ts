import axios from 'axios';

export interface UnsplashImage {
  id: string;
  url: string;
  description: string;
  alt_description: string;
  photographer: string;
  photographer_url: string;
}

export class UnsplashClient {
  private accessKey: string;
  private baseURL: string;

  constructor(accessKey: string) {
    this.accessKey = accessKey;
    this.baseURL = 'https://api.unsplash.com';
  }

  async searchImages(query: string, count: number = 3): Promise<UnsplashImage[]> {
    try {
      // Unsplash APIキーが設定されていない場合はダミー画像を返す
      if (!this.accessKey || this.accessKey === 'your_unsplash_access_key') {
        return this.generateFallbackImages(query, count);
      }

      const response = await axios.get(
        `${this.baseURL}/search/photos`,
        {
          params: {
            query: query,
            per_page: count,
            orientation: 'landscape'
          },
          headers: {
            'Authorization': `Client-ID ${this.accessKey}`
          }
        }
      );

      return response.data.results.map((photo: any) => ({
        id: photo.id,
        url: photo.urls.regular,
        description: photo.description || photo.alt_description,
        alt_description: photo.alt_description,
        photographer: photo.user.name,
        photographer_url: photo.user.links.html
      }));
    } catch (error) {
      console.error('Unsplash API Error:', error);
      return this.generateFallbackImages(query, count);
    }
  }

  private generateFallbackImages(query: string, count: number): UnsplashImage[] {
    // フォールバックとしてPexelsの無料画像を使用
    const pexelsImages = [
      {
        id: '1',
        url: `https://images.pexels.com/photos/38568/apple-imac-ipad-workplace-38568.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&dpr=2`,
        description: 'テクノロジーデバイス',
        alt_description: 'テクノロジーデバイス',
        photographer: 'Pexels',
        photographer_url: 'https://www.pexels.com'
      },
      {
        id: '2',
        url: `https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&dpr=2`,
        description: 'スマートホームデバイス',
        alt_description: 'スマートホームデバイス',
        photographer: 'Pexels',
        photographer_url: 'https://www.pexels.com'
      },
      {
        id: '3',
        url: `https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&dpr=2`,
        description: 'ガジェット使用シーン',
        alt_description: 'ガジェット使用シーン',
        photographer: 'Pexels',
        photographer_url: 'https://www.pexels.com'
      }
    ];

    return pexelsImages.slice(0, count);
  }
}