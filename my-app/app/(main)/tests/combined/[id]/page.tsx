"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/src/components/layout/Header";
import { Footer } from "@/src/components/layout/Footer";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { combinedTestsAPI } from "@/src/lib/api";
import type {
  CombinedTestDetailResponse,
  CombinedTestQuestionResponse,
  CombinedTestResult,
} from "@/src/types/api";

export default function CombinedTestPage() {
  const params = useParams();
  const router = useRouter();
  const testId = parseInt(params.id as string);

  const [test, setTest] = useState<CombinedTestDetailResponse | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Map<number, number[]>>(
    new Map()
  );
  const [isFinished, setIsFinished] = useState(false);
  const [result, setResult] = useState<CombinedTestResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTest();
  }, [testId]);

  const fetchTest = async () => {
    try {
      const data = await combinedTestsAPI. get(testId);
      setTest(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch test:", err);
      setError("Не удалось загрузить тест");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (questionId: number, optionId: number) => {
    const newAnswers = new Map(userAnswers);
    const currentAnswers = newAnswers. get(questionId) || [];

    if (currentAnswers.includes(optionId)) {
      newAnswers.set(
        questionId,
        currentAnswers.filter((id) => id !== optionId)
      );
    } else {
      newAnswers.set(questionId, [...currentAnswers, optionId]);
    }

    setUserAnswers(newAnswers);
  };

  const handleNext = () => {
    if (test && currentQuestion < test.questions. length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const finishTest = async () => {
    if (!test) return;

    if (! confirm("Вы уверены, что хотите завершить тест?")) return;

    try {
      const answers = Array.from(userAnswers.entries()).map(
        ([questionId, selectedOptionIds]) => ({
          question_id: questionId,
          selected_option_ids: 
            selectedOptionIds. length > 0 ? selectedOptionIds : null,
        })
      );

      const testResult = await combinedTestsAPI.submit(testId, { answers });
      setResult(testResult);
      setIsFinished(true);
    } catch (err) {
      console.error("Failed to submit test:", err);
      alert("Не удалось отправить результаты теста");
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Загрузка теста... </p>
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
            <p className="text-xl font-bold text-gray-900 mb-4">
              {error || "Тест не найден"}
            </p>
            <Button onClick={() => router.push("/tests")}>
              Вернуться к тестам
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isFinished && result) {
    const percentage = result.percentage;
    const passed = percentage >= 70;

    return (
      <div className="bg-white min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-16 md:pt-20">
          <div className="max-w-3xl mx-auto px-4 py-12">
            <Card>
              <CardContent className="p-8 text-center">
                <div
                  className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${
                    passed ?  "bg-green-100" : "bg-red-100"
                  }`}
                >
                  {passed ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="48"
                      height="48"
                      viewBox="0 0 256 256"
                      className="text-green-600"
                    >
                      <path
                        fill="currentColor"
                        d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="48"
                      height="48"
                      viewBox="0 0 256 256"
                      className="text-red-600"
                    >
                      <path
                        fill="currentColor"
                        d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm-8-80V80a8,8,0,0,1,16,0v56a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,172Z"
                      />
                    </svg>
                  )}
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {passed ? "Тест пройден!" : "Тест не пройден"}
                </h2>
                <p className="text-gray-600 mb-8">{test. title}</p>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Ваш результат</p>
                    <p
                      className={`text-4xl font-bold ${
                        passed ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {percentage. toFixed(0)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Правильных ответов
                    </p>
                    <p className="text-4xl font-bold text-gray-900">
                      {result.score}/{result.total_questions}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <Button onClick={() => router.push("/tests")}>
                    К списку тестов
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => window.location.reload()}
                  >
                    Пройти снова
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

  const question = test.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / test.questions.length) * 100;
  const selectedAnswers = userAnswers. get(question.question_id) || [];
  const hasAnswered = selectedAnswers.length > 0;

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16 md:pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>
                Вопрос {currentQuestion + 1} из {test.questions.length}
              </span>
              <span className="text-blue-600 font-medium">
                Тема: {question.source_test_title}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Left Column - Question (2/3 width) */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    {question.question_text}
                  </h2>
                  <p className="text-sm text-gray-500 mb-4">
                    Баллов: {question.points}
                  </p>

                  {/* Answer Options */}
                  <div className="space-y-3">
                    {question.options.map((option) => {
                      const isSelected = selectedAnswers.includes(option.id);
                      const isLocked = hasAnswered;

                      let borderClass = "border-gray-200";
                      let bgClass = "";
                      let iconColor = "border-gray-300";

                      if (hasAnswered) {
                        if (option.is_correct) {
                          borderClass = "border-green-500";
                          bgClass = "bg-green-50";
                          iconColor = "border-green-500 bg-green-500";
                        } else if (isSelected && !option.is_correct) {
                          borderClass = "border-red-500";
                          bgClass = "bg-red-50";
                          iconColor = "border-red-500 bg-red-500";
                        } else {
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
                            ! isLocked &&
                            handleAnswerSelect(question.question_id, option.id)
                          }
                          disabled={isLocked}
                          className={`w-full text-left p-4 rounded-lg border-2 transition ${borderClass} ${bgClass} ${
                            isLocked
                              ? "cursor-default"
                              : "hover:border-gray-300 active:border-gray-400"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`flex-shrink-0 w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${iconColor}`}
                            >
                              {hasAnswered && option.is_correct && (
                                <svg
                                  className="w-3 h-3 text-white"
                                  viewBox="0 0 256 256"
                                  fill="currentColor"
                                >
                                  <path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34Z" />
                                </svg>
                              )}
                              {hasAnswered &&
                                isSelected &&
                                ! option.is_correct && (
                                  <svg
                                    className="w-3 h-3 text-white"
                                    viewBox="0 0 256 256"
                                    fill="currentColor"
                                  >
                                    <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116. 69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
                                  </svg>
                                )}
                              {! hasAnswered && isSelected && (
                                <span className="text-white text-xs">✓</span>
                              )}
                            </div>
                            <span
                              className={`flex-1 text-gray-900 ${
                                hasAnswered && option.is_correct
                                  ? "text-green-800 font-medium"
                                  : hasAnswered &&
                                    isSelected &&
                                    !option.is_correct
                                  ? "text-red-800 font-medium"
                                  : ""
                              }`}
                            >
                              {option. option_text}
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
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-6">
                      Описание
                    </h3>

                    {/* Question Description - FIRST */}
                    {question.description && (
                      <div className="mb-6 pb-6 border-b border-gray-200">
                        <p className="text-xs sm:text-sm text-gray-600 font-medium mb-2">
                          Вопрос
                        </p>
                        <p className="text-sm sm:text-base text-gray-800 leading-relaxed">
                          {question.description}
                        </p>
                      </div>
                    )}

                    {/* All Options Descriptions - SECOND */}
                    <div className="space-y-4">
                      <p className="text-xs sm:text-sm text-gray-600 font-medium mb-4">
                        Варианты ответов
                      </p>
                      {question.options.map((option) => {
                        const isSelected = selectedAnswers.includes(option.id);
                        const isCorrect = option.is_correct;

                        return (
                          <div
                            key={option.id}
                            className={`p-3 sm:p-4 rounded-lg border-l-4 ${
                              isCorrect
                                ?  "bg-green-50 border-green-500"
                                : isSelected
                                ? "bg-red-50 border-red-500"
                                :  "bg-gray-50 border-gray-300"
                            }`}
                          >
                            <div className="flex items-start gap-2 mb-2">
                              <div className="flex-shrink-0 mt-0.5">
                                {isCorrect && (
                                  <span className="text-green-600 font-bold">✓</span>
                                )}
                                {isSelected && !isCorrect && (
                                  <span className="text-red-600 font-bold">✗</span>
                                )}
                              </div>
                              <p
                                className={`text-xs sm:text-sm font-medium ${
                                  isCorrect
                                    ? "text-green-900"
                                    : isSelected
                                    ? "text-red-900"
                                    :  "text-gray-900"
                                }`}
                              >
                                {option.option_text}
                              </p>
                            </div>
                            {option.description && (
                              <p
                                className={`text-xs sm:text-sm leading-relaxed ml-6 ${
                                  isCorrect
                                    ? "text-green-800"
                                    : isSelected
                                    ? "text-red-800"
                                    :  "text-gray-700"
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
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="secondary"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="min-w-[120px]"
            >
              Назад
            </Button>
            <div className="text-sm text-gray-600">
              Отвечено: {userAnswers.size} / {test.questions.length}
            </div>
            {currentQuestion === test.questions.length - 1 ?  (
              <Button onClick={finishTest} className="min-w-[120px]">
                Завершить
              </Button>
            ) : (
              <Button onClick={handleNext} className="min-w-[120px]">
                Далее
              </Button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}