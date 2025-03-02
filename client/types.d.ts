export type Media = {
  id: string;
  title?: string;
  isForAdult?: boolean;
  overview?: string;
  type?: "movies" | "series";
  image: {
    backdrop?: string;
    poster?: string;
    logo?: Logo;
  };
  video?: Video;
  releasedAt?: string;
  language?: {
    original?: string;
  };
};

export type Logo = {
  aspectRatio?: number;
  width?: number;
  height?: number;
  image?: string;
};

export type Video = {
  id: string;
  name: string;
  key: string;
  site: string;
  size: number;
  type: string;
  isOfficial: boolean;
};

export type User = {
  role: string;
  username: string;
  email: string;
  planId: string;
  subscriptionId: string;
  features: Features;
  planName: string;
  paypalSubscriptionExpiresAt : string;
  paypalSubscriptionApiKey : string;
  subscriptionStatus : string;
  location : string;
  usedFeatures : {
      backlinks?: number;
      plugin?: number;
      keywordSearches?: number;
      competitiveAnalysis?: number;
      serpScanner?: number;
  }
}
