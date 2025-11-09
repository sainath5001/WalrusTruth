import { type Market, type Outcome, type Status } from "@/types/market";

const outcomeLookup: Record<number, Outcome> = {
  0: "Undecided",
  1: "Yes",
  2: "No",
  3: "Void",
};

const statusLookup: Record<number, Status> = {
  0: "Open",
  1: "Resolved",
};

export const decodeOutcome = (value: bigint | number): Outcome =>
  outcomeLookup[Number(value)] ?? "Undecided";

export const decodeStatus = (value: bigint | number): Status =>
  statusLookup[Number(value)] ?? "Open";

export const isMarketActive = (market: Market) =>
  market.status === "Open" && market.deadline.getTime() > Date.now();

