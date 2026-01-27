import { Navbar, Footer } from '@/components/layout';
import {
  HeroSection,
  FeaturesSection,
  AboutSection,
  HowItWorksSection,
  ContactSection,
} from '@/app/landingpage';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <AboutSection />
      <HowItWorksSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
