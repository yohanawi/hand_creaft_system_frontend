/**
 * AI Search Screen
 *
 * Route: /ai-search
 * Wraps the AI search experience inside the standard page shell.
 */
import AIImageSearch from "@/components/AIImageSearch";
import PageShell from "@/components/PageShell";
import useHeaderScroll from "@/hooks/useHeaderScroll";
import { Animated, View } from "react-native";

export default function AISearchScreen() {
    const { scrollY, onScroll } = useHeaderScroll();

    return (
        <View style={{ flex: 1 }}>
            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                onScroll={onScroll} 
                scrollEventThrottle={16}
                contentContainerStyle={{ paddingBottom: 56 }}
            >
                <PageShell scrollY={scrollY}>
                    <AIImageSearch />
                </PageShell>
            </Animated.ScrollView>
        </View>
    );
}
