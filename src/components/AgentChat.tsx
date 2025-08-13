"use client";

import { useState } from "react";
import { Card, BlockStack, TextField, Button, Text, InlineStack } from "@shopify/polaris";

export function AgentChat() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

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
      if (!res.ok) throw new Error(data?.error || "Request failed");
      setResponse(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <BlockStack gap="300">
        <Text variant="headingSm" as="h3">Admin Agent</Text>
        <TextField
          label="Ask the agent"
          value={prompt}
          onChange={setPrompt}
          multiline={2}
          autoComplete="off"
        />
        <InlineStack gap="200">
          <Button onClick={send} loading={loading} variant="primary">Send</Button>
          <Button onClick={() => { setPrompt(""); setResponse(null); setError(null); }} disabled={loading}>Clear</Button>
        </InlineStack>
        {error && <Text as="p" tone="critical">{error}</Text>}
        {response && (
          <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(response, null, 2)}</pre>
        )}
      </BlockStack>
    </Card>
  );
} 