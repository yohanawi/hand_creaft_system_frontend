import StaticContentScreen from '@/screens/native/content/StaticContentScreen';
import { faqSections } from '@/screens/native/content/staticPages';

export default function HelpFaqNativeRoute() {
  return <StaticContentScreen title="Help & FAQ" subtitle="Customer guidance for the mobile app surface." sections={faqSections} />;
}