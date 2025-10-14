import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getAllTags, getAllPosts } from '@/lib/markdown';

export default async function TagsPage() {
  const tags = await getAllTags();
  const posts = await getAllPosts();

  // タグごとの記事数を計算
  const tagCounts: Record<string, number> = {};
  posts.forEach(post => {
    post.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">タグ一覧</h1>
          <p className="text-gray-600">
            記事に付けられたタグの一覧です。タグをクリックすると関連記事を表示します。
          </p>
        </div>

        {tags.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-500 text-lg mb-4">
              タグがまだありません
            </div>
            <p className="text-gray-400">
              記事が生成されるとタグが表示されます
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tags.map((tag) => (
              <Link
                key={tag}
                href={`/tags/${encodeURIComponent(tag)}`}
                className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-gray-900">
                    {tag}
                  </span>
                  <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                    {tagCounts[tag] || 0} 記事
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}