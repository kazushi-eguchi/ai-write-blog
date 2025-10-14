export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-gray-600">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} AI自動生成ブログ - DeepSeek AIによる自動生成コンテンツ
          </p>
          <p className="text-xs mt-2 text-gray-500">
            このブログの記事はAIによって自動生成されています
          </p>
        </div>
      </div>
    </footer>
  );
}