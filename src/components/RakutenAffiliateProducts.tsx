'use client';

import Image from 'next/image';
import { RakutenProduct } from '@/lib/rakuten';

interface Props {
  products: RakutenProduct[];
}

export function RakutenAffiliateProducts({ products }: Props) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 bg-gray-50 rounded-lg p-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        🛒 おすすめ商品
      </h3>
      <p className="text-gray-600 text-center mb-6">
        この記事に関連するおすすめ商品をご紹介します
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
          >
            <div className="aspect-w-3 aspect-h-4 relative h-48">
              <Image
                src={product.imageUrl || '/placeholder-image.jpg'}
                alt={product.itemName}
                fill
                className="object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://via.placeholder.com/300x200?text=商品画像';
                }}
              />
            </div>
            
            <div className="p-4">
              <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2">
                {product.itemName}
              </h4>
              
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-bold text-blue-600">
                  ¥{product.itemPrice.toLocaleString()}
                </span>
                {product.reviewAverage > 0 && (
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="text-yellow-400 mr-1">★</span>
                    {product.reviewAverage.toFixed(1)}
                    <span className="text-gray-400 ml-1">
                      ({product.reviewCount})
                    </span>
                  </div>
                )}
              </div>
              
              <div className="text-xs text-gray-500 mb-3">
                {product.shopName}
              </div>
              
              <a
                href={product.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-red-500 hover:bg-red-600 text-white text-center py-2 px-4 rounded-md font-medium transition-colors duration-200"
              >
                楽天で購入
              </a>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-xs text-gray-500 text-center">
        ※ 商品リンクは楽天アフィリエイトリンクです
      </div>
    </section>
  );
}