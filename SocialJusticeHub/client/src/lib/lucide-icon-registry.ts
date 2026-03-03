import {
  Briefcase,
  Circle,
  DollarSign,
  Gamepad2,
  Globe,
  Heart,
  Home,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";

const LIFE_AREA_ICON_MAP: Record<string, LucideIcon> = {
  Briefcase,
  DollarSign,
  Gamepad2,
  Globe,
  Heart,
  Home,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
  briefcase: Briefcase,
  dollarSign: DollarSign,
  gamepad2: Gamepad2,
  globe: Globe,
  heart: Heart,
  home: Home,
  sparkles: Sparkles,
  trendingUp: TrendingUp,
  userPlus: UserPlus,
  users: Users,
};

export function getLifeAreaIcon(iconName: string | null | undefined): LucideIcon {
  if (!iconName) {
    return Circle;
  }

  return LIFE_AREA_ICON_MAP[iconName] ?? Circle;
}
