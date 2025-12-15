"use client";

import React, { useState } from "react";

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  items: TabItem[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ items, defaultTab, onChange }) => {
  const [activeTab, setActiveTab] = useState(defaultTab || items[0]?.id || "");

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  return (
    <div className="w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      {/* Tab Headers */}
      <div className="flex gap-0 bg-white border-b border-gray-200">
        {items.map((item, index) => (
          <button
            key={item.id}
            onClick={() => handleTabChange(item.id)}
            className={`flex-1 px-6 py-4 font-medium transition-all duration-300 ${
              activeTab === item.id
                ? "text-white bg-blue-700"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            } ${index !== items.length - 1 ? "border-r border-gray-200" : ""}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white">
        {items.map((item) => (
          <div
            key={item.id}
            className={`transition-opacity duration-200 ${
              activeTab === item.id ? "block" : "hidden"
            }`}
          >
            {item.content}
          </div>
        ))}
      </div>
    </div>
  );
};
