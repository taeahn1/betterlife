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

**IMPORTANT**: If there are multiple food items in the image, analyze EACH item separately.

Please provide the following information:

1. **Overall Meal Summary**:
   - menu_name: Overall meal name in Korean (e.g., "연어 덮밥과 된장국 세트")
   - food_category: Category like "한식", "양식", "일식", "중식", "간식", "음료"
   - ingredients: Array of ALL ingredients visible (in Korean)
   - portion_size: Total serving size like "1인분", "2인분"

2. **Total Nutrition (sum of all items)**:
   - calories: Total calories (kcal)
   - carbohydrates: Total carbs (g)
   - protein: Total protein (g)
   - fat: Total fat (g)
   - pfc_ratio: Percentage breakdown (protein%, fat%, carbs%) - must sum to 100

3. **Individual Food Items** (CRITICAL - analyze each item separately):
   - food_items: Array of objects, one for EACH distinct food item
   - For each item include:
     - name: Specific food name in Korean
     - calories, carbohydrates, protein, fat (individual values)
     - portion_size: Size of this specific item

Return ONLY valid JSON in this exact format:
{
  "menu_name": "string",
  "food_category": "string",
  "ingredients": ["string"],
  "portion_size": "string",
  "calories": number,
  "carbohydrates": number,
  "protein": number,
  "fat": number,
  "pfc_ratio": {
    "protein": number,
    "fat": number,
    "carbs": number
  },
  "food_items": [
    {
      "name": "string",
      "calories": number,
      "carbohydrates": number,
      "protein": number,
      "fat": number,
      "portion_size": "string"
    }
  ]
}

**Example**: If you see rice, grilled fish, and soup:
- menu_name: "구운 생선 정식"
- food_items: [
    {"name": "흰쌀밥", "calories": 300, ...},
    {"name": "구운 고등어", "calories": 250, ...},
    {"name": "된장국", "calories": 50, ...}
  ]

Be as accurate as possible. If there's only one item, food_items array will have one object.`;

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
