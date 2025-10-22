import React, { useState, Children, useRef, useLayoutEffect } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { Variants } from "motion/react";
import { FiCheck, FiCircle, FiDisc } from "react-icons/fi";

interface StepperProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  initialStep?: number;
  onStepChange?: (step: number) => void;
  onFinalStepCompleted?: () => void;
  stepCircleContainerClassName?: string;
  stepContainerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  backButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  nextButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  backButtonText?: string;
  nextButtonText?: string;
  disableStepIndicators?: boolean;
  renderStepIndicator?: (props: {
    step: number;
    currentStep: number;
    onStepClick: (clicked: number) => void;
  }) => ReactNode;
}

export default function Stepper({
  children,
  initialStep = 1,
  onStepChange = () => {},
  onFinalStepCompleted = () => {},
  stepCircleContainerClassName = "",
  stepContainerClassName = "",
  contentClassName = "",
  footerClassName = "",
  backButtonProps = {},
  nextButtonProps = {},
  backButtonText = "Back",
  nextButtonText = "Continue",
  disableStepIndicators = false,
  renderStepIndicator,
  ...rest
}: StepperProps) {
  const [currentStep, setCurrentStep] = useState<number>(initialStep);
  const [direction, setDirection] = useState<number>(0);
  const stepsArray = Children.toArray(children);
  const totalSteps = stepsArray.length;
  const isCompleted = currentStep > totalSteps;
  const isLastStep = currentStep === totalSteps;

  const updateStep = (newStep: number) => {
    setCurrentStep(newStep);
    if (newStep > totalSteps) {
      onFinalStepCompleted();
    } else {
      onStepChange(newStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setDirection(-1);
      updateStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (!isLastStep) {
      setDirection(1);
      updateStep(currentStep + 1);
    }
  };

  const handleComplete = () => {
    setDirection(1);
    updateStep(totalSteps + 1);
  };

  return (
    <div
      className="flex min-h-full flex-1 flex-col items-center justify-center p-4 sm:aspect-[4/3] md:aspect-[2/1]"
      {...rest}
    >
      <div
        className={`w-full rounded-2xl bg-transparent shadow-xl ${
          stepCircleContainerClassName ?? ""
        }`}
      >
        <div
          className={`${stepContainerClassName} flex w-full items-center px-4 py-6 sm:px-6 sm:py-8`}
        >
          <div className="flex w-full items-center justify-between">
            {stepsArray.map((_, index) => {
              const stepNumber = index + 1;
              const isNotLastStep = index < totalSteps - 1;

              return (
                <React.Fragment key={stepNumber}>
                  {/* Step circle + label stacked vertically */}
                  <div className="flex flex-col items-center mt-1">
                    {renderStepIndicator ? (
                      renderStepIndicator({
                        step: stepNumber,
                        currentStep,
                        onStepClick: (clicked) => {
                          setDirection(clicked > currentStep ? 1 : -1);
                          updateStep(clicked);
                        },
                      })
                    ) : (
                      <StepIndicator
                        step={stepNumber}
                        disableStepIndicators={disableStepIndicators}
                        currentStep={currentStep}
                        onClickStep={(clicked) => {
                          setDirection(clicked > currentStep ? 1 : -1);
                          updateStep(clicked);
                        }}
                      />
                    )}
                  </div>

                  {/* Connector between circles only */}
                  {isNotLastStep && (
                    <div className="flex flex-1 items-center justify-center -translate-y-[10px]">
                      <StepConnector isComplete={currentStep > stepNumber} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <StepContentWrapper
          isCompleted={isCompleted}
          currentStep={currentStep}
          direction={direction}
          className={`space-y-2 px-8 ${contentClassName}`}
        >
          {stepsArray[currentStep - 1]}
        </StepContentWrapper>

        {!isCompleted && (
          <div className={`px-8 pb-8 ${footerClassName}`}>
            <div
              className={`mt-10 flex ${
                currentStep !== 1 ? "justify-between" : "justify-end"
              }`}
            >
              {currentStep !== 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="rounded-full border border-accent-4/50 px-3 py-1.5 text-sm font-medium text-contrast transition hover:border-accent-4 hover:text-contrast/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                  {...backButtonProps}
                >
                  {backButtonText}
                </button>
              )}
              <button
                type="button"
                onClick={isLastStep ? handleComplete : handleNext}
                className="flex items-center justify-center rounded-full bg-brand px-4 py-2 text-sm font-semibold text-primary transition hover:bg-brand/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                {...nextButtonProps}
              >
                {isLastStep ? "Complete" : nextButtonText}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface StepContentWrapperProps {
  isCompleted: boolean;
  currentStep: number;
  direction: number;
  children: ReactNode;
  className?: string;
}

function StepContentWrapper({
  isCompleted,
  currentStep,
  direction,
  children,
  className = "",
}: StepContentWrapperProps) {
  const [parentHeight, setParentHeight] = useState<number>(0);

  return (
    <motion.div
      style={{ position: "relative", overflow: "hidden" }}
      animate={{ height: isCompleted ? 0 : parentHeight }}
      transition={{ type: "spring", duration: 0.4 }}
      className={className}
    >
      <AnimatePresence initial={false} mode="sync" custom={direction}>
        {!isCompleted && (
          <SlideTransition
            key={currentStep}
            direction={direction}
            onHeightReady={(h) => setParentHeight(h)}
          >
            {children}
          </SlideTransition>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface SlideTransitionProps {
  children: ReactNode;
  direction: number;
  onHeightReady: (height: number) => void;
}

function SlideTransition({
  children,
  direction,
  onHeightReady,
}: SlideTransitionProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (containerRef.current) {
      onHeightReady(containerRef.current.offsetHeight);
    }
  }, [children, onHeightReady]);

  return (
    <motion.div
      ref={containerRef}
      custom={direction}
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.4 }}
      style={{ position: "absolute", left: 0, right: 0, top: 0 }}
    >
      {children}
    </motion.div>
  );
}

const stepVariants: Variants = {
  enter: (dir: number) => ({
    x: dir >= 0 ? "-100%" : "100%",
    opacity: 0,
  }),
  center: {
    x: "0%",
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir >= 0 ? "50%" : "-50%",
    opacity: 0,
  }),
};

interface StepProps {
  children: ReactNode;
}

export function Step({ children }: StepProps) {
  return <div className="px-8">{children}</div>;
}

interface StepIndicatorProps {
  step: number;
  currentStep: number;
  onClickStep: (clicked: number) => void;
  disableStepIndicators?: boolean;
}

function StepIndicator({
  step,
  currentStep,
  onClickStep,
  disableStepIndicators = false,
}: StepIndicatorProps) {
  const status =
    currentStep === step
      ? "active"
      : currentStep < step
      ? "inactive"
      : "complete";

  const handleClick = () => {
    if (step !== currentStep && !disableStepIndicators) {
      onClickStep(step);
    }
  };

  return (
    <motion.div
      onClick={handleClick}
      className="relative cursor-pointer outline-none focus:outline-none"
      animate={status}
      initial={false}
    >
      <motion.div
        variants={{
          inactive: {
            scale: 1,
            backgroundColor: "rgb(var(--color-accent-4) / 1)",
            color: "rgb(var(--color-contrast) / 0.75)",
          },
          active: {
            scale: 1,
            backgroundColor: "rgb(var(--color-brand) / 1)",
            color: "rgb(var(--color-primary) / 1)",
          },
          complete: {
            scale: 1,
            backgroundColor: "rgb(var(--color-brand) / 0.18)",
            color: "rgb(var(--color-brand) / 1)",
          },
        }}
        transition={{ duration: 0.3 }}
        className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold"
      >
        {status === "complete" ? (
          <FiCheck className="h-4 w-4" />
        ) : status === "active" ? (
          <FiDisc className="h-4 w-4" />
        ) : (
          <FiCircle className="h-4 w-4" />
        )}
      </motion.div>
    </motion.div>
  );
}

interface StepConnectorProps {
  isComplete: boolean;
}

function StepConnector({ isComplete }: StepConnectorProps) {
  const lineVariants: Variants = {
    incomplete: {
      scaleX: 0,
      backgroundColor: "rgb(var(--color-accent-4) / 1)",
    },
    complete: {
      scaleX: 1,
      backgroundColor: "rgb(var(--color-brand) / 1)",
    },
  };

  return (
    <div className="relative flex flex-1 items-center justify-center">
      <motion.div
        className="h-[4px] w-full origin-left rounded-full"
        variants={lineVariants}
        initial="incomplete"
        animate={isComplete ? "complete" : "incomplete"}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />
    </div>
  );
}
