"use client";

import { ResponsiveLayout } from "@/src/components/layout/ResponsiveLayout";

/**
 * Layout for main pages (with sidebar).
 * All pages in the (main) route group will have the global navigation sidebar.
 */
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ResponsiveLayout>{children}</ResponsiveLayout>;
}
