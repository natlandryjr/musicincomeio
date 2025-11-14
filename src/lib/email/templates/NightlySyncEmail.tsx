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

interface NightlySyncEmailProps {
  artistName: string;
  statementsFound: number;
  entriesCreated: number;
  totalAmount: number;
  sources: Array<{ name: string; amount: number; count: number }>;
}

export function NightlySyncEmail({
  artistName,
  statementsFound,
  entriesCreated,
  totalAmount,
  sources,
}: NightlySyncEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        {statementsFound > 0
          ? `We found ${statementsFound} new royalty statement${statementsFound === 1 ? "" : "s"}!`
          : "Nightly sync completed - No new statements found"}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {statementsFound > 0 ? (
            <>
              <Heading style={h1}>🎉 New Royalty Payments Found!</Heading>

              <Text style={text}>Hi {artistName},</Text>

              <Text style={text}>
                Good news! Our nightly sync found <strong>{statementsFound}</strong> new royalty{" "}
                statement{statementsFound === 1 ? "" : "s"} in your Gmail.
              </Text>

              <Section style={statsBox}>
                <div style={statItem}>
                  <Text style={statLabel}>Total New Income</Text>
                  <Text style={statValue}>${totalAmount.toFixed(2)}</Text>
                </div>
                <div style={statItem}>
                  <Text style={statLabel}>New Entries</Text>
                  <Text style={statValue}>{entriesCreated}</Text>
                </div>
                <div style={statItem}>
                  <Text style={statLabel}>Statements</Text>
                  <Text style={statValue}>{statementsFound}</Text>
                </div>
              </Section>

              {sources.length > 0 && (
                <>
                  <Text style={text}>
                    <strong>Breakdown by Source:</strong>
                  </Text>
                  <Section style={sourceBox}>
                    {sources.map((source) => (
                      <div key={source.name} style={sourceItem}>
                        <Text style={sourceName}>{source.name}</Text>
                        <div>
                          <Text style={sourceAmount}>${source.amount.toFixed(2)}</Text>
                          <Text style={sourceCount}>{source.count} entries</Text>
                        </div>
                      </div>
                    ))}
                  </Section>
                </>
              )}

              <Button style={button} href={`${process.env.NEXT_PUBLIC_APP_URL}/income`}>
                View All Income
              </Button>
            </>
          ) : (
            <>
              <Heading style={h1}>✓ Nightly Sync Complete</Heading>

              <Text style={text}>Hi {artistName},</Text>

              <Text style={text}>
                We checked your Gmail for new royalty statements, but didn't find any new ones since the last sync.
              </Text>

              <Text style={text}>
                This is normal! Distributors and PROs typically send statements monthly or quarterly.
              </Text>

              <Button style={button} href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`}>
                View Dashboard
              </Button>
            </>
          )}

          <Hr style={hr} />

          <Text style={footer}>
            <strong>Pro Tip:</strong> Make sure your distributors are sending statements to the email connected to MusicIncome.io.
          </Text>

          <Text style={footer}>
            You can adjust your email preferences in{" "}
            <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/settings`} style={link}>
              Settings
            </Link>
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
  backgroundColor: "#f0f7ff",
  borderRadius: "8px",
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
  color: "#333",
  fontSize: "28px",
  fontWeight: "bold",
  margin: "0",
};

const sourceBox = {
  margin: "16px 40px 24px",
  padding: "16px",
  backgroundColor: "#fafafa",
  borderRadius: "8px",
};

const sourceItem = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 0",
  borderBottom: "1px solid #e6e6e6",
};

const sourceName = {
  color: "#333",
  fontSize: "14px",
  fontWeight: "500",
  margin: "0",
};

const sourceAmount = {
  color: "#333",
  fontSize: "16px",
  fontWeight: "bold",
  margin: "0",
  textAlign: "right" as const,
};

const sourceCount = {
  color: "#666",
  fontSize: "12px",
  margin: "4px 0 0 0",
  textAlign: "right" as const,
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

export default NightlySyncEmail;
