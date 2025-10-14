import axios from 'axios';

export interface DeepSeekArticleRequest {
  theme: string;
  category: string;
  tags: string[];
  wordCount?: number;
}

export interface DeepSeekArticleResponse {
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  category: string;
}

export class DeepSeekClient {
  private apiKey: string;
  private baseURL: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.deepseek.com/v1';
  }

  async generateArticle(request: DeepSeekArticleRequest): Promise<DeepSeekArticleResponse> {
    try {
      const prompt = this.buildPrompt(request);
      
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'あなたはAI/テクノロジー分野の専門ブロガーです。日本語で高品質なブログ記事を生成してください。記事には適切な見出し、段落、箇条書き、画像を含めてください。必ず指定された場所に画像を挿入してください。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const generatedContent = response.data.choices[0].message.content;
      return this.parseGeneratedContent(generatedContent, request);
    } catch (error) {
      console.error('DeepSeek API Error:', error);
      throw new Error(`記事生成に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private buildPrompt(request: DeepSeekArticleRequest): string {
    const wordCount = request.wordCount || 1000;
    
    return `
以下の要件に基づいてガジェット・テクノロジーブログ記事を生成してください：

テーマ: ${request.theme}
カテゴリ: ${request.category}
タグ: ${request.tags.join(', ')}
文字数: ${wordCount}文字程度

記事の要件:
- 日本語で書くこと
- ガジェットやテクノロジー製品の紹介・レビュー記事
- 専門的でありながら読みやすい内容
- 適切な見出し構造（h2, h3）
- 箇条書きや番号付きリストを適宜使用
- 具体的な製品情報、スペック、価格を含める
- 読者の購入判断に役立つ実用的な情報
- 製品のメリット・デメリットを客観的に比較
- 実際の使用感や体験談を含める
- 記事の適切な場所に画像を挿入するためのマークダウン記法を記述してください
  - 例: ![製品名の画像](画像URL)
  - 画像は記事の内容に関連するものを想定して記述
  - 画像の説明文は具体的に記述

出力形式:
記事の内容のみを出力し、余計な説明は含めないでください。記事のタイトル、要約、タグは別途指定します。
`;
  }

  private parseGeneratedContent(content: string, request: DeepSeekArticleRequest): DeepSeekArticleResponse {
    // タイトルから番号を除去（例: "6. Nothing Phone (2)" → "Nothing Phone (2)"）
    const cleanTitle = request.theme.replace(/^\d+\.\s*/, '');
    
    return {
      title: cleanTitle,
      content: content,
      excerpt: this.generateExcerpt(content),
      tags: request.tags,
      category: request.category
    };
  }

  private generateExcerpt(content: string, maxLength: number = 150): string {
    // マークダウン記号を完全に除去
    const plainText = content
      .replace(/#{1,6}\s/g, '') // 見出し記号
      .replace(/\*\*/g, '')     // 太字
      .replace(/\*/g, '')       // 斜体・リスト
      .replace(/`/g, '')        // コード
      .replace(/\[.*?\]\(.*?\)/g, '') // リンク
      .replace(/!\[.*?\]\(.*?\)/g, '') // 画像
      .replace(/>\s*/g, '')     // 引用
      .replace(/!{1,3}/g, '')   // 感嘆符（マークダウン記号として）
      .replace(/\n/g, ' ')      // 改行をスペースに
      .replace(/\s+/g, ' ')     // 連続するスペースを1つに
      .trim();

    // さらに一般的な記号を除去（特に行頭の#記号）
    const cleanText = plainText
      .replace(/^[#!\-*>\s]+/, '') // 行頭のマークダウン記号（#を含む）
      .replace(/\s+[#!\-*>\s]+\s+/g, ' ') // 文中のマークダウン記号
      .replace(/^#+\s*/, '') // 行頭の#記号を特別に除去
      .trim();

    if (cleanText.length <= maxLength) {
      return cleanText;
    }

    return cleanText.substring(0, maxLength) + '...';
  }

  async generateThemeIdeas(count: number = 10): Promise<string[]> {
    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'あなたはガジェット・テクノロジーブログの専門家です。新登場や流行りのガジェット、スマートフォン、ウェアラブル、オーディオ、スマートホーム、PC周辺機器などに関する最新トレンドに詳しいです。'
            },
            {
              role: 'user',
              content: `新登場や流行りのガジェット・テクノロジー製品に関するブログ記事のテーマを${count}個提案してください。各テーマは1行で簡潔に記述し、改行で区切ってください。具体的な製品名やトレンドを含めてください。番号は付けないでください。`
            }
          ],
          max_tokens: 800,
          temperature: 0.9
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0].message.content;
      const themes = content.split('\n')
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0 && !line.startsWith('1.') && !line.startsWith('2.') && !line.startsWith('3.') && !line.startsWith('4.') && !line.startsWith('5.') && !line.startsWith('例：'));

      return themes.slice(0, count);
    } catch (error) {
      console.error('DeepSeek Theme Generation Error:', error);
      // フォールバックテーマ
      return [
        '機械学習の最新トレンドと実用例',
        'AI倫理と社会的影響',
        '自然言語処理の進化と応用',
        'コンピュータビジョンの未来',
        'AIと人間の協働の可能性'
      ];
    }
  }
}