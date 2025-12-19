"use client";

import React, { useState, createContext, useContext } from "react";
import { Sidebar } from "./Sidebar";

// Context for sidebar state management
interface SidebarContextType {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
}

const SidebarContext = createContext<SidebarContextType | null>(null);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within ResponsiveLayout");
  }
  return context;
};

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const contextValue: SidebarContextType = {
    isOpen: isSidebarOpen,
    toggle: () => setIsSidebarOpen((prev) => !prev),
    close: () => setIsSidebarOpen(false),
  };

  return (
    <SidebarContext.Provider value={contextValue}>
      {/* Desktop Sidebar - always visible on lg+ */}
      <Sidebar />

      {/* Mobile Sidebar - controlled by state */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main content area - responsive margin + top padding for fixed header */}
      <main className="min-h-screen lg:ml-64 pt-14 transition-[margin] duration-300">
        {children}
      </main>
    </SidebarContext.Provider>
  );
};
