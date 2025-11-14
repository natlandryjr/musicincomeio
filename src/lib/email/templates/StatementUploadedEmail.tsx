import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface StatementUploadedEmailProps {
  artistName: string;
  fileName: string;
  entriesCreated: number;
  totalAmount: number;
  parserUsed: string;
}

export function StatementUploadedEmail({
  artistName,
  fileName,
  entriesCreated,
  totalAmount,
  parserUsed,
}: StatementUploadedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Statement uploaded successfully - {fileName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>✓ Statement Uploaded Successfully</Heading>

          <Text style={text}>Hi {artistName},</Text>

          <Text style={text}>
            Your statement <strong>{fileName}</strong> has been successfully uploaded and processed.
          </Text>

          <Section style={statsBox}>
            <div style={statItem}>
              <Text style={statLabel}>Total Income</Text>
              <Text style={statValue}>${totalAmount.toFixed(2)}</Text>
            </div>
            <div style={statItem}>
              <Text style={statLabel}>Entries Created</Text>
              <Text style={statValue}>{entriesCreated}</Text>
            </div>
          </Section>

          <Section style={infoBox}>
            <Text style={infoText}>
              <strong>Format Detected:</strong> {parserUsed}
            </Text>
            <Text style={infoText}>
              All {entriesCreated} income entries have been added to your dashboard.
            </Text>
          </Section>

          <Button style={button} href={`${process.env.NEXT_PUBLIC_APP_URL}/income`}>
            View All Income
          </Button>

          <Hr style={hr} />

          <Text style={footer}>
            Having issues with a statement? Upload it again or{" "}
            <a href="mailto:support@musicincome.io" style={link}>
              contact support
            </a>
            .
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

const statsBox = {
  display: "flex",
  justifyContent: "space-around",
  margin: "32px 40px",
  padding: "24px",
  backgroundColor: "#f0fdf4",
  borderRadius: "8px",
  border: "1px solid #bbf7d0",
};

const statItem = {
  textAlign: "center" as const,
};

const statLabel = {
  color: "#666",
  fontSize: "12px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  margin: "0 0 8px 0",
};

const statValue = {
  color: "#16a34a",
  fontSize: "28px",
  fontWeight: "bold",
  margin: "0",
};

const infoBox = {
  margin: "24px 40px",
  padding: "16px",
  backgroundColor: "#fafafa",
  borderRadius: "8px",
};

const infoText = {
  color: "#555",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "8px 0",
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
  lineHeight: "20px",
  padding: "0 40px",
  margin: "12px 0",
};

const link = {
  color: "#3b82f6",
  textDecoration: "underline",
};

export default StatementUploadedEmail;
