"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/src/components/layout/Header";
import { Footer } from "@/src/components/layout/Footer";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { tests } from "@/src/data/tests";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

interface Question {
  id: string;
  question: string;
  answers: string[];
  correct: number;
}

export default function TestPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.id as string;

  const [test, setTest] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const foundTest = tests.find((t) => t.id === testId);
    if (foundTest) {
      setTest(foundTest);
      setUserAnswers(new Array(foundTest.content?.length || 0).fill(null));
    }
    setIsLoading(false);
  }, [testId]);

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setUserAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < (test?.content?.length || 1) - 1) {
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

  const finishTest = () => {
    // Подсчет результатов
    let correctCount = 0;
    test.content.forEach((question: Question, idx: number) => {
      if (userAnswers[idx] === question.correct) {
        correctCount++;
      }
    });

    const testScore = Math.round((correctCount / test.content.length) * 100);
    setScore(testScore);

    // Сохранение результата
    localStorage.setItem(`test_${testId}_passed`, "true");
    localStorage.setItem(`test_${testId}_score`, testScore.toString());

    setIsFinished(true);
  };

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-600">Загрузка...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!test) {
    return (
      <div className="bg-white min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 mb-4">Тест не найден</p>
            <Button onClick={() => router.push("/tests")}>Вернуться к тестам</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="bg-white min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-20">
          <div className="max-w-2xl mx-auto w-full px-6 py-12">
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <CheckCircle2 size={64} className="mx-auto text-green-600 mb-6" />
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Тест завершён!
                </h1>
                <p className="text-gray-600 mb-8">{test.title}</p>

                <div className="mb-8">
                  <p className="text-sm text-gray-600 mb-2">Ваш результат</p>
                  <p className="text-6xl font-bold text-green-600">{score}%</p>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-4 mb-8">
                  <div
                    className="bg-green-600 h-4 rounded-full transition-all"
                    style={{ width: `${score}%` }}
                  ></div>
                </div>

                <p className="text-gray-600 mb-8">
                  Вы ответили правильно на{" "}
                  <span className="font-bold text-green-600">
                    {Math.round((score / 100) * test.content.length)}
                  </span>{" "}
                  из <span className="font-bold">{test.content.length}</span> вопросов
                </p>

                <div className="flex gap-4 justify-center">
                  <Button onClick={() => router.push("/tests")}>
                    К остальным тестам
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setCurrentQuestion(0);
                      setUserAnswers(new Array(test.content.length).fill(null));
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

  const question = test.content[currentQuestion];
  const answeredQuestions = userAnswers.filter((a) => a !== null).length;
  const progress = Math.round(((currentQuestion + 1) / test.content.length) * 100);

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-20">
        <div className="max-w-3xl mx-auto w-full px-6 py-12">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-900">
                Вопрос {currentQuestion + 1} из {test.content.length}
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
                {question.question}
              </h2>

              {/* Answers */}
              <div className="space-y-3">
                {question.answers.map((answer: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswerSelect(idx)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      userAnswers[currentQuestion] === idx
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                          userAnswers[currentQuestion] === idx
                            ? "border-blue-600 bg-blue-600"
                            : "border-gray-300"
                        }`}
                      >
                        {userAnswers[currentQuestion] === idx && (
                          <span className="text-white text-sm">✓</span>
                        )}
                      </div>
                      <span className="text-gray-900 font-medium">{answer}</span>
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
              <ChevronLeft size={16} />
              Предыдущий
            </Button>

            <Button
              variant="primary"
              onClick={handleNext}
              className="flex items-center gap-2"
            >
              {currentQuestion === test.content.length - 1
                ? "Завершить"
                : "Следующий"}
              {currentQuestion !== test.content.length - 1 && (
                <ChevronRight size={16} />
              )}
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
