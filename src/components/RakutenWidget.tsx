export function RakutenWidget() {
  return (
    <div className="mt-8 mb-8">
      {/* 楽天アフィリエイトウィジェット - サーバーコンポーネントとして実装 */}
      <div
        dangerouslySetInnerHTML={{
          __html: `
            <script type="text/javascript">
              rakuten_design="slide";
              rakuten_affiliateId="100289c9.7a3c312b.100289ca.99ca7f67";
              rakuten_items="ctsmatch";
              rakuten_genreId="0";
              rakuten_size="600x200";
              rakuten_target="_blank";
              rakuten_theme="gray";
              rakuten_border="off";
              rakuten_auto_mode="on";
              rakuten_genre_title="off";
              rakuten_recommend="on";
              rakuten_ts="1760676612004";
            </script>
            <script type="text/javascript" src="https://xml.affiliate.rakuten.co.jp/widget/js/rakuten_widget.js?20230106"></script>
          `,
        }}
      />
    </div>
  );
}