import { useEffect, useState } from "react";
import Stepper2 from "../components/ui/Stepper2";
import BaseInfoStep2 from "../components/ui/steps/BaseInfoStep2";
import LikeingStep2 from "../components/ui/steps/LikeingsStep2";
import SpecialDatesStep2 from "../components/ui/steps/SpecialDatesStep2";

const Test = () => {
  const steps = [{ name: "Step 1" }, { name: "Step 2" }, { name: "Step 3" }];

  const [activeStep, setActiveStep] = useState<number>(0);

  const renderForm = () => {
    switch (activeStep) {
      case 0:
        return <BaseInfoStep2 />;
        break;
      case 1:
        return <LikeingStep2 />;
        break;
      case 2:
        return <SpecialDatesStep2 />;
    }
  };

  useEffect(() => {
    console.log("activeStep:", activeStep);
  }, [activeStep]);

  console.log(typeof steps);

  return (
    <div className="flex flex-col gap-8">
      <Stepper2 steps={steps} activeStep={activeStep} />

      {renderForm()}

      <div className="flex justify-between">
        <button
          disabled={activeStep === 0}
          onClick={() => {
            setActiveStep(activeStep - 1);
          }}
          className={
            activeStep === 0
              ? "bg-red-500/60 p-2 rounded-2xl"
              : "bg-red-500 p-2 rounded-2xl"
          }
        >
          prev
        </button>
        <button
          disabled={activeStep === steps.length - 1}
          onClick={() => {
            setActiveStep(activeStep + 1);
          }}
          className={
            activeStep === steps.length - 1
              ? "bg-green-500/60 p-2 rounded-2xl"
              : "bg-green-500 p-2 rounded-2xl"
          }
        >
          next
        </button>
      </div>
    </div>
  );
};

export default Test;
