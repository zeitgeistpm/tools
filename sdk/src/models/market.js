"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("@polkadot/util");
const it_all_1 = __importDefault(require("it-all"));
const uint8arrays_1 = require("uint8arrays");
const ipfs_1 = require("../util/ipfs");
const polkadot_1 = require("../util/polkadot");
class Market {
    constructor(market) {
        const { creator, creation, creator_fee, oracle, end, metadata, market_type, market_status, reported_outcome, reporter, categories, title, description, metadataString, invalidShareId, yesShareId, noShareId, } = market;
        this.creator = creator;
        this.creation = creation;
        this.creatorFee = creator_fee;
        this.oracle = oracle;
        this.end = end;
        this.metadata = metadata;
        this.marketType = market_type;
        this.marketStatus = market_status;
        this.reportedOutcome = reported_outcome;
        this.reporter = reporter;
        this.categories = categories;
        this.title = title;
        this.description = description;
        this.metadataString = metadataString;
        this.invalidShareId = invalidShareId;
        this.yesShareId = yesShareId;
        this.noShareId = noShareId;
    }
    static getRemote(marketId) {
        return __awaiter(this, void 0, void 0, function* () {
            const api = yield polkadot_1.initApi();
            const ipfs = ipfs_1.initIpfs();
            const market = (yield api.query.predictionMarkets.markets(marketId)).toJSON();
            if (!market) {
                throw new Error(`Market with market id ${marketId} does not exist.`);
            }
            const { metadata } = market;
            const metadataString = util_1.hexToString(metadata);
            let data = {
                description: 'No metadata',
                title: 'No metadata',
            };
            if (util_1.hexToString(metadata)) {
                const raw = uint8arrays_1.toString(uint8arrays_1.concat(yield it_all_1.default(ipfs.cat(metadataString))));
                const extract = (data) => {
                    const titlePattern = "title:";
                    const infoPattern = "::info:";
                    return {
                        description: data.slice(data.indexOf(infoPattern) + infoPattern.length),
                        title: data.slice(titlePattern.length, data.indexOf(infoPattern)),
                    };
                };
                data = extract(raw);
            }
            const invalidShareId = (yield api.rpc.predictionMarkets.marketOutcomeShareId(0, 0)).toString();
            const yesShareId = (yield api.rpc.predictionMarkets.marketOutcomeShareId(0, 1)).toString();
            const noShareId = (yield api.rpc.predictionMarkets.marketOutcomeShareId(0, 2)).toString();
            Object.assign(market, Object.assign(Object.assign({}, data), { metadataString,
                invalidShareId,
                yesShareId,
                noShareId }));
            return new Market(market);
        });
    }
}
exports.default = Market;
//# sourceMappingURL=market.js.map