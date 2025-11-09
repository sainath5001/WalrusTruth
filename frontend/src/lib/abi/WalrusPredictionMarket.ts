export const walrusPredictionMarketAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "admin", type: "address", internalType: "address" },
      { name: "usdcToken", type: "address", internalType: "contract IERC20" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "createMarket",
    inputs: [
      { name: "title", type: "string", internalType: "string" },
      { name: "description", type: "string", internalType: "string" },
      { name: "deadline", type: "uint64", internalType: "uint64" },
      { name: "metadataURI", type: "string", internalType: "string" },
    ],
    outputs: [{ name: "marketId", type: "uint256", internalType: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getBettors",
    inputs: [{ name: "marketId", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "address[]", internalType: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getMarket",
    inputs: [{ name: "marketId", type: "uint256", internalType: "uint256" }],
    outputs: [
      {
        name: "viewData",
        type: "tuple",
        internalType: "struct WalrusPredictionMarket.MarketView",
        components: [
          { name: "title", type: "string", internalType: "string" },
          { name: "description", type: "string", internalType: "string" },
          { name: "metadataURI", type: "string", internalType: "string" },
          { name: "deadline", type: "uint64", internalType: "uint64" },
          {
            name: "status",
            type: "uint8",
            internalType: "enum WalrusPredictionMarket.Status",
          },
          {
            name: "outcome",
            type: "uint8",
            internalType: "enum WalrusPredictionMarket.Outcome",
          },
          { name: "yesPool", type: "uint128", internalType: "uint128" },
          { name: "noPool", type: "uint128", internalType: "uint128" },
          { name: "bettorCount", type: "uint256", internalType: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getWager",
    inputs: [
      { name: "marketId", type: "uint256", internalType: "uint256" },
      { name: "bettor", type: "address", internalType: "address" },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct WalrusPredictionMarket.Wager",
        components: [
          { name: "yesAmount", type: "uint128", internalType: "uint128" },
          { name: "noAmount", type: "uint128", internalType: "uint128" },
          { name: "paid", type: "bool", internalType: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "marketCount",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "placeBet",
    inputs: [
      { name: "marketId", type: "uint256", internalType: "uint256" },
      {
        name: "outcome",
        type: "uint8",
        internalType: "enum WalrusPredictionMarket.Outcome",
      },
      { name: "amount", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "renounceOwnership",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "resolveMarket",
    inputs: [
      { name: "marketId", type: "uint256", internalType: "uint256" },
      {
        name: "outcome",
        type: "uint8",
        internalType: "enum WalrusPredictionMarket.Outcome",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "submitEvidence",
    inputs: [
      { name: "marketId", type: "uint256", internalType: "uint256" },
      { name: "walrusURI", type: "string", internalType: "string" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "transferOwnership",
    inputs: [
      { name: "newOwner", type: "address", internalType: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "usdc",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "contract IERC20" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "BetPlaced",
    inputs: [
      { name: "marketId", type: "uint256", indexed: true, internalType: "uint256" },
      { name: "bettor", type: "address", indexed: true, internalType: "address" },
      {
        name: "side",
        type: "uint8",
        indexed: false,
        internalType: "enum WalrusPredictionMarket.Outcome",
      },
      { name: "amount", type: "uint256", indexed: false, internalType: "uint256" },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "EvidenceSubmitted",
    inputs: [
      { name: "marketId", type: "uint256", indexed: true, internalType: "uint256" },
      { name: "submitter", type: "address", indexed: true, internalType: "address" },
      { name: "walrusURI", type: "string", indexed: false, internalType: "string" },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "MarketCreated",
    inputs: [
      { name: "marketId", type: "uint256", indexed: true, internalType: "uint256" },
      { name: "title", type: "string", indexed: false, internalType: "string" },
      {
        name: "description",
        type: "string",
        indexed: false,
        internalType: "string",
      },
      { name: "deadline", type: "uint64", indexed: false, internalType: "uint64" },
      {
        name: "metadataURI",
        type: "string",
        indexed: false,
        internalType: "string",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "MarketResolved",
    inputs: [
      { name: "marketId", type: "uint256", indexed: true, internalType: "uint256" },
      {
        name: "outcome",
        type: "uint8",
        indexed: false,
        internalType: "enum WalrusPredictionMarket.Outcome",
      },
      { name: "totalPaid", type: "uint256", indexed: false, internalType: "uint256" },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "OwnershipTransferred",
    inputs: [
      {
        name: "previousOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      { name: "newOwner", type: "address", indexed: true, internalType: "address" },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "WinningsPaid",
    inputs: [
      { name: "marketId", type: "uint256", indexed: true, internalType: "uint256" },
      { name: "bettor", type: "address", indexed: true, internalType: "address" },
      { name: "amount", type: "uint256", indexed: false, internalType: "uint256" },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "OwnableInvalidOwner",
    inputs: [{ name: "owner", type: "address", internalType: "address" }],
  },
  {
    type: "error",
    name: "OwnableUnauthorizedAccount",
    inputs: [{ name: "account", type: "address", internalType: "address" }],
  },
  {
    type: "error",
    name: "ReentrancyGuardReentrantCall",
    inputs: [],
  },
  {
    type: "error",
    name: "SafeERC20FailedOperation",
    inputs: [{ name: "token", type: "address", internalType: "address" }],
  },
] as const;

export type WalrusPredictionMarketAbi = typeof walrusPredictionMarketAbi;

