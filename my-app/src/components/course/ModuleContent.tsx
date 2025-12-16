"use client";

import React, { useState } from "react";
import { ImageTooltip } from "./ImageTooltip";
import { ImageModal } from "./ImageModal";

interface ModuleContentProps {
  content: string;
  images: { [key: string]: { url: string; alt: string } };
}

export const ModuleContent: React.FC<ModuleContentProps> = ({
  content,
  images,
}) => {
  const [modalImage, setModalImage] = useState<{
    url: string;
    alt: string;
  } | null>(null);

  // Parse content and replace image references with interactive tooltips
  const parseContent = (text: string) => {
    // Match patterns like (figure1), (image1), (рис.1), etc.
    const regex = /\((figure\d+|image\d+|рис\.\d+|fig\.\d+)\)/gi;
    const parts: (string | React.ReactNode)[] = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }

      const key = match[1].toLowerCase();
      const imageData = images[key];

      if (imageData) {
        parts.push(
          <ImageTooltip
            key={`${key}-${match.index}`}
            label={match[0]}
            imageUrl={imageData.url}
            alt={imageData.alt}
            onImageClick={(url, alt) => setModalImage({ url, alt })}
          />
        );
      } else {
        parts.push(match[0]);
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts;
  };

  // Split content into paragraphs
  const paragraphs = content.split("\n\n");

  return (
    <>
      <div className="prose prose-lg max-w-none">
        {paragraphs.map((paragraph, idx) => (
          <p
            key={idx}
            className="text-gray-700 leading-relaxed mb-4 animate-fadeInUp"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            {parseContent(paragraph)}
          </p>
        ))}
      </div>

      {/* Modal for full-size image */}
      <ImageModal
        isOpen={!!modalImage}
        imageUrl={modalImage?.url || ""}
        alt={modalImage?.alt || ""}
        onClose={() => setModalImage(null)}
      />
    </>
  );
};
