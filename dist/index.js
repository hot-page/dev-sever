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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http = __importStar(require("http"));
const https_1 = __importDefault(require("https"));
const cheerio_1 = __importDefault(require("cheerio"));
module.exports = function makeHotPageDevelopmentServer(options) {
    const { site, replaceAssets, port = 8000 } = options;
    if (!site)
        throw "Site is required";
    const server = http.createServer(function (req, res) {
        console.log(req.url);
        const options = {
            host: site.includes('.') ? site : `${site}.hot.page`,
            path: req.url,
        };
        https_1.default.request(options, (proxyRes) => {
            let html = '';
            proxyRes.on('data', chunk => html += chunk);
            // proxyRes.on('error', error => ... )
            proxyRes.on('end', () => {
                const $ = cheerio_1.default.load(html);
                Object.keys(replaceAssets).forEach((source) => {
                    const addAsset = () => {
                        if (replaceAssets[source].endsWith('.js')) {
                            $(`head`).append(`<script src="${replaceAssets[source]}"></script>`);
                        }
                        else if (replaceAssets[source].endsWith('.css')) {
                            $(`head`).append(`<link rel=stylesheet href="${replaceAssets[source]}">`);
                        }
                    };
                    if (source.endsWith('.js')) {
                        if ($(`script[src="${source}"]`).length > 0) {
                            $(`script[src="${source}"]`).remove();
                            addAsset();
                        }
                    }
                    else if (source.endsWith('.css')) {
                        if ($(`link[href="${source}"]`).length > 0) {
                            $(`link[href="${source}"]`).remove();
                            addAsset();
                        }
                    }
                });
                res.end($.html());
            });
        }).end();
    });
    server.listen(port, () => console.log('Listening on port', port));
};
//# sourceMappingURL=index.js.map