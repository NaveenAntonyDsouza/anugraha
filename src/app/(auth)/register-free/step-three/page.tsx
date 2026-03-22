import { RegistrationLayout } from "@/components/auth/registration-layout";
import { StepThreeForm } from "@/components/auth/forms/step-three-form";

export default function RegisterStep3Page() {
  return (
    <RegistrationLayout
      currentStep={3}
      title="Education & Professional Details"
    >
      <StepThreeForm />
    </RegistrationLayout>
  );
}
