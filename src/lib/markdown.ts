import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { RakutenProduct } from './rakuten';

const postsDirectory = join(process.cwd(), 'content');

export interface Post {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  category: string;
  content: string;
  excerpt?: string;
  rakutenProducts?: RakutenProduct[];
}

export function getPostSlugs(): string[] {
  return readdirSync(postsDirectory).filter(file => file.endsWith('.md'));
}

export async function getPostBySlug(slug: string): Promise<Post> {
  const realSlug = slug.replace(/\.md$/, '');
  const fullPath = join(postsDirectory, `${realSlug}.md`);
  const fileContents = readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  // アフィリエイトセクションを除去
  const affiliateIndex = content.indexOf('<!-- アフィリエイト商品 -->');
  const contentWithoutAffiliate = affiliateIndex !== -1
    ? content.substring(0, affiliateIndex)
    : content;
  
  // 抜粋用にHTMLタグを除去したテキストを生成
  const excerptText = contentWithoutAffiliate
    .replace(/<[^>]*>/g, '') // HTMLタグを除去
    .replace(/\s+/g, ' ')     // 連続する空白を単一スペースに
    .trim()
    .substring(0, 150) + '...'; // 150文字で切り詰め
  
  // マークダウンをHTMLに変換
  const processedContent = await remark()
    .use(html)
    .process(contentWithoutAffiliate);
  const contentHtml = processedContent.toString();

  return {
    slug: realSlug,
    title: data.title,
    date: data.date,
    tags: data.tags || [],
    category: data.category || '未分類',
    content: contentHtml,
    excerpt: excerptText, // 生成した抜粋テキストを使用
  };
}

export async function getAllPosts(): Promise<Post[]> {
  const slugs = getPostSlugs();
  const posts = await Promise.all(
    slugs.map(async (slug) => await getPostBySlug(slug))
  );
  
  // 日付でソート（新しい順）
  return posts.sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
}

export function getAllTags(): string[] {
  const slugs = getPostSlugs();
  const allTags = new Set<string>();
  
  slugs.forEach(slug => {
    const fullPath = join(postsDirectory, slug);
    const fileContents = readFileSync(fullPath, 'utf8');
    const { data } = matter(fileContents);
    
    if (data.tags && Array.isArray(data.tags)) {
      data.tags.forEach((tag: string) => allTags.add(tag));
    }
  });
  
  return Array.from(allTags).sort();
}

export function getAllCategories(): string[] {
  const slugs = getPostSlugs();
  const allCategories = new Set<string>();
  
  slugs.forEach(slug => {
    const fullPath = join(postsDirectory, slug);
    const fileContents = readFileSync(fullPath, 'utf8');
    const { data } = matter(fileContents);
    
    if (data.category) {
      allCategories.add(data.category);
    }
  });
  
  return Array.from(allCategories).sort();
}