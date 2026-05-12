'use client';

import { NewNav } from './components/NewNav';
import { Hero } from './components/Hero';
import { ProblemMatrix } from './components/ProblemMatrix';
import { LossCalculator } from './components/LossCalculator';
import { SolutionBanner } from './components/SolutionBanner';
import { FeatureBento } from './components/FeatureBento';
import { OperationFlow } from './components/OperationFlow';
import { CompetitorMatrix } from './components/CompetitorMatrix';
import { PricingTiers } from './components/PricingTiers';
import { EcosystemDiagram } from './components/EcosystemDiagram';
import { CtaFooter } from './components/CtaFooter';

export default function NewLandingPage() {
  return (
    <main className="relative overflow-hidden">
      <NewNav />
      <Hero />
      <ProblemMatrix />
      <LossCalculator />
      <SolutionBanner />
      <FeatureBento />
      <OperationFlow />
      <CompetitorMatrix />
      <PricingTiers />
      <EcosystemDiagram />
      <CtaFooter />
    </main>
  );
}
