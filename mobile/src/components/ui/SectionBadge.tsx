import { Text, View } from 'react-native';

/** Único badge/kicker de sección — espejo de SECTION_BADGE del sitio. */
export function SectionBadge({ children }: { children: string }) {
  return (
    <View className="self-start rounded-full bg-white/5 border border-white/10 px-4 py-1.5">
      <Text className="font-sans text-[11px] uppercase tracking-[3px] text-slate-400">
        {children}
      </Text>
    </View>
  );
}
