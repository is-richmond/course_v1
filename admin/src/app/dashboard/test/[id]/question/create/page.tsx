// admin/src/app/dashboard/test/[id]/question/create/page.tsx
"use client";

import { use } from 'react';
import CreateQuestionPage from './CreateQuestionPage';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const testId = parseInt(resolvedParams.id);
  
  return <CreateQuestionPage testId={testId} />;
}