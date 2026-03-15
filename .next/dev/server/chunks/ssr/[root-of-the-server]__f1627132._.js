module.exports = [
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/app/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/app/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

const { jsxDEV: _jsxDEV } = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
{}{
    settingsOpen && /*#__PURE__*/ _jsxDEV("section", {
        className: "absolute top-20 left-4 right-4 z-40 md:static md:px-2",
        children: /*#__PURE__*/ _jsxDEV("div", {
            className: "flex flex-col gap-4 rounded-3xl bg-slate-900/98 px-6 py-5 border border-slate-700 shadow-2xl backdrop-blur-xl",
            children: [
                /*#__PURE__*/ _jsxDEV("div", {
                    className: "flex items-center justify-between",
                    children: [
                        /*#__PURE__*/ _jsxDEV("p", {
                            className: "text-sm md:text-lg font-bold uppercase text-slate-400",
                            children: "Match Length"
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 8,
                            columnNumber: 9
                        }, /*TURBOPACK member replacement*/ __turbopack_context__.e),
                        /*#__PURE__*/ _jsxDEV("div", {
                            className: "flex bg-slate-800 p-1 rounded-full border border-slate-700",
                            children: [
                                3,
                                5
                            ].map((num)=>/*#__PURE__*/ _jsxDEV("button", {
                                    onClick: ()=>setMatchFormat(num),
                                    className: `px-4 md:px-6 py-2 rounded-full text-sm md:text-lg font-bold transition-all ${matchFormat === num ? "bg-indigo-500 text-white shadow-lg" : "text-slate-500"}`,
                                    children: [
                                        "Best of ",
                                        num
                                    ]
                                }, num, true, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 11,
                                    columnNumber: 13
                                }, /*TURBOPACK member replacement*/ __turbopack_context__.e))
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 9,
                            columnNumber: 9
                        }, /*TURBOPACK member replacement*/ __turbopack_context__.e)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 7,
                    columnNumber: 7
                }, /*TURBOPACK member replacement*/ __turbopack_context__.e),
                /*#__PURE__*/ _jsxDEV("div", {
                    className: "h-px bg-slate-800"
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 24,
                    columnNumber: 7
                }, /*TURBOPACK member replacement*/ __turbopack_context__.e),
                /*#__PURE__*/ _jsxDEV("div", {
                    className: "flex items-center justify-between",
                    children: [
                        /*#__PURE__*/ _jsxDEV("p", {
                            className: "text-sm md:text-lg font-bold uppercase text-slate-400",
                            children: "Scoring Mode"
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 28,
                            columnNumber: 9
                        }, /*TURBOPACK member replacement*/ __turbopack_context__.e),
                        /*#__PURE__*/ _jsxDEV("button", {
                            onClick: toggleGoldenPoint,
                            className: `px-4 py-2 rounded-full text-sm md:text-lg font-bold border-2 transition-all ${useGoldenPoint ? "border-emerald-500 text-emerald-400 bg-emerald-500/10" : "border-slate-700 text-slate-500"}`,
                            children: useGoldenPoint ? "Golden Point" : "Advantage"
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 29,
                            columnNumber: 9
                        }, /*TURBOPACK member replacement*/ __turbopack_context__.e)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 27,
                    columnNumber: 7
                }, /*TURBOPACK member replacement*/ __turbopack_context__.e),
                /*#__PURE__*/ _jsxDEV("div", {
                    className: "h-px bg-slate-800"
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 39,
                    columnNumber: 7
                }, /*TURBOPACK member replacement*/ __turbopack_context__.e),
                /*#__PURE__*/ _jsxDEV("div", {
                    className: "flex items-center justify-between",
                    children: [
                        /*#__PURE__*/ _jsxDEV("p", {
                            className: "text-sm md:text-lg font-bold uppercase text-slate-400",
                            children: "Current Server"
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 43,
                            columnNumber: 9
                        }, /*TURBOPACK member replacement*/ __turbopack_context__.e),
                        /*#__PURE__*/ _jsxDEV("button", {
                            type: "button",
                            onClick: toggleServer,
                            className: "inline-flex items-center gap-2 rounded-full bg-slate-800 border-2 border-slate-600 px-5 py-2 text-sm md:text-lg font-bold text-slate-200 active:scale-95 transition-transform",
                            children: [
                                /*#__PURE__*/ _jsxDEV(ArrowRightLeft, {
                                    className: "h-4 w-4 md:h-5 md:w-5"
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 49,
                                    columnNumber: 11
                                }, /*TURBOPACK member replacement*/ __turbopack_context__.e),
                                "Swap Server"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 44,
                            columnNumber: 9
                        }, /*TURBOPACK member replacement*/ __turbopack_context__.e)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 42,
                    columnNumber: 7
                }, /*TURBOPACK member replacement*/ __turbopack_context__.e)
            ]
        }, void 0, true, {
            fileName: "[project]/app/page.tsx",
            lineNumber: 4,
            columnNumber: 5
        }, /*TURBOPACK member replacement*/ __turbopack_context__.e)
    }, void 0, false, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 3,
        columnNumber: 3
    }, /*TURBOPACK member replacement*/ __turbopack_context__.e);
}}),
"[project]/app/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/page.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__f1627132._.js.map