"use client";

import { useState } from "react";
import { Card, BlockStack, TextField, Button, Text, InlineStack, Banner, Box } from "@shopify/polaris";

function DeloitteHeader() {
  return (
    <Box padding="400" background="bg-fill" borderRadius="300">
      <div style={{ borderLeft: "6px solid #86BC25", paddingLeft: 12 }}>
        <BlockStack gap="200">
          <Text as="h2" variant="headingLg">Deloitte Digital – Shopify Admin Assistant</Text>
          <Text as="p" variant="bodyMd">Ask the assistant to manage products, collections, and customers. It uses Shopify Dev MCP to generate and execute GraphQL safely.</Text>
        </BlockStack>
      </div>
    </Box>
  );
}

export function AgentChat() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);

  async function send() {
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || data?.error || "Request failed");
      setResponse(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const success = response?.success === true;
  const friendlyMessage = response?.message || (success ? "Done." : undefined);

  return (
    <BlockStack gap="400">
      <DeloitteHeader />
      {error && (
        <Banner tone="critical" title="Request failed">
          <p>{error}</p>
        </Banner>
      )}
      {friendlyMessage && (
        <Banner tone={success ? "success" : "critical"} title={success ? "Success" : "Unable to complete"}>
          <p>{friendlyMessage}</p>
        </Banner>
      )}
      <Card>
        <BlockStack gap="300">
          <TextField
            label="Ask the assistant"
            value={prompt}
            onChange={setPrompt}
            multiline={2}
            autoComplete="off"
          />
          <InlineStack gap="200">
            <Button onClick={send} loading={loading} variant="primary">Send</Button>
            <Button onClick={() => { setPrompt(""); setResponse(null); setError(null); }} disabled={loading}>Clear</Button>
            {response ? (
              <Button onClick={() => setShowRaw((v) => !v)}>
                {showRaw ? "Hide details" : "Show technical details"}
              </Button>
            ) : null}
          </InlineStack>
          {showRaw && response && (
            <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(response, null, 2)}</pre>
          )}
        </BlockStack>
      </Card>
    </BlockStack>
  );
} 