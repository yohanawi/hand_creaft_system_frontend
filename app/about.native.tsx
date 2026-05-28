import StaticContentScreen from '@/screens/native/content/StaticContentScreen';
import { aboutSections } from '@/screens/native/content/staticPages';

export default function AboutNativeRoute() {
  return <StaticContentScreen title="About" subtitle="Brand and platform context for the native customer app." sections={aboutSections} />;
}