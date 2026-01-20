"use client";

import React, { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { ImageModal } from "@/src/components/ui/ImageModal";
import { mediaAPI } from "@/src/lib/api";

interface TestMedia {
  id: string;
  download_url?:  string | null;
  original_filename?: string | null;
  custom_name?: string | null;
  media_type:  "image" | "video";
}

interface UrlMedia {
  id: number;
  media_url: string;
  media_type: string;
}

interface TestContentRendererProps {
  content: string;
  testMedia?:  TestMedia[];
  urlMedia?: UrlMedia[];
}

interface HoverPreview {
  url:  string;
  x: number;
  y: number;
  type: "image" | "video";
}

export function TestContentRenderer({
  content,
  testMedia = [],
  urlMedia = [],
}: TestContentRendererProps) {
  const [modalImage, setModalImage] = useState<{
    url: string;
    alt: string;
  } | null>(null);
  const [modalVideo, setModalVideo] = useState<{
    url: string;
    alt: string;
  } | null>(null);
  const [hoverPreview, setHoverPreview] = useState<HoverPreview | null>(null);
  const [mediaMap, setMediaMap] = useState<Map<string, string>>(new Map());
  const [loadingMedia, setLoadingMedia] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  // Извлечь все media ID из контента
  const extractMediaIds = useCallback((text: string): string[] => {
    const placeholderRegex = /\[(IMAGE|VIDEO):([a-zA-Z0-9-]+)\]/g;
    const ids: string[] = [];
    let match;
    while ((match = placeholderRegex.exec(text)) !== null) {
      ids.push(match[2]);
    }
    return ids;
  }, []);

  // Загрузить медиа по ID через API
  useEffect(() => {
    const loadMedia = async () => {
      const mediaIds = extractMediaIds(content);
      const newMediaMap = new Map<string, string>();
      const loading = new Set<string>();

      // Сначала добавляем уже имеющиеся медиа
      testMedia.forEach((media) => {
        if (media.download_url) {
          newMediaMap.set(media.id, media.download_url);
        }
      });

      urlMedia.forEach((media) => {
        if (media.media_url) {
          newMediaMap.set(String(media.id), media.media_url);
        }
      });

      // Загружаем недостающие медиа через API
      for (const mediaId of mediaIds) {
        if (!newMediaMap.has(mediaId)) {
          loading.add(mediaId);
          try {
            const mediaData = await mediaAPI.getMediaById(mediaId);
            if (mediaData.download_url) {
              newMediaMap.set(mediaId, mediaData.download_url);
            }
          } catch (error) {
            console.error(`Failed to load media ${mediaId}: `, error);
          } finally {
            loading.delete(mediaId);
          }
        }
      }

      setMediaMap(newMediaMap);
      setLoadingMedia(loading);
    };

    if (content) {
      loadMedia();
    }
  }, [content, testMedia, urlMedia, extractMediaIds]);

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent, url: string, type: "image" | "video") => {
      if (window.matchMedia("(hover: hover)").matches) {
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        setHoverPreview({
          url,
          x: rect.left + rect.width / 2,
          y: rect.bottom + 10,
          type,
        });
      }
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    setHoverPreview(null);
  }, []);

  const handleImageClick = useCallback((url: string, alt: string) => {
    setHoverPreview(null);
    setModalImage({ url, alt });
  }, []);

  const handleVideoClick = useCallback((url: string, alt: string) => {
    setHoverPreview(null);
    setModalVideo({ url, alt });
  }, []);

  const isHtmlContent = useMemo(() => {
    return /<[a-z][\s\S]*>/i.test(content);
  }, [content]);

  const renderContent = useMemo(() => {
    if (!content) return null;

    const placeholderRegex = /\[(IMAGE|VIDEO):([a-zA-Z0-9-]+)\]/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    const renderText = (text: string, key: string) => {
      if (! text) return null;

      if (isHtmlContent) {
        return (
          <div
            key={key}
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: text }}
          />
        );
      } else {
        return (
          <span key={key}>
            {text. split("\n").map((line, i, arr) => (
              <React.Fragment key={i}>
                {line}
                {i < arr.length - 1 && <br />}
              </React.Fragment>
            ))}
          </span>
        );
      }
    };

    while ((match = placeholderRegex.exec(content)) !== null) {
      const [fullMatch, mediaType, mediaId] = match;
      const matchStart = match.index;

      if (matchStart > lastIndex) {
        const textBefore = content.slice(lastIndex, matchStart);
        parts.push(renderText(textBefore, `text-${lastIndex}`));
      }

      const mediaUrl = mediaMap.get(mediaId);
      const isLoading = loadingMedia.has(mediaId);

      if (isLoading) {
        // Показываем индикатор загрузки
        parts.push(
          <span
            key={`loading-${mediaId}-${matchStart}`}
            className="inline-flex items-center gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 mx-0.5 sm:mx-1 my-0.5 
                       bg-gray-100 border border-gray-200 rounded-md sm:rounded-lg 
                       text-gray-500 text-xs sm:text-sm"
          >
            <svg
              className="animate-spin h-3 w-3 sm:h-4 sm:w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="hidden xs:inline">Загрузка...</span>
          </span>
        );
      } else if (mediaUrl) {
        if (mediaType === "IMAGE") {
          parts.push(
            <button
              key={`image-${mediaId}-${matchStart}`}
              onClick={() =>
                handleImageClick(mediaUrl, `Изображение ${mediaId}`)
              }
              onMouseEnter={(e) => handleMouseEnter(e, mediaUrl, "image")}
              onMouseLeave={handleMouseLeave}
              className="inline-flex items-center gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 mx-0.5 sm:mx-1 my-0.5 
                         bg-blue-50 hover:bg-blue-100 active:bg-blue-200
                         border border-blue-200 hover:border-blue-300
                         rounded-md sm:rounded-lg 
                         text-blue-600 hover:text-blue-700
                         text-xs sm:text-sm 
                         transition-all duration-200 
                         cursor-pointer
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
                         touch-manipulation"
              title="Нажмите для просмотра изображения"
              aria-label="Открыть изображение"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 256 256"
                className="shrink-0 sm:w-4 sm:h-4"
              >
                <path
                  fill="currentColor"
                  d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,160H40V56H216V200ZM176,88a12,12,0,1,1-12-12A12,12,0,0,1,176,88Zm36,72v40H44V184l52-52a8,8,0,0,1,11.31,0l44. 69,44.69L191,137l. 66-. 66a8,8,0,0,1,11.31,0Z"
                />
              </svg>
              <span className="hidden xs:inline">Изображение</span>
            </button>
          );
        } else if (mediaType === "VIDEO") {
          parts.push(
            <button
              key={`video-${mediaId}-${matchStart}`}
              onClick={() => handleVideoClick(mediaUrl, `Видео ${mediaId}`)}
              onMouseEnter={(e) => handleMouseEnter(e, mediaUrl, "video")}
              onMouseLeave={handleMouseLeave}
              className="inline-flex items-center gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 mx-0.5 sm:mx-1 my-0.5 
                         bg-red-50 hover:bg-red-100 active:bg-red-200
                         border border-red-200 hover:border-red-300
                         rounded-md sm:rounded-lg 
                         text-red-600 hover:text-red-700
                         text-xs sm:text-sm 
                         transition-all duration-200 
                         cursor-pointer
                         focus: outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1
                         touch-manipulation"
              title="Нажмите для просмотра видео"
              aria-label="Открыть видео"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 256 256"
                className="shrink-0 sm:w-4 sm: h-4"
              >
                <path
                  fill="currentColor"
                  d="M224,56v144a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V56A16,16,0,0,1,48,40h160A16,16,0,0,1,224,56Zm-16,0H48V200h160ZM102,140l44-32a8,8,0,0,0,0-13.06l-44-32A8,8,0,0,0,88,64V176A8,8,0,0,0,102,140Z"
                />
              </svg>
              <span className="hidden xs:inline">Видео</span>
            </button>
          );
        }
      } else {
        const mediaLabel = mediaType === "IMAGE" ?  "Изображение" : "Видео";
        parts. push(
          <span
            key={`missing-${mediaId}-${matchStart}`}
            className="inline-flex items-center gap-1 px-2 py-1 mx-0.5 my-0.5
                       bg-gray-100 border border-gray-200 rounded-md 
                       text-gray-500 text-xs sm:text-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 256 256"
            >
              <path
                fill="currentColor"
                d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm-8-80V80a8,8,0,0,1,16,0v56a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,172Z"
              />
            </svg>
            <span className="hidden sm:inline">{mediaLabel} недоступно</span>
            <span className="sm:hidden">N/A</span>
          </span>
        );
      }

      lastIndex = matchStart + fullMatch.length;
    }

    if (lastIndex < content.length) {
      const textAfter = content.slice(lastIndex);
      parts.push(renderText(textAfter, `text-end-${lastIndex}`));
    }

    return parts;
  }, [
    content,
    mediaMap,
    loadingMedia,
    isHtmlContent,
    handleImageClick,
    handleVideoClick,
    handleMouseEnter,
    handleMouseLeave,
  ]);

  return (
    <>
      <div
        ref={containerRef}
        className="prose prose-sm max-w-none text-gray-700 leading-relaxed
                   prose-headings:text-gray-900 prose-headings: font-bold
                   prose-h1:text-xl prose-h1:sm:text-2xl prose-h1:lg:text-3xl
                   prose-h2:text-lg prose-h2:sm:text-xl prose-h2:lg:text-2xl
                   prose-h3:text-base prose-h3:sm:text-lg
                   prose-p:text-sm prose-p: sm:text-base
                   prose-ul:pl-4 prose-ul:sm:pl-6
                   prose-li:text-sm prose-li: sm:text-base"
      >
        {renderContent}
      </div>

      {hoverPreview && (
        <div
          className="hidden md:block fixed pointer-events-none animate-fadeIn"
          style={{
            left: hoverPreview.x,
            top: hoverPreview.y,
            transform: "translateX(-50%)",
            zIndex: 100,
          }}
        >
          <div className="bg-white p-1 rounded-xl shadow-2xl border border-gray-200">
            {hoverPreview.type === "image" ?  (
              <img
                src={hoverPreview.url}
                alt="Preview"
                className="max-w-[200px] lg:max-w-[280px] max-h-[150px] lg:max-h-[200px] object-contain rounded-lg"
              />
            ) : (
              <video
                src={hoverPreview. url}
                className="max-w-[200px] lg:max-w-[280px] max-h-[150px] lg:max-h-[200px] object-contain rounded-lg"
                controls
              />
            )}
          </div>
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-l border-t border-gray-200 rotate-45" />
        </div>
      )}

      <ImageModal
        isOpen={!!modalImage}
        imageUrl={modalImage?.url || ""}
        alt={modalImage?.alt}
        onClose={() => setModalImage(null)}
      />

      {modalVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          onClick={() => setModalVideo(null)}
        >
          <div
            className="relative bg-black rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModalVideo(null)}
              className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 hover: bg-gray-100 transition-colors"
              aria-label="Закрыть"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 256 256"
                fill="currentColor"
              >
                <path d="M202.83,74.83a8,8,0,0,0-11.66,0L128,137. 17,64.83,74.83a8,8,0,0,0-11.66,11.66L116. 34,128,53.17,191.17a8,8,0,0,0,11.66,11.66L128,139.83l63.17,63.17a8,8,0,0,0,11.66-11.66L139.66,128l63.17-63.17A8,8,0,0,0,202.83,74.83Z" />
              </svg>
            </button>
            <video
              src={modalVideo.url}
              controls
              autoPlay
              className="w-full h-auto max-h-[90vh] rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
}