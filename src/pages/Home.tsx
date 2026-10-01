import React from 'react';
import { Hero } from '../components/Hero';
import { Marquee } from '../components/Marquee';
import { Powerpacks } from '../components/Powerpacks';
import { WhyChooseMakhe } from '../components/WhyChooseMakhe';
import { FourPmCraving } from '../components/FourPmCraving';
import { CustomerFeedback } from '../components/CustomerFeedback';
import { BrandIntro } from '../components/BrandIntro';
import { OurStoryTeaser } from '../components/OurStoryTeaser';
import { PageRoute } from '../types';

interface HomeProps {
  onNavigate: (page: PageRoute) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  return (
    <main className="w-full">
      <Hero onNavigate={onNavigate} />
      <Marquee />
      <Powerpacks onNavigate={onNavigate} />
      <WhyChooseMakhe />
      <FourPmCraving />
      <CustomerFeedback />
      <BrandIntro onDiscoverStory={() => onNavigate('/our-story')} />
      <OurStoryTeaser onNavigate={onNavigate} />
    </main>
  );
};
