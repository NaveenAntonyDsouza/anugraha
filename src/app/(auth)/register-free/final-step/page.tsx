import { RegistrationLayout } from "@/components/auth/registration-layout";
import { StepFiveForm } from "@/components/auth/forms/step-five-form";

export default function RegisterStep5Page() {
  return (
    <RegistrationLayout
      currentStep={5}
      title="Profile Creation Details"
    >
      <StepFiveForm />
    </RegistrationLayout>
  );
}
