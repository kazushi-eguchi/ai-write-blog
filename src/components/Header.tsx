import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
            ガジェットレビューブログ
          </Link>
          <nav className="flex space-x-8">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              ホーム
            </Link>
            <Link 
              href="/tags" 
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              タグ
            </Link>
            <Link 
              href="/categories" 
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              カテゴリ
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}