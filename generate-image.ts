import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main() {
  try {
    console.log('Generating image...');
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: 'A sleek, modern, and professional hero image for a web application. The image must have a dark, black and white monochrome tone with subtle glowing white or silver accents. It represents an AI-powered keyword strategy engine. The Korean text "혁신 키워드 조합 AI" must be written clearly and prominently in the center of the image in a modern, bold sans-serif font. High quality, digital art, tech vibe.',
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: "1K"
        }
      }
    });

    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const buffer = Buffer.from(part.inlineData.data, 'base64');
        fs.writeFileSync(path.join(publicDir, 'hero.png'), buffer);
        console.log('Image saved successfully to public/hero.png');
        return;
      }
    }
    console.log('No image data found in response.');
  } catch (error) {
    console.error('Error generating image:', error);
  }
}

main();
