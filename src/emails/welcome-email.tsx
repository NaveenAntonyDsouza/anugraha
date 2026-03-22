import {
  Html,
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Preview,
  Section,
  Text,
  Button,
} from "@react-email/components";

interface WelcomeEmailProps {
  name: string;
  profileId: string;
}

export function WelcomeEmail({ name, profileId }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Anugraha Matrimony - {profileId}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>
            Welcome to Anugraha Matrimony!
          </Heading>

          <Text style={text}>Dear {name},</Text>
          <Text style={text}>
            Thank you for registering with Anugraha Matrimony. Your profile has
            been created successfully.
          </Text>

          <Section style={idBox}>
            <Text style={idLabel}>Your Profile ID</Text>
            <Text style={idValue}>{profileId}</Text>
          </Section>

          <Text style={text}>
            Complete your profile to increase your chances of finding the
            perfect match. A complete profile gets up to 10x more responses!
          </Text>

          <Section style={btnSection}>
            <Button
              style={button}
              href={`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/register-free/additional-step-one`}
            >
              Complete Your Profile
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            &copy; {new Date().getFullYear()} Anugraha Matrimony. All rights
            reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f6f6",
  fontFamily: "Arial, sans-serif",
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 30px",
  maxWidth: "560px",
  borderRadius: "8px",
};

const heading = {
  color: "#8B1D91",
  fontSize: "24px",
  fontWeight: "bold" as const,
  textAlign: "center" as const,
  marginBottom: "24px",
};

const text = {
  color: "#333333",
  fontSize: "14px",
  lineHeight: "24px",
};

const idBox = {
  backgroundColor: "#f3e5f5",
  borderRadius: "8px",
  padding: "16px",
  textAlign: "center" as const,
  margin: "24px 0",
};

const idLabel = {
  color: "#666666",
  fontSize: "12px",
  margin: "0 0 4px",
};

const idValue = {
  color: "#8B1D91",
  fontSize: "28px",
  fontWeight: "bold" as const,
  margin: "0",
};

const btnSection = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#8B1D91",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "bold" as const,
  padding: "12px 24px",
  textDecoration: "none",
};

const hr = {
  borderColor: "#eeeeee",
  margin: "24px 0",
};

const footer = {
  color: "#999999",
  fontSize: "12px",
  textAlign: "center" as const,
};

export default WelcomeEmail;
