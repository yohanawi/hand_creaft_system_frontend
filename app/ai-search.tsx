/**
 * AI Search Screen
 *
 * Route: /ai-search
 * Wraps the AIImageSearch component inside the standard Expo Router screen.
 */
import AIImageSearch from "@/components/AIImageSearch";
import Header from "@/components/Common/Header";
import { View } from "react-native";

export default function AISearchScreen() {
    return (
        <View style={{ flex: 1 }}>
            <Header />
            <AIImageSearch />
        </View>
    );
}
