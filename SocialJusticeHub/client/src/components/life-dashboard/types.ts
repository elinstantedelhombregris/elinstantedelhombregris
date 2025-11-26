import { LucideIcon } from "lucide-react";

export interface LifeAreaModel {
  id: number;
  name: string;
  value: number;
  target: number;
  icon: LucideIcon;
  note: string;
  history: number[];
  level?: number;
}

export type MoodOption = {
  emoji: string;
  label: string;
  tone: "calm" | "focused" | "energized" | "overwhelmed" | "celebratory";
};


