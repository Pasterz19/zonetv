module.exports = [
"[project]/src/app/admin/analytics/analytics-chart.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AnalyticsChart",
    ()=>AnalyticsChart
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
'use client';
;
const colorMap = {
    blue: {
        bg: 'bg-blue-500/20',
        line: 'bg-blue-500',
        text: 'text-blue-500'
    },
    red: {
        bg: 'bg-red-500/20',
        line: 'bg-red-500',
        text: 'text-red-500'
    },
    green: {
        bg: 'bg-emerald-500/20',
        line: 'bg-emerald-500',
        text: 'text-emerald-500'
    },
    purple: {
        bg: 'bg-purple-500/20',
        line: 'bg-purple-500',
        text: 'text-purple-500'
    },
    amber: {
        bg: 'bg-amber-500/20',
        line: 'bg-amber-500',
        text: 'text-amber-500'
    }
};
function AnalyticsChart({ data, type = 'bar', color = 'blue' }) {
    const colors = colorMap[color];
    const maxValue = Math.max(...data.map((d)=>d.value), 1);
    if (data.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "h-48 flex items-center justify-center text-muted-foreground",
            children: "Brak danych do wyświetlenia"
        }, void 0, false, {
            fileName: "[project]/src/app/admin/analytics/analytics-chart.tsx",
            lineNumber: 48,
            columnNumber: 7
        }, this);
    }
    const formatLabel = (label)=>{
        // Format YYYY-MM to Month abbreviation
        if (label.match(/^\d{4}-\d{2}$/)) {
            const [year, month] = label.split('-');
            const months = [
                'Sty',
                'Lut',
                'Mar',
                'Kwi',
                'Maj',
                'Cze',
                'Lip',
                'Sie',
                'Wrz',
                'Paź',
                'Lis',
                'Gru'
            ];
            return months[parseInt(month) - 1];
        }
        return label;
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "h-48",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex h-full items-end gap-1",
            children: data.map((item, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex-1 flex flex-col items-center gap-1 group",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "relative w-full",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `w-full rounded-t-sm transition-all duration-300 ${colors.line} group-hover:opacity-80`,
                                    style: {
                                        height: `${item.value / maxValue * 140}px`,
                                        minHeight: item.value > 0 ? '4px' : '0px'
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/analytics/analytics-chart.tsx",
                                    lineNumber: 73,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "bg-black/90 text-white text-xs rounded px-2 py-1 whitespace-nowrap",
                                        children: [
                                            formatLabel(item.label),
                                            ": ",
                                            item.value
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin/analytics/analytics-chart.tsx",
                                        lineNumber: 82,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/analytics/analytics-chart.tsx",
                                    lineNumber: 81,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/admin/analytics/analytics-chart.tsx",
                            lineNumber: 72,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-[10px] text-muted-foreground transform -rotate-45 origin-left",
                            children: formatLabel(item.label)
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin/analytics/analytics-chart.tsx",
                            lineNumber: 87,
                            columnNumber: 13
                        }, this)
                    ]
                }, index, true, {
                    fileName: "[project]/src/app/admin/analytics/analytics-chart.tsx",
                    lineNumber: 68,
                    columnNumber: 11
                }, this))
        }, void 0, false, {
            fileName: "[project]/src/app/admin/analytics/analytics-chart.tsx",
            lineNumber: 66,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/admin/analytics/analytics-chart.tsx",
        lineNumber: 65,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=src_app_admin_analytics_analytics-chart_tsx_b0f74083._.js.map