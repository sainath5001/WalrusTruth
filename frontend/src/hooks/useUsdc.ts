import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Address, formatUnits, parseUnits } from "viem";
import { toast } from "react-hot-toast";
import { usePublicClient, useWriteContract } from "wagmi";
import { erc20Abi } from "@/lib/abi/erc20";
import { USDC_ADDRESS, USDC_DECIMALS } from "@/lib/contract";

const MAX_ALLOWANCE = parseUnits("1000000", USDC_DECIMALS);

export function useUsdcBalance(address?: Address) {
  const publicClient = usePublicClient();
  return useQuery({
    queryKey: ["usdcBalance", address],
    enabled: Boolean(address),
    queryFn: async () => {
      if (!address) return 0n;
      return (await publicClient.readContract({
        address: USDC_ADDRESS,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [address],
      })) as bigint;
    },
  });
}

export function useUsdcAllowance(owner?: Address, spender?: Address) {
  const publicClient = usePublicClient();
  return useQuery({
    queryKey: ["usdcAllowance", owner, spender],
    enabled: Boolean(owner && spender),
    queryFn: async () => {
      if (!owner || !spender) return 0n;
      return (await publicClient.readContract({
        address: USDC_ADDRESS,
        abi: erc20Abi,
        functionName: "allowance",
        args: [owner, spender],
      })) as bigint;
    },
  });
}

export function formatUsdcBalance(amount: bigint) {
  return parseFloat(formatUnits(amount, USDC_DECIMALS)).toFixed(2);
}

export function useApproveUsdc(spender: Address) {
  const queryClient = useQueryClient();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  return useMutation({
    mutationFn: async () => {
      if (!publicClient) {
        throw new Error("Public client not ready");
      }
      const hash = await writeContractAsync({
        address: USDC_ADDRESS,
        abi: erc20Abi,
        functionName: "approve",
        args: [spender, MAX_ALLOWANCE],
      });
      await publicClient.waitForTransactionReceipt({ hash });
      return hash;
    },
    onSuccess: () => {
      toast.success("USDC allowance updated");
      queryClient.invalidateQueries({ queryKey: ["usdcAllowance"] });
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to approve USDC");
    },
  });
}

