"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signerFromSeed = exports.initApi = void 0;
const api_1 = require("@polkadot/api");
const keyring_1 = __importDefault(require("@polkadot/keyring"));
const zeitgeistDefinitions = __importStar(require("@zeitgeistpm/type-definitions"));
const typesFromDefs = (definitions) => {
    return Object
        .values(definitions)
        .reduce((res, { types }) => (Object.assign(Object.assign({}, res), types)), {});
};
exports.initApi = (endpoint = 'wss://bp-rpc.zeitgeist.pm') => {
    return api_1.ApiPromise.create({
        provider: new api_1.WsProvider(endpoint),
        rpc: {
            predictionMarkets: {
                marketOutcomeShareId: {
                    description: "Get the market outcome share identifier.",
                    params: [
                        {
                            name: 'market_id',
                            type: 'MarketId'
                        },
                        {
                            name: 'outcome',
                            type: 'u16'
                        },
                        {
                            name: 'at',
                            type: 'Hash',
                            isOptional: true
                        }
                    ],
                    type: 'Hash'
                }
            }
        },
        types: typesFromDefs(zeitgeistDefinitions),
    });
};
exports.signerFromSeed = (seed) => {
    const keyring = new keyring_1.default({
        type: "sr25519",
    });
    return keyring.addFromUri(seed);
};
//# sourceMappingURL=polkadot.js.map