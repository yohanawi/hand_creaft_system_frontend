import StaticContentScreen from '@/screens/native/content/StaticContentScreen';
import { termsSections } from '@/screens/native/content/staticPages';

export default function TermsNativeRoute() {
  return <StaticContentScreen title="Terms & conditions" subtitle="Customer-side operating terms for the native app." sections={termsSections} />;
}