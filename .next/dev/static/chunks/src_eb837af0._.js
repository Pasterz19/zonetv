(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/lib/utils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/clsx/dist/clsx.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-client] (ecmascript)");
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ui/button.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Button",
    ()=>Button,
    "buttonVariants",
    ()=>buttonVariants
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-slot/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/class-variance-authority/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
;
;
;
;
const buttonVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cva"])("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive", {
    variants: {
        variant: {
            default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
            destructive: "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
            outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
            secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
            ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
            link: "text-primary underline-offset-4 hover:underline"
        },
        size: {
            default: "h-9 px-4 py-2 has-[>svg]:px-3",
            sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
            lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
            icon: "size-9"
        }
    },
    defaultVariants: {
        variant: "default",
        size: "default"
    }
});
function Button({ className, variant, size, asChild = false, ...props }) {
    const Comp = asChild ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Slot"] : "button";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Comp, {
        "data-slot": "button",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(buttonVariants({
            variant,
            size,
            className
        })),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/button.tsx",
        lineNumber: 51,
        columnNumber: 5
    }, this);
}
_c = Button;
;
var _c;
__turbopack_context__.k.register(_c, "Button");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ui/slider.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Slider",
    ()=>Slider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slider$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-slider/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function Slider({ className, defaultValue, value, min = 0, max = 100, ...props }) {
    _s();
    const _values = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "Slider.useMemo[_values]": ()=>Array.isArray(value) ? value : Array.isArray(defaultValue) ? defaultValue : [
                min,
                max
            ]
    }["Slider.useMemo[_values]"], [
        value,
        defaultValue,
        min,
        max
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slider$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"], {
        "data-slot": "slider",
        defaultValue: defaultValue,
        value: value,
        min: min,
        max: max,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col", className),
        ...props,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slider$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Track"], {
                "data-slot": "slider-track",
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slider$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Range"], {
                    "data-slot": "slider-range",
                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full")
                }, void 0, false, {
                    fileName: "[project]/src/components/ui/slider.tsx",
                    lineNumber: 45,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/ui/slider.tsx",
                lineNumber: 39,
                columnNumber: 7
            }, this),
            Array.from({
                length: _values.length
            }, (_, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slider$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Thumb"], {
                    "data-slot": "slider-thumb",
                    className: "border-primary bg-background ring-ring/50 block size-4 shrink-0 rounded-full border shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
                }, index, false, {
                    fileName: "[project]/src/components/ui/slider.tsx",
                    lineNumber: 53,
                    columnNumber: 9
                }, this))
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ui/slider.tsx",
        lineNumber: 27,
        columnNumber: 5
    }, this);
}
_s(Slider, "g0y/PG/feYg861SE8jxuAUMRVc0=");
_c = Slider;
;
var _c;
__turbopack_context__.k.register(_c, "Slider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/dashboard/movies/[id]/movie-player.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MoviePlayer",
    ()=>MoviePlayer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$hls$2e$js$2f$dist$2f$hls$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/hls.js/dist/hls.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/play.js [app-client] (ecmascript) <export default as Play>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pause$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Pause$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/pause.js [app-client] (ecmascript) <export default as Pause>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$volume$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Volume2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/volume-2.js [app-client] (ecmascript) <export default as Volume2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$volume$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__VolumeX$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/volume-x.js [app-client] (ecmascript) <export default as VolumeX>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$maximize$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Maximize$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/maximize.js [app-client] (ecmascript) <export default as Maximize>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$minimize$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Minimize$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/minimize.js [app-client] (ecmascript) <export default as Minimize>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$skip$2d$back$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__SkipBack$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/skip-back.js [app-client] (ecmascript) <export default as SkipBack>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$skip$2d$forward$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__SkipForward$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/skip-forward.js [app-client] (ecmascript) <export default as SkipForward>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$film$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Film$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/film.js [app-client] (ecmascript) <export default as Film>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/triangle-alert.js [app-client] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/refresh-cw.js [app-client] (ecmascript) <export default as RefreshCw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$slider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/slider.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
function MoviePlayer({ movie, initialTimestamp, userId }) {
    _s();
    const videoRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const hlsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const saveIntervalRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const isSeekingRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const retryAttemptsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const maxRetries = 3;
    const [isPlaying, setIsPlaying] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isMuted, setIsMuted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [volume, setVolume] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(1);
    const [currentTime, setCurrentTime] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [duration, setDuration] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [showControls, setShowControls] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [isFullscreen, setIsFullscreen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [retryCount, setRetryCount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const videoUrl = movie?.externalUrl;
    const hasValidUrl = videoUrl && videoUrl.trim() !== '';
    // Parse error details
    const parseHlsError = (data)=>{
        const errorType = data.type;
        const errorDetails = data.details;
        const errorMessage = data.error?.message || '';
        const responseCode = data.response?.code;
        // Check for expired URL (common with token-based URLs)
        if (data.details === 'fragLoadError') {
            const url = data.url || data.frag?.url || '';
            // Check for common expired token indicators
            if (responseCode === 403 || responseCode === 401 || errorMessage.includes('403') || errorMessage.includes('401')) {
                return {
                    type: 'network',
                    message: 'Link do wideo wygasł',
                    details: 'Token autoryzacyjny w URL wygasł. Musisz wygenerować nowy link do wideo.'
                };
            }
            // Generic fragment load error
            return {
                type: 'network',
                message: 'Nie można załadować fragmentu wideo',
                details: 'Sprawdź czy link nie wygasł lub czy serwer działa poprawnie.'
            };
        }
        // Network errors
        if (errorType === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$hls$2e$js$2f$dist$2f$hls$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].ErrorTypes.NETWORK_ERROR) {
            switch(errorDetails){
                case 'manifestLoadError':
                case 'levelLoadError':
                case 'audioTrackLoadError':
                    return {
                        type: 'network',
                        message: 'Nie można załadować manifestu wideo',
                        details: 'Serwer nie odpowiada lub link wygasł. Sprawdź czy URL jest poprawny.'
                    };
                case 'manifestLoadTimeOut':
                case 'levelLoadTimeOut':
                    return {
                        type: 'network',
                        message: 'Przekroczono czas oczekiwania',
                        details: 'Serwer odpowiedział zbyt wolno. Spróbuj ponownie za chwilę.'
                    };
                case 'fragLoadTimeOut':
                    return {
                        type: 'network',
                        message: 'Przekroczono czas ładowania fragmentu',
                        details: 'Serwer odpowiada zbyt wolno. Sprawdź połączenie internetowe.'
                    };
                default:
                    return {
                        type: 'network',
                        message: 'Błąd sieci',
                        details: `Szczegóły: ${errorDetails}${errorMessage ? ` - ${errorMessage}` : ''}`
                    };
            }
        }
        // Media errors
        if (errorType === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$hls$2e$js$2f$dist$2f$hls$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].ErrorTypes.MEDIA_ERROR) {
            switch(errorDetails){
                case 'bufferFullError':
                    return {
                        type: 'media',
                        message: 'Bufor wideo jest pełny',
                        details: 'Spróbuj odświeżyć stronę.'
                    };
                case 'bufferStalledError':
                    return {
                        type: 'media',
                        message: 'Odtwarzanie zostało wstrzymane',
                        details: 'Brak danych do odtwarzania. Sprawdź połączenie internetowe.'
                    };
                default:
                    return {
                        type: 'media',
                        message: 'Błąd mediów',
                        details: `Szczegóły: ${errorDetails}${errorMessage ? ` - ${errorMessage}` : ''}`
                    };
            }
        }
        // Manifest errors
        if (errorType === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$hls$2e$js$2f$dist$2f$hls$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].ErrorTypes.MUX_ERROR) {
            return {
                type: 'manifest',
                message: 'Błąd formatu wideo',
                details: 'Ten format wideo nie jest obsługiwany lub plik jest uszkodzony.'
            };
        }
        return {
            type: 'unknown',
            message: 'Nieznany błąd',
            details: `Typ: ${errorType}, Szczegóły: ${errorDetails}${errorMessage ? ` - ${errorMessage}` : ''}`
        };
    };
    // Initialize player
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MoviePlayer.useEffect": ()=>{
            const video = videoRef.current;
            if (!video || !hasValidUrl) {
                const timer = setTimeout({
                    "MoviePlayer.useEffect.timer": ()=>setIsLoading(false)
                }["MoviePlayer.useEffect.timer"], 0);
                return ({
                    "MoviePlayer.useEffect": ()=>clearTimeout(timer)
                })["MoviePlayer.useEffect"];
            }
            // Reset error state on retry
            if (retryCount > 0) {
                setError(null);
                retryAttemptsRef.current = 0;
            }
            console.log('Loading video URL:', videoUrl);
            // Check if HLS stream
            if (videoUrl.includes('.m3u8') && __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$hls$2e$js$2f$dist$2f$hls$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isSupported()) {
                const hls = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$hls$2e$js$2f$dist$2f$hls$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]({
                    maxBufferLength: 30,
                    maxMaxBufferLength: 120,
                    maxBufferSize: 60 * 1000 * 1000,
                    maxBufferHole: 0.5,
                    lowLatencyMode: false,
                    backBufferLength: 90,
                    enableWorker: true,
                    startLevel: -1,
                    capLevelToPlayerSize: true,
                    startFragPrefetch: true,
                    // Better error handling for seeking
                    fragLoadingTimeOut: 20000,
                    fragLoadingMaxRetry: 6,
                    fragLoadingMaxRetryTimeout: 64000,
                    levelLoadingTimeOut: 10000,
                    levelLoadingMaxRetry: 4,
                    manifestLoadingTimeOut: 10000,
                    manifestLoadingMaxRetry: 4
                });
                hls.loadSource(videoUrl);
                hls.attachMedia(video);
                hls.on(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$hls$2e$js$2f$dist$2f$hls$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].Events.MANIFEST_PARSED, {
                    "MoviePlayer.useEffect": ()=>{
                        console.log('HLS manifest parsed successfully');
                        retryAttemptsRef.current = 0;
                        setTimeout({
                            "MoviePlayer.useEffect": ()=>{
                                setIsLoading(false);
                                setError(null);
                            }
                        }["MoviePlayer.useEffect"], 0);
                        if (initialTimestamp > 0) {
                            video.currentTime = initialTimestamp;
                        }
                    }
                }["MoviePlayer.useEffect"]);
                hls.on(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$hls$2e$js$2f$dist$2f$hls$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].Events.FRAG_LOADED, {
                    "MoviePlayer.useEffect": ()=>{
                        // Reset retry counter on successful fragment load
                        retryAttemptsRef.current = 0;
                    }
                }["MoviePlayer.useEffect"]);
                hls.on(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$hls$2e$js$2f$dist$2f$hls$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].Events.ERROR, {
                    "MoviePlayer.useEffect": (_, data)=>{
                        // Don't show errors during seeking for non-fatal errors
                        if (isSeekingRef.current && !data.fatal) {
                            console.warn('HLS info during seeking:', data.details);
                            return;
                        }
                        // Handle non-fatal errors
                        if (!data.fatal) {
                            // Buffer stalls during seeking are normal
                            if (data.details === 'bufferStalledError' || data.details === 'bufferNudgeOnStall') {
                                console.warn('HLS buffer stall (normal during seeking):', data.details);
                                return;
                            }
                            console.warn('HLS non-fatal error:', data.details);
                            return;
                        }
                        // Fatal errors handling
                        console.error('HLS fatal error:', data.type, data.details, data);
                        // Increment retry counter
                        retryAttemptsRef.current++;
                        const parsedError = parseHlsError(data);
                        // Check for expired token (403/401) - no point retrying
                        const response = data.response;
                        const isExpiredToken = response?.code === 403 || response?.code === 401 || String(data.error?.message || '').includes('403') || String(data.error?.message || '').includes('401');
                        if (isExpiredToken) {
                            console.error('Token expired, showing error immediately');
                            setError({
                                type: 'network',
                                message: 'Link do wideo wygasł',
                                details: 'Token autoryzacyjny wygasł. Musisz zaktualizować link do wideo w panelu administracyjnym.'
                            });
                            setTimeout({
                                "MoviePlayer.useEffect": ()=>setIsLoading(false)
                            }["MoviePlayer.useEffect"], 0);
                            return;
                        }
                        // Check if we've exceeded max retries
                        if (retryAttemptsRef.current > maxRetries) {
                            console.error('Max retries exceeded, showing error to user');
                            setError({
                                ...parsedError,
                                details: `${parsedError.details || ''}`
                            });
                            setTimeout({
                                "MoviePlayer.useEffect": ()=>setIsLoading(false)
                            }["MoviePlayer.useEffect"], 0);
                            return;
                        }
                        // Try to recover from fatal errors
                        switch(data.type){
                            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$hls$2e$js$2f$dist$2f$hls$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].ErrorTypes.NETWORK_ERROR:
                                // For fragment load errors, try to reload
                                console.log(`Network error, retrying... (${retryAttemptsRef.current}/${maxRetries})`);
                                // If it's a fragLoadError during seeking, just try to startLoad
                                if (data.details === 'fragLoadError' || data.details === 'fragLoadTimeOut') {
                                    // Try to reload the fragment
                                    hls.startLoad(video.currentTime);
                                    // Set a timeout to show error if recovery fails
                                    const retryTimeout = setTimeout({
                                        "MoviePlayer.useEffect.retryTimeout": ()=>{
                                            if (retryAttemptsRef.current <= maxRetries && hlsRef.current === hls) {
                                                // Try again
                                                hls.startLoad(video.currentTime);
                                            }
                                        }
                                    }["MoviePlayer.useEffect.retryTimeout"], 3000);
                                    // Clear timeout on successful playback
                                    const clearRetry = {
                                        "MoviePlayer.useEffect.clearRetry": ()=>{
                                            clearTimeout(retryTimeout);
                                            video.removeEventListener('playing', clearRetry);
                                        }
                                    }["MoviePlayer.useEffect.clearRetry"];
                                    video.addEventListener('playing', clearRetry);
                                } else {
                                    // Other network errors
                                    hls.startLoad();
                                }
                                // Show error after delay if still failing
                                setTimeout({
                                    "MoviePlayer.useEffect": ()=>{
                                        if (hlsRef.current === hls && retryAttemptsRef.current > maxRetries) {
                                            setError(parsedError);
                                            setTimeout({
                                                "MoviePlayer.useEffect": ()=>setIsLoading(false)
                                            }["MoviePlayer.useEffect"], 0);
                                        }
                                    }
                                }["MoviePlayer.useEffect"], 8000);
                                break;
                            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$hls$2e$js$2f$dist$2f$hls$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].ErrorTypes.MEDIA_ERROR:
                                // Try to recover media errors
                                console.log(`Media error, recovering... (${retryAttemptsRef.current}/${maxRetries})`);
                                hls.recoverMediaError();
                                // Show error after delay if still failing
                                setTimeout({
                                    "MoviePlayer.useEffect": ()=>{
                                        if (hlsRef.current === hls && retryAttemptsRef.current > maxRetries) {
                                            setError(parsedError);
                                            setTimeout({
                                                "MoviePlayer.useEffect": ()=>setIsLoading(false)
                                            }["MoviePlayer.useEffect"], 0);
                                        }
                                    }
                                }["MoviePlayer.useEffect"], 5000);
                                break;
                            default:
                                // Cannot recover - show error
                                console.error('Unrecoverable error:', data.type);
                                setError(parsedError);
                                setTimeout({
                                    "MoviePlayer.useEffect": ()=>setIsLoading(false)
                                }["MoviePlayer.useEffect"], 0);
                                hls.destroy();
                                break;
                        }
                    }
                }["MoviePlayer.useEffect"]);
                hlsRef.current = hls;
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                // Native HLS support (Safari)
                video.src = videoUrl;
                setTimeout({
                    "MoviePlayer.useEffect": ()=>setIsLoading(false)
                }["MoviePlayer.useEffect"], 0);
            } else {
                // Regular video (MP4, etc.)
                video.src = videoUrl;
                video.onerror = ({
                    "MoviePlayer.useEffect": ()=>{
                        const mediaError = video.error;
                        if (mediaError) {
                            let errorMsg = 'Nie można odtworzyć wideo';
                            let errorDetails = '';
                            switch(mediaError.code){
                                case MediaError.MEDIA_ERR_ABORTED:
                                    errorMsg = 'Odtwarzanie zostało przerwane';
                                    break;
                                case MediaError.MEDIA_ERR_NETWORK:
                                    errorMsg = 'Błąd sieci';
                                    errorDetails = 'Nie można pobrać wideo. Sprawdź połączenie internetowe.';
                                    break;
                                case MediaError.MEDIA_ERR_DECODE:
                                    errorMsg = 'Błąd dekodowania';
                                    errorDetails = 'Format wideo nie jest obsługiwany lub plik jest uszkodzony.';
                                    break;
                                case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                                    errorMsg = 'Nieobsługiwany format';
                                    errorDetails = 'Ten format wideo nie jest obsługiwany przez przeglądarkę.';
                                    break;
                            }
                            setError({
                                type: 'media',
                                message: errorMsg,
                                details: errorDetails || `Kod błędu: ${mediaError.code}`
                            });
                        }
                        setTimeout({
                            "MoviePlayer.useEffect": ()=>setIsLoading(false)
                        }["MoviePlayer.useEffect"], 0);
                    }
                })["MoviePlayer.useEffect"];
                setTimeout({
                    "MoviePlayer.useEffect": ()=>setIsLoading(false)
                }["MoviePlayer.useEffect"], 0);
            }
            // Event listeners
            const onLoadedMetadata = {
                "MoviePlayer.useEffect.onLoadedMetadata": ()=>{
                    setDuration(video.duration);
                    if (initialTimestamp > 0) {
                        video.currentTime = initialTimestamp;
                    }
                }
            }["MoviePlayer.useEffect.onLoadedMetadata"];
            const onTimeUpdate = {
                "MoviePlayer.useEffect.onTimeUpdate": ()=>{
                    setCurrentTime(video.currentTime);
                }
            }["MoviePlayer.useEffect.onTimeUpdate"];
            const onPlay = {
                "MoviePlayer.useEffect.onPlay": ()=>setIsPlaying(true)
            }["MoviePlayer.useEffect.onPlay"];
            const onPause = {
                "MoviePlayer.useEffect.onPause": ()=>setIsPlaying(false)
            }["MoviePlayer.useEffect.onPause"];
            const onWaiting = {
                "MoviePlayer.useEffect.onWaiting": ()=>setTimeout({
                        "MoviePlayer.useEffect.onWaiting": ()=>setIsLoading(true)
                    }["MoviePlayer.useEffect.onWaiting"], 0)
            }["MoviePlayer.useEffect.onWaiting"];
            const onPlaying = {
                "MoviePlayer.useEffect.onPlaying": ()=>{
                    setTimeout({
                        "MoviePlayer.useEffect.onPlaying": ()=>{
                            setIsLoading(false);
                            setError(null);
                        }
                    }["MoviePlayer.useEffect.onPlaying"], 0);
                }
            }["MoviePlayer.useEffect.onPlaying"];
            const onCanPlay = {
                "MoviePlayer.useEffect.onCanPlay": ()=>setTimeout({
                        "MoviePlayer.useEffect.onCanPlay": ()=>setIsLoading(false)
                    }["MoviePlayer.useEffect.onCanPlay"], 0)
            }["MoviePlayer.useEffect.onCanPlay"];
            const onSeeking = {
                "MoviePlayer.useEffect.onSeeking": ()=>{
                    isSeekingRef.current = true;
                    setTimeout({
                        "MoviePlayer.useEffect.onSeeking": ()=>setIsLoading(true)
                    }["MoviePlayer.useEffect.onSeeking"], 0);
                }
            }["MoviePlayer.useEffect.onSeeking"];
            const onSeeked = {
                "MoviePlayer.useEffect.onSeeked": ()=>{
                    isSeekingRef.current = false;
                    setTimeout({
                        "MoviePlayer.useEffect.onSeeked": ()=>setIsLoading(false)
                    }["MoviePlayer.useEffect.onSeeked"], 0);
                }
            }["MoviePlayer.useEffect.onSeeked"];
            video.addEventListener('loadedmetadata', onLoadedMetadata);
            video.addEventListener('timeupdate', onTimeUpdate);
            video.addEventListener('play', onPlay);
            video.addEventListener('pause', onPause);
            video.addEventListener('waiting', onWaiting);
            video.addEventListener('playing', onPlaying);
            video.addEventListener('canplay', onCanPlay);
            video.addEventListener('seeking', onSeeking);
            video.addEventListener('seeked', onSeeked);
            return ({
                "MoviePlayer.useEffect": ()=>{
                    video.removeEventListener('loadedmetadata', onLoadedMetadata);
                    video.removeEventListener('timeupdate', onTimeUpdate);
                    video.removeEventListener('play', onPlay);
                    video.removeEventListener('pause', onPause);
                    video.removeEventListener('waiting', onWaiting);
                    video.removeEventListener('playing', onPlaying);
                    video.removeEventListener('canplay', onCanPlay);
                    video.removeEventListener('seeking', onSeeking);
                    video.removeEventListener('seeked', onSeeked);
                    if (hlsRef.current) {
                        hlsRef.current.destroy();
                        hlsRef.current = null;
                    }
                    if (saveIntervalRef.current) {
                        clearInterval(saveIntervalRef.current);
                    }
                }
            })["MoviePlayer.useEffect"];
        }
    }["MoviePlayer.useEffect"], [
        videoUrl,
        initialTimestamp,
        hasValidUrl,
        retryCount
    ]);
    // Save progress periodically
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MoviePlayer.useEffect": ()=>{
            if (!isPlaying || !hasValidUrl) return;
            saveIntervalRef.current = setInterval({
                "MoviePlayer.useEffect": async ()=>{
                    const video = videoRef.current;
                    if (!video) return;
                    try {
                        await fetch('/api/watch/progress', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                movieId: movie.id,
                                timestamp: Math.floor(video.currentTime)
                            })
                        });
                    } catch (err) {
                        console.error('Failed to save progress:', err);
                    }
                }
            }["MoviePlayer.useEffect"], 10000); // Save every 10 seconds
            return ({
                "MoviePlayer.useEffect": ()=>{
                    if (saveIntervalRef.current) {
                        clearInterval(saveIntervalRef.current);
                    }
                }
            })["MoviePlayer.useEffect"];
        }
    }["MoviePlayer.useEffect"], [
        isPlaying,
        movie.id,
        hasValidUrl
    ]);
    // Auto-hide controls
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MoviePlayer.useEffect": ()=>{
            if (!isPlaying) return;
            let timeout;
            const handleMouseMove = {
                "MoviePlayer.useEffect.handleMouseMove": ()=>{
                    setShowControls(true);
                    clearTimeout(timeout);
                    timeout = setTimeout({
                        "MoviePlayer.useEffect.handleMouseMove": ()=>setShowControls(false)
                    }["MoviePlayer.useEffect.handleMouseMove"], 3000);
                }
            }["MoviePlayer.useEffect.handleMouseMove"];
            const container = containerRef.current;
            container?.addEventListener('mousemove', handleMouseMove);
            return ({
                "MoviePlayer.useEffect": ()=>{
                    container?.removeEventListener('mousemove', handleMouseMove);
                    clearTimeout(timeout);
                }
            })["MoviePlayer.useEffect"];
        }
    }["MoviePlayer.useEffect"], [
        isPlaying
    ]);
    const togglePlay = ()=>{
        const video = videoRef.current;
        if (!video) return;
        if (isPlaying) {
            video.pause();
        } else {
            video.play();
        }
    };
    const toggleMute = ()=>{
        const video = videoRef.current;
        if (!video) return;
        video.muted = !video.muted;
        setIsMuted(video.muted);
    };
    const handleVolumeChange = (value)=>{
        const video = videoRef.current;
        if (!video) return;
        video.volume = value[0] / 100;
        setVolume(value[0] / 100);
        setIsMuted(value[0] === 0);
    };
    const handleSeek = (value)=>{
        const video = videoRef.current;
        if (!video) return;
        video.currentTime = value[0] / 100 * duration;
    };
    const skip = (seconds)=>{
        const video = videoRef.current;
        if (!video) return;
        video.currentTime = Math.max(0, Math.min(video.currentTime + seconds, duration));
    };
    const toggleFullscreen = async ()=>{
        const container = containerRef.current;
        if (!container) return;
        if (!document.fullscreenElement) {
            await container.requestFullscreen();
            setIsFullscreen(true);
        } else {
            await document.exitFullscreen();
            setIsFullscreen(false);
        }
    };
    const handleRetry = ()=>{
        setError(null);
        setRetryCount((prev)=>prev + 1);
    };
    const formatTime = (time)=>{
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor(time % 3600 / 60);
        const seconds = Math.floor(time % 60);
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };
    // Show error if no valid URL
    if (!hasValidUrl) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "aspect-video bg-black rounded-2xl flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center space-y-4 p-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$film$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Film$3e$__["Film"], {
                        className: "h-16 w-16 mx-auto text-muted-foreground"
                    }, void 0, false, {
                        fileName: "[project]/src/app/dashboard/movies/[id]/movie-player.tsx",
                        lineNumber: 572,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "text-xl font-bold text-white",
                        children: "Brak źródła wideo"
                    }, void 0, false, {
                        fileName: "[project]/src/app/dashboard/movies/[id]/movie-player.tsx",
                        lineNumber: 573,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-muted-foreground",
                        children: "Ten film nie ma przypisanego adresu URL."
                    }, void 0, false, {
                        fileName: "[project]/src/app/dashboard/movies/[id]/movie-player.tsx",
                        lineNumber: 574,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/dashboard/movies/[id]/movie-player.tsx",
                lineNumber: 571,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/dashboard/movies/[id]/movie-player.tsx",
            lineNumber: 570,
            columnNumber: 7
        }, this);
    }
    // Show error state
    if (error) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "aspect-video bg-black rounded-2xl flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center space-y-4 p-8 max-w-md",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                        className: "h-16 w-16 mx-auto text-red-500"
                    }, void 0, false, {
                        fileName: "[project]/src/app/dashboard/movies/[id]/movie-player.tsx",
                        lineNumber: 585,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "text-xl font-bold text-white",
                        children: error.message
                    }, void 0, false, {
                        fileName: "[project]/src/app/dashboard/movies/[id]/movie-player.tsx",
                        lineNumber: 586,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-muted-foreground text-sm",
                        children: error.details
                    }, void 0, false, {
                        fileName: "[project]/src/app/dashboard/movies/[id]/movie-player.tsx",
                        lineNumber: 587,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "pt-4 space-y-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                onClick: handleRetry,
                                className: "w-full gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                        className: "h-4 w-4"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/movies/[id]/movie-player.tsx",
                                        lineNumber: 593,
                                        columnNumber: 15
                                    }, this),
                                    "Spróbuj ponownie"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/dashboard/movies/[id]/movie-player.tsx",
                                lineNumber: 589,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-muted-foreground",
                                children: [
                                    "URL: ",
                                    videoUrl?.substring(0, 50),
                                    "..."
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/dashboard/movies/[id]/movie-player.tsx",
                                lineNumber: 596,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/dashboard/movies/[id]/movie-player.tsx",
                        lineNumber: 588,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/dashboard/movies/[id]/movie-player.tsx",
                lineNumber: 584,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/dashboard/movies/[id]/movie-player.tsx",
            lineNumber: 583,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: containerRef,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("relative aspect-video bg-black rounded-2xl overflow-hidden group", showControls && "cursor-auto"),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("video", {
                ref: videoRef,
                className: "w-full h-full object-contain",
                playsInline: true,
                onClick: togglePlay,
                suppressHydrationWarning: true
            }, void 0, false, {
                fileName: "[project]/src/app/dashboard/movies/[id]/movie-player.tsx",
                lineNumber: 613,
                columnNumber: 7
            }, this),
            isLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 flex items-center justify-center bg-black/50",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                    className: "h-12 w-12 animate-spin text-primary"
                }, void 0, false, {
                    fileName: "[project]/src/app/dashboard/movies/[id]/movie-player.tsx",
                    lineNumber: 624,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/dashboard/movies/[id]/movie-player.tsx",
                lineNumber: 623,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300", showControls ? "opacity-100" : "opacity-0"),
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: togglePlay,
                        className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-16 w-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center transition-transform hover:scale-110",
                        children: isPlaying ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pause$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Pause$3e$__["Pause"], {
                            className: "h-8 w-8 text-white"
                        }, void 0, false, {
                            fileName: "[project]/src/app/dashboard/movies/[id]/movie-player.tsx",
                            lineNumber: 641,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__["Play"], {
                            className: "h-8 w-8 text-white ml-1"
                        }, void 0, false, {
                            fileName: "[project]/src/app/dashboard/movies/[id]/movie-player.tsx",
                            lineNumber: 643,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/dashboard/movies/[id]/movie-player.tsx",
                        lineNumber: 636,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute bottom-0 left-0 right-0 p-4 space-y-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm text-white min-w-[50px]",
                                        children: formatTime(currentTime)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/movies/[id]/movie-player.tsx",
                                        lineNumber: 651,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$slider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Slider"], {
                                        value: [
                                            duration > 0 ? currentTime / duration * 100 : 0
                                        ],
                                        onValueChange: handleSeek,
                                        max: 100,
                                        step: 0.1,
                                        className: "flex-1 cursor-pointer"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/movies/[id]/movie-player.tsx",
                                        lineNumber: 654,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm text-white min-w-[50px] text-right",
                                        children: formatTime(duration)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/movies/[id]/movie-player.tsx",
                                        lineNumber: 661,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/dashboard/movies/[id]/movie-player.tsx",
                                lineNumber: 650,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                variant: "ghost",
                                                size: "icon",
                                                className: "h-10 w-10 text-white hover:bg-white/20",
                                                onClick: ()=>skip(-10),
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$skip$2d$back$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__SkipBack$3e$__["SkipBack"], {
                                                    className: "h-5 w-5"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/dashboard/movies/[id]/movie-player.tsx",
                                                    lineNumber: 675,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/dashboard/movies/[id]/movie-player.tsx",
                                                lineNumber: 669,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                variant: "ghost",
                                                size: "icon",
                                                className: "h-10 w-10 text-white hover:bg-white/20",
                                                onClick: togglePlay,
                                                children: isPlaying ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pause$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Pause$3e$__["Pause"], {
                                                    className: "h-5 w-5"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/dashboard/movies/[id]/movie-player.tsx",
                                                    lineNumber: 684,
                                                    columnNumber: 30
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__["Play"], {
                                                    className: "h-5 w-5"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/dashboard/movies/[id]/movie-player.tsx",
                                                    lineNumber: 684,
                                                    columnNumber: 62
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/dashboard/movies/[id]/movie-player.tsx",
                                                lineNumber: 678,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                variant: "ghost",
                                                size: "icon",
                                                className: "h-10 w-10 text-white hover:bg-white/20",
                                                onClick: ()=>skip(10),
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$skip$2d$forward$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__SkipForward$3e$__["SkipForward"], {
                                                    className: "h-5 w-5"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/dashboard/movies/[id]/movie-player.tsx",
                                                    lineNumber: 693,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/dashboard/movies/[id]/movie-player.tsx",
                                                lineNumber: 687,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-1 ml-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                        variant: "ghost",
                                                        size: "icon",
                                                        className: "h-10 w-10 text-white hover:bg-white/20",
                                                        onClick: toggleMute,
                                                        children: isMuted ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$volume$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__VolumeX$3e$__["VolumeX"], {
                                                            className: "h-5 w-5"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/dashboard/movies/[id]/movie-player.tsx",
                                                            lineNumber: 703,
                                                            columnNumber: 30
                                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$volume$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Volume2$3e$__["Volume2"], {
                                                            className: "h-5 w-5"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/dashboard/movies/[id]/movie-player.tsx",
                                                            lineNumber: 703,
                                                            columnNumber: 64
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/dashboard/movies/[id]/movie-player.tsx",
                                                        lineNumber: 697,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$slider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Slider"], {
                                                        value: [
                                                            isMuted ? 0 : volume * 100
                                                        ],
                                                        onValueChange: handleVolumeChange,
                                                        max: 100,
                                                        step: 1,
                                                        className: "w-24 cursor-pointer"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/dashboard/movies/[id]/movie-player.tsx",
                                                        lineNumber: 705,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/dashboard/movies/[id]/movie-player.tsx",
                                                lineNumber: 696,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/dashboard/movies/[id]/movie-player.tsx",
                                        lineNumber: 668,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-sm text-white/60",
                                                children: movie.title
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/dashboard/movies/[id]/movie-player.tsx",
                                                lineNumber: 716,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                variant: "ghost",
                                                size: "icon",
                                                className: "h-10 w-10 text-white hover:bg-white/20",
                                                onClick: toggleFullscreen,
                                                children: isFullscreen ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$minimize$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Minimize$3e$__["Minimize"], {
                                                    className: "h-5 w-5"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/dashboard/movies/[id]/movie-player.tsx",
                                                    lineNumber: 723,
                                                    columnNumber: 33
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$maximize$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Maximize$3e$__["Maximize"], {
                                                    className: "h-5 w-5"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/dashboard/movies/[id]/movie-player.tsx",
                                                    lineNumber: 723,
                                                    columnNumber: 68
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/dashboard/movies/[id]/movie-player.tsx",
                                                lineNumber: 717,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/dashboard/movies/[id]/movie-player.tsx",
                                        lineNumber: 715,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/dashboard/movies/[id]/movie-player.tsx",
                                lineNumber: 667,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/dashboard/movies/[id]/movie-player.tsx",
                        lineNumber: 648,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/dashboard/movies/[id]/movie-player.tsx",
                lineNumber: 629,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/dashboard/movies/[id]/movie-player.tsx",
        lineNumber: 606,
        columnNumber: 5
    }, this);
}
_s(MoviePlayer, "a08NVQVufA/+pzOZgF1i93rBEVc=");
_c = MoviePlayer;
var _c;
__turbopack_context__.k.register(_c, "MoviePlayer");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_eb837af0._.js.map