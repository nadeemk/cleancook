'use client';

import { useSearchParams } from 'next/navigation';
import RecipeCard from '@/components/RecipeCard';

export default function RecipePage() {
  const searchParams = useSearchParams();
  const data = searchParams.get('data');
  const recipe = data ? JSON.parse(decodeURIComponent(data)) : null;

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">No Recipe Data</h1>
            <p className="mt-2 text-gray-600">Please go back and try again.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <RecipeCard recipe={recipe} />
    </div>
  );
} 