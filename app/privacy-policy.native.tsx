import StaticContentScreen from '@/screens/native/content/StaticContentScreen';
import { privacySections } from '@/screens/native/content/staticPages';

export default function PrivacyPolicyNativeRoute() {
  return <StaticContentScreen title="Privacy policy" subtitle="How customer data moves through the mobile app." sections={privacySections} />;
}