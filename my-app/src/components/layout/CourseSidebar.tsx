"use client";

import React, { useState } from "react";
import Link from "next/link";

interface Module {
  id: string;
  title: string;
  duration: string;
  lessons: string[];
}

interface CourseSidebarProps {
  modules: Module[];
  selectedModuleId?: string;
  onSelectModule?: (moduleId: string) => void;
  courseId?: string;
}

export const CourseSidebar: React.FC<CourseSidebarProps> = ({
  modules,
  selectedModuleId,
  onSelectModule,
  courseId,
}) => {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set()
  );

  const toggleExpanded = (moduleId: string) => {
    setExpandedModules((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  const handleSelectModule = (moduleId: string) => {
    onSelectModule?.(moduleId);
    if (courseId) {
      const moduleIdx = modules.findIndex((m) => m.id === moduleId);
      localStorage.setItem(
        `course_${courseId}_lastModule`,
        moduleIdx.toString()
      );
    }
  };

  return (
    <aside className="w-80 bg-white border-r border-gray-200 overflow-y-auto flex flex-col animate-fadeIn">
      {/* Course Modules Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 256 256"
              className="text-blue-600"
            >
              <path
                fill="currentColor"
                d="M232,64H176V48a24,24,0,0,0-24-24H104A24,24,0,0,0,80,48V64H24A8,8,0,0,0,16,72V200a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V72A8,8,0,0,0,232,64ZM96,48a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8V64H96ZM224,200H32V80H224Z"
              />
            </svg>
          </div>
          <h3 className="font-bold text-lg text-gray-900">Содержание</h3>
        </div>
        <p className="text-xs text-gray-500 ml-11">{modules.length} модулей</p>
      </div>

      {/* Modules List */}
      <div className="flex-1 p-4 space-y-2 overflow-y-auto">
        {modules.map((module, idx) => (
          <div
            key={module.id}
            className="animate-fadeInUp"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <button
              onClick={() => {
                handleSelectModule(module.id);
                toggleExpanded(module.id);
              }}
              className={`w-full text-left p-4 rounded-xl transition-all duration-300 group ${
                selectedModuleId === module.id
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20"
                  : "bg-gray-50 text-gray-900 hover:bg-gray-100 hover:shadow-md"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-md flex items-center justify-center ${
                        selectedModuleId === module.id
                          ? "bg-white/20 text-white"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <h4 className="font-semibold text-sm line-clamp-2 leading-tight">
                      {module.title.replace(/^Модуль \d+:\s*/i, "")}
                    </h4>
                  </div>
                  <div
                    className={`flex items-center gap-3 text-xs ml-9 ${
                      selectedModuleId === module.id
                        ? "text-blue-100"
                        : "text-gray-500"
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 256 256"
                      >
                        <path
                          fill="currentColor"
                          d="M224,48H32A16,16,0,0,0,16,64V192a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V64A16,16,0,0,0,224,48Zm0,144H32V64H224V192ZM48,104a8,8,0,0,1,8-8H200a8,8,0,0,1,0,16H56A8,8,0,0,1,48,104Zm0,32a8,8,0,0,1,8-8H200a8,8,0,0,1,0,16H56A8,8,0,0,1,48,136Z"
                        />
                      </svg>
                      {module.lessons.length} уроков
                    </span>
                    <span className="flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 256 256"
                      >
                        <path
                          fill="currentColor"
                          d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z"
                        />
                      </svg>
                      {module.duration}
                    </span>
                  </div>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 256 256"
                  className={`mt-1 transition-transform duration-300 shrink-0 ml-2 ${
                    expandedModules.has(module.id) ? "rotate-90" : ""
                  } ${
                    selectedModuleId === module.id
                      ? "text-white"
                      : "text-gray-400 group-hover:text-gray-600"
                  }`}
                >
                  <path
                    fill="currentColor"
                    d="M184.49,136.49l-80,80a12,12,0,0,1-17-17L159,128,87.51,56.49a12,12,0,1,1,17-17l80,80A12,12,0,0,1,184.49,136.49Z"
                  />
                </svg>
              </div>
            </button>

            {/* Expanded lessons list */}
            {expandedModules.has(module.id) && (
              <div className="ml-4 mt-2 space-y-1 border-l-2 border-blue-200 pl-4 animate-fadeIn">
                {module.lessons.map((lesson, lessonIdx) => (
                  <div
                    key={lessonIdx}
                    className="text-xs text-gray-600 py-2 px-3 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-all flex items-center gap-2 group"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 256 256"
                      className="text-gray-400 group-hover:text-blue-500 transition-colors shrink-0"
                    >
                      <path
                        fill="currentColor"
                        d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm48.49-90.83-48-32A8,8,0,0,0,116,100v64a8,8,0,0,0,12.49,6.62l48-32a8,8,0,0,0,0-13.24Z"
                      />
                    </svg>
                    <span className="line-clamp-1">{lesson}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Course Navigation Footer */}
      <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-transparent border-t border-gray-100 p-4">
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-600 hover:text-blue-600 transition rounded-xl hover:bg-blue-50 group"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 256 256"
            className="group-hover:text-blue-600 transition-colors"
          >
            <path
              fill="currentColor"
              d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"
            />
          </svg>
          К главной
        </Link>
      </div>
    </aside>
  );
};
