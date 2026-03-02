import { useState, useEffect } from "react";

/**
 * 범용적인 LocalStorage 커스텀 훅
 * 클라이언트 사이드(브라우저)에서만 실행되도록 보장합니다.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
    // 상태 초기화: 로컬스토리지에서 값을 읽거나 초기값 사용
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            if (typeof window !== "undefined") {
                const item = window.localStorage.getItem(key);
                return item ? JSON.parse(item) : initialValue;
            }
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
        }
        return initialValue;
    });

    // 상태가 변경될 때마다 로컬스토리에 동기화
    useEffect(() => {
        try {
            if (typeof window !== "undefined") {
                window.localStorage.setItem(key, JSON.stringify(storedValue));
            }
        } catch (error) {
            console.warn(`Error setting localStorage key "${key}":`, error);
        }
    }, [key, storedValue]);

    return [storedValue, setStoredValue] as const;
}

// ============== 데이터 타입 정의 (Data Interfaces) ==============

export interface UserProfile {
    nickname: string;
    gender: "male" | "female" | "other";
    age: number | null;
    height: number | null;
    weight: number | null;
    bodyShape: "broad_shoulder" | "skinny" | "sturdy_lower" | "belly" | "standard" | null;
    preferredFit: "over_fit" | "wide_fit" | "standard_fit" | "slim_fit" | null;
    tempSensitivity: "cold_sensitive" | "normal" | "heat_sensitive";
    favoriteStyles: string[]; // 최대 5개 선택 (미니멀, 캐주얼, 아메카지 등)
}

export interface ClothingItem {
    id: string; // uuid
    category: "outer" | "top" | "bottom" | "shoes" | "accessory";
    brand?: string;
    name?: string;
    color: string;
    thickness: "thin" | "normal" | "thick";
    fit?: string;
    imageUrl?: string; // 사진이나 착샷 URL (로컬 업로드의 경우 base64 또는 object url)
    isWashing: boolean; // 세탁 중 여부 플래그
    lastWornAt?: string; // ISO Date String (연속 착용 방지 쿨타임 로직에 사용)
    createdAt: string;
}

export interface PresetDef {
    id: string;
    tpo: "work" | "date" | "casual" | "formal";
    mood: string; // 예: "꾸안꾸", "남자답게", "필살기"
    items: string[]; // ClothingItem의 ID 배열 (해당 룩에 포함된 옷들)
}

export const defaultUserProfile: UserProfile = {
    nickname: "",
    gender: "other",
    age: null,
    height: null,
    weight: null,
    bodyShape: null,
    preferredFit: null,
    tempSensitivity: "normal",
    favoriteStyles: [],
};
