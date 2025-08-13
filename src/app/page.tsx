"use client";

import useSWR from "swr";
import { Page, Layout, Grid, Text } from "@shopify/polaris";
import { ProductCard } from "@/components/ProductCard";
import { AgentChat } from "@/components/AgentChat";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Home() {
  const { data, error, isLoading } = useSWR("/api/products", fetcher);

  const products = data?.products ?? [];

  return (
    <Page title="Products">
      <Layout>
        <Layout.Section>
          <AgentChat />
        </Layout.Section>
        <Layout.Section>
          {error ? (
            <Text as="p" tone="critical">Failed to load products</Text>
          ) : isLoading ? (
            <Text as="p">Loading products…</Text>
          ) : products.length === 0 ? (
            <Text as="p">No products found</Text>
          ) : (
            <Grid columns={{ xs: 1, sm: 2, md: 3, lg: 4 }} gap={{ xs: "400", sm: "400", md: "400", lg: "400" }}>
              {products.map((p: any) => (
                <Grid.Cell key={p.id}>
                  <ProductCard
                    id={p.id}
                    title={p.title}
                    imageUrl={p.image?.src || p.images?.[0]?.src}
                    price={p.variants?.[0]?.price || null}
                  />
                </Grid.Cell>
              ))}
            </Grid>
          )}
        </Layout.Section>
      </Layout>
    </Page>
  );
}
