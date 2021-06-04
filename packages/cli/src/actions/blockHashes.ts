import SDK, { util } from "@zeitgeistpm/sdk";

type Options = {
  endpoint: string;
  blocks: number[];
  link?: boolean;
};

const getBlockHashes = async (opts: Options): Promise<void> => {
  const { blocks, link, endpoint } = opts;
  const linkOf = (hash) =>
    link
      ? `\nhttps://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fbp-rpc.zeitgeist.pm#/explorer/query/${hash}\n`
      : "";

  const sdk = await SDK.initialize(endpoint);

  const hashes = blocks.map((block) => sdk.api.rpc.chain.getBlockHash(block));

  console.log(
    (await Promise.all(hashes))
      .map((hash, idx) => `${blocks[idx]}: ${hash}${linkOf(hash)}`)
      .join("\n")
  );
};

export default getBlockHashes;
