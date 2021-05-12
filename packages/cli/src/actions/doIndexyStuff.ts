/* eslint-disable prettier/prettier */
// import SDK, { util } from "@zeitgeistpm/sdk";
import SDK, { util } from "../../../sdk/src/";

type Options = {
  startBlock?: number;
  endBlock?: number;
  endpoint: string;
};

const transferredIn = {};

const indexableExtrinsics = ["balances::transfer", "balances::transfer"];

const arbitrarySet = null;

const indexExtrinsicsUnstable = async (opts: Options): Promise<void> => {
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
  
  let timer = Date.now();
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
        
    console.log(transferredIn);      
    
  } catch(e) {console.log(e)};    
};

export default indexExtrinsicsUnstable;
