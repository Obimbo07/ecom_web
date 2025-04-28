import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

interface Banner {
  image: string;
  title: string;
  buttonText: string;
  buttonLink: string;
}

// Sample banner data (replace with your actual images)
const banners: Banner[] = [
  {
    image: 'sales.jpg', // Replace with actual image URL
    title: 'HOT DEALS',
    buttonText: 'Shop Now',
    buttonLink: '/deals',
  },
  {
    image: 'IMG-20250222-WA0084.jpg',
    title: 'WINTER COLLECTION',
    buttonText: 'Explore',
    buttonLink: '/shop/shirts',
  },
  
];

export function BannerCarousel() {
  return (
    <Carousel className="w-full h-90">
      <CarouselContent>
        {banners.map((banner, index) => (
          <CarouselItem key={index}>
            <div
              className="relative h-90 bg-cover bg-center bg-origin-padding"
              style={{ backgroundImage: `url(${banner.image})`, backgroundRepeat: 'no-repeat', backgroundPosition: 'c' }}
            >
              {/* Overlay for better text visibility */}
              <div className="absolute inset-0   flex items-center justify-center">
                <div className="text-center h-fit ">
                  <h2 className="text-xl font-bold text-white mt-50 bg-black rounded-full p-4">{banner.title}</h2>
                  <a
                    href={banner.buttonLink}
                    className="inline-block bg-red-500 text-white p-2 rounded hover:bg-red-600 transition"
                  >
                    {banner.buttonText}
                  </a>
                </div>
                
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
       <CarouselPrevious className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white rounded-full p-2 hover:bg-gray-700" />
      <CarouselNext className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white rounded-full p-2 hover:bg-gray-700" />
    </Carousel> 
  );
}

export default BannerCarousel;