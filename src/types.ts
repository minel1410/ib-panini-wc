export type User = {
  id: string;
  name: string;
};

export type StickerRow = {
  sticker_id: string;
  quantity: number;
};

export type TradePair = {
  give: string;
  get: string;
};

export type MatchResult = {
  user: User;
  pairs: TradePair[];
  score: number;
};

export type LookupResult = {
  id: string;
  name: string;
  quantity: number;
};

export type LeaderboardEntry = {
  user: User;
  collected: number;
  duplicates: number;
  totalExtra: number;
  missing: number;
  percent: number;
  tradingValue: number;
};
