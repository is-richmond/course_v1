"use client";

import React from "react";

/**
 * Fullscreen layout for lesson pages.
 * No Header, Footer, or Sidebar - just the lesson content.
 */
export default function LessonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-gray-50">{children}</div>;
}
