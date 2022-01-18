import { gql } from "graphql-request";
import { MarketCreation, ScoringRule } from "../../types";

export const FRAGMENT_MARKET_DETAILS = gql`
  fragment MarketDetails on Market {
    marketId
    description
    end
    creator
    creatorFee
    creation
    oracle
    question
    slug
    img
    tags
    status
    scoringRule
    resolvedOutcome
    marketType {
      categorical
      scalar
    }
    period {
      block
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
    mdm {
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
  marketType: { categorical: string | null; scalar: string | null };
  mdm: {
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
    timestamp: string | null;
  };
  description: string;
  creator: string;
  creatorFee: number;
  creation: MarketCreation;
  slug: string;
  img: string | null;
  tags: string[] | null;
  status: string;
  scoringRule: ScoringRule;
  resolvedOutcome: number | null;
  end: BigInt;
  oracle: string;
  question: string;
  categories: { ticker: string; name: string; color: string }[];
};
