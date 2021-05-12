/* eslint-disable prettier/prettier */
// import SDK, { util } from "@zeitgeistpm/sdk";
import SDK, { util } from "../../../sdk/src/";

type Options = {
  startBlock?: number;
  endBlock?: number;
  endpoint: string;
};

const arbitrarySet= [
  0, 775, 
  // 7725,7726,7744,7745, 7775, 7776,7777,7778, 7779,7780,7781,7782,7783, 7784,7785, 7786, 
  // 8355, 8420, 8427, 8464,8466,
  // 9382,9780, 
  // 10152,10207,10229, 10231, 10233,10237, 10252,10269, 10271, 10301, 10334,10477,10478, 10480,10482, 10495,
  // 10704,10721,10731, 10737, 10739, 10748, 10783,10790, 10832,
  11319,11322,11323,11325,11371,11373,11375,
  21742,21897, 22380, 22383
];

const doIndexyStuff = async (opts: Options): Promise<void> => {
  console.log('opts', opts);
  
  const { startBlock, endBlock, endpoint } = opts;

  const sdk = await SDK.initialize(endpoint);
  console.log('Begin at ', Date.now());

  let latestBlock = 0;
  if (!endBlock) {
    const head = await sdk.api.rpc.chain.getHeader();
    latestBlock = head.number.toNumber();
  }

  const blockHash = await sdk.api.rpc.chain.getBlockHash(
    Number(endBlock) || latestBlock
  );
  console.log('blockHash received at ', Date.now());
  
  console.log("blockHash", blockHash.toString());

  // console.log("startBlock:", startBlock);
  // const res = await sdk.models.indexTransferRecipients(startBlock || 0, endBlock);
  const res = await sdk.models.indexTransferRecipients(startBlock || 0, endBlock, arbitrarySet);

try{
  

  const blacklist=singleExtrinsic=>{
    if (!singleExtrinsic.method) {
      console.log('Uh uh, no method');     
    }
    const toHuman= singleExtrinsic.method.toHuman();
    const methString = `${toHuman.section}::${toHuman.method}`;
    
    if (methString === "timestamp::set") {
      console.log(`\nmethString=${methString}, return ${false}`);      
      return false;
    }

    
    console.log(`\n${singleExtrinsic.blockNum}: ${methString}`);
    console.log(toHuman);
    console.log(singleExtrinsic.toHuman());
    
    return methString
  }


  console.log("\n");
  const ting = res.map((blockExtrinsics, idx) => {
    if (blockExtrinsics.length!=1 || blockExtrinsics[0].length!==10) {
      return {
        idx, 
        blockNum: blockExtrinsics.blockNum, 
        blockExtrinsics,
        // bEtH : blockExtrinsics.toHuman(),
        bEtHFiltered : blockExtrinsics
          .map(singleExtrinsic=>(
            Object.assign(singleExtrinsic, {blockNum: blockExtrinsics.blockNum} )
          ))
          .filter(blacklist),
        // blockExtrinsics: blockExtrinsics.filter(blacklist).map(ext=>ext.toHuman())
      }
    }
  })
   ;
  console.log('(1st) mapped at:', Date.now());
  

  console.log('ting', ting);
  if (ting.length>1) {
    console.log('ting toHuman', ting.map(t=>t.blockExtrinsics.toHuman()));
    console.log('ting method toHuman', ting.map(t=>t.blockExtrinsics.map(singleExtrinsic=>({
      ...singleExtrinsic.method.toHuman(),
      ...singleExtrinsic.method.args,
      argsStringifed: JSON.stringify(singleExtrinsic.method.args),
      blockNum: t.blockExtrinsics.blockNum
      }))));
    console.log();
    

  }
  
  console.log("\n");
  const methods = res.map((blockExtrinsics) =>
    blockExtrinsics.map((mid) => mid.method.toJSON())
  );
  console.log(
    "methods with callIndex other than 0x0800:",
    methods.filter((arr) =>
      arr.every((method) => method.callIndex !== "0x0800")
    )
  );

  console.log("\n");
  console.log(
    "methods with args other than now:",
    methods.filter((arr, idx) => {
      if (idx%250===0) {console.log(idx);}      
      return arr.every((method) => !method.args || Object.keys(method.args).length !== 1) ?
      [idx, arr] : false
    })
  );
}catch(e){console.log(e)};
  
  // console.log("\n");
  // console.log(JSON.stringify(methods.map(methods=> methods.map(m=> m.args))));
  

  


  // console.log('\n');
  // console.log(method.toJSON());
  // console.log(nonce.toString(), signature.toString(), signer.toString(), isSigned.toString(), tip.toString(), args.toString());

  // const res = await sdk.models.getBlockData(blockHash);

  // console.log(res.block.extrinsics);
};

export default doIndexyStuff;
