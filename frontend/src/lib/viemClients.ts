import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import { env } from "./env";

export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(env.rpcUrl),
});

