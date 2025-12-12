import React from "react";
import { Star } from "lucide-react";

interface RatingProps {
  rating: number;
  reviews?: number;
}

export const Rating: React.FC<RatingProps> = ({ rating, reviews }) => (
  <div className="flex items-center gap-2">
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={16}
          className={i < Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
        />
      ))}
    </div>
    <span className="text-sm font-medium text-gray-900">{rating.toFixed(1)}</span>
    {reviews && <span className="text-sm text-gray-600">({reviews})</span>}
  </div>
);
