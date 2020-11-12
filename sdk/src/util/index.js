"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signerFromSeed = exports.initIpfs = exports.initApi = void 0;
const ipfs_1 = require("./ipfs");
Object.defineProperty(exports, "initIpfs", { enumerable: true, get: function () { return ipfs_1.initIpfs; } });
const polkadot_1 = require("./polkadot");
Object.defineProperty(exports, "initApi", { enumerable: true, get: function () { return polkadot_1.initApi; } });
Object.defineProperty(exports, "signerFromSeed", { enumerable: true, get: function () { return polkadot_1.signerFromSeed; } });
//# sourceMappingURL=index.js.map