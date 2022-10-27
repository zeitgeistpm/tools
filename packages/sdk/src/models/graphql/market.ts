import { gql } from "graphql-request";
import { MarketCreation, ScalarRangeType, ScoringRule } from "../../types";

export const FRAGMENT_MARKET_DETAILS = gql`
  fragment MarketDetails on Market {
    marketId
    description
    creator
    creatorFee
    creation
    oracle
    question
    slug
    tags
    status
    scoringRule
    resolvedOutcome
    poolId
    scalarType
    metadata
    marketType {
      categorical
      scalar
    }
    period {
      block
      end
      start
      timestamp
    }
    report {
      outcome {
        categorical
        scalar
      }
      at
      by
    }
    disputeMechanism {
      Authorized: authorized
      Court: court
      SimpleDisputes: simpleDisputes
    }
    categories {
      ticker
      name
      color
    }
  }
`;

export type MarketQueryData = {
  marketId: number;
  poolId: number;
  marketType: { categorical: string | null; scalar: string | null };
  disputeMechanism: {
    authorized: boolean | null;
    court: boolean | null;
    simpleDisputes: boolean | null;
  };
  report: {
    outcome: {
      categorical: string | null;
      scalar: unknown;
    };
  };
  period: {
    block: string | null;
    end: string;
    start: string;
    timestamp: string[] | null;
  };
  metadata: string;
  scalarType: ScalarRangeType | null;
  description: string;
  creator: string;
  creatorFee: number;
  creation: MarketCreation;
  slug: string;
  tags: string[] | null;
  status: string;
  scoringRule: ScoringRule;
  resolvedOutcome: number | null;
  oracle: string;
  question: string;
  categories: { ticker: string; name: string; color: string }[];
};
