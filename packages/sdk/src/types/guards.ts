import { AuthorisedDisputeMechanism, MarketDisputeMechanism } from ".";

export const isAuthorisedDisputeMechanism = (
  marketDisputeMechanism: MarketDisputeMechanism
): marketDisputeMechanism is AuthorisedDisputeMechanism => {
  return (
    (marketDisputeMechanism as AuthorisedDisputeMechanism).authorized !==
    undefined
  );
};
