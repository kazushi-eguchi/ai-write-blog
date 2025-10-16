'use client';

import { notFound } from 'next/navigation';
import { use } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import Link from 'next/link';
import { RakutenAffiliateProducts } from '../../../components/RakutenAffiliateProducts';
import { useEffect, useState } from 'react';

interface Props {
  params: Promise<{ slug: string }>;
}

interface Post {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  category: string;
  content: string;
  excerpt?: string;
}

interface RakutenProduct {
  itemName: string;
  itemUrl: string;
  affiliateUrl: string;
  itemPrice: number;
  imageUrl: string;
  shopName: string;
  reviewAverage: number;
  reviewCount: number;
}

function RakutenWidget() {
  useEffect(() => {
    // 既存のスクリプトをクリーンアップ
    const existingScripts = document.querySelectorAll('script[src*="rakuten_widget"]');
    existingScripts.forEach(script => script.remove());

    // 楽天ウィジェットスクリプトを動的に読み込む
    const script1 = document.createElement('script');
    script1.type = 'text/javascript';
    script1.innerHTML = `rakuten_design="slide";rakuten_affiliateId="100289c9.7a3c312b.100289ca.99ca7f67";rakuten_items="ctsmatch";rakuten_genreId="0";rakuten_size="600x200";rakuten_target="_blank";rakuten_theme="gray";rakuten_border="on";rakuten_auto_mode="on";rakuten_genre_title="off";rakuten_recommend="on";rakuten_ts="${Date.now()}";`;
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.type = 'text/javascript';
    script2.src = 'https://xml.affiliate.rakuten.co.jp/widget/js/rakuten_widget.js?20230106';
    script2.async = true;
    document.head.appendChild(script2);

    return () => {
      // クリーンアップ
      if (document.head.contains(script1)) {
        document.head.removeChild(script1);
      }
      if (document.head.contains(script2)) {
        document.head.removeChild(script2);
      }
    };
  }, []);

  return (
    <div className="mb-6">
      {/* ウィジェットがここに表示されます */}
    </div>
  );
}

export default function PostPage({ params }: Props) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;
  
  const [post, setPost] = useState<Post | null>(null);
  const [rakutenProducts, setRakutenProducts] = useState<RakutenProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // 記事データを取得
        const response = await fetch(`/api/posts/${slug}`);
        if (!response.ok) {
          notFound();
          return;
        }
        const postData = await response.json();
        setPost(postData);

        // 楽天商品を取得
        const rakutenResponse = await fetch(`/api/rakuten-products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: postData.content }),
        });
        
        if (rakutenResponse.ok) {
          const products = await rakutenResponse.json();
          setRakutenProducts(products);
        }
      } catch (error) {
        console.error('データ取得エラー:', error);
        notFound();
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">読み込み中...</div>
        </main>
        <Footer />
      </div>
    );
  }

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
              <time dateTime={post!.date}>
                {format(new Date(post!.date), 'yyyy年MM月dd日', { locale: ja })}
              </time>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                {post!.category}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {post!.title}
            </h1>

            {/* 楽天アフィリエイトウィジェット */}
            <RakutenWidget />
            
            {post!.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post!.tags.map((tag) => (
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
            dangerouslySetInnerHTML={{ __html: post!.content }}
          />

          {/* 楽天アフィリエイト商品セクション */}
          {rakutenProducts.length > 0 && (
            <RakutenAffiliateProducts products={rakutenProducts} />
          )}

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