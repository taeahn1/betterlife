import { GoogleGenerativeAI } from '@google/generative-ai';
import { SkinAnalysisMetadata } from '@/types';

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
}

const genAI = new GoogleGenerativeAI(apiKey);

interface ImageInput {
    buffer: Buffer;
    mimeType: string;
    position: 'left' | 'front' | 'right';
}

/**
 * Analyze 3 skin images (Left, Front, Right) using Gemini 2.0 Flash
 */
export async function analyzeSkinImages(images: ImageInput[]): Promise<SkinAnalysisMetadata> {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const imageParts = images.map(img => ({
            inlineData: {
                data: img.buffer.toString('base64'),
                mimeType: img.mimeType
            }
        }));

        const prompt = `
You are an expert Dermatologist and Data Analyst. Analyze these 3 photos of a patient's face (Left, Front, Right) to evaluate skin condition.
Identify acne, inflammation, and scars with extreme precision.

**Output Requirement**: Return ONLY valid JSON. No markdown formatting.

**Analysis Criteria**:

1. **Hard Count (Lesion Counts)**:
   - Count EXACT numbers of lesions visible across all 3 images (avoid double counting overlapping areas).
   - "non_inflammatory": Whiteheads/Blackheads (Grade 1)
   - "inflammatory": Papules/Pustules (Grade 2-3)
   - "cystic": Nodules/Cysts (Grade 4) - Deep, painful lumps
   - "large_lesions": Count lesions with estimated diameter > 5mm

2. **Spatial Mapping**:
   - "primary_locations": List areas with highest density (e.g., "Left Cheek", "Forehead", "Jawline").
   - "distribution_pattern": "Clustered" (grouped together) or "Scattered" (spread out).

3. **Asymmetry Index**:
   - Compare Left vs Right face images.
   - "left_count": Total lesions on left side.
   - "right_count": Total lesions on right side.
   - "diff_ratio": Right count / Left count (or Left/Right if Left is dominant). e.g., if Right=10, Left=2, ratio is 5.0. If mostly balanced, ratio is ~1.0.
   - "comment": E.g., "Right side has significantly more inflammation, possibly due to sleeping position."

4. **Post-Acne Marking**:
   - "pigmentation_count": Red/Brown spots (PIH/PIE) that are NOT active pimples.
   - "pitted_scars": Boolean. True if there are indentations/ice-pick scars.

5. **Integrated Scores (Calculation Logic)**:
   - "inflammatory_score": (non_inflammatory * 1) + (inflammatory * 3) + (cystic * 10). Higher is worse.
   - "spatial_risk_score": If Pattern is "Clustered", score 20. If "Scattered", score 5. (+5 for Jawline location).
   - "total_health_index": 
     Start with 100.
     Subtract (inflammatory_score * 0.5).
     Subtract (pigmentation_count * 0.2).
     Subtract spatial_risk_score.
     If Asymmetry Ratio > 2.0, subtract 10 (Lifestyle penalty).
     Min score is 0, Max is 100.
   - "status": "Good" (80-100), "Warning" (50-79), "Danger" (0-49).

**JSON Format**:
{
  "lesion_counts": {
    "non_inflammatory": number,
    "inflammatory": number,
    "cystic": number,
    "large_lesions": number
  },
  "spatial_mapping": {
    "primary_locations": ["string"],
    "distribution_pattern": "Clustered" | "Scattered"
  },
  "asymmetry": {
    "left_count": number,
    "right_count": number,
    "diff_ratio": number,
    "comment": "string"
  },
  "post_acne": {
    "pigmentation_count": number,
    "pitted_scars": boolean
  },
  "scores": {
    "inflammatory_score": number,
    "spatial_risk_score": number,
    "total_health_index": number,
    "status": "Good" | "Warning" | "Danger"
  },
  "analysis_date": "${new Date().toISOString()}"
}
`;

        const result = await model.generateContent([prompt, ...imageParts]);
        const response = result.response;
        const text = response.text();

        // Extract JSON
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Failed to extract JSON from Gemini Skin Analysis');
        }

        const data: SkinAnalysisMetadata = JSON.parse(jsonMatch[0]);

        // Add image placeholders (will be filled by caller with URLs)
        data.image_urls = {};

        return data;

    } catch (error) {
        console.error('Error analyzing skin images:', error);
        throw new Error('Failed to analyze skin images');
    }
}
