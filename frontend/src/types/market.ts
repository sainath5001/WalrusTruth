export type Outcome = "Undecided" | "Yes" | "No" | "Void";
export type Status = "Open" | "Resolved";

export type Market = {
  id: bigint;
  title: string;
  description: string;
  metadataURI: string;
  deadline: Date;
  status: Status;
  outcome: Outcome;
  yesPool: bigint;
  noPool: bigint;
  bettorCount: bigint;
};

export type Wager = {
  yesAmount: bigint;
  noAmount: bigint;
  paid: boolean;
};

export type MarketWithWager = Market & {
  userWager?: Wager;
};

