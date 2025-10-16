import { writeFileSync } from 'fs';
import { getAllPosts } from '../src/lib/markdown';

async function generateSitemap() {
  const baseUrl = 'https://ai-write-blog.vercel.app'; // VercelのデプロイURLに合わせて変更
  const posts = await getAllPosts();
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- ホームページ -->
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- カテゴリーページ -->
  <url>
    <loc>${baseUrl}/categories</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- タグページ -->
  <url>
    <loc>${baseUrl}/tags</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- 記事ページ -->
  ${posts.map(post => `
  <url>
    <loc>${baseUrl}/posts/${post.slug}</loc>
    <lastmod>${new Date(post.date).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('')}
</urlset>`;

  // publicディレクトリにサイトマップを保存
  writeFileSync('public/sitemap.xml', sitemap);
  console.log('✅ サイトマップを生成しました: public/sitemap.xml');
  
  // robots.txtも更新
  const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml`;

  writeFileSync('public/robots.txt', robotsTxt);
  console.log('✅ robots.txtを更新しました: public/robots.txt');
}

// 実行
generateSitemap().catch(console.error);