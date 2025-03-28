'use client';

import { useSearchParams } from 'next/navigation';
import RecipeCard from '@/components/RecipeCard';

export default function RecipePage() {
  const searchParams = useSearchParams();
  const recipeData = searchParams.get('data');

  if (!recipeData) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-center text-red-600">
            No recipe data found. Please try again.
          </h1>
        </div>
      </div>
    );
  }

  try {
    const recipe = JSON.parse(decodeURIComponent(recipeData));
    return (
      <main className="min-h-screen bg-gray-50 py-12">
        <RecipeCard recipe={recipe} />
      </main>
    );
  } catch (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-center text-red-600">
            Invalid recipe data. Please try again.
          </h1>
        </div>
      </div>
    );
  }
} 