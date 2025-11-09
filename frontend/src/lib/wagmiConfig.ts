import { createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { cookieStorage, createStorage } from "wagmi";
import { injected } from "wagmi/connectors";
import { env } from "./env";

const rpcUrl = env.rpcUrl || sepolia.rpcUrls.default.http[0]!;

export const wagmiConfig = createConfig({
  chains: [sepolia],
  connectors: [
    injected({ shimDisconnect: true }),
  ],
  transports: {
    [sepolia.id]: http(rpcUrl),
  },
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
});

