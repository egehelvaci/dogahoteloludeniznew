import { productIds } from '../../../data/products';
import ProductDetailPage from './ProductDetailPage';

export const runtime = 'nodejs';

type PageProps = {
  params: {
    lang: string;
    productId: string;
  };
};

// Geçerli ürün ID'leri için statik parametreler oluştur
export async function generateStaticParams() {
  return productIds.map(id => ({ productId: id }));
}

// Next.js 15'te, params'a erişim için önce params nesnesini await etmeliyiz
export default async function Page({ params }: PageProps) {
  // Önce tüm params nesnesini await et
  const resolvedParams = await params;
  const lang = resolvedParams.lang || 'tr';
  const productId = resolvedParams.productId;
  
  return <ProductDetailPage lang={lang} productId={productId} />;
} 