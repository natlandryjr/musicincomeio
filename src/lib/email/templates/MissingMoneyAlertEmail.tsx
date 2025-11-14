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

interface MissingMoneyAlertEmailProps {
  artistName: string;
  totalEstimated: number;
  topOpportunities: Array<{
    source: string;
    amount: number;
    actionUrl: string;
  }>;
}

export function MissingMoneyAlertEmail({
  artistName,
  totalEstimated,
  topOpportunities,
}: MissingMoneyAlertEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>You may be missing ${totalEstimated.toLocaleString()} in uncollected royalties</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>🚨 Missing Money Detected</Heading>

          <Text style={text}>Hi {artistName},</Text>

          <Text style={text}>
            Based on your activity, we've detected you may be missing out on{" "}
            <strong>${totalEstimated.toLocaleString()}</strong> in uncollected royalties annually.
          </Text>

          <Section style={alertBox}>
            <Text style={alertAmount}>${totalEstimated.toLocaleString()}</Text>
            <Text style={alertLabel}>Estimated Uncollected (Annual)</Text>
          </Section>

          <Text style={text}>
            <strong>Top Opportunities:</strong>
          </Text>

          <Section style={opportunitiesBox}>
            {topOpportunities.map((opp, index) => (
              <div key={index} style={opportunityItem}>
                <div>
                  <Text style={oppName}>{opp.source}</Text>
                  <Text style={oppAmount}>${opp.amount}/year</Text>
                </div>
                <Button style={smallButton} href={opp.actionUrl}>
                  Register →
                </Button>
              </div>
            ))}
          </Section>

          <Text style={text}>
            Don't leave money on the table! These are revenue streams you're likely entitled to
            based on your streaming numbers and songwriting activity.
          </Text>

          <Button style={button} href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`}>
            See Full Analysis
          </Button>

          <Hr style={hr} />

          <Text style={footer}>
            <strong>How accurate is this?</strong> Our estimates are based on industry averages
            and your activity. Actual amounts may vary, but registering ensures you don't miss
            future payments.
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

const alertBox = {
  backgroundColor: "#fef3c7",
  border: "2px solid #fbbf24",
  borderRadius: "12px",
  margin: "32px 40px",
  padding: "32px",
  textAlign: "center" as const,
};

const alertAmount = {
  color: "#92400e",
  fontSize: "48px",
  fontWeight: "bold",
  margin: "0 0 8px 0",
};

const alertLabel = {
  color: "#78350f",
  fontSize: "14px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  margin: "0",
};

const opportunitiesBox = {
  margin: "16px 40px 32px",
};

const opportunityItem = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "16px",
  marginBottom: "12px",
  backgroundColor: "#fafafa",
  borderRadius: "8px",
  border: "1px solid #e6e6e6",
};

const oppName = {
  color: "#333",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 4px 0",
};

const oppAmount = {
  color: "#16a34a",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0",
};

const smallButton = {
  backgroundColor: "#3b82f6",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "14px",
  fontWeight: "600",
  textDecoration: "none",
  padding: "8px 16px",
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

export default MissingMoneyAlertEmail;
