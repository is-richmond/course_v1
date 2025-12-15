"use client";

import React from "react";
import { Settings } from "lucide-react";

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 bg-white border-b border-gray-200 shadow-sm z-30">
      <div className="px-6 py-4 flex items-center justify-end">
        {/* Right Section - User Controls */}
        <div className="flex items-center gap-6">
          {/* Settings */}
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
            <Settings size={20} />
          </button>

          {/* User Avatar */}
          <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
            <div className="text-right">
              <p className="font-medium text-gray-900 text-sm">Иван Петров</p>
              <p className="text-xs text-gray-500">Студент</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              ИП
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
