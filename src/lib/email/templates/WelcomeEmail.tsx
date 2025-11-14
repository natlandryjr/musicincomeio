import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface WelcomeEmailProps {
  artistName: string;
  email: string;
}

export function WelcomeEmail({ artistName, email }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to MusicIncome.io - Track all your music royalties in one place</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome to MusicIncome.io! 🎵</Heading>

          <Text style={text}>Hi {artistName || "there"},</Text>

          <Text style={text}>
            Thanks for signing up! You've just taken the first step toward never missing another royalty payment.
          </Text>

          <Section style={highlightBox}>
            <Text style={highlightText}>
              🎯 <strong>Quick Start:</strong>
            </Text>
            <Text style={bulletText}>
              • Connect your Gmail to auto-import statements<br />
              • Upload CSV files from DistroKid, TuneCore, or CD Baby<br />
              • Check the Missing Money Detector to find uncollected royalties<br />
              • Set up nightly auto-sync (Pro feature)
            </Text>
          </Section>

          <Button style={button} href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`}>
            Go to Dashboard
          </Button>

          <Hr style={hr} />

          <Text style={footer}>
            Need help? Check out our{" "}
            <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/library`} style={link}>
              Knowledge Base
            </Link>{" "}
            or reply to this email.
          </Text>

          <Text style={footer}>
            MusicIncome.io - Track all your music income in one place
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0 40px",
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  padding: "0 40px",
};

const highlightBox = {
  backgroundColor: "#f0f7ff",
  border: "1px solid #bdd7ff",
  borderRadius: "8px",
  margin: "24px 40px",
  padding: "24px",
};

const highlightText = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "0 0 12px 0",
};

const bulletText = {
  color: "#555",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "0",
};

const button = {
  backgroundColor: "#3b82f6",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "200px",
  padding: "14px 20px",
  margin: "24px auto",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "40px 40px",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  padding: "0 40px",
  margin: "12px 0",
};

const link = {
  color: "#3b82f6",
  textDecoration: "underline",
};

export default WelcomeEmail;
