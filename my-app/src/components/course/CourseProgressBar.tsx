"use client";

import React from "react";

interface CourseProgressBarProps {
  completedLessons: number;
  totalLessons: number;
  className?: string;
  variant?: "light" | "dark";
}

/**
 * CourseProgressBar - адаптивный прогресс-бар курса
 * - Mobile-first дизайн
 * - Светлый и тёмный варианты
 * - Плавная анимация прогресса
 */
export function CourseProgressBar({
  completedLessons,
  totalLessons,
  className = "",
  variant = "light",
}: CourseProgressBarProps) {
  const percentage =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const isLight = variant === "light";

  return (
    <div className={className}>
      {/* Header - адаптивный текст */}
      <div className="flex items-center justify-between mb-2">
        <span
          className={`text-xs sm:text-sm font-semibold ${
            isLight ? "text-gray-700" : "text-white"
          }`}
        >
          Прогресс курса
        </span>
        <span
          className={`text-xs sm:text-sm font-medium ${
            isLight ? "text-gray-600" : "text-white/90"
          }`}
        >
          <span className="hidden xs:inline">
            {completedLessons} / {totalLessons} уроков
          </span>
          <span className="xs:hidden">
            {completedLessons}/{totalLessons}
          </span>
          <span className="ml-1 font-bold">({percentage}%)</span>
        </span>
      </div>

      {/* Progress bar */}
      <div
        className={`h-2 sm:h-2.5 rounded-full overflow-hidden ${
          isLight ? "bg-gray-200" : "bg-white/20"
        }`}
      >
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Прогресс курса: ${percentage}%`}
        />
      </div>

      {/* Completion message */}
      {percentage === 100 && (
        <p
          className={`font-semibold text-xs mt-2 flex items-center gap-1 ${
            isLight ? "text-green-600" : "text-green-400"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 256 256"
            className="shrink-0"
          >
            <path
              fill="currentColor"
              d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34Z"
            />
          </svg>
          Курс завершён!
        </p>
      )}
    </div>
  );
}
