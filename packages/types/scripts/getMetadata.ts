import axios from "axios";
import fs from "fs";

const main = async (): Promise<void> => {
  const result = await axios.post(
    "http://localhost:9933", 
    '{"id":"1", "jsonrpc":"2.0", "method": "state_getMetadata", "params":[]}',
  {
    headers: {
      "Content-Type": "application/json"
    }
  });

  const { data } = result;
  fs.writeFileSync('packages/types/src/metadata/static-latest.ts', `export default '${data.result}';`);

  console.log("Done");
  process.exit(0);
}

try { main(); } catch (err) { console.error(err); }
