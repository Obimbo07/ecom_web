import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';
import { FaStar, FaShoppingCart, FaEye, FaEllipsisH, FaCheck, FaTimes } from 'react-icons/fa';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import parse from 'html-react-parser';
import { addToGuestCart, addToUserCart } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface Product {
  id: number;
  title: string;
  price: number;
  old_price: number | null;
  image: string | null;
  images: string[] | { id: number; image: string; alt_text: string | null; display_order: number; }[] | null;
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
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { user } = useAuth();
  const [fetchDisabled, setFetchDisabled] = useState(false);

  // Helper function to get image URL from either string or object
  const getImageUrl = (img: string | { id: number; image: string; alt_text: string | null; display_order: number; } | null | undefined): string | null => {
    if (!img) return null;
    if (typeof img === 'string') return img;
    return img.image;
  };

  // Regular discount (old_price vs price)
  const hasRegularDiscount = product.old_price !== null && product.old_price > product.price;
  const regularDiscountPercentage = hasRegularDiscount && product.old_price
    ? Math.round(((product.old_price - product.price) / product.old_price) * 100)
    : 0;

  // Display price
  const displayPrice = product.price;

  // Get primary image (main image) or first from images array
  const primaryImage = product.image || (product.images && product.images.length > 0 ? getImageUrl(product.images[0]) : null);
  
  // Get all images for carousel - ensure no duplicates
  const allImages = Array.from(new Set([
    ...(product.image ? [product.image] : []),
    ...(product.images || []).map(img => getImageUrl(img)).filter(Boolean)
  ])).filter(Boolean) as string[];

  // Render stars based on rating (placeholder; can be enhanced with actual ratings)
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          className={i <= Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}
        />
      );
    }
    return stars;
  };

  const handleAddToCart = async () => {
    setFetchDisabled(true);
    try {
      if (user) {
        await addToUserCart(user.id, {
          productId: product.id,
          quantity: 1,
        });
      } else {
        addToGuestCart({
          product_id: product.id,
          quantity: 1,
        });
      }
      // Success - button will show checkmark for 2 seconds
    } catch (err: any) {
      console.error('Error adding to cart:', err);
      alert('Failed to add to cart. Please try again.');
    } finally {
      setTimeout(() => setFetchDisabled(false), 2000);
    }
  };

  return (
    <Card className="border-none overflow-hidden p-0 shadow-lg hover:]]-xl transition-shadow">
      <CardContent className="p-0">
        <div className="w-full h-48 bg-gray-200 relative">
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              No image available
            </div>
          )}
          {hasRegularDiscount && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold py-1 px-2 rounded-full">
              -{regularDiscountPercentage}%
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold line-clamp-2">{product.title}</h3>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-lg font-bold text-green-600">
              Ksh {displayPrice.toLocaleString()}
            </span>
            {hasRegularDiscount && (
              <span className="text-sm text-gray-500 line-through">
                Ksh {product.old_price?.toLocaleString()}
              </span>
            )}
          </div>
          <div className="flex justify-between text-white text-sm space-x-2 mt-4">
            <button
              onClick={handleAddToCart}
              disabled={fetchDisabled}
              className="bg-green-500 p-2 rounded-xl hover:bg-green-600 disabled:bg-gray-400 w-full flex items-center justify-center space-x-2"
              aria-label={fetchDisabled ? 'Product added to cart' : 'Add product to cart'}
            >
              {fetchDisabled ? (
                <>
                  <FaEllipsisH className="text-white text-lg animate-pulse" />
                  <FaCheck className="text-white text-lg" />
                </>
              ) : (
                <FaShoppingCart className="text-white text-lg hover:text-gray-200 transition-colors" />
              )}
            </button>
            <Dialog>
              <DialogTrigger asChild>
                <button
                  className="bg-green-500 p-2 rounded-xl hover:bg-green-600 w-full flex items-center justify-center space-x-2"
                  aria-label="View product details"
                >
                  <FaEye className="text-white text-lg hover:text-gray-200 transition-colors" />
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 bg-white">
                <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:pointer-events-none z-50 text-gray-900 hover:text-gray-700">
                  <FaTimes className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </DialogClose>

                <div className="grid md:grid-cols-2 gap-6 p-6 bg-white">
                  {/* Left Side - Images */}
                  <div>
                    {allImages.length > 0 ? (
                      <div className="sticky top-0">
                        <Carousel className="w-full">
                          <CarouselContent>
                            {allImages.map((imageUrl, index) => (
                              <CarouselItem key={index}>
                                <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                                  <img
                                    src={imageUrl}
                                    alt={`${product.title} - Image ${index + 1}`}
                                    className="w-full h-full object-contain p-4"
                                  />
                                </div>
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                          {allImages.length > 1 && (
                            <>
                              <CarouselPrevious className="left-2" />
                              <CarouselNext className="right-2" />
                            </>
                          )}
                        </Carousel>
                        {allImages.length > 1 && (
                          <div className="text-center mt-3 text-sm text-gray-500">
                            {allImages.length} images
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center border-2 border-gray-200">
                        <span className="text-gray-400">No image available</span>
                      </div>
                    )}
                  </div>

                  {/* Right Side - Product Details */}
                  <div className="flex flex-col bg-white">
                    <DialogHeader className="mb-4">
                      <DialogTitle className="text-2xl font-bold text-black pr-8">
                        {product.title}
                      </DialogTitle>
                      {product.category && (
                        <p className="text-sm text-gray-600 mt-1">{product.category.title}</p>
                      )}
                    </DialogHeader>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center gap-1">
                        {renderStars(4.5)}
                      </div>
                      <span className="text-sm text-gray-700 font-medium">(4.5 out of 5)</span>
                    </div>

                    {/* Pricing */}
                    <div className="mb-4 pb-4 border-b">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-3xl font-bold text-green-600">
                          Ksh {displayPrice.toLocaleString()}
                        </span>
                        {hasRegularDiscount && (
                          <>
                            <span className="text-lg text-gray-500 line-through">
                              Ksh {product.old_price?.toLocaleString()}
                            </span>
                            <span className="bg-red-500 text-white text-sm font-bold py-1 px-3 rounded-full">
                              SAVE {regularDiscountPercentage}%
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Stock */}
                    <div className="mb-4">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                        product.stock_count > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.stock_count > 0 
                          ? `✓ In Stock (${product.stock_count} available)` 
                          : '✗ Out of Stock'}
                      </span>
                    </div>

                    {/* Description */}
                    {product.description && (
                      <div className="mb-4">
                        <h4 className="text-lg font-semibold text-black mb-2">Description</h4>
                        <div className="text-gray-800 text-sm leading-relaxed prose prose-sm max-w-none">
                          {parse(product.description)}
                        </div>
                      </div>
                    )}

                    {/* Specifications */}
                    {product.specifications && (
                      <div className="mb-4">
                        <h4 className="text-lg font-semibold text-black mb-2">Specifications</h4>
                        <div className="text-gray-800 text-sm leading-relaxed prose prose-sm max-w-none">
                          {parse(product.specifications)}
                        </div>
                      </div>
                    )}

                    {/* Product Type */}
                    {product.type && (
                      <div className="mb-4 bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-700">Product Type:</span>
                          <span className="text-sm font-medium text-black">{product.type}</span>
                        </div>
                      </div>
                    )}

                    {/* Add to Cart Button */}
                    <div className="mt-auto pt-4">
                      <Button
                        onClick={handleAddToCart}
                        disabled={fetchDisabled || product.stock_count === 0}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-6 text-lg font-semibold rounded-lg flex items-center justify-center gap-3 transition-all"
                        aria-label={fetchDisabled ? 'Product added to cart' : 'Add product to cart'}
                      >
                        {fetchDisabled ? (
                          <>
                            <FaCheck className="text-xl" />
                            <span>Added to Cart!</span>
                          </>
                        ) : (
                          <>
                            <FaShoppingCart className="text-xl" />
                            <span>Add to Cart</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ProductCard;