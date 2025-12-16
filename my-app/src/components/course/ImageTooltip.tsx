"use client";

import React, { useState } from "react";

interface ImageTooltipProps {
  label: string;
  imageUrl: string;
  alt: string;
  onImageClick: (imageUrl: string, alt: string) => void;
}

export const ImageTooltip: React.FC<ImageTooltipProps> = ({
  label,
  imageUrl,
  alt,
  onImageClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <span
      className="relative inline-block cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onImageClick(imageUrl, alt)}
    >
      {/* Label */}
      <span className="text-blue-600 font-medium border-b-2 border-blue-300 border-dashed hover:border-blue-500 transition-colors px-1 py-0.5 rounded bg-blue-50/50">
        {label}
      </span>

      {/* Tooltip preview */}
      {isHovered && (
        <div className="absolute z-40 bottom-full left-1/2 transform -translate-x-1/2 mb-3 animate-tooltipIn">
          {/* Arrow */}
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rotate-45 shadow-lg" />

          {/* Image container */}
          <div className="relative bg-white rounded-xl shadow-2xl p-2 border border-gray-100">
            <img
              src={imageUrl}
              alt={alt}
              className="w-48 h-32 object-cover rounded-lg"
            />
            <p className="text-xs text-gray-500 text-center mt-2 px-2">{alt}</p>
            <p className="text-xs text-blue-500 text-center mt-1">
              Нажмите для увеличения
            </p>
          </div>
        </div>
      )}
    </span>
  );
};
