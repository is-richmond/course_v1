"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";

// Hamburger menu button for mobile
const HamburgerButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="fixed top-4 left-4 z-50 p-2 bg-blue-900 text-white rounded-lg shadow-lg lg:hidden hover:bg-blue-800 transition-colors"
    aria-label="Открыть меню"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 256 256"
    >
      <path
        fill="currentColor"
        d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z"
      />
    </svg>
  </button>
);

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar - always visible on lg+ */}
      <Sidebar />

      {/* Mobile Sidebar - controlled by state */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Hamburger button for mobile */}
      <HamburgerButton onClick={() => setIsSidebarOpen(true)} />

      {/* Main content area - responsive margin */}
      <main className="min-h-screen lg:ml-64 transition-[margin] duration-300">
        {children}
      </main>
    </>
  );
};
