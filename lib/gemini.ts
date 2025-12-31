import { GoogleGenerativeAI } from '@google/generative-ai';
import { MealMetadata } from '@/types';

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
}

const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Analyze food image using Gemini Vision API
 * @param imageBuffer - Image file buffer
 * @param mimeType - Image MIME type (e.g., 'image/jpeg')
 * @returns Parsed meal metadata
 */
export async function analyzeFoodImage(
    imageBuffer: Buffer,
    mimeType: string
): Promise<MealMetadata> {
    try {
        // Use Gemini 2.0 Flash model for vision tasks
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const prompt = `Analyze this food image and provide detailed nutritional information in JSON format.

Please provide the following information:

1. **Basic Nutrition (The Big 4)**:
   - calories: Total estimated energy (kcal)
   - carbohydrates: Amount in grams
   - protein: Amount in grams
   - fat: Amount in grams

2. **Food Identity**:
   - menu_name: Specific dish name in Korean (e.g., "연어 아보카도 덮밥")
   - food_category: Category like "한식", "양식", "일식", "중식", "간식", "음료"
   - ingredients: Array of main ingredients visible in the image (in Korean)

3. **Portion & Ratio**:
   - portion_size: Estimated serving size like "1인분", "0.5인분", "1.5인분"
   - pfc_ratio: Object with protein, fat, and carbs percentages of total calories
     - protein: percentage (0-100)
     - fat: percentage (0-100)
     - carbs: percentage (0-100)
     - Note: protein + fat + carbs should equal 100

Return ONLY valid JSON in this exact format:
{
  "calories": number,
  "carbohydrates": number,
  "protein": number,
  "fat": number,
  "menu_name": "string",
  "food_category": "string",
  "ingredients": ["string"],
  "portion_size": "string",
  "pfc_ratio": {
    "protein": number,
    "fat": number,
    "carbs": number
  }
}

Be as accurate as possible based on visual analysis. If uncertain, provide reasonable estimates.`;

        const imagePart = {
            inlineData: {
                data: imageBuffer.toString('base64'),
                mimeType,
            },
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = result.response;
        const text = response.text();

        // Extract JSON from response (remove markdown code blocks if present)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Failed to extract JSON from Gemini response');
        }

        const mealData: MealMetadata = JSON.parse(jsonMatch[0]);

        // Validate required fields
        if (
            typeof mealData.calories !== 'number' ||
            typeof mealData.carbohydrates !== 'number' ||
            typeof mealData.protein !== 'number' ||
            typeof mealData.fat !== 'number' ||
            !mealData.menu_name ||
            !mealData.food_category ||
            !Array.isArray(mealData.ingredients) ||
            !mealData.portion_size ||
            !mealData.pfc_ratio
        ) {
            throw new Error('Invalid meal data structure from Gemini');
        }

        return mealData;
    } catch (error) {
        console.error('Error analyzing food image:', error);
        throw new Error('Failed to analyze food image with Gemini API');
    }
}
