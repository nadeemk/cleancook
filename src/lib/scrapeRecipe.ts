import * as cheerio from 'cheerio';

interface RecipeData {
  title: string;
  servings: string;
  prepTime: string;
  cookTime: string;
  ingredients: string[];
  instructions: string[];
  image?: string[];
}

function formatDuration(duration: string): string {
  if (!duration) return '';
  
  // Remove the PT prefix
  const time = duration.replace('PT', '');
  
  // Extract hours and minutes
  const hours = time.match(/(\d+)H/)?.[1] || '0';
  const minutes = time.match(/(\d+)M/)?.[1] || '0';
  
  // Format the time
  if (parseInt(hours) > 0) {
    return `${hours} hr ${minutes} min`;
  }
  return `${minutes} min`;
}

function extractInstructions(instructions: any): string[] {
  if (Array.isArray(instructions)) {
    return instructions.flatMap(instruction => {
      if (typeof instruction === 'string') {
        return instruction;
      }
      if (instruction['@type'] === 'HowToSection') {
        return instruction.itemListElement.map((step: any) => step.text || step.name);
      }
      if (instruction['@type'] === 'HowToStep') {
        return instruction.text || instruction.name;
      }
      return '';
    }).filter(Boolean);
  }
  return [];
}

export async function scrapeRecipe(url: string): Promise<RecipeData> {
  try {
    console.log('Fetching URL:', url);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }
    const html = await response.text();
    const $ = cheerio.load(html);

    // First try to find JSON-LD schema.org/Recipe
    const jsonLd = $('script[type="application/ld+json"]').toArray();
    console.log('Found JSON-LD scripts:', jsonLd.length);

    for (const script of jsonLd) {
      try {
        const data = JSON.parse($(script).html() || '');
        console.log('Parsed JSON-LD data:', data);
        
        // Handle @graph structure
        if (data['@graph']) {
          const recipe = data['@graph'].find((item: any) => item['@type'] === 'Recipe');
          if (recipe) {
            console.log('Found recipe in @graph:', recipe);
            return {
              title: recipe.name || '',
              servings: Array.isArray(recipe.recipeYield) ? recipe.recipeYield.join(', ') : recipe.recipeYield || '',
              prepTime: formatDuration(recipe.prepTime),
              cookTime: formatDuration(recipe.cookTime),
              ingredients: Array.isArray(recipe.recipeIngredient) 
                ? recipe.recipeIngredient 
                : [recipe.recipeIngredient || ''],
              instructions: extractInstructions(recipe.recipeInstructions),
              image: Array.isArray(recipe.image) ? recipe.image : recipe.image ? [recipe.image] : undefined
            };
          }
        }
        
        // Handle array of items
        if (Array.isArray(data)) {
          const recipe = data.find(item => item['@type'] === 'Recipe');
          if (recipe) {
            console.log('Found recipe in array:', recipe);
            return {
              title: recipe.name || '',
              servings: Array.isArray(recipe.recipeYield) ? recipe.recipeYield.join(', ') : recipe.recipeYield || '',
              prepTime: formatDuration(recipe.prepTime),
              cookTime: formatDuration(recipe.cookTime),
              ingredients: Array.isArray(recipe.recipeIngredient) 
                ? recipe.recipeIngredient 
                : [recipe.recipeIngredient || ''],
              instructions: extractInstructions(recipe.recipeInstructions),
              image: Array.isArray(recipe.image) ? recipe.image : recipe.image ? [recipe.image] : undefined
            };
          }
        } 
        // Handle single recipe
        else if (data['@type'] === 'Recipe') {
          console.log('Found single recipe:', data);
          return {
            title: data.name || '',
            servings: Array.isArray(data.recipeYield) ? data.recipeYield.join(', ') : data.recipeYield || '',
            prepTime: formatDuration(data.prepTime),
            cookTime: formatDuration(data.cookTime),
            ingredients: Array.isArray(data.recipeIngredient)
              ? data.recipeIngredient
              : [data.recipeIngredient || ''],
            instructions: extractInstructions(data.recipeInstructions),
            image: Array.isArray(data.image) ? data.image : data.image ? [data.image] : undefined
          };
        }
      } catch (e) {
        console.log('Failed to parse JSON-LD:', e);
      }
    }

    // Fallback to HTML parsing
    console.log('Falling back to HTML parsing');
    const title = $('h1').first().text().trim();
    console.log('Found title:', title);

    const servings = $('[itemprop="recipeYield"]').text().trim() || '';
    const prepTime = $('[itemprop="prepTime"]').text().trim() || '';
    const cookTime = $('[itemprop="cookTime"]').text().trim() || '';

    const ingredients: string[] = [];
    $('[itemprop="recipeIngredient"]').each((_, el) => {
      ingredients.push($(el).text().trim());
    });
    console.log('Found ingredients:', ingredients.length);

    const instructions: string[] = [];
    $('[itemprop="recipeInstructions"] li, [itemprop="recipeInstructions"] p').each((_, el) => {
      instructions.push($(el).text().trim());
    });
    console.log('Found instructions:', instructions.length);

    // Additional selectors for common recipe sites
    if (ingredients.length === 0) {
      $('.ingredients li, .recipe-ingredients li, .ingredient-item').each((_, el) => {
        ingredients.push($(el).text().trim());
      });
      console.log('Found ingredients with alternative selectors:', ingredients.length);
    }

    if (instructions.length === 0) {
      $('.instructions li, .recipe-instructions li, .step-item').each((_, el) => {
        instructions.push($(el).text().trim());
      });
      console.log('Found instructions with alternative selectors:', instructions.length);
    }

    // Try to find recipe image
    const image = $('[itemprop="image"]').attr('src') || $('.recipe-image img').attr('src');
    const images = image ? [image] : undefined;

    if (ingredients.length === 0 && instructions.length === 0) {
      throw new Error('No recipe data found in the page');
    }

    return {
      title,
      servings,
      prepTime: formatDuration(prepTime),
      cookTime: formatDuration(cookTime),
      ingredients,
      instructions,
      image: images
    };
  } catch (error) {
    console.error('Error scraping recipe:', error);
    throw new Error(`Failed to extract recipe data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 