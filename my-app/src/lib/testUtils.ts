/**
 * Test Results Utilities
 *
 * Business Logic for calculating test pass/fail status.
 *
 * CRITICAL RULES:
 * 1. Calculate percentage: (score / total_points) * 100
 * 2. Test is PASSED if percentage >= passing_score
 * 3. DO NOT compare score directly with passing_score
 * 4. DO NOT trust backend `passed` flag — calculate on frontend
 * 5. Multiple attempts: test is PASSED if ANY attempt was successful
 * 6. Show last attempt result, but track overall pass status
 */

import type { TestResult, TestAttemptResponse } from "@/src/types/api";

// =============================================================================
// Types
// =============================================================================

export interface TestPassStatus {
  /** Whether the test has ever been passed (across all attempts) */
  hasEverPassed: boolean;
  /** Whether the current/last attempt passed */
  currentAttemptPassed: boolean;
  /** Calculated percentage for the current/last attempt */
  currentPercentage: number;
  /** Passing threshold in percentage */
  passingPercentage: number;
  /** Score earned in current attempt */
  currentScore: number;
  /** Max possible score */
  totalPoints: number;
  /** Best percentage achieved across all attempts */
  bestPercentage: number;
  /** Number of attempts made */
  attemptCount: number;
}

export interface TestListStatus {
  testId: number;
  hasEverPassed: boolean;
  lastPercentage: number | null;
  bestPercentage: number | null;
  attemptCount: number;
}

// =============================================================================
// Core Calculation Functions
// =============================================================================

/**
 * Calculate percentage score from raw score and total points.
 *
 * @param score - Points earned
 * @param totalPoints - Maximum possible points
 * @returns Percentage (0-100), rounded to 1 decimal place
 */
export function calculatePercentage(
  score: number,
  totalPoints: number
): number {
  if (totalPoints <= 0) return 0;
  const percentage = (score / totalPoints) * 100;
  return Math.round(percentage * 10) / 10; // Round to 1 decimal
}

/**
 * Determine if a test is passed based on percentage and passing threshold.
 *
 * ⚠️ IMPORTANT: Always use this function instead of comparing score vs passing_score directly
 *
 * @param percentage - Calculated percentage (0-100)
 * @param passingScore - Passing threshold in percent (0-100)
 * @returns true if passed
 */
export function isTestPassed(
  percentage: number,
  passingScore: number
): boolean {
  return percentage >= passingScore;
}

/**
 * Calculate test result from a TestResult object.
 * Does NOT trust the backend `passed` flag — recalculates on frontend.
 */
export function calculateTestResult(result: TestResult): {
  percentage: number;
  passed: boolean;
} {
  const percentage = calculatePercentage(result.score, result.total_points);
  const passed = isTestPassed(percentage, result.passing_score);
  return { percentage, passed };
}

// =============================================================================
// Multiple Attempts Handling
// =============================================================================

/**
 * Analyze all attempts for a test to determine overall pass status.
 *
 * BUSINESS RULE: Test is PASSED if AT LEAST ONE attempt was successful.
 * Last attempt is used for displaying "current result".
 *
 * @param attempts - Array of test attempts
 * @param passingScore - Passing threshold in percent (0-100)
 * @returns Comprehensive pass status object
 */
