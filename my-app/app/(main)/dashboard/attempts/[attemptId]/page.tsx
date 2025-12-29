"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Footer } from "@/src/components/layout/Footer";
import { Button } from "@/src/components/ui/Button";
import { Card, CardContent } from "@/src/components/ui/Card";
import { combinedTestsAPI } from "@/src/lib/api";
import type {
  CombinedTestAttemptDetailResponse,
  AttemptTopicStatistics,
} from "@/src/types/api";

export default function AttemptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = parseInt(params.attemptId as string);

  const [attempt, setAttempt] = useState<CombinedTestAttemptDetailResponse | null>(null);
  const [statistics, setStatistics] = useState<AttemptTopicStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [attemptData, statsData] = await Promise.all([
          combinedTestsAPI.getAttempt(attemptId),
          combinedTestsAPI.getAttemptStatistics(attemptId),
        ]);

        setAttempt(attemptData);
        setStatistics(statsData);
        setError(null);
      } catch (err) {
        console.error("Failed to load attempt details:", err);
        setError("Не удалось загрузить данные попытки");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [attemptId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <main className="flex-1 pt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Back Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push("/combined-tests/dashboard")}
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
            <>
              <div className="mb-8 animate-pulse">
                <div className="h-10 w-2/3 bg-gray-200 rounded mb-2" />
                <div className="h-5 w-1/3 bg-gray-200 rounded" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse"
                  >
                    <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
                    <div className="h-8 w-16 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Error State */}
          {error && !isLoading && (
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
          {!isLoading && !error && attempt && statistics && (
            <>
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {attempt.combined_test_title}
                </h1>
                <p className="text-gray-600">
                  Пройдено: {formatDate(attempt.started_at)}
                </p>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Score Card */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">Результат</p>
                      <div className={`w-10 h-10 ${getScoreBgColor(attempt.percentage)} rounded-lg flex items-center justify-center`}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 256 256"
                          className={getScoreColor(attempt.percentage)}
                        >
                          <path
                            fill="currentColor"
                            d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34l13.49-58.54L21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L166,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Z"
                          />
                        </svg>
                      </div>
                    </div>
                    <p className={`text-3xl font-bold ${getScoreColor(attempt.percentage)}`}>
                      {attempt.percentage.toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {attempt.score} из {attempt.total_questions}
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
                      {attempt.score}
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
                      {attempt.total_questions - attempt.score}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">ответов</p>
                  </CardContent>
                </Card>
              </div>

              {/* Topic Statistics */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Статистика по темам
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {statistics.topics.map((topic) => (
                    <Card key={topic.test_id}>
                      <CardContent className="pt-6">
                        <h3 className="font-semibold text-gray-900 mb-3">
                          {topic.test_title}
                        </h3>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Вопросов:</span>
                            <span className="font-medium">
                              {topic.total_questions_answered}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Правильных:</span>
                            <span className="font-medium text-green-600">
                              {topic.correct_answers}
                            </span>
                          </div>
                          <div className="pt-2 border-t">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm text-gray-600">
                                Точность:
                              </span>
                              <span
                                className={`text-lg font-bold ${getScoreColor(
                                  topic.percentage
                                )}`}
                              >
                                {topic.percentage.toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  topic.percentage >= 80
                                    ? "bg-green-600"
                                    : topic.percentage >= 60
                                    ? "bg-yellow-600"
                                    : "bg-red-600"
                                }`}
                                style={{ width: `${topic.percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Answers Review */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Разбор ответов
                </h2>
                <div className="space-y-4">
                  {attempt.answers.map((answer, index) => (
                    <Card
                      key={answer.question_id}
                      className={`border-l-4 ${
                        answer.is_correct
                          ? "border-green-500 bg-green-50"
                          : "border-red-500 bg-red-50"
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
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                {answer.source_test_title}
                              </span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {answer.question_text}
                            </h3>
                          </div>
                          <div
                            className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                              answer.is_correct
                                ? "bg-green-100 text-green-700"
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

                        {/* Score */}
                        <div className="mb-4 text-sm text-gray-600">
                          Баллы: {answer.points_earned} из {answer.points_possible}
                        </div>

                        {/* Answer Details */}
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          {answer.text_answer ? (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-2">
                                Ваш ответ:
                              </p>
                              <p className="text-gray-900">{answer.text_answer}</p>
                            </div>
                          ) : (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-2">
                                Выбранные варианты:
                              </p>
                              {answer.selected_option_ids && answer.selected_option_ids.length > 0 ? (
                                <ul className="space-y-1">
                                  {answer.selected_option_ids.map((optionId) => (
                                    <li
                                      key={optionId}
                                      className="text-gray-900 flex items-center gap-2"
                                    >
                                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                                      Вариант #{optionId}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-gray-500 italic">Ответ не выбран</p>
                              )}
                            </div>
                          )}
                        </div>
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