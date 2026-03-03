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

        // Fetch HTML content from URL
        const res = await fetch(urlToScrape, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7"
            }
        });

        if (!res.ok) {
            console.error("Fetch returned status:", res.status);
            return NextResponse.json({ error: "쇼핑몰 URL에 접근할 수 없습니다 (접근 차단됨)." }, { status: 400 });
        }

        const html = await res.text();
        const $doc = cheerio.load(html);

        // Clean up DOM to reduce tokens
        $doc("script, style, noscript, svg, header, footer, path, img").remove();

        // Extract raw text and condense
        const rawText = $doc("body").text().replace(/\s+/g, " ").substring(0, 20000);

        const prompt = `
당신은 최고의 패션 코디네이터 전문 AI입니다. 아래 주어진 쇼핑몰 페이지의 텍스트에서 판매 중인 옷(상품)에 대한 정보를 추출하여 완벽한 JSON 형식으로 반환하세요.

Text Extract:
"""
${rawText}
"""

[필수 요구사항]
오직 순수한 JSON 객체(마크다운 코드 블록 제외)만 반환해야 합니다. 다른 말은 절대 금지합니다.
키 이름과 규칙:
- "name": 상품의 이름 (가장 길게 적힌 대표 상품명)
- "brand": 브랜드명 (가능하다면 추출)
- "category": 반드시 다음 중 하나여야 함. ("outer", "top", "bottom", "shoes", "accessory"). 옷을 보고 합리적으로 추론하세요.
- "color": 상품 색상 (ex. "Black", "스카이블루", "Beige"). 찾지 못하면 "기본" 지정.
- "material": 옷의 소재 (코튼, 울, 폴리에스터 등). 없으면 "Unknown".
- "thickness": 두께감. 반드시 다음 중 하나 ("thin", "normal", "thick", "heavy"). 계절성(여름이면 thin)이나 외투 종류에 따라 추론하세요.
`;

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
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
