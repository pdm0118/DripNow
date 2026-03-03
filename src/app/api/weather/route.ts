import { NextResponse } from 'next/server';

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');

    if (!lat || !lon) {
        return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 });
    }

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        );

        if (!response.ok) {
            throw new Error(`OpenWeather API error: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Weather API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 });
    }
}
