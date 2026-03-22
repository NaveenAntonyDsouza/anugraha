import { RegistrationLayout } from "@/components/auth/registration-layout";
import { StepOneForm } from "@/components/auth/forms/step-one-form";

export default function RegisterStep1Page() {
  return (
    <RegistrationLayout
      currentStep={1}
      title="Register Free"
      subtitle="Create your matrimony profile in minutes"
    >
      <StepOneForm />
    </RegistrationLayout>
  );
}
