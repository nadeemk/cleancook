import RecipeForm from '@/components/RecipeForm';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">CleanCook</h1>
        <p className="text-center text-gray-800 mb-12">
          Paste a recipe URL to get a clean, printable version
        </p>
        <RecipeForm />
      </div>
    </main>
  );
}
