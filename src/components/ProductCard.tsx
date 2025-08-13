"use client";

import {
  Card,
  Box,
  Text,
  InlineStack,
  BlockStack,
  Thumbnail,
  Badge,
} from "@shopify/polaris";

export type ProductCardProps = {
  id: number;
  title: string;
  imageUrl?: string | null;
  price?: string | null;
};

export function ProductCard({ id, title, imageUrl, price }: ProductCardProps) {
  return (
    <Card>
      <BlockStack gap="300">
        <InlineStack align="space-between">
          <Text as="h3" variant="headingSm">
            {title}
          </Text>
          <Badge tone="info">{`#${id}`}</Badge>
        </InlineStack>
        <Box>
          <Thumbnail
            source={imageUrl || "https://placehold.co/300x300?text=No+Image"}
            alt={title}
            size="large"
          />
        </Box>
        {price ? (
          <Text as="p" variant="bodyMd">
            Price from: ${price}
          </Text>
        ) : null}
      </BlockStack>
    </Card>
  );
} 