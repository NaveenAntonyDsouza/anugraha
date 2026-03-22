import { RegistrationLayout } from "@/components/auth/registration-layout";
import { StepFourForm } from "@/components/auth/forms/step-four-form";

export default function RegisterStep4Page() {
  return (
    <RegistrationLayout
      currentStep={4}
      title="Location & Contact Details"
    >
      <StepFourForm />
    </RegistrationLayout>
  );
}
