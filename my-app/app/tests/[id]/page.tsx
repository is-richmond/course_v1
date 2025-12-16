"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/src/components/layout/Header";
import { Footer } from "@/src/components/layout/Footer";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { testsAPI } from "@/src/lib/api";
import type {
  TestWithQuestions,
  QuestionWithOptions,
  TestSubmission,
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
  const [score, setScore] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const fetchedTest = await testsAPI.getWithQuestions(parseInt(testId));
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
    if (!test) return;
    const question = test.questions[currentQuestion];
    const newAnswers = new Map(userAnswers);

    if (question.question_type === "single_choice") {
      newAnswers.set(question.id, [optionId]);
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
      const result = await testsAPI.submit(parseInt(testId), submission);
      setScore(result.score);
      setTotalPoints(result.total_points);

      // Save to localStorage
      localStorage.setItem(
        `test_${testId}_passed`,
        result.passed ? "true" : "false"
      );
      localStorage.setItem(`test_${testId}_score`, result.score.toString());

      setIsFinished(true);
    } catch (err) {
      console.error("Failed to submit test:", err);
      // Fallback: calculate locally
      let correctCount = 0;
      test.questions.forEach((question) => {
        const selected = userAnswers.get(question.id) || [];
        const correctOptions = question.options
          .filter((o) => o.is_correct)
          .map((o) => o.id);

        if (
          selected.length === correctOptions.length &&
          selected.every((s) => correctOptions.includes(s))
        ) {
          correctCount++;
        }
      });

      const testScore = Math.round(
        (correctCount / test.questions.length) * 100
      );
      setScore(testScore);
      setTotalPoints(100);
      setIsFinished(true);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Загрузка теста...</p>
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
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
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
            <p className="text-2xl font-bold text-gray-900 mb-4">
              {error || "Тест не найден"}
            </p>
            <Button onClick={() => router.push("/")}>
              Вернуться на главную
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isFinished) {
    const percentage =
      totalPoints > 0 ? Math.round((score / totalPoints) * 100) : score;
    return (
      <div className="bg-white min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-20">
          <div className="max-w-2xl mx-auto w-full px-6 py-12">
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="64"
                  height="64"
                  viewBox="0 0 256 256"
                  className="mx-auto text-green-600 mb-6"
                >
                  <path
                    fill="currentColor"
                    d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"
                  />
                </svg>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Тест завершён!
                </h1>
                <p className="text-gray-600 mb-8">{test.title}</p>

                <div className="mb-8">
                  <p className="text-sm text-gray-600 mb-2">Ваш результат</p>
                  <p className="text-6xl font-bold text-green-600">
                    {percentage}%
                  </p>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-4 mb-8">
                  <div
                    className="bg-green-600 h-4 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>

                <p className="text-gray-600 mb-8">
                  Набрано баллов:{" "}
                  <span className="font-bold text-green-600">{score}</span> из{" "}
                  <span className="font-bold">{totalPoints}</span>
                </p>

                <div className="flex gap-4 justify-center">
                  <Button onClick={() => router.push("/")}>На главную</Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setCurrentQuestion(0);
                      setUserAnswers(new Map());
                      setIsFinished(false);
                    }}
                  >
                    Переделать тест
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
  const answeredQuestions = userAnswers.size;
  const progress = Math.round(
    ((currentQuestion + 1) / test.questions.length) * 100
  );
  const selectedOptions = userAnswers.get(question.id) || [];

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-20">
        <div className="max-w-3xl mx-auto w-full px-6 py-12">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-900">
                Вопрос {currentQuestion + 1} из {test.questions.length}
              </p>
              <p className="text-sm font-medium text-gray-600">
                Ответлено: {answeredQuestions}
              </p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Question Card */}
          <Card className="mb-8">
            <CardContent className="pt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                {question.question_text}
              </h2>

              {/* Answers */}
              <div className="space-y-3">
                {question.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleAnswerSelect(option.id)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedOptions.includes(option.id)
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                          selectedOptions.includes(option.id)
                            ? "border-blue-600 bg-blue-600"
                            : "border-gray-300"
                        }`}
                      >
                        {selectedOptions.includes(option.id) && (
                          <span className="text-white text-sm">✓</span>
                        )}
                      </div>
                      <span className="text-gray-900 font-medium">
                        {option.option_text}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex gap-4 justify-between">
            <Button
              variant="secondary"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 256 256"
              >
                <path
                  fill="currentColor"
                  d="M168.49,199.51a12,12,0,0,1-17,17l-80-80a12,12,0,0,1,0-17l80-80a12,12,0,0,1,17,17L97,128Z"
                />
              </svg>
              Предыдущий
            </Button>

            <Button
              variant="primary"
              onClick={handleNext}
              className="flex items-center gap-2"
            >
              {currentQuestion === test.questions.length - 1
                ? "Завершить"
                : "Следующий"}
              {currentQuestion !== test.questions.length - 1 && (
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
              )}
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
