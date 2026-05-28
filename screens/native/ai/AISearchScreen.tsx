import React from 'react';

import AIImageSearch from '@/components/AIImageSearch';
import { AppScreen } from '@/screens/native/shared/AppScreen';

export default function AISearchScreen() {
  return (
    <AppScreen title="AI image search" subtitle="The native customer app keeps the existing visual-search engine and backend integration.">
      <AIImageSearch />
    </AppScreen>
  );
}