import { notFound } from 'next/navigation';
import { getPostBySlug, getAllPosts } from '@/lib/markdown';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import Link from 'next/link';
import { RakutenWidget } from '../../../components/RakutenWidget';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: '記事が見つかりません',
    };
  }

  return {
    title: `${post.title} - ガジェットレビューブログ`,
    description: post.excerpt || 'AIによって自動生成された記事です',
  };
}


export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article className="bg-white">
          <header className="mb-8">
            <nav className="mb-4">
              <Link 
                href="/" 
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                ← ホームに戻る
              </Link>
            </nav>
            
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <time dateTime={post.date}>
                {format(new Date(post.date), 'yyyy年MM月dd日', { locale: ja })}
              </time>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                {post.category}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>
            
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          <div
            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-900 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-blockquote:border-blue-600 prose-blockquote:text-gray-800 prose-ul:text-gray-900 prose-ol:text-gray-900 prose-li:text-gray-900"
            style={{ color: '#111827' }}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* 楽天アフィリエイトウィジェット */}
          <RakutenWidget />

   
          <footer className="mt-12 pt-8 border-t">
            <div className="text-center text-gray-500 text-sm">
              <p>この記事はAIによって自動生成されました</p>
            </div>
          </footer>
        </article>
      </main>

      <Footer />
    </div>
  );
}