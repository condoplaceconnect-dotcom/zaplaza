import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface Banner {
  id: string;
  image: string;
  title: string;
  subtitle: string;
}

interface HeroBannerProps {
  banners: Banner[];
}

export default function HeroBanner({ banners }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  if (banners.length === 0) return null;

  return (
    <div className="relative h-64 rounded-lg overflow-hidden group">
      <div 
        className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"
      />
      <img
        src={banners[currentIndex].image}
        alt={banners[currentIndex].title}
        className="w-full h-full object-cover"
        data-testid={`img-banner-${currentIndex}`}
      />
      <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 text-white">
        <h2 className="text-3xl font-bold mb-2" data-testid="text-banner-title">
          {banners[currentIndex].title}
        </h2>
        <p className="text-lg" data-testid="text-banner-subtitle">
          {banners[currentIndex].subtitle}
        </p>
      </div>
      {banners.length > 1 && (
        <>
          <Button
            size="icon"
            variant="secondary"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
            onClick={prevSlide}
            data-testid="button-banner-prev"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
            onClick={nextSlide}
            data-testid="button-banner-next"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex ? 'bg-white w-6' : 'bg-white/50'
                }`}
                onClick={() => setCurrentIndex(index)}
                data-testid={`button-banner-indicator-${index}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
