import { Suspense } from 'react';
import UnsubscribeContent from './UnsubscribeContent';

export default async function UnsubscribePage() {

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 px-4">
      <Suspense fallback={<div className="text-center">Loading...</div>}>
        <UnsubscribeContent />
      </Suspense>
    </div>
  );
}
