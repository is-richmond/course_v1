// admin/src/app/dashboard/test/[id]/edit/page.tsx
"use client";

import { use } from 'react';
import EditTestPage from './EditTestPage';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const testId = parseInt(resolvedParams.id);
  
  return <EditTestPage testId={testId} />;
}