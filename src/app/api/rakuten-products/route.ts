import { NextRequest, NextResponse } from 'next/server';
import { RakutenClient } from '@/lib/rakuten';

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

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json({ error: 'コンテンツが必要です' }, { status: 400 });
    }

    const rakutenAppId = process.env.RAKUTEN_APPLICATION_ID;
    const rakutenAffiliateId = process.env.RAKUTEN_AFFILIATE_ID;
    
    if (!rakutenAppId || !rakutenAffiliateId) {
      console.warn('楽天API設定がありません');
      return NextResponse.json([]);
    }

    const rakutenClient = new RakutenClient(rakutenAppId, rakutenAffiliateId);
    const products = await rakutenClient.getRelatedProducts(content, 3);
    
    return NextResponse.json(products);
  } catch (error) {
    console.error('楽天商品取得エラー:', error);
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}