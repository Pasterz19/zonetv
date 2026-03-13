module.exports = [
"[project]/node_modules/jszip/lib/index.js [app-rsc] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "server/chunks/ssr/node_modules_4862f11a._.js",
  "server/chunks/ssr/[externals]__846aef34._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[project]/node_modules/jszip/lib/index.js [app-rsc] (ecmascript)");
    });
});
}),
"[project]/src/lib/m3u-parser.ts [app-rsc] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "server/chunks/ssr/src_lib_m3u-parser_ts_51dcd909._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[project]/src/lib/m3u-parser.ts [app-rsc] (ecmascript)");
    });
});
}),
];