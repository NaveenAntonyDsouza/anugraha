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

interface ForwardProfileEmailProps {
  senderName: string;
  recipientName: string;
  profileId: string;
  customMessage?: string;
}

export function ForwardProfileEmail({
  senderName,
  recipientName,
  profileId,
  customMessage,
}: ForwardProfileEmailProps) {
  const profileUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/view-full-profile/${profileId}`;

  return (
    <Html>
      <Head />
      <Preview>
        {senderName} shared a profile with you on Anugraha Matrimony
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Profile Shared With You</Heading>

          <Text style={text}>Dear {recipientName},</Text>
          <Text style={text}>
            <strong>{senderName}</strong> has shared a matrimony profile with
            you on Anugraha Matrimony.
          </Text>

          {customMessage && (
            <Section style={messageBox}>
              <Text style={messageLabel}>Message from {senderName}:</Text>
              <Text style={messageText}>{customMessage}</Text>
            </Section>
          )}

          <Section style={idBox}>
            <Text style={idLabel}>Profile ID</Text>
            <Text style={idValue}>{profileId}</Text>
          </Section>

          <Section style={btnSection}>
            <Button style={button} href={profileUrl}>
              View Full Profile
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

const messageBox = {
  backgroundColor: "#faf5fb",
  borderLeft: "4px solid #8B1D91",
  borderRadius: "4px",
  padding: "12px 16px",
  margin: "16px 0",
};

const messageLabel = {
  color: "#8B1D91",
  fontSize: "12px",
  fontWeight: "bold" as const,
  margin: "0 0 4px",
};

const messageText = {
  color: "#333333",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0",
  whiteSpace: "pre-wrap" as const,
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

export default ForwardProfileEmail;
