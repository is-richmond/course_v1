"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Footer } from "@/src/components/layout/Footer";
import { Button } from "@/src/components/ui/Button";
import { Card, CardContent } from "@/src/components/ui/Card";
import { testAPI } from "@/src/lib/api";
import type { TestResult } from "@/src/types/api";

export default function TestAttemptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const testId = parseInt(params.testId as string);
  const attemptId = parseInt(params.attemptId as string);

  const [result, setResult] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const resultData = await tests.getAttemptDetail(testId, attemptId);
        setResult(resultData);
        setError(null);
      } catch (err) {
        console.error("Failed to load attempt details:", err);
        setError("Не удалось загрузить данные попытки");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [testId, attemptId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month:  "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculatePercentage = (score: number, totalPoints: number) => {
    if (totalPoints === 0) return 0;
    return (score / totalPoints) * 100;
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-100";
    if (percentage >= 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  if (! result) return null;

  const percentage = calculatePercentage(result. score, result.total_points);
  const isPassed = percentage >= result.passing_score;

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <main className="flex-1 pt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Back Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push("/tests-dashboard")}
            className="mb-6"
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
                d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"
              />
            </svg>
            Назад к дашборду
          </Button>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Загрузка...</p>
            </div>
          )}

          {/* Error State */}
          {error && ! isLoading && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  viewBox="0 0 256 256"
                  className="text-red-500"
                >
                  <path
                    fill="currentColor"
                    d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm-8-80V80a8,8,0,0,1,16,0v56a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,172Z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Ошибка загрузки
              </h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button
                variant="primary"
                onClick={() => window.location.reload()}
              >
                Попробовать снова
              </Button>
            </div>
          )}

          {/* Content */}
          {!isLoading && !error && result && (
            <>
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {result.test_title}
                </h1>
                <p className="text-gray-600">
                  Пройдено: {formatDate(result.started_at)}
                </p>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {/* Score Card */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">Результат</p>
                      <div
                        className={`w-10 h-10 ${getScoreBgColor(
                          percentage
                        )} rounded-lg flex items-center justify-center`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 256 256"
                          className={getScoreColor(percentage)}
                        >
                          <path
                            fill="currentColor"
                            d="M234. 5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34l13.49-58.54L21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L166,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Z"
                          />
                        </svg>
                      </div>
                    </div>
                    <p
                      className={`text-3xl font-bold ${getScoreColor(
                        percentage
                      )}`}
                    >
                      {percentage.toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {result.score} из {result.total_points}
                    </p>
                  </CardContent>
                </Card>

                {/* Pass/Fail Status */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">Статус</p>
                      <div
                        className={`w-10 h-10 ${
                          isPassed ? "bg-green-100" : "bg-red-100"
                        } rounded-lg flex items-center justify-center`}
                      >
                        {isPassed ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
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
                            width="24"
                            height="24"
                            viewBox="0 0 256 256"
                            className="text-red-600"
                          >
                            <path
                              fill="currentColor"
                              d="M165.66,101.66,139.31,128l26.35,26.34a8,8,0,0,1-11.32,11.32L128,139.31l-26.34,26.35a8,8,0,0,1-11.32-11.32L116. 69,128,90.34,101.66a8,8,0,0,1,11.32-11.32L128,116.69l26.34-26.35a8,8,0,0,1,11.32,11.32ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                    <p
                      className={`text-2xl font-bold ${
                        isPassed ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {isPassed ? "Сдан" : "Не сдан"}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Проходной:  {result.passing_score}%
                    </p>
                  </CardContent>
                </Card>

                {/* Correct Answers */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">Правильных</p>
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 256 256"
                          className="text-green-600"
                        >
                          <path
                            fill="currentColor"
                            d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"
                          />
                        </svg>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-green-600">
                      {result.answers.filter((a) => a.is_correct).length}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">ответов</p>
                  </CardContent>
                </Card>

                {/* Wrong Answers */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">Неправильных</p>
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 256 256"
                          className="text-red-600"
                        >
                          <path
                            fill="currentColor"
                            d="M165.66,101.66,139.31,128l26.35,26.34a8,8,0,0,1-11.32,11.32L128,139.31l-26.34,26.35a8,8,0,0,1-11.32-11.32L116.69,128,90.34,101.66a8,8,0,0,1,11.32-11.32L128,116.69l26.34-26.35a8,8,0,0,1,11.32,11.32ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"
                          />
                        </svg>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-red-600">
                      {result.answers.filter((a) => !a.is_correct).length}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">ответов</p>
                  </CardContent>
                </Card>
              </div>

              {/* Answers Review */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Разбор ответов
                </h2>
                <div className="space-y-6">
                  {result.answers.map((answer, index) => (
                    <Card
                      key={answer.question_id}
                      className={`border-l-4 ${
                        answer.is_correct
                          ? "border-green-500"
                          : "border-red-500"
                      }`}
                    >
                      <CardContent className="pt-6">
                        {/* Question Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-medium text-gray-500">
                                Вопрос {index + 1}
                              </span>
                              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                {answer.points_earned}/{answer.points_possible}{" "}
                                баллов
                              </span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">
                              {answer.question_text}
                            </h3>
                          </div>

                          <div
                            className={`flex items-center gap-2 px-3 py-1 rounded-full ml-4 ${
                              answer.is_correct
                                ?  "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {answer.is_correct ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 256 256"
                              >
                                <path
                                  fill="currentColor"
                                  d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34Z"
                                />
                              </svg>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 256 256"
                              >
                                <path
                                  fill="currentColor"
                                  d="M165.66,101.66,139.31,128l26.35,26.34a8,8,0,0,1-11.32,11.32L128,139.31l-26.34,26.35a8,8,0,0,1-11.32-11.32L116.69,128,90.34,101.66a8,8,0,0,1,11.32-11.32L128,116.69l26.34-26.35a8,8,0,0,1,11.32,11.32Z"
                                />
                              </svg>
                            )}
                            <span className="text-sm font-medium">
                              {answer.is_correct ? "Правильно" : "Неправильно"}
                            </span>
                          </div>
                        </div>

                        {/* Answer Info */}
                        {answer.selected_option_ids &&
                        answer.selected_option_ids. length > 0 ? (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <p className="text-sm text-gray-600">
                              Выбранные варианты:{" "}
                              {answer.selected_option_ids.join(", ")}
                            </p>
                          </div>
                        ) : null}

                        {answer.text_answer && (
                          <div className="mt-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">
                              Ваш текстовый ответ:
                            </p>
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                              <p className="text-gray-900">
                                {answer.text_answer}
                              </p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}