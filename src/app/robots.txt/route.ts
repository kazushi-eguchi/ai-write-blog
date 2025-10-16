import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = 'https://ai-write-blog-v2.vercel.app';
  
  const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml`;

  return new NextResponse(robotsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400', // 24時間キャッシュ
    },
  });
}