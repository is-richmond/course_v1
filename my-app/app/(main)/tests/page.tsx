"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Footer } from "@/src/components/layout/Footer";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { testsAPI, combinedTestsAPI } from "@/src/lib/api";
import {
  loadTestStatusFromStorage,
  getStatusColorClass,
  formatPercentage,
} from "@/src/lib/testUtils";
import type {
  TestResponse,
  TestType,
  CombinedTestResponse,
} from "@/src/types/api";

interface TestWithStatus extends TestResponse {
  hasEverPassed: boolean;
  lastPercentage: number | null;
  bestPercentage: number | null;
  attemptCount: number;
}

export default function TestsPage() {
  const router = useRouter();
  const [tests, setTests] = useState<TestWithStatus[]>([]);
  const [combinedTests, setCombinedTests] = useState<CombinedTestResponse[]>(
    []
  );
  const [filteredTests, setFilteredTests] = useState<TestWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | TestType>("all");

  const completedCount = filteredTests.filter((t) => t.hasEverPassed).length;
  const remainingCount = filteredTests.length - completedCount;

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const apiTests = await testsAPI.list();

        // Filter out course_test - those are shown in courses only
        const publicTests = apiTests.filter(
          (test) => test.test_type !== "course_test"
        );

        const enrichedTests: TestWithStatus[] = publicTests.map((test) => {
          const stored = loadTestStatusFromStorage(test.id);
          return {
            ...test,
            hasEverPassed: stored?.hasEverPassed ?? false,
            lastPercentage: stored?.lastPercentage ?? null,
            bestPercentage: stored?.bestPercentage ?? null,
            attemptCount: stored?.attemptCount ?? 0,
          };
        });

        setTests(enrichedTests);
        setFilteredTests(enrichedTests);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch tests:", err);
        setError("Не удалось загрузить тесты");
      } finally {
        setIsLoading(false);
      }
    };

    const fetchCombinedTests = async () => {
      try {
        const data = await combinedTestsAPI.getMyTests();
        setCombinedTests(data);
      } catch (err) {
        console.error("Failed to fetch combined tests:", err);
      }
    };

    fetchTests();
    fetchCombinedTests();
  }, []);

  useEffect(() => {
    if (activeFilter === "all") {
      setFilteredTests(tests);
    } else {
      setFilteredTests(tests.filter((t) => t.test_type === activeFilter));
    }
  }, [activeFilter, tests]);

  const getTestTypeBadge = (testType: TestType) => {
    switch (testType) {
      case "weekly":
        return (
          <span className="inline-flex items-center px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded font-medium">
            Недельный тест
          </span>
        );
      case "for_combined":
        return (
          <span className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded font-medium">
            По темам
          </span>
        );
      case "course_test":
        return (
          <span className="inline-flex items-center px-2 py-1 bg-green-50 text-green-700 text-xs rounded font-medium">
            Тест курса
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen flex flex-col">
        {/* Header provided by ResponsiveLayout */}
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 text-sm sm:text-base">
              Загрузка тестов...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white min-h-screen flex flex-col">
        {/* Header provided by ResponsiveLayout */}
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 256 256"
                className="text-red-500 sm:w-10 sm:h-10"
              >
                <path
                  fill="currentColor"
                  d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm-8-80V80a8,8,0,0,1,16,0v56a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,172Z"
                />
              </svg>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              {error}
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="min-h-[44px]"
            >
              Попробовать снова
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* Header provided by ResponsiveLayout */}

      <main className="flex-1 pt-12 sm:pt-16 md:pt-20">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
          {/* Page title */}
          <div className="mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Доступные тесты
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              Проверьте свои знания с помощью наших интерактивных тестов
            </p>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setActiveFilter("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeFilter === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Все тесты
              </button>
              <button
                onClick={() => setActiveFilter("weekly")}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeFilter === "weekly"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Недельные
              </button>
              <button
                onClick={() => setActiveFilter("for_combined")}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeFilter === "for_combined"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                По темам
              </button>
            </div>
          </div>

          {/* Stats cards - responsive grid */}
          <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-8 sm:mb-12">
            <Card>
              <CardContent className="p-3 sm:pt-6">
                <div className="text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 48 48"
                    className="mx-auto mb-2 sm:mb-3 sm:w-8 sm:h-8"
                  >
                    <path d="M38 4H32V2C32 1.46957 31.7893 0.960859 31.4142 0.585786C31.0391 0.210714 30.5304 0 30 0H10C9.46957 0 8.96086 0.210714 8.58579 0.585786C8.21071 0.960859 8 1.46957 8 2V4H2C1.46957 4 0.960859 4.21071 0.585786 4.58579C0.210714 4.96086 0 5.46957 0 6V12C0 14.1217 0.842855 16.1566 2.34315 17.6569C3.84344 19.1571 5.87827 20 8 20H11.08C12.8891 22.0183 15.3281 23.3647 18 23.82V28H16C14.4087 28 12.8826 28.6321 11.7574 29.7574C10.6321 30.8826 10 32.4087 10 34V38C10 38.5304 10.2107 39.0391 10.5858 39.4142C10.9609 39.7893 11.4696 40 12 40H28C28.5304 40 29.0391 39.7893 29.4142 39.4142C29.7893 39.0391 30 38.5304 30 38V34C30 32.4087 29.3679 30.8826 28.2426 29.7574C27.1174 28.6321 25.5913 28 24 28H22V23.82C24.6719 23.3647 27.1109 22.0183 28.92 20H32C34.1217 20 36.1566 19.1571 37.6569 17.6569C39.1571 16.1566 40 14.1217 40 12V6C40 5.46957 39.7893 4.96086 39.4142 4.58579C39.0391 4.21071 38.5304 4 38 4ZM8 16C6.93913 16 5.92172 15.5786 5.17157 14.8284C4.42143 14.0783 4 13.0609 4 12V8H8V12C8.0044 13.3634 8.24112 14.7161 8.7 16H8ZM24 32C24.5304 32 25.0391 32.2107 25.4142 32.5858C25.7893 32.9609 26 33.4696 26 34V36H14V34C14 33.4696 14.2107 32.9609 14.5858 32.5858C14.9609 32.2107 15.4696 32 16 32H24ZM28 12C28 14.1217 27.1571 16.1566 25.6569 17.6569C24.1566 19.1571 22.1217 20 20 20C17.8783 20 15.8434 19.1571 14.3431 17.6569C12.8429 16.1566 12 14.1217 12 12V4H28V12ZM36 12C36 13.0609 35.5786 14.0783 34.8284 14.8284C34.0783 15.5786 33.0609 16 32 16H31.3C31.7589 14.7161 31.9956 13.3634 32 12V8H36V12Z" fill="#196BC4"/>
                  </svg>

                  <p className="text-xs sm:text-sm text-gray-600 mb-0.5 sm:mb-1">
                    Всего
                  </p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                    {filteredTests.length}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:pt-6">
                <div className="text-center">
                  <svg width="65" height="65" viewBox="0 0 65 65" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-2 sm:mb-3 sm:w-8 sm:h-8"
                  >
                    <path d="M26.6504 46.2583C25.9322 46.2581 25.2434 45.9727 24.7356 45.4648L14.3356 35.0647C14.0769 34.8149 13.8706 34.5161 13.7287 34.1856C13.5867 33.8552 13.512 33.4998 13.5089 33.1402C13.5058 32.7806 13.5743 32.424 13.7105 32.0911C13.8466 31.7583 14.0477 31.4559 14.302 31.2016C14.5563 30.9473 14.8587 30.7462 15.1916 30.61C15.5244 30.4738 15.881 30.4053 16.2407 30.4084C16.6003 30.4116 16.9557 30.4863 17.2861 30.6282C17.6165 30.7702 17.9154 30.9765 18.1652 31.2352L26.6504 39.7204L46.8356 19.5352C47.3464 19.0418 48.0305 18.7688 48.7407 18.775C49.4508 18.7812 50.1301 19.066 50.6322 19.5682C51.1343 20.0703 51.4192 20.7496 51.4254 21.4597C51.4315 22.1698 51.1585 22.8539 50.6652 23.3647L28.5652 45.4648C28.0574 45.9727 27.3686 46.2581 26.6504 46.2583Z" fill="#196BC4"/>

                  </svg>
                  <p className="text-xs sm:text-sm text-gray-600 mb-0.5 sm:mb-1">
                    Пройдено
                  </p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                    {completedCount}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:pt-6">
                <div className="text-center">
                  <svg width="34" height="38" viewBox="0 0 34 38" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto text-orange-600 mb-2 sm:mb-3 sm:w-8 sm:h-8"
                  >
                    <path d="M13.2222 3.61905C12.687 3.61905 12.2387 3.44533 11.8773 3.0979C11.5159 2.75048 11.3346 2.32102 11.3333 1.80952C11.3321 1.29803 11.5134 0.868571 11.8773 0.521143C12.2413 0.173714 12.6896 0 13.2222 0H20.7778C21.313 0 21.7619 0.173714 22.1246 0.521143C22.4872 0.868571 22.6679 1.29803 22.6667 1.80952C22.6654 2.32102 22.4841 2.75108 22.1227 3.09971C21.7613 3.44835 21.313 3.62146 20.7778 3.61905H13.2222ZM17 23.5238C17.5352 23.5238 17.9841 23.3501 18.3468 23.0027C18.7094 22.6552 18.8901 22.2258 18.8889 21.7143V14.4762C18.8889 13.9635 18.7076 13.534 18.3449 13.1878C17.9822 12.8416 17.5339 12.6679 17 12.6667C16.4661 12.6655 16.0178 12.8392 15.6551 13.1878C15.2924 13.5364 15.1111 13.9659 15.1111 14.4762V21.7143C15.1111 22.227 15.2924 22.657 15.6551 23.0045C16.0178 23.3519 16.4661 23.525 17 23.5238ZM17 38C14.6704 38 12.4742 37.5705 10.4116 36.7116C8.34889 35.8527 6.54689 34.6837 5.00556 33.2048C3.46422 31.7258 2.24463 29.9989 1.34678 28.0241C0.448926 26.0493 0 23.946 0 21.7143C0 19.4825 0.448926 17.3787 1.34678 15.4027C2.24463 13.4267 3.46422 11.7004 5.00556 10.2238C6.54689 8.74724 8.34952 7.57889 10.4134 6.71876C12.4774 5.85863 14.6729 5.42857 17 5.42857C18.9519 5.42857 20.825 5.73016 22.6194 6.33333C24.4139 6.93651 26.0981 7.81111 27.6722 8.95714L28.9944 7.69047C29.3407 7.35873 29.7815 7.19286 30.3167 7.19286C30.8518 7.19286 31.2926 7.35873 31.6389 7.69047C31.9852 8.02222 32.1583 8.44444 32.1583 8.95714C32.1583 9.46984 31.9852 9.89206 31.6389 10.2238L30.3167 11.4905C31.513 12.9984 32.4259 14.6119 33.0556 16.3309C33.6852 18.05 34 19.8444 34 21.7143C34 23.946 33.5511 26.0499 32.6532 28.0259C31.7554 30.0019 30.5358 31.7282 28.9944 33.2048C27.4531 34.6813 25.6505 35.8503 23.5866 36.7116C21.5226 37.5729 19.3271 38.0024 17 38ZM17 34.3809C20.6519 34.3809 23.7685 33.1444 26.35 30.6714C28.9315 28.1984 30.2222 25.2127 30.2222 21.7143C30.2222 18.2159 28.9315 15.2302 26.35 12.7571C23.7685 10.2841 20.6519 9.04762 17 9.04762C13.3481 9.04762 10.2315 10.2841 7.65 12.7571C5.06852 15.2302 3.77778 18.2159 3.77778 21.7143C3.77778 25.2127 5.06852 28.1984 7.65 30.6714C10.2315 33.1444 13.3481 34.3809 17 34.3809Z" fill="#196BC4"/>
                  </svg>
                  <p className="text-xs sm:text-sm text-gray-600 mb-0.5 sm:mb-1">
                    Осталось
                  </p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                    {remainingCount}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tests Grid */}
          {filteredTests.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 256 256"
                  className="text-gray-400 sm:w-10 sm:h-10"
                >
                  <path
                    fill="currentColor"
                    d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm-8-80V80a8,8,0,0,1,16,0v56a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,172Z"
                  />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                Тесты не найдены
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                {activeFilter === "all"
                  ? "Пока нет доступных тестов"
                  : "Нет тестов данного типа"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {filteredTests.map((test) => {
                const statusColors = getStatusColorClass(test.hasEverPassed);

                return (
                  <Card
                    key={test.id}
                    className="hover:shadow-lg transition group"
                  >
                    <CardContent className="p-4 sm:pt-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
                        <div className="flex-1">
                          <div className="flex items-start gap-2 mb-2">
                            {getTestTypeBadge(test.test_type)}
                            {test.attemptCount > 0 && (
                              <div
                                className={`shrink-0 flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${statusColors.bg} ${statusColors.text}`}
                              >
                                {test.hasEverPassed ? "✓" : "✗"}
                                <span className="hidden sm:inline">
                                  {test.hasEverPassed
                                    ? "Пройден"
                                    : "Не пройден"}
                                </span>
                              </div>
                            )}
                          </div>
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                            {test.title}
                          </h3>
                          {test.description && (
                            <p
                              className={`text-xs sm:text-sm text-gray-600 ${
                                test.test_type === "weekly"
                                  ? "line-clamp-3"
                                  : "line-clamp-2"
                              }`}
                            >
                              {test.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-4 sm:mb-6 py-3 sm:py-4 border-y border-gray-200">
                        <div className="text-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 256 256"
                            className="mx-auto text-blue-600 mb-1"
                          >
                            <path
                              fill="currentColor"
                              d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"
                            />
                          </svg>
                          <p className="text-xs sm:text-sm font-semibold text-gray-900">
                            {test.passing_score}%
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-600">
                            проходной
                          </p>
                        </div>
                        <div className="text-center">
                          {test.lastPercentage !== null ? (
                            <>
                              <p
                                className={`text-lg sm:text-xl font-bold ${
                                  test.hasEverPassed
                                    ? "text-green-600"
                                    : "text-gray-900"
                                }`}
                              >
                                {formatPercentage(test.lastPercentage)}
                              </p>
                              <p className="text-[10px] sm:text-xs text-gray-600">
                                ваш результат
                              </p>
                            </>
                          ) : (
                            <>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 256 256"
                                className="mx-auto text-blue-600 mb-1"
                              >
                                <path
                                  fill="currentColor"
                                  d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z"
                                />
                              </svg>
                              <p className="text-xs sm:text-sm font-semibold text-gray-900">
                                30 мин
                              </p>
                              <p className="text-[10px] sm:text-xs text-gray-600">
                                время
                              </p>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Action - always show retake button */}
                      {test.hasEverPassed ? (
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">
                              Лучший результат
                            </p>
                            <p className="text-lg sm:text-xl font-bold text-green-600">
                              {test.bestPercentage !== null
                                ? formatPercentage(test.bestPercentage)
                                : "✓ Пройден"}
                            </p>
                          </div>
                          <Link href={`/tests/${test.id}`}>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="min-h-[40px] sm:min-h-[36px]"
                            >
                              Пройти снова
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <Link href={`/tests/${test.id}`} className="w-full">
                          <Button
                            variant="primary"
                            className="w-full flex items-center justify-center gap-2 min-h-[44px] sm:min-h-[40px]"
                          >
                            {test.attemptCount > 0
                              ? "Пройти снова"
                              : "Начать тест"}
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 256 256"
                            >
                              <path
                                fill="currentColor"
                                d="M184.49,136.49l-80,80a12,12,0,0,1-17-17L159,128,87.51,56.49a12,12,0,1,1,17-17l80,80A12,12,0,0,1,184.49,136.49Z"
                              />
                            </svg>
                          </Button>
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Combined Tests Section */}
          <div className="mt-12 sm:mt-16 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Мои комбинированные тесты
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Создавайте собственные тесты из вопросов по темам
                </p>
              </div>
              <Button
                onClick={() => router.push("/tests/create-combined")}
                className="min-h-[44px]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 256 256"
                  className="mr-2"
                >
                  <path
                    fill="currentColor"
                    d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"
                  />
                </svg>
                <span className="hidden sm:inline">Создать тест</span>
                <span className="sm:hidden">Создать</span>
              </Button>
            </div>

            {combinedTests.length === 0 ? (
              <Card>
                <CardContent className="p-8 sm:p-12 text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 256 256"
                      className="text-blue-600"
                    >
                      <path
                        fill="currentColor"
                        d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,160H40V56H216V200Z M176,88a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h80A8,8,0,0,1,176,88Zm0,32a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h80A8,8,0,0,1,176,120Zm0,32a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h80A8,8,0,0,1,176,152Z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                    У вас пока нет комбинированных тестов
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base mb-6">
                    Создайте свой первый тест, комбинируя вопросы из тестов по
                    темам
                  </p>
                  <Button
                    onClick={() => router.push("/tests/create-combined")}
                    className="min-h-[44px]"
                  >
                    Создать комбинированный тест
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {combinedTests.map((test) => (
                  <Card
                    key={test.id}
                    className="hover:shadow-lg transition group"
                  >
                    <CardContent className="p-4 sm:p-6">
                      <div className="mb-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors flex-1">
                            {test.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 256 256"
                          >
                            <path
                              fill="currentColor"
                              d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z"
                            />
                          </svg>
                          {test.total_questions} вопросов
                        </div>
                        <div className="text-xs text-gray-500 mb-3">
                          {new Date(test.created_at).toLocaleDateString(
                            "ru-RU"
                          )}
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-2">Темы:</p>
                        <div className="flex flex-wrap gap-2">
                          {test.source_tests.map((source) => (
                            <span
                              key={source.source_test_id}
                              className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                            >
                              {source.source_test_title} (
                              {source.questions_count})
                            </span>
                          ))}
                        </div>
                      </div>

                      <Button
                        onClick={() =>
                          router.push(`/tests/combined/${test.id}`)
                        }
                        className="w-full min-h-[40px]"
                      >
                        Пройти тест
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
