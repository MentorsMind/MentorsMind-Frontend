import { useMemo, useState } from "react";

export type PortfolioAsset = {
  id: string;
  icon: string;
  name: string;
  balance: number;
  usdValue: number;
  change24h: number;
  trusted: boolean;
};

export type SortOption = "value" | "name" | "change";

const mockAssets: PortfolioAsset[] = [
  {
    id: "xlm",
    icon: "⭐",
    name: "XLM",
    balance: 1200,
    usdValue: 145.5,
    change24h: 2.4,
    trusted: true,
  },
  {
    id: "usdc",
    icon: "💵",
    name: "USDC",
    balance: 500,
    usdValue: 500,
    change24h: 0.2,
    trusted: true,
  },
  {
    id: "aqua",
    icon: "💧",
    name: "AQUA",
    balance: 3200,
    usdValue: 91.8,
    change24h: -1.8,
    trusted: false,
  },
];

export function usePortfolio() {
  const [assets, setAssets] = useState<PortfolioAsset[]>(mockAssets);
  const [sortBy, setSortBy] = useState<SortOption>("value");
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const totalValue = useMemo(() => {
    return assets.reduce((sum, asset) => sum + asset.usdValue, 0);
  }, [assets]);

  const sortedAssets = useMemo(() => {
    const copied = [...assets];

    if (sortBy === "value") {
      copied.sort((a, b) => b.usdValue - a.usdValue);
    } else if (sortBy === "name") {
      copied.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "change") {
      copied.sort((a, b) => b.change24h - a.change24h);
    }

    return copied;
  }, [assets, sortBy]);

  const refreshPortfolio = () => {
    setLoading(true);

    setTimeout(() => {
      setLastUpdated(new Date());
      setLoading(false);
    }, 1000);
  };

  const toggleTrustline = (id: string) => {
    setAssets((prev) =>
      prev.map((asset) =>
        asset.id === id ? { ...asset, trusted: !asset.trusted } : asset
      )
    );
  };

  return {
    assets: sortedAssets,
    totalValue,
    sortBy,
    setSortBy,
    loading,
    lastUpdated,
    refreshPortfolio,
    toggleTrustline,
  };
}