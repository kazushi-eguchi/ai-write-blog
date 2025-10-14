import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getAllPosts } from '@/lib/markdown';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

function cleanExcerpt(excerpt: string): string {
  // マークダウン記号を除去
  return excerpt
    .replace(/#{1,6}\s/g, '') // 見出し記号
    .replace(/\*\*/g, '')     // 太字
    .replace(/\*/g, '')       // 斜体・リスト
    .replace(/`/g, '')        // コード
    .replace(/\[.*?\]\(.*?\)/g, '') // リンク
    .replace(/!\[.*?\]\(.*?\)/g, '') // 画像
    .replace(/>\s*/g, '')     // 引用
    .replace(/!{1,3}/g, '')   // 感嘆符
    .replace(/^[#!\-*>\s]+/, '') // 行頭のマークダウン記号
    .replace(/\s+[#!\-*>\s]+\s+/g, ' ') // 文中のマークダウン記号
    .replace(/^#+\s*/, '') // 行頭の#記号を特別に除去
    .trim();
}

export default async function Home() {
  const posts = await getAllPosts();

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ガジェットレビューブログ
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            AIが自動生成する最新ガジェット・テクノロジー製品のレビューと紹介
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-500 text-lg mb-4">
              まだ記事がありません
            </div>
            <p className="text-gray-400">
              自動生成スクリプトが記事を作成するのをお待ちください
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article 
                key={post.slug}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <time dateTime={post.date}>
                      {format(new Date(post.date), 'yyyy年MM月dd日', { locale: ja })}
                    </time>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {post.category}
                    </span>
                  </div>
                  
                  <h2 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                    <Link 
                      href={`/posts/${post.slug}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {post.title}
                    </Link>
                  </h2>
                  
                  {post.excerpt && (
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {cleanExcerpt(post.excerpt)}
                    </p>
                  )}
                  
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span 
                          key={tag}
                          className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="text-gray-500 text-xs">
                          +{post.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  
                  <Link 
                    href={`/posts/${post.slug}`}
                    className="inline-block text-blue-600 hover:text-blue-800 font-medium text-sm"
                  >
                    続きを読む →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
