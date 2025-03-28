import { NextResponse } from 'next/server';
import { scrapeRecipe } from '@/lib/scrapeRecipe';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    console.log('Processing URL:', url);
    const recipeData = await scrapeRecipe(url);

    // Validate that we got some data
    if (!recipeData.title && recipeData.ingredients.length === 0 && recipeData.instructions.length === 0) {
      return NextResponse.json(
        { error: 'No recipe data found on the page' },
        { status: 404 }
      );
    }

    return NextResponse.json(recipeData);
  } catch (error) {
    console.error('Error in extract route:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to extract recipe data';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 