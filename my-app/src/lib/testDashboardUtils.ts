import type { TestAttemptResponse, TestResponse } from "@/src/types/api";

export interface TestDashboardStats {
  total_attempts: number;
  total_tests_taken: number;
  average_score: number;
  best_score: number;
  total_questions_answered: number;
  total_correct_answers: number;
  tests:  TestStats[];
}

export interface TestStats {
  test_id: number;
  test_title: string;
  total_attempts: number;
  best_score: number;
  average_score: number;
  best_percentage: number;
  average_percentage: number;
}

/**
 * Рассчитать общую статистику из попыток пользователя
 */
export function calculateDashboardStats(
  attempts: TestAttemptResponse[],
  tests: Map<number, TestResponse>
): TestDashboardStats {
  if (attempts.length === 0) {
    return {
      total_attempts: 0,
      total_tests_taken: 0,
      average_score: 0,
      best_score:  0,
      total_questions_answered: 0,
      total_correct_answers: 0,
      tests: [],
    };
  }

  // Группируем попытки по тестам
  const testAttemptsMap = new Map<number, TestAttemptResponse[]>();
  let totalScore = 0;
  let totalPoints = 0;

  attempts. forEach((attempt) => {
    if (!testAttemptsMap.has(attempt.test_id)) {
      testAttemptsMap.set(attempt.test_id, []);
    }
    testAttemptsMap.get(attempt. test_id)!.push(attempt);
    totalScore += attempt.score;
    totalPoints += attempt.total_points;
  });

  // Рассчитываем статистику по каждому тесту
  const testStats: TestStats[] = [];
  testAttemptsMap. forEach((testAttempts, testId) => {
    const test = tests.get(testId);
    if (! test) return;

    const scores = testAttempts.map((a) => a.score);
    const totalPointsForTest = testAttempts[0].total_points;
    const percentages = scores.map((s) => (s / totalPointsForTest) * 100);

    const bestScore = Math.max(...scores);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const bestPercentage = Math.max(...percentages);
    const avgPercentage = percentages.reduce((a, b) => a + b, 0) / percentages.length;

    testStats.push({
      test_id: testId,
      test_title: test. title,
      total_attempts:  testAttempts.length,
      best_score: bestScore,
      average_score: avgScore,
      best_percentage: bestPercentage,
      average_percentage: avgPercentage,
    });
  });

  // Сортируем по количеству попыток (по убыванию)
  testStats.sort((a, b) => b.total_attempts - a.total_attempts);

  const overallPercentage = totalPoints > 0 ? (totalScore / totalPoints) * 100 : 0;
  const bestAttempt = attempts.reduce((best, current) => {
    const currentPercentage = (current.score / current.total_points) * 100;
    const bestPercentage = (best.score / best.total_points) * 100;
    return currentPercentage > bestPercentage ? current : best;
  });
  const bestPercentage = (bestAttempt.score / bestAttempt.total_points) * 100;

  return {
    total_attempts: attempts. length,
    total_tests_taken: testAttemptsMap.size,
    average_score: overallPercentage,
    best_score:  bestPercentage,
    total_questions_answered: totalPoints,
    total_correct_answers: totalScore,
    tests: testStats,
  };
}

/**
 * Получить информацию о попытке с расчетом процента
 */
export function getAttemptInfo(attempt: TestAttemptResponse) {
  const percentage =
    attempt.total_points > 0
      ?  (attempt.score / attempt.total_points) * 100
      : 0;

  return {
    ... attempt,
    percentage,
  };
}