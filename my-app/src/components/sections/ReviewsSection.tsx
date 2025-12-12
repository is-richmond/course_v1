import React from "react";
import { Review } from "@/src/types";
import { Rating } from "@/src/components/ui/Rating";

interface ReviewsProps {
  reviews: Review[];
}

export const ReviewsSection: React.FC<ReviewsProps> = ({ reviews }) => (
  <section className="py-20 bg-gray-50">
    <div className="max-w-6xl mx-auto px-6">
      <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
        Отзывы студентов
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white p-8 rounded-xl shadow-md">
            <Rating rating={review.rating} />
            <p className="text-gray-700 mt-4 mb-4 italic">"{review.text}"</p>
            <div>
              <p className="font-bold text-gray-900">{review.name}</p>
              <p className="text-sm text-gray-600">{review.title}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
