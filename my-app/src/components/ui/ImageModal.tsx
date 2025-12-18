"use client";

import React, { useEffect, useCallback, useState, useRef } from "react";
import { createPortal } from "react-dom";

interface ImageModalProps {
  isOpen: boolean;
  imageUrl: string;
  alt?: string;
  onClose: () => void;
}

/**
 * ImageModal - полноэкранный просмотр изображения
 * - Изображение по центру экрана
 * - Затемнённый фон
 * - Поддержка zoom колёсиком мыши
 * - Адаптивный дизайн (mobile-first)
 * - z-index: 9999 для отображения поверх всего
 */
export function ImageModal({
  isOpen,
  imageUrl,
  alt,
  onClose,
}: ImageModalProps) {
  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);

  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "+" || e.key === "=")
        setScale((prev) => Math.min(prev * 1.2, 5));
      if (e.key === "-") {
        setScale((prev) => {
          const newScale = prev / 1.2;
          if (newScale <= 1) setPosition({ x: 0, y: 0 });
          return Math.max(newScale, 0.5);
        });
      }
      if (e.key === "0") {
        setScale(1);
        setPosition({ x: 0, y: 0 });
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  // Zoom with mouse wheel
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setScale((prev) => {
      const newScale = Math.min(Math.max(prev * zoomFactor, 0.5), 5);
      if (newScale <= 1) setPosition({ x: 0, y: 0 });
      return newScale;
    });
  }, []);

  // Double click to zoom
  const handleDoubleClick = useCallback(() => {
    if (scale > 1) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    } else {
      setScale(2);
    }
  }, [scale]);

  // Dragging for panning when zoomed
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (scale > 1) {
        e.preventDefault();
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
      }
    },
    [scale, position]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging && scale > 1) {
        setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
      }
    },
    [isDragging, dragStart, scale]
  );

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  // Touch handlers for mobile
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (scale > 1 && e.touches.length === 1) {
        const touch = e.touches[0];
        setIsDragging(true);
        setDragStart({
          x: touch.clientX - position.x,
          y: touch.clientY - position.y,
        });
      }
    },
    [scale, position]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (isDragging && scale > 1 && e.touches.length === 1) {
        const touch = e.touches[0];
        setPosition({
          x: touch.clientX - dragStart.x,
          y: touch.clientY - dragStart.y,
        });
      }
    },
    [isDragging, dragStart, scale]
  );

  const handleTouchEnd = useCallback(() => setIsDragging(false), []);

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      // Only close if clicking on backdrop itself
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  // Zoom handlers
  const zoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev * 1.2, 5));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((prev) => {
      const newScale = prev / 1.2;
      if (newScale <= 1) setPosition({ x: 0, y: 0 });
      return Math.max(newScale, 0.5);
    });
  }, []);

  const resetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const setPresetZoom = useCallback((value: number) => {
    setScale(value);
    if (value <= 1) setPosition({ x: 0, y: 0 });
  }, []);

  if (!isOpen) return null;

  const scalePercent = Math.round(scale * 100);

  // Use portal to render modal at document body level
  // This ensures it's above all other elements regardless of their z-index
  return createPortal(
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-sm"
      style={{ zIndex: 9999 }}
      onClick={handleBackdropClick}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Controls - панель управления */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 py-2 sm:px-4 sm:py-3 bg-gradient-to-b from-black/80 to-transparent z-20 pointer-events-auto">
        {/* Zoom Controls - адаптивные кнопки */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Zoom Out */}
          <button
            type="button"
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="w-9 h-9 sm:w-10 sm:h-10 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-all active:scale-95"
            aria-label="Уменьшить"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
              <path d="M8 11h6" />
            </svg>
          </button>

          {/* Scale indicator */}
          <span className="text-white font-medium text-xs sm:text-sm min-w-[50px] sm:min-w-[60px] text-center bg-white/10 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full">
            {scalePercent}%
          </span>

          {/* Zoom In */}
          <button
            type="button"
            onClick={zoomIn}
            disabled={scale >= 5}
            className="w-9 h-9 sm:w-10 sm:h-10 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-all active:scale-95"
            aria-label="Увеличить"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
              <path d="M11 8v6" />
              <path d="M8 11h6" />
            </svg>
          </button>
        </div>

        {/* Presets - скрыты на мобильных */}
        <div className="hidden sm:flex items-center gap-1">
          {[
            { label: "Вписать", value: 1 },
            { label: "150%", value: 1.5 },
            { label: "200%", value: 2 },
          ].map((preset) => (
            <button
              type="button"
              key={preset.label}
              onClick={() => setPresetZoom(preset.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                Math.abs(scale - preset.value) < 0.05
                  ? "bg-white text-black"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Reset - скрыто на мобильных */}
          <button
            type="button"
            onClick={resetZoom}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white text-xs font-medium transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            Сбросить
          </button>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 sm:w-10 sm:h-10 bg-white/10 hover:bg-red-500/80 rounded-full flex items-center justify-center transition-all active:scale-95"
            aria-label="Закрыть"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Image Container - центрированное изображение */}
      <div
        className="absolute inset-0 flex items-center justify-center overflow-hidden p-4 sm:p-8 z-10"
        style={{
          cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in",
          paddingTop: "70px",
          paddingBottom: alt ? "60px" : "20px",
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          ref={imageRef}
          src={imageUrl}
          alt={alt || "Изображение"}
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl select-none transition-transform duration-150 ease-out"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: "center center",
          }}
          draggable={false}
        />
      </div>

      {/* Caption - подпись к изображению */}
      {alt && (
        <div className="absolute bottom-0 left-0 right-0 py-2 sm:py-3 text-center bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
          <p className="text-white/90 text-xs sm:text-sm px-4 line-clamp-2">
            {alt}
          </p>
        </div>
      )}

      {/* Hints - подсказки (только на desktop) */}
      <div className="hidden md:block absolute bottom-3 right-3 text-right pointer-events-none">
        <p className="text-white/40 text-[10px]">
          ESC — закрыть • Колёсико мыши — zoom
        </p>
        <p className="text-white/40 text-[10px]">
          Двойной клик — увеличить/сбросить
        </p>
        {scale > 1 && (
          <p className="text-white/50 text-[10px] font-medium">
            Перетаскивайте для навигации
          </p>
        )}
      </div>
    </div>,
    document.body
  );
}
