import { notFound } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getAllCategories, getAllPosts } from '@/lib/markdown';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  const categories = await getAllCategories();
  return categories.map((category) => ({
    category: encodeURIComponent(category),
  }));
}

export async function generateMetadata({ params }: Props) {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);
  
  return {
    title: `「${decodedCategory}」カテゴリの記事 - AI自動生成ブログ`,
    description: `カテゴリ「${decodedCategory}」に関連するAI自動生成記事の一覧です`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);
  const allCategories = await getAllCategories();
  const allPosts = await getAllPosts();

  // 存在しないカテゴリの場合は404
  if (!allCategories.includes(decodedCategory)) {
    notFound();
  }

  // 特定のカテゴリの記事をフィルタリング
  const filteredPosts = allPosts.filter(post => 
    post.category === decodedCategory
  );

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <nav className="mb-4">
            <Link 
              href="/categories" 
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              ← カテゴリ一覧に戻る
            </Link>
          </nav>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            カテゴリ: {decodedCategory}
          </h1>
          <p className="text-gray-600">
            {filteredPosts.length} 件の記事が見つかりました
          </p>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-500 text-lg mb-4">
              このカテゴリの記事はまだありません
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredPosts.map((post) => (
              <article 
                key={post.slug}
                className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <time dateTime={post.date}>
                    {format(new Date(post.date), 'yyyy年MM月dd日', { locale: ja })}
                  </time>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {post.category}
                  </span>
                </div>
                
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  <Link 
                    href={`/posts/${post.slug}`}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {post.title}
                  </Link>
                </h2>
                
                {post.excerpt && (
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                )}
                
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {post.tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/tags/${encodeURIComponent(tag)}`}
                        className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded hover:bg-gray-200"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}