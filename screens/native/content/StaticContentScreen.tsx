import React from 'react';
import { Text, View } from 'react-native';

import { AppScreen } from '@/screens/native/shared/AppScreen';
import { SectionCard } from '@/screens/native/shared/SectionCard';

type StaticContentScreenProps = {
  title: string;
  subtitle: string;
  sections: { heading: string; body: string }[];
};

export default function StaticContentScreen({ title, subtitle, sections }: StaticContentScreenProps) {
  return (
    <AppScreen title={title} subtitle={subtitle} canGoBack>
      {sections.map((section) => (
        <SectionCard key={section.heading} title={section.heading} subtitle="Native content surface for APK release.">
          <View>
            <Text style={{ color: '#6f5a4d', fontFamily: 'Inter', fontSize: 14, lineHeight: 24 }}>{section.body}</Text>
          </View>
        </SectionCard>
      ))}
    </AppScreen>
  );
}