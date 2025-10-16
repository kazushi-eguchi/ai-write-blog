import { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/markdown';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://ai-write-blog-v2.vercel.app';
  const posts = await getAllPosts();

  // ホームページ
  const homePage = {
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1.0,
  };

  // カテゴリーページ
  const categoriesPage = {
    url: `${baseUrl}/categories`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  };

  // タグページ
  const tagsPage = {
    url: `${baseUrl}/tags`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  };

  // 記事ページ
  const postPages = posts.map((post) => ({
    url: `${baseUrl}/posts/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [homePage, categoriesPage, tagsPage, ...postPages];
}