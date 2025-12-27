// admin/src/app/dashboard/test/[id]/question/[questionId]/edit/page.tsx
"use client";

import { use } from 'react';
import EditQuestionPage from './EditQuestionPage';

export default function Page({ params }: { params: Promise<{ id: string; questionId: string }> }) {
  const resolvedParams = use(params);
  const testId = parseInt(resolvedParams.id);
  const questionId = parseInt(resolvedParams.questionId);
  
  return <EditQuestionPage testId={testId} questionId={questionId} />;
}