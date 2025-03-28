'use client';

import { useRef } from 'react';
import Image from 'next/image';

interface RecipeData {
  title: string;
  servings: string;
  prepTime: string;
  cookTime: string;
  ingredients: string[];
  instructions: string[];
  image?: string[];
}

interface RecipeCardProps {
  recipe: RecipeData;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const downloadPDF = async () => {
    if (!cardRef.current) return;

    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const opt = {
        margin: 1,
        filename: `${recipe.title.toLowerCase().replace(/\s+/g, '-')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          logging: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        },
        jsPDF: { 
          unit: 'in', 
          format: 'letter', 
          orientation: 'portrait' as const 
        }
      };

      // Create a temporary div with standard RGB colors
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = cardRef.current.innerHTML;
      
      // Replace Tailwind classes with standard RGB colors
      const elements = tempDiv.getElementsByTagName('*');
      for (const element of elements) {
        const htmlElement = element as HTMLElement;
        
        // Remove all Tailwind classes
        const classes = Array.from(htmlElement.classList);
        classes.forEach(className => {
          if (className.startsWith('text-') || className.startsWith('bg-')) {
            htmlElement.classList.remove(className);
          }
        });

        // Add standard colors based on original classes
        if (classes.includes('text-gray-900')) {
          htmlElement.style.color = '#111827';
        } else if (classes.includes('text-gray-800')) {
          htmlElement.style.color = '#1F2937';
        } else if (classes.includes('text-gray-600')) {
          htmlElement.style.color = '#4B5563';
        } else if (classes.includes('text-white')) {
          htmlElement.style.color = '#ffffff';
        }

        if (classes.includes('bg-white')) {
          htmlElement.style.backgroundColor = '#ffffff';
        } else if (classes.includes('bg-green-600')) {
          htmlElement.style.backgroundColor = '#059669';
        } else if (classes.includes('hover:bg-green-700')) {
          htmlElement.style.backgroundColor = '#047857';
        }

        // Add base styles
        if (htmlElement.tagName === 'H1') {
          htmlElement.style.fontSize = '1.875rem';
          htmlElement.style.fontWeight = '700';
          htmlElement.style.marginBottom = '1.5rem';
          htmlElement.style.textAlign = 'center';
        } else if (htmlElement.tagName === 'H2') {
          htmlElement.style.fontSize = '1.25rem';
          htmlElement.style.fontWeight = '700';
          htmlElement.style.marginBottom = '1rem';
        } else if (htmlElement.tagName === 'H3') {
          htmlElement.style.fontWeight = '600';
        }

        // Add list styles
        if (htmlElement.tagName === 'UL') {
          htmlElement.style.listStyleType = 'disc';
          htmlElement.style.paddingLeft = '1.5rem';
        } else if (htmlElement.tagName === 'OL') {
          htmlElement.style.listStyleType = 'decimal';
          htmlElement.style.paddingLeft = '1.5rem';
        }

        // Add button styles
        if (htmlElement.tagName === 'BUTTON') {
          htmlElement.style.width = '100%';
          htmlElement.style.padding = '0.5rem 1rem';
          htmlElement.style.borderRadius = '0.375rem';
          htmlElement.style.marginTop = '1.5rem';
        }
      }

      await html2pdf().set(opt).from(tempDiv).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div ref={cardRef} className="bg-white rounded-lg shadow-lg p-8 print:shadow-none">
        {recipe.image && recipe.image[0] && (
          <div className="relative w-full h-64 mb-8 rounded-lg overflow-hidden">
            <Image
              src={recipe.image[0]}
              alt={recipe.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              unoptimized
            />
          </div>
        )}
        
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-900">{recipe.title}</h1>
        
        <div className="grid grid-cols-3 gap-4 mb-8 text-center">
          <div>
            <h3 className="font-semibold text-gray-800">Servings</h3>
            <p className="text-gray-900">{recipe.servings}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Prep Time</h3>
            <p className="text-gray-900">{recipe.prepTime}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Cook Time</h3>
            <p className="text-gray-900">{recipe.cookTime}</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Ingredients</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-900">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4 text-gray-900">Instructions</h2>
          <ol className="list-decimal list-inside space-y-4 text-gray-900">
            {recipe.instructions.map((instruction, index) => (
              <li key={index} className="ml-4">{instruction}</li>
            ))}
          </ol>
        </div>
      </div>

      <button
        onClick={downloadPDF}
        className="mt-6 w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
      >
        Download as PDF
      </button>
    </div>
  );
} 