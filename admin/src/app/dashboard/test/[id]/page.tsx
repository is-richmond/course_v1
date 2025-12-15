"use client";

import { use } from 'react';
import TestDetailsPage from './TestDetailsPage';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const testId = parseInt(resolvedParams.id);
  
  return <TestDetailsPage testId={testId} />;
}