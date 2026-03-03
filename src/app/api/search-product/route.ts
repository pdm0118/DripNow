export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: Request) {
    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "Gemini API key is not configured" }, { status: 500 });
        }

        const body = await request.json();
        const query = body.query;

        if (!query || typeof query !== 'string') {
            return NextResponse.json({ error: "Invalid search query provided" }, { status: 400 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            // Enable Google Search Grounding
            // @ts-ignore
            tools: [{ googleSearch: {} }]
        });

        const prompt = `
당신은 최고의 패션 코디네이터 전문 AI입니다. 사용자가 텍스트로 상품명, 브랜드명, 혹은 색상을 대략적으로 입력했습니다.
이 텍스트를 바탕으로 구글 검색을 활용해 가장 정확한 해당 옷(상품)을 찾고 상세 정보를 추출하여 완벽한 JSON 형식으로 반환하세요.

사용자 검색어: "${query}"

[필수 요구사항]
오직 순수한 JSON 객체(마크다운 코드 블록 제외)만 반환해야 합니다. 다른 말은 절대 금지합니다.
키 이름과 규칙:
- "name": 구글 검색을 통해 찾은 가장 정확한 공식 상품명
- "brand": 공식 브랜드명 
- "category": 반드시 다음 중 하나여야 함. ("outer", "top", "bottom", "shoes", "accessory"). 옷을 보고 합리적으로 추론하세요.
- "color": 상품 대표 색상 (ex. "Dark Navy", "Beige"). 여러 개면 1개만 반환.
- "material": 옷의 핵심 소재 (코튼, 울, 폴리에스터 등). 없으면 "Unknown".
- "thickness": 두께감. 반드시 다음 중 하나 ("thin", "normal", "thick", "heavy"). 계절성을 통해 추론하세요.
- "confidence": 이 검색 결과가 사용자가 의도한 상품일 확률 (0~100 사이의 숫자).
`;

        const result = await model.generateContent(prompt);
        let responseText = result.response.text().trim();

        // Strip markdown backticks
        if (responseText.startsWith("\`\`\`")) {
            const lines = responseText.split("\n");
            if (lines[0].includes("json")) lines.shift();
            if (lines[lines.length - 1].includes("\`\`\`")) lines.pop();
            responseText = lines.join("\n").trim();
        }

        const extracted = JSON.parse(responseText);
        return NextResponse.json(extracted);

    } catch (error: any) {
        console.error("Text Search AI Error:", error);
        return NextResponse.json({ error: "AI가 상품 정보를 검색하는 데 실패했습니다." }, { status: 500 });
    }
}
