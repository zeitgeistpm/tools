/* eslint-disable prettier/prettier */
// import SDK, { util } from "@zeitgeistpm/sdk";
import SDK, { util } from "../../../sdk/src/";

type Options = {
  marketId?: number;
  startBlock?: number;
  endBlock?: number;
  endpoint: string;
};

const transferredIn = {};

const indexableExtrinsics = ["balances::transfer", "balances::transfer"];

const arbitrarySet = [
0, 775, 
7725,7726,7744,7745, 7775, 7776,7777,7778, 7779,7780,7781,7782,7783, 7784,7785, 7786, 
8355, 8420, 8427, 8464,8466,
9382,9780, 
10152,10207,10229, 10231, 10233,10237, 10252,10269, 10271, 10301, 10334,10477,10478, 10480,10482, 10495,
10704,10721,10731, 10737, 10739, 10748, 10783,10790, 10832,
11319,11322,11323,11325,11371,11373,11375,
21742,21897,];

const assets = [
  `{"ztg":"null"}`,
];

const spotPrice = {
  '{"ztg":"null"}' : 1,
};

const indexExtrinsicsUnstable = async (opts: Options): Promise<void> => {
  console.log('opts', opts);
  
  const { marketId, startBlock, endBlock, endpoint } = opts;

  let timer= Date.now();
  timer= Date.now();

  const sdk = await SDK.initialize(endpoint);
  console.log('Begin at ', Date.now());

  const outcomeAssets = (marketId === undefined)
    ? []
    : sdk.models.fetchMarketData(Number(marketId))
        .then(marketData=>{
          if (marketData.report === null) {
            throw new Error(`Market ${marketId} exists, with marketStatus ${marketData.marketStatus} but is not reported.`)
          }
          console.log(marketData.outcomeAssets);
          // TODO: check report status matches for non-categorical outcomes
          marketData.outcomeAssets.forEach((asset, idx)=>{
            spotPrice[JSON.stringify(asset)] = Number(Number(marketData.report) === idx)
          })
          return marketData.outcomeAssets;          
        });

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
  
  // timer = Date.now();
  console.log("beginning postprocessing at:", timer);

  try{    
    const indexSelectedExtrinsic = (args, methodConcatName, wholeBlock)=> {
      if (methodConcatName === "balances::transfer") {
        // Note different capitalisation: .toHuman().args[x].id  vs. args[0].toHuman().Id)  
        const recipient = args[0].toHuman().Id;        
        const balance = Number(args[1]);
        if (isNaN(balance)) {
          console.log("Expected balance as second argument, got:",args,"of which second argument converts to",Number(args[1]));          
          throw new Error(`${args[1]} did not converts to a numerical balance in ${wholeBlock.blockNum}- ${methodConcatName}`);
        }

        if (!transferredIn[recipient]) {
          transferredIn[recipient] = {};
        }
        console.log(`${balance}->${recipient}`);
        

        const asset=`{"ztg":"null"}`;
        if (!transferredIn[recipient][asset]) {
          transferredIn[recipient][asset] = 0;
        }
        
        transferredIn[recipient][asset] += balance;  
        return([balance, asset, recipient]);
      }
    }

    //@ts-ignore
    const parseExtrinsics=(singleExtrinsic, idx, _blockExtrinsics)=>{
      if (!singleExtrinsic.method) {
        console.log('Uh uh, no method');     
      }
      
      const toHuman= singleExtrinsic.method.toHuman();
      const methodConcatName = `${toHuman.section}::${toHuman.method}`;
      
      if (methodConcatName === "timestamp::set") {
        console.log(`\n${singleExtrinsic.blockNum}-${idx}: methodConcatName=${methodConcatName}, ignore.`);      
        return false;
      }      
      console.log(`${singleExtrinsic.blockNum}-${idx}: ${methodConcatName}`);

      if (indexableExtrinsics.includes(methodConcatName)) {
        indexSelectedExtrinsic(singleExtrinsic.args, methodConcatName, _blockExtrinsics);
      }

      return ({ methodConcatName });
    }

    console.log("\n");
    const filteredBlocks = res.map((blockExtrinsics) => {
      if (blockExtrinsics.length!=1 || blockExtrinsics[0].length!==10) {        
        return ({
          blockNum: blockExtrinsics.blockNum, 
          extrinsics: blockExtrinsics,
          filteredExtrinsics:
            blockExtrinsics
            .map(singleExtrinsic=>(
              Object.assign(
                singleExtrinsic, 
                { blockNum: blockExtrinsics.blockNum, }
              )
            ))
            .filter(parseExtrinsics)
        })
      }
    })
    .filter(block=>block && block.filteredExtrinsics.length);
        
    console.log("blocks filtered at:", Date.now());    
    console.log(transferredIn);      
    
  } catch(e) {console.log(e)};    

  console.log('pre-balancesChange');
  const balancesChange = await Promise.all(
    Object.keys(transferredIn).map(async player => {    
      const change = { player };

      console.log('pre-await');    
      const responsesAsync=
          assets.map(async asset=>
            asset === `{"ztg":"null"}`
              ? await sdk.api.query.system.account(player).then((res) => res.data)
              : await sdk.api.query.tokens.accounts(player, asset)
          )
      
      await Promise.all(assets);
      const responses= await Promise.all(responsesAsync);          
      responses
        .forEach((newBalance, idx)=>{
          // TODO: test for non-ZTG assets
          console.log('newBalance.toHuman()', newBalance.toHuman());
          console.log('newBalance.to JSON()', newBalance.toJSON());
          // @ts-ignore
          console.log('newBalance.toJSON().free', newBalance.toJSON().free);
          // @ts-ignore
          change[assets[idx]] = (newBalance.toJSON().free || 0) - (transferredIn[player][assets[idx] || 0]);
          // console.log(change, change[assets[idx]]);
        })

      console.log(change);      
      return change;
    })
  )

  console.log('balancesChange', balancesChange);  

  const profit = Object.keys(transferredIn).map((player, idx) => ({
    ...transferredIn[player],
    player,
    profit: assets.reduce((total, asset)=> 
        total + balancesChange[idx][asset] * spotPrice[asset] ,
        0
      )
  }))
    .sort((a,b)=>b.profit-a.profit)
  
  console.log(`completed at: ${Date.now()}: ${(Date.now()-timer)/1000}s.\n`);
  profit.forEach((player, idx)=>{
    console.log(`\nPLACED: ${idx+1}...`);
    if (player.profit) {
      console.log(`with total ${player.profit>0 ? "WINNINGS" : "LOSSES"} of ${player.profit/1e10} ZTG -`);    
    } else {
      console.log(`(BROKE EVEN)`);      
    }
    console.log(`${player.player}`);
    
  })
};

export default indexExtrinsicsUnstable;
