import { RegistrationLayout } from "@/components/auth/registration-layout";
import { StepTwoForm } from "@/components/auth/forms/step-two-form";

export default function RegisterStep2Page() {
  return (
    <RegistrationLayout
      currentStep={2}
      title="Personal & Religious Information"
    >
      <StepTwoForm />
    </RegistrationLayout>
  );
}
