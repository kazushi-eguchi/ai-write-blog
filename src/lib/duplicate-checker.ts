import { getAllPosts } from './markdown';
import { DeepSeekArticleRequest } from './deepseek';

export class DuplicateChecker {
  private similarityThreshold = 0.8; // 80%以上の類似度で重複と判定

  async isDuplicateArticle(request: DeepSeekArticleRequest): Promise<{ isDuplicate: boolean; similarArticle?: string }> {
    const existingPosts = await getAllPosts();
    
    // タイトルの類似度チェック
    const titleSimilarity = await this.checkTitleSimilarity(request.theme, existingPosts);
    if (titleSimilarity.isDuplicate) {
      return titleSimilarity;
    }

    // テーマの類似度チェック
    const themeSimilarity = await this.checkThemeSimilarity(request, existingPosts);
    if (themeSimilarity.isDuplicate) {
      return themeSimilarity;
    }

    return { isDuplicate: false };
  }

  private async checkTitleSimilarity(
    newTitle: string, 
    existingPosts: any[]
  ): Promise<{ isDuplicate: boolean; similarArticle?: string }> {
    
    for (const post of existingPosts) {
      const similarity = this.calculateSimilarity(newTitle.toLowerCase(), post.title.toLowerCase());
      
      if (similarity >= this.similarityThreshold) {
        return {
          isDuplicate: true,
          similarArticle: post.title
        };
      }
    }

    return { isDuplicate: false };
  }

  private async checkThemeSimilarity(
    request: DeepSeekArticleRequest, 
    existingPosts: any[]
  ): Promise<{ isDuplicate: boolean; similarArticle?: string }> {
    
    const newThemeKeywords = this.extractKeywords(request.theme + ' ' + request.tags.join(' '));
    
    for (const post of existingPosts) {
      const existingKeywords = this.extractKeywords(post.title + ' ' + post.tags.join(' '));
      
      const keywordOverlap = this.calculateKeywordOverlap(newThemeKeywords, existingKeywords);
      
      if (keywordOverlap >= this.similarityThreshold) {
        return {
          isDuplicate: true,
          similarArticle: post.title
        };
      }
    }

    return { isDuplicate: false };
  }

  private calculateSimilarity(str1: string, str2: string): number {
    // レーベンシュタイン距離に基づく類似度計算
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) {
      return 1.0;
    }

    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) {
      matrix[0][i] = i;
    }

    for (let j = 0; j <= str2.length; j++) {
      matrix[j][0] = j;
    }

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  private extractKeywords(text: string): Set<string> {
    // ストップワードリスト
    const stopWords = new Set([
      'の', 'に', 'は', 'を', 'た', 'が', 'で', 'て', 'と', 'し', 'れ', 'さ',
      'ある', 'いる', 'も', 'する', 'から', 'な', 'こと', 'として', 'い', 'や',
      'れる', 'など', 'なっ', 'ない', 'この', 'ため', 'その', 'あっ', 'よう', 'また',
      'もの', 'という', 'あり', 'まで', 'られ', 'なる', 'へ', 'か', 'だ', 'これ',
      'によって', 'により', 'おり', 'より', 'による', 'ず', 'なり', 'られる', 'において',
      'について', 'ならびに', 'および', 'ai', '技術', '最新', '未来', '進化', '展望'
    ]);

    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => 
        word.length > 1 && 
        !stopWords.has(word) &&
        !this.isNumeric(word)
      );

    return new Set(words);
  }

  private isNumeric(str: string): boolean {
    return /^\d+$/.test(str);
  }

  private calculateKeywordOverlap(set1: Set<string>, set2: Set<string>): number {
    if (set1.size === 0 || set2.size === 0) {
      return 0;
    }

    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return intersection.size / union.size;
  }

  async getUniqueTheme(themeIdeas: string[]): Promise<string | null> {
    const existingPosts = await getAllPosts();
    const existingTitles = existingPosts.map(post => post.title.toLowerCase());

    for (const theme of themeIdeas) {
      let isUnique = true;
      
      for (const existingTitle of existingTitles) {
        const similarity = this.calculateSimilarity(theme.toLowerCase(), existingTitle);
        
        if (similarity >= this.similarityThreshold) {
          isUnique = false;
          break;
        }
      }

      if (isUnique) {
        return theme;
      }
    }

    return null;
  }

  async getAvailableCategories(): Promise<string[]> {
    const existingPosts = await getAllPosts();
    const categoryCount: Record<string, number> = {};

    existingPosts.forEach(post => {
      categoryCount[post.category] = (categoryCount[post.category] || 0) + 1;
    });

    // 記事数が少ないカテゴリを優先
    return Object.entries(categoryCount)
      .sort(([, a], [, b]) => a - b)
      .map(([category]) => category)
      .slice(0, 3);
  }

  async getSuggestedTags(theme: string): Promise<string[]> {
    const baseTags = ['ガジェット', 'テクノロジー', 'レビュー'];
    
    // テーマに基づいてタグを追加
    const themeKeywords = this.extractKeywords(theme);
    const additionalTags = Array.from(themeKeywords).slice(0, 3);
    
    return [...baseTags, ...additionalTags].slice(0, 5);
  }
}