export function analyzeTestAttempts(
  attempts: TestAttemptResponse[],
  passingScore: number
): TestPassStatus {
  if (attempts.length === 0) {
    return {
      hasEverPassed: false,
      currentAttemptPassed: false,
      currentPercentage: 0,
      passingPercentage: passingScore,
      currentScore: 0,
      totalPoints: 0,
      bestPercentage: 0,
      attemptCount: 0,
    };
  }

  // Sort attempts by completion time (most recent last)
  const sortedAttempts = [...attempts].sort((a, b) => {
    const timeA = a.completed_at ? new Date(a.completed_at).getTime() : 0;
    const timeB = b.completed_at ? new Date(b.completed_at).getTime() : 0;
    return timeA - timeB;
  });

  // Get the last (most recent) attempt
  const lastAttempt = sortedAttempts[sortedAttempts.length - 1];

  // Calculate all percentages and find best
  let hasEverPassed = false;
  let bestPercentage = 0;

  for (const attempt of sortedAttempts) {
    const percentage = calculatePercentage(attempt.score, attempt.total_points);
    const passed = isTestPassed(percentage, passingScore);

    if (passed) {
      hasEverPassed = true;
    }

    if (percentage > bestPercentage) {
      bestPercentage = percentage;
    }
  }

  // Calculate current (last) attempt status
  const currentPercentage = calculatePercentage(
    lastAttempt.score,
    lastAttempt.total_points
  );
  const currentAttemptPassed = isTestPassed(currentPercentage, passingScore);

  return {
    hasEverPassed,
    currentAttemptPassed,
    currentPercentage,
    passingPercentage: passingScore,
    currentScore: lastAttempt.score,
    totalPoints: lastAttempt.total_points,
    bestPercentage,
    attemptCount: attempts.length,
  };
}

// =============================================================================
// LocalStorage Persistence (for offline/quick access)
// =============================================================================

const STORAGE_KEY_PREFIX = "test_result_";

interface StoredTestStatus {
  hasEverPassed: boolean;
  bestPercentage: number;
  lastPercentage: number;
  attemptCount: number;
  updatedAt: string;
}

/**
 * Save test status to localStorage for quick access on list pages.
 * This is a cache — the source of truth should be fetched from API.
 */
export function saveTestStatusToStorage(
  testId: number,
  status: TestPassStatus
): void {
  const stored: StoredTestStatus = {
    hasEverPassed: status.hasEverPassed,
    bestPercentage: status.bestPercentage,
    lastPercentage: status.currentPercentage,
    attemptCount: status.attemptCount,
    updatedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(
      `${STORAGE_KEY_PREFIX}${testId}`,
      JSON.stringify(stored)
    );
  } catch (e) {
    console.warn("Failed to save test status to localStorage:", e);
  }
}

/**
 * Load test status from localStorage.
 * Returns null if not found or invalid.
 */
export function loadTestStatusFromStorage(
  testId: number
): StoredTestStatus | null {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${testId}`);
    if (!stored) return null;
    return JSON.parse(stored) as StoredTestStatus;
  } catch (e) {
    return null;
  }
}

/**
 * Get pass status for multiple tests from localStorage.
 * Useful for quickly showing status badges on test list page.
 */
export function getTestListStatusFromStorage(
  testIds: number[]
): Map<number, StoredTestStatus | null> {
  const result = new Map<number, StoredTestStatus | null>();
  for (const testId of testIds) {
    result.set(testId, loadTestStatusFromStorage(testId));
  }
  return result;
}

// =============================================================================
// UI Helper Functions
// =============================================================================

/**
 * Get color class for status display.
 */
export function getStatusColorClass(passed: boolean): {
  bg: string;
  text: string;
  border: string;
} {
  if (passed) {
    return {
      bg: "bg-green-100",
      text: "text-green-700",
      border: "border-green-200",
    };
  }
  return {
    bg: "bg-red-100",
    text: "text-red-700",
    border: "border-red-200",
  };
}

/**
 * Get status text in Russian.
 */
export function getStatusText(passed: boolean): string {
  return passed ? "Тест пройден" : "Тест не пройден";
}

/**
 * Get short badge text in Russian.
 */
export function getStatusBadgeText(passed: boolean): string {
  return passed ? "✓ Пройден" : "✗ Не пройден";
}

/**
 * Format percentage for display.
 */
export function formatPercentage(percentage: number): string {
  // If it's a whole number, show without decimals
  if (percentage === Math.floor(percentage)) {
    return `${percentage}%`;
  }
  return `${percentage.toFixed(1)}%`;
}
