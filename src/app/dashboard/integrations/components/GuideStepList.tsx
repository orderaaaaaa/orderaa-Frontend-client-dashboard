import { Fragment } from 'react';
import type { GuideSegment, GuideStep } from '../constants/steps';

const renderSegment = (segment: GuideSegment, index: number) => {
  if (typeof segment === 'string') {
    return <Fragment key={index}>{segment}</Fragment>;
  }
  if ('ui' in segment) {
    return (
      <bdi key={index} className="font-semibold text-gray-800">
        «{segment.ui}»
      </bdi>
    );
  }
  return (
    <code
      key={index}
      dir="ltr"
      className="font-mono text-xs bg-gray-100 text-gray-800 rounded px-1 py-0.5 break-all"
    >
      {segment.value}
    </code>
  );
};

const renderStep = (step: GuideStep) =>
  typeof step === 'string' ? step : step.map(renderSegment);

export default function GuideStepList({ steps }: { steps: GuideStep[] }) {
  return (
    <>
      {steps.map((step, i) => (
        <div key={i} className="relative flex items-start gap-3 pb-4 last:pb-0">
          <span className="relative z-10 flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
            {i + 1}
          </span>
          <p className="text-sm text-gray-600 leading-relaxed pt-0.5">
            {renderStep(step)}
          </p>
        </div>
      ))}
    </>
  );
}
