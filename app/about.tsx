import About_global from "@/components/About/About_global";
import About_Hero_Section from "@/components/About/About_Hero_Section";
import About_Milestones_Section from "@/components/About/About_Milestones_Section";
import About_Process_Section from "@/components/About/About_Process_Section";
import About_quality_Section from "@/components/About/About_quality_Section";
import About_Stats_Section from "@/components/About/About_Stats_Section";
import About_Story_Section from "@/components/About/About_Story_Section";
import About_Team_Section from "@/components/About/About_Team_Section";
import About_Value_Section from "@/components/About/About_Value_Section";
import CTA_Section from "@/components/About/CTA_Section";
import TestimonialsSection from "@/components/Home/TestimonialsSection";
import PageShell from "@/components/PageShell";
import useHeaderScroll from "@/hooks/useHeaderScroll";
import { Animated, View } from "react-native";

export default function AboutUsScreen() {
    const { scrollY, onScroll } = useHeaderScroll();
    return (
        <View className="flex-1 bg-brown-Background">
            <Animated.ScrollView showsVerticalScrollIndicator={false} onScroll={onScroll} scrollEventThrottle={16}>
                <PageShell scrollY={scrollY}>
                    {/* HERO  */}
                    <About_Hero_Section />
                    {/* OUR STORY*/}
                    <About_Story_Section />
                    {/* OUR VALUES*/}
                    <About_Value_Section />
                    {/* MATERIALS & QUALITY*/}
                    <About_quality_Section />
                    {/*  CRAFT PROCESS */}
                    <About_Process_Section />
                    {/*  MILESTONES */}
                    <About_Milestones_Section />
                    {/*  STATS */}
                    <About_Stats_Section />
                    {/*  TEAM  */}
                    <About_Team_Section />
                    {/*  GLOBAL PRESENCE */}
                    <About_global />
                    {/* CUSTOMER STORIES */}
                    <TestimonialsSection />
                    {/* CTA */}
                    <CTA_Section />
                </PageShell>
            </Animated.ScrollView>
        </View>
    );
}
