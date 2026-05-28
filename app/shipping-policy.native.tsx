import StaticContentScreen from '@/screens/native/content/StaticContentScreen';
import { shippingSections } from '@/screens/native/content/staticPages';

export default function ShippingPolicyNativeRoute() {
  return <StaticContentScreen title="Shipping policy" subtitle="Delivery guidance for the native customer app." sections={shippingSections} />;
}