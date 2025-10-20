import { div } from "motion/react-client";
import React from "react";
import { FaRegCircle, FaRegDotCircle, FaRegCheckCircle } from "react-icons/fa";

interface Stepper2Props {
  steps: Array<{ name: string }>;
  activeStep: number;
}

const Stepper2: React.FC<Stepper2Props> = ({ steps, activeStep }) => {
  console.log("steps len", steps.length);

  // <div className="bg-amber-950">
  //   {steps.indexOf(step) < steps.length - 1 && (
  //     <div className="w-8 h-2 rounded-full bg-amber-300"></div>
  //   )}
  // </div>;
  return (
    <div className="flex justify-between ">
      {steps.map((step) => (
        <div className="flex-col ">
          <div className="flex justify-center">
            {activeStep === steps.indexOf(step) ? (
              <FaRegDotCircle className="text-green-500 text-3xl" />
            ) : activeStep > steps.indexOf(step) ? (
              <FaRegCheckCircle className="text-green-500 text-3xl" />
            ) : (
              <FaRegCircle className="text-gray-400 text-3xl" />
            )}
          </div>
          <div>{step.name}</div>
        </div>
      ))}
    </div>
  );
};

export default Stepper2;
