"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initIpfs = void 0;
const ipfs_http_client_1 = __importDefault(require("ipfs-http-client"));
exports.initIpfs = () => {
    return ipfs_http_client_1.default({
        url: 'https://ipfs.zeitgeist.pm'
    });
};
//# sourceMappingURL=ipfs.js.map