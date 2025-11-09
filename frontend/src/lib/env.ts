export const env = {
  contractAddress: process.env.NEXT_PUBLIC_WALRUS_MARKET_ADDRESS ?? "",
  rpcUrl: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ?? "",
  usdcAddress: process.env.NEXT_PUBLIC_USDC_ADDRESS ?? "",
  walrusUploadUrl: process.env.NEXT_PUBLIC_WALRUS_UPLOAD_URL ?? "",
  walrusMetadataBase: process.env.NEXT_PUBLIC_WALRUS_METADATA_BASE ?? "",
  adminAddresses: (process.env.NEXT_PUBLIC_ADMIN_ADDRESSES ?? "")
    .split(",")
    .map((addr) => addr.trim().toLowerCase())
    .filter(Boolean),
  leaderboardUrl: process.env.NEXT_PUBLIC_WALRUS_LEADERBOARD_URL ?? "",
};

