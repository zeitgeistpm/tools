const fs = require("fs");

const raw = fs.readFileSync("derbyIndex.output", { encoding: "utf-8" });

let total = 0;

const out = raw
  .split("\n")
  .filter(v => !!v)
  .sort((line, nextLine) => {
    const [address, value] = line.split(",");
    const [nextAddress, nextValue] = nextLine.split(",");
    return Number(nextValue) - Number(value);
  });

out.forEach(line => {
  const [address, value] = line.split(",");
  console.log(Number(value));
  total += Number(value);
});

fs.writeFileSync("out", out.join("\n"));
console.log('total', total);
