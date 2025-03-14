import * as React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import ProductCard from './ProductsCard';
import api from '../../api';

interface Product {
  id: number;
  title: string;
  price: number;
  old_price: number;
  image: string | null;
  rating: number;
  additional_images: { id: number; image: string | null; date: string }[];
}

interface ProductsCarouselProps {
  categoryId?: number;
}

export function ProductsCarousel({ categoryId }: ProductsCarouselProps) {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const url = categoryId
          ? `/api/products/category/${categoryId}/`
          : '/api/products/';
        const response = await api.get(url);
        setProducts(response.data.slice(0, 5));
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categoryId]);

  if (loading) {
    return <div className="text-center py-4">Loading products...</div>;
  }

  if (products.length === 0) {
    return <div className="text-center py-4">No products available</div>;
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