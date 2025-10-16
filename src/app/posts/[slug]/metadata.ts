import { getPostBySlug, getAllPosts } from '@/lib/markdown';

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