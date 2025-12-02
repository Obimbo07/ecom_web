import * as React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import ProductCard from './ProductsCard';
import { getProducts } from '@/lib/supabase';

interface Product {
  id: number;
  title: string;
  price: number;
  old_price: number | null;
  image: string | null;
  description: string | null;
  specifications: string | null;
  type: string | null;
  stock_count: number;
  slug: string | null;
  featured: boolean;
  category: {
    id: number;
    title: string;
    slug: string | null;
  } | null;
  images: Array<{
    id: number;
    image: string;
    alt_text: string | null;
    display_order: number;
  }>;
}

interface ProductsCarouselProps {
  categoryId?: number;
  featured?: boolean;
  limit?: number;
}

export function ProductsCarousel({ categoryId, featured, limit = 10 }: ProductsCarouselProps) {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getProducts({
          categoryId,
          featured,
          limit,
        });
        setProducts(data);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categoryId, featured, limit]);

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-40 bg-gray-300 rounded"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return <div className="text-center py-4 text-gray-500">No products available</div>;
  }

  return (
    <Carousel className="w-full max-w-4xl">
      <CarouselContent className="-ml-1">
        {products.map((product) => (
          <CarouselItem key={product.id} className="basis-1/2 md:basis-1/2 lg:basis-1/3">
            <div className="p-1">
              <ProductCard product={product} />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white rounded-full p-2 hover:bg-gray-700" />
      <CarouselNext className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white rounded-full p-2 hover:bg-gray-700" />
    </Carousel>
  );
}

export default ProductsCarousel;