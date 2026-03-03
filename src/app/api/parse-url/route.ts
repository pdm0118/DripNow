export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as cheerio from "cheerio";

export async function POST(request: Request) {
    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "Gemini API key is not configured" }, { status: 500 });
        }

        const body = await request.json();
        const urlToScrape = body.url;

        if (!urlToScrape || typeof urlToScrape !== 'string') {
            return NextResponse.json({ error: "Invalid URL provided" }, { status: 400 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            // Enable Google Search Grounding
            // @ts-ignore
            tools: [{ googleSearch: {} }]
        });

        // Let Gemini use its search grounding to find the product directly from the URL or domain.
        const prompt = `
당신은 최고의 패션 코디네이터 전문 AI입니다. 아래 주어진 쇼핑몰 URL(또는 상품명)에 접속하거나 구글 검색을 통해 상품에 대한 정보를 추출하여 완벽한 JSON 형식으로 반환하세요.

대상 URL: ${urlToScrape}

[필수 요구사항]
오직 순수한 JSON 객체(마크다운 코드 블록 제외)만 반환해야 합니다. 다른 말은 절대 금지합니다. 단, 구글 검색을 활용해서 최대한 정확한 실제 정보를 찾아주세요.
키 이름과 규칙:
- "name": 상품의 이름 (가장 길게 적힌 대표 쇼핑몰 상품명)
- "brand": 브랜드명 (가능하다면 추출)
- "category": 반드시 다음 중 하나여야 함. ("outer", "top", "bottom", "shoes", "accessory"). 옷을 보고 합리적으로 추론하세요.
- "color": 상품 색상. 여러 개면 배열 대신 대표 색상 1개만 문자열로 적고, 찾지 못하면 "기본" 지정.
- "material": 옷의 주요 소재 (코튼, 울, 폴리에스터 등). 없으면 "Unknown".
- "thickness": 두께감. 반드시 다음 중 하나 ("thin", "normal", "thick", "heavy"). 계절성(여름이면 thin)이나 패딩/코트 종류에 따라 추론하세요.
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
        console.error("URL Parsing AI Error:", error);
        return NextResponse.json({ error: "AI가 상품 정보를 분석하는 데 실패했습니다." }, { status: 500 });
    }
}
