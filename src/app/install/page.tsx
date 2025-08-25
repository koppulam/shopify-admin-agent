"use client";

import { useState } from "react";
import { Card, TextField, Button, Page, Layout, Text, BlockStack } from "@shopify/polaris";

export default function InstallPage() {
  const [shop, setShop] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInstall = () => {
    if (!shop) return;
    
    setLoading(true);
    const shopDomain = shop.includes('.myshopify.com') ? shop : `${shop}.myshopify.com`;
    window.location.href = `/api/auth?shop=${encodeURIComponent(shopDomain)}`;
  };

  return (
    <Page title="Install Deloitte Digital Shopify Admin Assistant">
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Connect Your Shopify Store
              </Text>
              <Text as="p">
                Enter your Shopify store domain to install the Admin Assistant app.
              </Text>
              <TextField
                label="Store domain"
                value={shop}
                onChange={setShop}
                placeholder="your-store.myshopify.com"
                helpText="Enter your store's .myshopify.com domain"
                autoComplete="off"
              />
              <Button
                variant="primary"
                onClick={handleInstall}
                loading={loading}
                disabled={!shop.trim()}
              >
                Install App
              </Button>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
} 