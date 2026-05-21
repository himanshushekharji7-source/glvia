import Link from "next/link";

interface SalonCardProps {
  id: string;
  name: string;
  image: string;
  rating: number;
  reviews: number;
  distance: string;
  address: string;
  priceRange?: string;
  tags?: string[];
  featured?: boolean;
}

export default function SalonCard({
  id,
  name,
  image,
  rating,
  reviews,
  distance,
  address,
  priceRange,
  tags,
  featured = false,
}: SalonCardProps) {
  return (
    <Link href={`/salon/${id}`} className="block">
      <div
        className={`card-elevated group ${
          featured ? "w-[260px]" : "w-full"
        }`}
      >
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundImage: `url(${image})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

          {/* Rating Badge */}
          <div className="absolute top-3 left-3 badge badge-rating">
            <span className="material-icons-round text-[12px] text-amber-500">
              star
            </span>
            <span className="text-amber-700 font-bold">{rating.toFixed(1)}</span>
            <span className="text-amber-600/60 font-normal">({reviews})</span>
          </div>

          {/* Heart */}
          <button
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-white hover:scale-110"
            onClick={(e) => e.preventDefault()}
          >
            <span className="material-icons-round text-[18px] text-text-tertiary">
              favorite_border
            </span>
          </button>

          {/* Distance */}
          <div className="absolute bottom-3 right-3 badge bg-white/90 backdrop-blur-sm text-text-primary">
            <span className="material-icons-round text-[11px]">location_on</span>
            {distance}
          </div>
        </div>

        {/* Content */}
        <div className="p-3.5">
          <h3 className="font-bold text-[15px] text-text-primary mb-1 truncate">
            {name}
          </h3>
          <p className="text-[12px] text-text-secondary truncate">{address}</p>

          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/5 text-primary"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {priceRange && (
            <div className="mt-2.5 flex items-center gap-1.5">
              <span className="text-[12px] text-text-tertiary">From</span>
              <span className="text-[14px] font-bold text-text-primary">
                {priceRange}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
