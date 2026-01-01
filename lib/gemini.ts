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

**CRITICAL INSTRUCTION ON PORTION ESTIMATION**: 
1. Look at the size of the food relative to the plate and utensils (fork/spoon). 
2. Do NOT simply assign standard calories for "1 unit" (e.g., 1 whole banana). 
3. Carefully observe if it is a whole item, a slice, a piece, or a handful. 
4. If a banana is cut into small pieces, calculate only for those pieces (e.g., "0.3 units" or "30g") rather than a full unit.

Please provide the following information:

1. **Overall Meal Summary**:
   - menu_name: Overall meal name in Korean
   - food_category: "한식", "양식", "일식", "중식", "간식", "음료" 등
   - ingredients: Array of ALL ingredients visible (in Korean)
   - portion_size: Total serving size (e.g., "0.5인분", "1인분")

2. **Total Nutrition (sum of all items)**:
   - calories, carbohydrates, protein, fat, pfc_ratio (protein%, fat%, carbs% - sum to 100)

3. **Individual Food Items** (Analyze each item with high precision):
   - food_items: Array of objects
   - For each item include:
     - name: Specific food name in Korean
     - calories, carbohydrates, protein, fat
     - quantity_description: Describe the visual quantity (e.g., "바나나 조각 2개", "샐러드 한 줌")
     - portion_size: Estimated weight (g) or unit (e.g., "0.3개")

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
      "quantity_description": "string",
      "portion_size": "string",
      "calories": number,
      "carbohydrates": number,
      "protein": number,
      "fat": number
    }
  ]
}

**Example**: If you see rice, grilled fish, and soup:
- menu_name: "구운 생선 정식"
- food_items: [
    {"name": "흰쌀밥", "quantity_description": "공기 2/3 정도", "portion_size": "150g", "calories": 200, ...},
    {"name": "구운 고등어", "quantity_description": "반 마리", "portion_size": "80g", "calories": 150, ...}
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
