"use client";

import React, { useState, createContext, useContext } from "react";
import { useAuth } from "@/src/contexts/AuthContext";
import { Header } from "./Header";
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
  const { isAuthenticated, isLoading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const contextValue: SidebarContextType = {
    isOpen: isSidebarOpen,
    toggle: () => setIsSidebarOpen((prev) => !prev),
    close: () => setIsSidebarOpen(false),
  };

  // Loading state - show minimal UI
  if (isLoading) {
    return (
      <>
        <Header showUserMenu={false} />
        <main className="min-h-screen pt-14">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Загрузка...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  // GUEST LAYOUT - no authentication
  if (!isAuthenticated) {
    return (
      <>
        <Header showUserMenu={false} />
        <main className="min-h-screen pt-14 transition-[margin] duration-300">
          {children}
        </main>
      </>
    );
  }

  // AUTHENTICATED LAYOUT - with Sidebar
  return (
    <SidebarContext.Provider value={contextValue}>
      <Header showUserMenu={true} />

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
