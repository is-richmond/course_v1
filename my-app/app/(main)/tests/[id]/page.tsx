"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/src/components/layout/Header";
import { Footer } from "@/src/components/layout/Footer";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { testsAPI } from "@/src/lib/api";
import {
  calculatePercentage,
  isTestPassed,
  saveTestStatusToStorage,
  loadTestStatusFromStorage,
  formatPercentage,
  getStatusColorClass,
} from "@/src/lib/testUtils";
import type {
  TestWithQuestions,
  TestSubmission,
  TestResult,
} from "@/src/types/api";

export default function TestPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.id as string;

  const [test, setTest] = useState<TestWithQuestions | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Map<number, number[]>>(
    new Map()
  );
  const [isFinished, setIsFinished] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    totalPoints: number;
    percentage: number;
    passed: boolean;
    passingScore: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const fetchedTest = await testsAPI. getWithQuestions(parseInt(testId));
        setTest(fetchedTest);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch test:", err);
        setError("Не удалось загрузить тест");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTest();
  }, [testId]);

  const handleAnswerSelect = (optionId: number) => {
    if (! test) return;
    const question = test.questions[currentQuestion];
    const newAnswers = new Map(userAnswers);

    if (question.question_type === "single_choice") {
      newAnswers. set(question.id, [optionId]);
    } else {
      // multiple choice
      const current = newAnswers.get(question.id) || [];
      if (current.includes(optionId)) {
        newAnswers.set(
          question.id,
          current.filter((id) => id !== optionId)
        );
      } else {
        newAnswers.set(question.id, [...current, optionId]);
      }
    }
    setUserAnswers(newAnswers);
  };

  const handleNext = () => {
    if (!test) return;
    if (currentQuestion < test.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      finishTest();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const finishTest = async () => {
    if (!test) return;

    try {
      // Prepare submission
      const submission: TestSubmission = {
        answers: test.questions.map((q) => ({
          question_id: q.id,
          selected_option_ids: userAnswers.get(q.id) || [],
        })),
      };

      // Submit to API
      const apiResult:  TestResult = await testsAPI. submit(
        parseInt(testId),
        submission
      );

      // CRITICAL: Calculate percentage ourselves (don't trust backend `passed`)
      const percentage = calculatePercentage(
        apiResult.score,
        apiResult.total_points
      );
      const passed = isTestPassed(percentage, apiResult.passing_score);

      setResult({
        score: apiResult.score,
        totalPoints: apiResult.total_points,
        percentage,
        passed,
        passingScore: apiResult. passing_score,
      });

      // Save to localStorage with proper structure
      // Load existing status to check if user has ever passed
      const existingStatus = loadTestStatusFromStorage(parseInt(testId));
      const hasEverPassed = passed || (existingStatus?. hasEverPassed ??  false);
      const bestPercentage = Math.max(
        percentage,
        existingStatus?.bestPercentage ??  0
      );

      saveTestStatusToStorage(parseInt(testId), {
        hasEverPassed,
        currentAttemptPassed: passed,
        currentPercentage: percentage,
        passingPercentage: apiResult.passing_score,
        currentScore: apiResult.score,
        totalPoints: apiResult.total_points,
        bestPercentage,
        attemptCount: (existingStatus?.attemptCount ??  0) + 1,
      });

      setIsFinished(true);
    } catch (err) {
      console.error("Failed to submit test:", err);
      // Fallback:  calculate locally
      if (! test) return;

      let correctCount = 0;
      let totalPoints = 0;

      test.questions.forEach((question) => {
        const selected = userAnswers.get(question.id) || [];
        const correctOptions = question.options
          .filter((o) => o.is_correct)
          .map((o) => o.id);

        totalPoints += question.points;

        if (
          selected.length === correctOptions. length &&
          selected.every((s) => correctOptions.includes(s))
        ) {
          correctCount += question.points;
        }
      });

      const percentage = calculatePercentage(correctCount, totalPoints);
      const passed = isTestPassed(percentage, test. passing_score);

      setResult({
        score: correctCount,
        totalPoints,
        percentage,
        passed,
        passingScore: test.passing_score,
      });

      // Save to localStorage
      const existingStatus = loadTestStatusFromStorage(parseInt(testId));
      const hasEverPassed = passed || (existingStatus?.hasEverPassed ?? false);
      const bestPercentage = Math.max(
        percentage,
        existingStatus?.bestPercentage ?? 0
      );

      saveTestStatusToStorage(parseInt(testId), {
        hasEverPassed,
        currentAttemptPassed: passed,
        currentPercentage: percentage,
        passingPercentage: test.passing_score,
        currentScore: correctCount,
        totalPoints,
        bestPercentage,
        attemptCount: (existingStatus?.attemptCount ?? 0) + 1,
      });

      setIsFinished(true);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 text-sm sm:text-base">
              Загрузка теста...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="bg-white min-h-screen flex flex-col">
        <Header />
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
              {error || "Тест не найден"}
            </p>
            <Button onClick={() => router.push("/")} className="min-h-[44px]">
              Вернуться на главную
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // =========================================================================
  // RESULT SCREEN - Show pass/fail clearly
  // =========================================================================
  if (isFinished && result) {
    const statusColors = getStatusColorClass(result. passed);

    return (
      <div className="bg-white min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-12 sm:pt-16 md:pt-20">
          <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
            <Card>
              <CardContent className="p-6 sm:pt-12 sm:pb-12 text-center">
                {/* Pass/Fail Icon */}
                {result.passed ? (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="40"
                      height="40"
                      viewBox="0 0 256 256"
                      className="text-green-600 sm:w-12 sm:h-12"
                    >
                      <path
                        fill="currentColor"
                        d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"
                      />
                    </svg>
                  </div>
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 sm: mb-6">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="40"
                      height="40"
                      viewBox="0 0 256 256"
                      className="text-red-600 sm:w-12 sm:h-12"
                    >
                      <path
                        fill="currentColor"
                        d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"
                      />
                    </svg>
                  </div>
                )}

                {/* Status Title */}
                <h1
                  className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-2 ${
                    result.passed ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {result.passed ? "Тест пройден!" : "Тест не пройден"}
                </h1>
                <p className="text-gray-600 text-sm sm:text-base mb-6 sm:mb-8">
                  {test.title}
                </p>

                {/* Score display */}
                <div className="mb-6 sm:mb-8">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
                    Ваш результат
                  </p>
                  <p
                    className={`text-4xl sm:text-5xl md:text-6xl font-bold ${
                      result.passed ?  "text-green-600" :  "text-red-600"
                    }`}
                  >
                    {formatPercentage(result.percentage)}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="relative w-full bg-gray-200 rounded-full h-3 sm:h-4 mb-4 sm:mb-6">
                  <div
                    className={`h-3 sm:h-4 rounded-full transition-all ${
                      result.passed ? "bg-green-600" : "bg-red-500"
                    }`}
                    style={{ width: `${Math.min(result.percentage, 100)}%` }}
                  />
                  {/* Passing threshold marker */}
                  <div
                    className="absolute top-0 h-full w-0.5 bg-gray-500"
                    style={{ left: `${result.passingScore}%` }}
                  />
                </div>

                {/* Info row */}
                <div className="flex justify-center gap-4 sm:gap-8 mb-6 sm:mb-8 text-xs sm:text-sm">
                  <div>
                    <p className="text-gray-600">Набрано баллов</p>
                    <p className="font-bold text-gray-900">
                      {result.score} / {result.totalPoints}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Проходной балл</p>
                    <p className="font-bold text-gray-900">
                      {result.passingScore}%
                    </p>
                  </div>
                </div>

                {/* Status message */}
                {! result.passed && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 sm:p-4 mb-6 sm:mb-8">
                    <p className="text-orange-700 text-sm sm:text-base">
                      Для прохождения теста необходимо набрать минимум{" "}
                      {result.passingScore}%.  Попробуйте ещё раз!
                    </p>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <Button
                    onClick={() => router.push("/tests")}
                    variant={result.passed ? "primary" : "secondary"}
                    className="min-h-[44px]"
                  >
                    К списку тестов
                  </Button>
                  <Button
                    variant={result.passed ? "secondary" : "primary"}
                    onClick={() => {
                      setCurrentQuestion(0);
                      setUserAnswers(new Map());
                      setIsFinished(false);
                      setResult(null);
                    }}
                    className="min-h-[44px]"
                  >
                    Пройти тест заново
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // =========================================================================
  // QUESTION SCREEN - TWO COLUMN LAYOUT
  // =========================================================================
  const question = test.questions[currentQuestion];
  const answeredQuestions = userAnswers.size;
  const progress = Math.round(
    ((currentQuestion + 1) / test.questions.length) * 100
  );
  const selectedOptions = userAnswers.get(question.id) || [];
  const hasAnswered = selectedOptions.length > 0;

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-12 sm:pt-16 md:pt-20">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
          {/* Progress */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs sm:text-sm font-medium text-gray-900">
                Вопрос {currentQuestion + 1} из {test.questions. length}
              </p>
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                Отвечено: {answeredQuestions}
              </p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
              <div
                className="bg-blue-600 h-2 sm:h-3 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
            {/* Left Column - Question (2/3 width) */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-4 sm:pt-8">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">
                    {question.question_text}
                  </h2>

                  {/* Answers - touch-friendly */}
                  <div className="space-y-2 sm:space-y-3">
                    {question.options.map((option) => {
                      const isSelected = selectedOptions.includes(option.id);
                      const isLocked = hasAnswered;

                      // Determine styling based on answer state
                      let borderClass = "border-gray-200";
                      let bgClass = "";
                      let iconColor = "border-gray-300";

                      if (hasAnswered) {
                        if (option.is_correct) {
                          // Always highlight correct answer in green
                          borderClass = "border-green-500";
                          bgClass = "bg-green-50";
                          iconColor = "border-green-500 bg-green-500";
                        } else if (isSelected && !option.is_correct) {
                          // User selected wrong answer - red
                          borderClass = "border-red-500";
                          bgClass = "bg-red-50";
                          iconColor = "border-red-500 bg-red-500";
                        } else {
                          // Not selected, not correct - gray out
                          borderClass = "border-gray-200";
                          bgClass = "bg-gray-50";
                        }
                      } else if (isSelected) {
                        borderClass = "border-blue-600";
                        bgClass = "bg-blue-50";
                        iconColor = "border-blue-600 bg-blue-600";
                      }

                      return (
                        <button
                          key={option.id}
                          onClick={() =>
                            ! isLocked && handleAnswerSelect(option.id)
                          }
                          disabled={isLocked}
                          className={`w-full text-left p-3 sm: p-4 rounded-lg border-2 transition-all min-h-[48px] ${borderClass} ${bgClass} ${
                            isLocked
                              ? "cursor-default"
                              : "hover:border-gray-300 active:border-gray-400"
                          }`}
                        >
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div
                              className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${iconColor}`}
                            >
                              {hasAnswered && option.is_correct && (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="14"
                                  height="14"
                                  viewBox="0 0 256 256"
                                  className="text-white"
                                >
                                  <path
                                    fill="currentColor"
                                    d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34Z"
                                  />
                                </svg>
                              )}
                              {hasAnswered &&
                                isSelected &&
                                ! option.is_correct && (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="14"
                                    height="14"
                                    viewBox="0 0 256 256"
                                    className="text-white"
                                  >
                                    <path
                                      fill="currentColor"
                                      d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"
                                    />
                                  </svg>
                                )}
                              {! hasAnswered && isSelected && (
                                <span className="text-white text-xs sm:text-sm">
                                  ✓
                                </span>
                              )}
                            </div>
                            <span
                              className={`text-sm sm:text-base font-medium ${
                                hasAnswered && option.is_correct
                                  ? "text-green-800"
                                  : hasAnswered &&
                                    isSelected &&
                                    !option.is_correct
                                  ? "text-red-800"
                                  : "text-gray-900"
                              }`}
                            >
                              {option.option_text}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Descriptions Panel (1/2 width, appears only after answer) */}
            {hasAnswered && (
              <div className="lg:col-span-1">
                <div className="flex flex-col gap-6 sm:gap-8">
                  {/* Question Description Card */}
                  {question.description && (
                    <Card className="sticky top-32">
                      <CardContent className="p-4 sm:p-6">
                        <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-4">
                          Описание вопроса
                        </h3>
                        <p className="text-sm sm:text-base text-gray-800 leading-relaxed">
                          {question.description}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Options Descriptions Card */}
                  <Card className="sticky top-64">
                    <CardContent className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto">
                      <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-4">
                        Описание ответов
                      </h3>

                      {/* All Options Descriptions */}
                      <div className="space-y-4">
                      <p className="text-xs sm:text-sm text-gray-600 font-medium">
                        Варианты ответов
                      </p>
                      {question.options.map((option) => {
                        const isSelected = selectedOptions.includes(option.id);
                        const isCorrect = option.is_correct;

                        return (
                          <div
                            key={option. id}
                            className={`p-3 sm:p-4 rounded-lg border-l-4 ${
                              isCorrect
                                ? "bg-green-50 border-green-500"
                                : isSelected
                                ? "bg-red-50 border-red-500"
                                : "bg-gray-50 border-gray-300"
                            }`}
                          >
                            <div className="flex items-start gap-2 mb-2">
                              <div className="flex-shrink-0 mt-0.5">
                                {isCorrect && (
                                  <span className="text-green-600 font-bold">
                                    ✓
                                  </span>
                                )}
                                {isSelected && !isCorrect && (
                                  <span className="text-red-600 font-bold">
                                    ✗
                                  </span>
                                )}
                              </div>
                              <p
                                className={`text-xs sm:text-sm font-medium ${
                                  isCorrect
                                    ? "text-green-900"
                                    : isSelected
                                    ? "text-red-900"
                                    : "text-gray-900"
                                }`}
                              >
                                {option. option_text}
                              </p>
                            </div>
                            {option.description && (
                              <p
                                className={`text-xs sm:text-sm leading-relaxed ml-6 ${
                                  isCorrect
                                    ? "text-green-800"
                                    : isSelected
                                    ? "text-red-800"
                                    : "text-gray-700"
                                }`}
                              >
                                {option.description}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
                </div>
              </div>
            )}
          </div>

          {/* Navigation - touch-friendly */}
          <div className="flex gap-3 sm:gap-4 justify-between">
            <Button
              variant="secondary"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="flex items-center gap-2 min-h-[44px] sm:min-h-[40px]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 256 256"
              >
                <path
                  fill="currentColor"
                  d="M168. 49,199.51a12,12,0,0,1-17,17l-80-80a12,12,0,0,1,0-17l80-80a12,12,0,0,1,17,17L97,128Z"
                />
              </svg>
              <span className="hidden sm:inline">Предыдущий</span>
              <span className="sm:hidden">Назад</span>
            </Button>

            <Button
              variant="primary"
              onClick={handleNext}
              className="flex items-center gap-2 min-h-[44px] sm:min-h-[40px]"
            >
              {currentQuestion === test.questions.length - 1
                ? "Завершить"
                : "Далее"}
              {currentQuestion !== test.questions.length - 1 && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 256 256"
                >
                  <path
                    fill="currentColor"
                    d="M184. 49,136.49l-80,80a12,12,0,0,1-17-17L159,128,87.51,56.49a12,12,0,1,1,17-17l80,80A12,12,0,0,1,184.49,136.49Z"
                  />
                </svg>
              )}
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}