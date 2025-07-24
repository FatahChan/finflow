import { jsx, jsxs } from 'react/jsx-runtime';
import { createRootRoute, createFileRoute, lazyRouteComponent, Outlet, HeadContent, Scripts, RouterProvider, createRouter } from '@tanstack/react-router';
import { defineHandlerCallback, renderRouterToStream } from '@tanstack/react-router/ssr/server';
import { AsyncLocalStorage } from 'node:async_hooks';
import nodeCrypto from 'node:crypto';
import * as fs from 'node:fs';

function StartServer(props) {
	return /* @__PURE__ */ jsx(RouterProvider, { router: props.router });
}
const defaultStreamHandler = defineHandlerCallback(({ request, router, responseHeaders }) => renderRouterToStream({
	request,
	router,
	responseHeaders,
	children: /* @__PURE__ */ jsx(StartServer, { router })
}));
const stateIndexKey = "__TSR_index";
function createHistory(opts) {
	let location = opts.getLocation();
	const subscribers = /* @__PURE__ */ new Set();
	const notify = (action) => {
		location = opts.getLocation();
		subscribers.forEach((subscriber) => subscriber({
			location,
			action
		}));
	};
	const handleIndexChange = (action) => {
		if (opts.notifyOnIndexChange ?? true) notify(action);
		else location = opts.getLocation();
	};
	const tryNavigation = async ({ task, navigateOpts,...actionInfo }) => {
		var _a, _b;
		const ignoreBlocker = (navigateOpts == null ? void 0 : navigateOpts.ignoreBlocker) ?? false;
		if (ignoreBlocker) {
			task();
			return;
		}
		const blockers = ((_a = opts.getBlockers) == null ? void 0 : _a.call(opts)) ?? [];
		const isPushOrReplace = actionInfo.type === "PUSH" || actionInfo.type === "REPLACE";
		if (typeof document !== "undefined" && blockers.length && isPushOrReplace) for (const blocker of blockers) {
			const nextLocation = parseHref(actionInfo.path, actionInfo.state);
			const isBlocked = await blocker.blockerFn({
				currentLocation: location,
				nextLocation,
				action: actionInfo.type
			});
			if (isBlocked) {
				(_b = opts.onBlocked) == null || _b.call(opts);
				return;
			}
		}
		task();
	};
	return {
		get location() {
			return location;
		},
		get length() {
			return opts.getLength();
		},
		subscribers,
		subscribe: (cb) => {
			subscribers.add(cb);
			return () => {
				subscribers.delete(cb);
			};
		},
		push: (path, state, navigateOpts) => {
			const currentIndex = location.state[stateIndexKey];
			state = assignKeyAndIndex(currentIndex + 1, state);
			tryNavigation({
				task: () => {
					opts.pushState(path, state);
					notify({ type: "PUSH" });
				},
				navigateOpts,
				type: "PUSH",
				path,
				state
			});
		},
		replace: (path, state, navigateOpts) => {
			const currentIndex = location.state[stateIndexKey];
			state = assignKeyAndIndex(currentIndex, state);
			tryNavigation({
				task: () => {
					opts.replaceState(path, state);
					notify({ type: "REPLACE" });
				},
				navigateOpts,
				type: "REPLACE",
				path,
				state
			});
		},
		go: (index, navigateOpts) => {
			tryNavigation({
				task: () => {
					opts.go(index);
					handleIndexChange({
						type: "GO",
						index
					});
				},
				navigateOpts,
				type: "GO"
			});
		},
		back: (navigateOpts) => {
			tryNavigation({
				task: () => {
					opts.back((navigateOpts == null ? void 0 : navigateOpts.ignoreBlocker) ?? false);
					handleIndexChange({ type: "BACK" });
				},
				navigateOpts,
				type: "BACK"
			});
		},
		forward: (navigateOpts) => {
			tryNavigation({
				task: () => {
					opts.forward((navigateOpts == null ? void 0 : navigateOpts.ignoreBlocker) ?? false);
					handleIndexChange({ type: "FORWARD" });
				},
				navigateOpts,
				type: "FORWARD"
			});
		},
		canGoBack: () => location.state[stateIndexKey] !== 0,
		createHref: (str) => opts.createHref(str),
		block: (blocker) => {
			var _a;
			if (!opts.setBlockers) return () => {};
			const blockers = ((_a = opts.getBlockers) == null ? void 0 : _a.call(opts)) ?? [];
			opts.setBlockers([...blockers, blocker]);
			return () => {
				var _a2, _b;
				const blockers2 = ((_a2 = opts.getBlockers) == null ? void 0 : _a2.call(opts)) ?? [];
				(_b = opts.setBlockers) == null || _b.call(opts, blockers2.filter((b) => b !== blocker));
			};
		},
		flush: () => {
			var _a;
			return (_a = opts.flush) == null ? void 0 : _a.call(opts);
		},
		destroy: () => {
			var _a;
			return (_a = opts.destroy) == null ? void 0 : _a.call(opts);
		},
		notify
	};
}
function assignKeyAndIndex(index, state) {
	if (!state) state = {};
	const key = createRandomKey();
	return {
		...state,
		key,
		__TSR_key: key,
		[stateIndexKey]: index
	};
}
function createMemoryHistory(opts = { initialEntries: ["/"] }) {
	const entries = opts.initialEntries;
	let index = opts.initialIndex ? Math.min(Math.max(opts.initialIndex, 0), entries.length - 1) : entries.length - 1;
	const states = entries.map((_entry, index2) => assignKeyAndIndex(index2, void 0));
	const getLocation = () => parseHref(entries[index], states[index]);
	return createHistory({
		getLocation,
		getLength: () => entries.length,
		pushState: (path, state) => {
			if (index < entries.length - 1) {
				entries.splice(index + 1);
				states.splice(index + 1);
			}
			states.push(state);
			entries.push(path);
			index = Math.max(entries.length - 1, 0);
		},
		replaceState: (path, state) => {
			states[index] = state;
			entries[index] = path;
		},
		back: () => {
			index = Math.max(index - 1, 0);
		},
		forward: () => {
			index = Math.min(index + 1, entries.length - 1);
		},
		go: (n) => {
			index = Math.min(Math.max(index + n, 0), entries.length - 1);
		},
		createHref: (path) => path
	});
}
function parseHref(href, state) {
	const hashIndex = href.indexOf("#");
	const searchIndex = href.indexOf("?");
	const addedKey = createRandomKey();
	return {
		href,
		pathname: href.substring(0, hashIndex > 0 ? searchIndex > 0 ? Math.min(hashIndex, searchIndex) : hashIndex : searchIndex > 0 ? searchIndex : href.length),
		hash: hashIndex > -1 ? href.substring(hashIndex) : "",
		search: searchIndex > -1 ? href.slice(searchIndex, hashIndex === -1 ? void 0 : hashIndex) : "",
		state: state || {
			[stateIndexKey]: 0,
			key: addedKey,
			__TSR_key: addedKey
		}
	};
}
function createRandomKey() {
	return (Math.random() + 1).toString(36).substring(7);
}
function splitSetCookieString(cookiesString) {
	if (Array.isArray(cookiesString)) return cookiesString.flatMap((c$1) => splitSetCookieString(c$1));
	if (typeof cookiesString !== "string") return [];
	const cookiesStrings = [];
	let pos = 0;
	let start;
	let ch;
	let lastComma;
	let nextStart;
	let cookiesSeparatorFound;
	const skipWhitespace = () => {
		while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))) pos += 1;
		return pos < cookiesString.length;
	};
	const notSpecialChar = () => {
		ch = cookiesString.charAt(pos);
		return ch !== "=" && ch !== ";" && ch !== ",";
	};
	while (pos < cookiesString.length) {
		start = pos;
		cookiesSeparatorFound = false;
		while (skipWhitespace()) {
			ch = cookiesString.charAt(pos);
			if (ch === ",") {
				lastComma = pos;
				pos += 1;
				skipWhitespace();
				nextStart = pos;
				while (pos < cookiesString.length && notSpecialChar()) pos += 1;
				if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
					cookiesSeparatorFound = true;
					pos = nextStart;
					cookiesStrings.push(cookiesString.slice(start, lastComma));
					start = pos;
				} else pos = lastComma + 1;
			} else pos += 1;
		}
		if (!cookiesSeparatorFound || pos >= cookiesString.length) cookiesStrings.push(cookiesString.slice(start, cookiesString.length));
	}
	return cookiesStrings;
}
function toHeadersInstance(init) {
	if (init instanceof Headers) return new Headers(init);
	else if (Array.isArray(init)) return new Headers(init);
	else if (typeof init === "object") return new Headers(init);
	else return new Headers();
}
function mergeHeaders(...headers) {
	return headers.reduce((acc, header) => {
		const headersInstance = toHeadersInstance(header);
		for (const [key, value] of headersInstance.entries()) if (key === "set-cookie") {
			const splitCookies = splitSetCookieString(value);
			splitCookies.forEach((cookie) => acc.append("set-cookie", cookie));
		} else acc.set(key, value);
		return acc;
	}, new Headers());
}
function json(payload, init) {
	return new Response(JSON.stringify(payload), {
		...init,
		headers: mergeHeaders({ "content-type": "application/json" }, init == null ? void 0 : init.headers)
	});
}
var prefix = "Invariant failed";
function invariant(condition, message) {
	if (condition) return;
	throw new Error(prefix);
}
function isPlainObject$1(o$1) {
	if (!hasObjectPrototype(o$1)) return false;
	const ctor = o$1.constructor;
	if (typeof ctor === "undefined") return true;
	const prot = ctor.prototype;
	if (!hasObjectPrototype(prot)) return false;
	if (!prot.hasOwnProperty("isPrototypeOf")) return false;
	return true;
}
function hasObjectPrototype(o$1) {
	return Object.prototype.toString.call(o$1) === "[object Object]";
}
function createControlledPromise(onResolve) {
	let resolveLoadPromise;
	let rejectLoadPromise;
	const controlledPromise = new Promise((resolve, reject) => {
		resolveLoadPromise = resolve;
		rejectLoadPromise = reject;
	});
	controlledPromise.status = "pending";
	controlledPromise.resolve = (value) => {
		controlledPromise.status = "resolved";
		controlledPromise.value = value;
		resolveLoadPromise(value);
	};
	controlledPromise.reject = (e) => {
		controlledPromise.status = "rejected";
		rejectLoadPromise(e);
	};
	return controlledPromise;
}
const SEGMENT_TYPE_PATHNAME = 0;
const SEGMENT_TYPE_PARAM = 1;
const SEGMENT_TYPE_WILDCARD = 2;
const SEGMENT_TYPE_OPTIONAL_PARAM = 3;
function joinPaths(paths) {
	return cleanPath(paths.filter((val) => {
		return val !== void 0;
	}).join("/"));
}
function cleanPath(path) {
	return path.replace(/\/{2,}/g, "/");
}
function trimPathLeft(path) {
	return path === "/" ? path : path.replace(/^\/{1,}/, "");
}
function trimPathRight(path) {
	return path === "/" ? path : path.replace(/\/{1,}$/, "");
}
function trimPath(path) {
	return trimPathRight(trimPathLeft(path));
}
const parsePathname = (pathname, cache) => {
	if (!pathname) return [];
	const cached = cache == null ? void 0 : cache.get(pathname);
	if (cached) return cached;
	const parsed = baseParsePathname(pathname);
	cache?.set(pathname, parsed);
	return parsed;
};
const PARAM_RE = /^\$.{1,}$/;
const PARAM_W_CURLY_BRACES_RE = /^(.*?)\{(\$[a-zA-Z_$][a-zA-Z0-9_$]*)\}(.*)$/;
const OPTIONAL_PARAM_W_CURLY_BRACES_RE = /^(.*?)\{-(\$[a-zA-Z_$][a-zA-Z0-9_$]*)\}(.*)$/;
const WILDCARD_RE = /^\$$/;
const WILDCARD_W_CURLY_BRACES_RE = /^(.*?)\{\$\}(.*)$/;
function baseParsePathname(pathname) {
	pathname = cleanPath(pathname);
	const segments = [];
	if (pathname.slice(0, 1) === "/") {
		pathname = pathname.substring(1);
		segments.push({
			type: SEGMENT_TYPE_PATHNAME,
			value: "/"
		});
	}
	if (!pathname) return segments;
	const split = pathname.split("/").filter(Boolean);
	segments.push(...split.map((part) => {
		const wildcardBracesMatch = part.match(WILDCARD_W_CURLY_BRACES_RE);
		if (wildcardBracesMatch) {
			const prefix$1 = wildcardBracesMatch[1];
			const suffix = wildcardBracesMatch[2];
			return {
				type: SEGMENT_TYPE_WILDCARD,
				value: "$",
				prefixSegment: prefix$1 || void 0,
				suffixSegment: suffix || void 0
			};
		}
		const optionalParamBracesMatch = part.match(OPTIONAL_PARAM_W_CURLY_BRACES_RE);
		if (optionalParamBracesMatch) {
			const prefix$1 = optionalParamBracesMatch[1];
			const paramName = optionalParamBracesMatch[2];
			const suffix = optionalParamBracesMatch[3];
			return {
				type: SEGMENT_TYPE_OPTIONAL_PARAM,
				value: paramName,
				prefixSegment: prefix$1 || void 0,
				suffixSegment: suffix || void 0
			};
		}
		const paramBracesMatch = part.match(PARAM_W_CURLY_BRACES_RE);
		if (paramBracesMatch) {
			const prefix$1 = paramBracesMatch[1];
			const paramName = paramBracesMatch[2];
			const suffix = paramBracesMatch[3];
			return {
				type: SEGMENT_TYPE_PARAM,
				value: "" + paramName,
				prefixSegment: prefix$1 || void 0,
				suffixSegment: suffix || void 0
			};
		}
		if (PARAM_RE.test(part)) {
			const paramName = part.substring(1);
			return {
				type: SEGMENT_TYPE_PARAM,
				value: "$" + paramName,
				prefixSegment: void 0,
				suffixSegment: void 0
			};
		}
		if (WILDCARD_RE.test(part)) return {
			type: SEGMENT_TYPE_WILDCARD,
			value: "$",
			prefixSegment: void 0,
			suffixSegment: void 0
		};
		return {
			type: SEGMENT_TYPE_PATHNAME,
			value: part.includes("%25") ? part.split("%25").map((segment) => decodeURI(segment)).join("%25") : decodeURI(part)
		};
	}));
	if (pathname.slice(-1) === "/") {
		pathname = pathname.substring(1);
		segments.push({
			type: SEGMENT_TYPE_PATHNAME,
			value: "/"
		});
	}
	return segments;
}
function matchPathname(basepath, currentPathname, matchLocation, parseCache) {
	const pathParams = matchByPath(basepath, currentPathname, matchLocation, parseCache);
	if (matchLocation.to && !pathParams) return;
	return pathParams ?? {};
}
function removeBasepath(basepath, pathname, caseSensitive = false) {
	const normalizedBasepath = caseSensitive ? basepath : basepath.toLowerCase();
	const normalizedPathname = caseSensitive ? pathname : pathname.toLowerCase();
	switch (true) {
		case normalizedBasepath === "/": return pathname;
		case normalizedPathname === normalizedBasepath: return "";
		case pathname.length < basepath.length: return pathname;
		case normalizedPathname[normalizedBasepath.length] !== "/": return pathname;
		case normalizedPathname.startsWith(normalizedBasepath): return pathname.slice(basepath.length);
		default: return pathname;
	}
}
function matchByPath(basepath, from, { to, fuzzy, caseSensitive }, parseCache) {
	if (basepath !== "/" && !from.startsWith(basepath)) return void 0;
	from = removeBasepath(basepath, from, caseSensitive);
	to = removeBasepath(basepath, `${to ?? "$"}`, caseSensitive);
	const baseSegments = parsePathname(from.startsWith("/") ? from : `/${from}`, parseCache);
	const routeSegments = parsePathname(to.startsWith("/") ? to : `/${to}`, parseCache);
	const params = {};
	const result = isMatch(baseSegments, routeSegments, params, fuzzy, caseSensitive);
	return result ? params : void 0;
}
function isMatch(baseSegments, routeSegments, params, fuzzy, caseSensitive) {
	var _a, _b, _c;
	let baseIndex = 0;
	let routeIndex = 0;
	while (baseIndex < baseSegments.length || routeIndex < routeSegments.length) {
		const baseSegment = baseSegments[baseIndex];
		const routeSegment = routeSegments[routeIndex];
		if (routeSegment) {
			if (routeSegment.type === SEGMENT_TYPE_WILDCARD) {
				const remainingBaseSegments = baseSegments.slice(baseIndex);
				let _splat;
				if (routeSegment.prefixSegment || routeSegment.suffixSegment) {
					if (!baseSegment) return false;
					const prefix$1 = routeSegment.prefixSegment || "";
					const suffix = routeSegment.suffixSegment || "";
					const baseValue = baseSegment.value;
					if ("prefixSegment" in routeSegment) {
						if (!baseValue.startsWith(prefix$1)) return false;
					}
					if ("suffixSegment" in routeSegment) {
						if (!((_a = baseSegments[baseSegments.length - 1]) == null ? void 0 : _a.value.endsWith(suffix))) return false;
					}
					let rejoinedSplat = decodeURI(joinPaths(remainingBaseSegments.map((d$1) => d$1.value)));
					if (prefix$1 && rejoinedSplat.startsWith(prefix$1)) rejoinedSplat = rejoinedSplat.slice(prefix$1.length);
					if (suffix && rejoinedSplat.endsWith(suffix)) rejoinedSplat = rejoinedSplat.slice(0, rejoinedSplat.length - suffix.length);
					_splat = rejoinedSplat;
				} else _splat = decodeURI(joinPaths(remainingBaseSegments.map((d$1) => d$1.value)));
				params["*"] = _splat;
				params["_splat"] = _splat;
				return true;
			}
			if (routeSegment.type === SEGMENT_TYPE_PATHNAME) {
				if (routeSegment.value === "/" && !(baseSegment == null ? void 0 : baseSegment.value)) {
					routeIndex++;
					continue;
				}
				if (baseSegment) {
					if (caseSensitive) {
						if (routeSegment.value !== baseSegment.value) return false;
					} else if (routeSegment.value.toLowerCase() !== baseSegment.value.toLowerCase()) return false;
					baseIndex++;
					routeIndex++;
					continue;
				} else return false;
			}
			if (routeSegment.type === SEGMENT_TYPE_PARAM) {
				if (!baseSegment) return false;
				if (baseSegment.value === "/") return false;
				let _paramValue = "";
				let matched = false;
				if (routeSegment.prefixSegment || routeSegment.suffixSegment) {
					const prefix$1 = routeSegment.prefixSegment || "";
					const suffix = routeSegment.suffixSegment || "";
					const baseValue = baseSegment.value;
					if (prefix$1 && !baseValue.startsWith(prefix$1)) return false;
					if (suffix && !baseValue.endsWith(suffix)) return false;
					let paramValue = baseValue;
					if (prefix$1 && paramValue.startsWith(prefix$1)) paramValue = paramValue.slice(prefix$1.length);
					if (suffix && paramValue.endsWith(suffix)) paramValue = paramValue.slice(0, paramValue.length - suffix.length);
					_paramValue = decodeURIComponent(paramValue);
					matched = true;
				} else {
					_paramValue = decodeURIComponent(baseSegment.value);
					matched = true;
				}
				if (matched) {
					params[routeSegment.value.substring(1)] = _paramValue;
					baseIndex++;
				}
				routeIndex++;
				continue;
			}
			if (routeSegment.type === SEGMENT_TYPE_OPTIONAL_PARAM) {
				if (!baseSegment) {
					routeIndex++;
					continue;
				}
				if (baseSegment.value === "/") {
					routeIndex++;
					continue;
				}
				let _paramValue = "";
				let matched = false;
				if (routeSegment.prefixSegment || routeSegment.suffixSegment) {
					const prefix$1 = routeSegment.prefixSegment || "";
					const suffix = routeSegment.suffixSegment || "";
					const baseValue = baseSegment.value;
					if ((!prefix$1 || baseValue.startsWith(prefix$1)) && (!suffix || baseValue.endsWith(suffix))) {
						let paramValue = baseValue;
						if (prefix$1 && paramValue.startsWith(prefix$1)) paramValue = paramValue.slice(prefix$1.length);
						if (suffix && paramValue.endsWith(suffix)) paramValue = paramValue.slice(0, paramValue.length - suffix.length);
						_paramValue = decodeURIComponent(paramValue);
						matched = true;
					}
				} else {
					let shouldMatchOptional = true;
					for (let lookAhead = routeIndex + 1; lookAhead < routeSegments.length; lookAhead++) {
						const futureRouteSegment = routeSegments[lookAhead];
						if ((futureRouteSegment == null ? void 0 : futureRouteSegment.type) === SEGMENT_TYPE_PATHNAME && futureRouteSegment.value === baseSegment.value) {
							shouldMatchOptional = false;
							break;
						}
						if ((futureRouteSegment == null ? void 0 : futureRouteSegment.type) === SEGMENT_TYPE_PARAM || (futureRouteSegment == null ? void 0 : futureRouteSegment.type) === SEGMENT_TYPE_WILDCARD) break;
					}
					if (shouldMatchOptional) {
						_paramValue = decodeURIComponent(baseSegment.value);
						matched = true;
					}
				}
				if (matched) {
					params[routeSegment.value.substring(1)] = _paramValue;
					baseIndex++;
				}
				routeIndex++;
				continue;
			}
		}
		if (baseIndex < baseSegments.length && routeIndex >= routeSegments.length) {
			params["**"] = joinPaths(baseSegments.slice(baseIndex).map((d$1) => d$1.value));
			return ((_b = routeSegments[routeSegments.length - 1]) == null ? void 0 : _b.value) !== "/";
		}
		if (routeIndex < routeSegments.length && baseIndex >= baseSegments.length) {
			for (let i$1 = routeIndex; i$1 < routeSegments.length; i$1++) if (((_c = routeSegments[i$1]) == null ? void 0 : _c.type) !== SEGMENT_TYPE_OPTIONAL_PARAM) return false;
			break;
		}
		break;
	}
	return true;
}
function isNotFound(obj) {
	return !!(obj == null ? void 0 : obj.isNotFound);
}
const rootRouteId = "__root__";
function isRedirect(obj) {
	return obj instanceof Response && !!obj.options;
}
function isResolvedRedirect(obj) {
	return isRedirect(obj) && !!obj.options.href;
}
const REQUIRED_PARAM_BASE_SCORE = .5;
const OPTIONAL_PARAM_BASE_SCORE = .4;
const WILDCARD_PARAM_BASE_SCORE = .25;
function handleParam(segment, baseScore) {
	if (segment.prefixSegment && segment.suffixSegment) return baseScore + .05;
	if (segment.prefixSegment) return baseScore + .02;
	if (segment.suffixSegment) return baseScore + .01;
	return baseScore;
}
function processRouteTree({ routeTree: routeTree$1, initRoute }) {
	const routesById = {};
	const routesByPath = {};
	const recurseRoutes = (childRoutes) => {
		childRoutes.forEach((childRoute, i$1) => {
			initRoute?.(childRoute, i$1);
			const existingRoute = routesById[childRoute.id];
			invariant(!existingRoute, `Duplicate routes found with id: ${String(childRoute.id)}`);
			routesById[childRoute.id] = childRoute;
			if (!childRoute.isRoot && childRoute.path) {
				const trimmedFullPath = trimPathRight(childRoute.fullPath);
				if (!routesByPath[trimmedFullPath] || childRoute.fullPath.endsWith("/")) routesByPath[trimmedFullPath] = childRoute;
			}
			const children = childRoute.children;
			if (children == null ? void 0 : children.length) recurseRoutes(children);
		});
	};
	recurseRoutes([routeTree$1]);
	const scoredRoutes = [];
	const routes = Object.values(routesById);
	routes.forEach((d$1, i$1) => {
		var _a;
		if (d$1.isRoot || !d$1.path) return;
		const trimmed = trimPathLeft(d$1.fullPath);
		let parsed = parsePathname(trimmed);
		let skip = 0;
		while (parsed.length > skip + 1 && ((_a = parsed[skip]) == null ? void 0 : _a.value) === "/") skip++;
		if (skip > 0) parsed = parsed.slice(skip);
		let optionalParamCount = 0;
		let hasStaticAfter = false;
		const scores = parsed.map((segment, index) => {
			if (segment.value === "/") return .75;
			let baseScore = void 0;
			if (segment.type === SEGMENT_TYPE_PARAM) baseScore = REQUIRED_PARAM_BASE_SCORE;
			else if (segment.type === SEGMENT_TYPE_OPTIONAL_PARAM) {
				baseScore = OPTIONAL_PARAM_BASE_SCORE;
				optionalParamCount++;
			} else if (segment.type === SEGMENT_TYPE_WILDCARD) baseScore = WILDCARD_PARAM_BASE_SCORE;
			if (baseScore) {
				for (let i2 = index + 1; i2 < parsed.length; i2++) {
					const nextSegment = parsed[i2];
					if (nextSegment.type === SEGMENT_TYPE_PATHNAME && nextSegment.value !== "/") {
						hasStaticAfter = true;
						return handleParam(segment, baseScore + .2);
					}
				}
				return handleParam(segment, baseScore);
			}
			return 1;
		});
		scoredRoutes.push({
			child: d$1,
			trimmed,
			parsed,
			index: i$1,
			scores,
			optionalParamCount,
			hasStaticAfter
		});
	});
	const flatRoutes = scoredRoutes.sort((a, b) => {
		const minLength = Math.min(a.scores.length, b.scores.length);
		for (let i$1 = 0; i$1 < minLength; i$1++) if (a.scores[i$1] !== b.scores[i$1]) return b.scores[i$1] - a.scores[i$1];
		if (a.scores.length !== b.scores.length) {
			if (a.optionalParamCount !== b.optionalParamCount) {
				if (a.hasStaticAfter === b.hasStaticAfter) return a.optionalParamCount - b.optionalParamCount;
				else if (a.hasStaticAfter && !b.hasStaticAfter) return -1;
				else if (!a.hasStaticAfter && b.hasStaticAfter) return 1;
			}
			return b.scores.length - a.scores.length;
		}
		for (let i$1 = 0; i$1 < minLength; i$1++) if (a.parsed[i$1].value !== b.parsed[i$1].value) return a.parsed[i$1].value > b.parsed[i$1].value ? 1 : -1;
		return a.index - b.index;
	}).map((d$1, i$1) => {
		d$1.child.rank = i$1;
		return d$1.child;
	});
	return {
		routesById,
		routesByPath,
		flatRoutes
	};
}
function getMatchedRoutes({ pathname, routePathname, basepath, caseSensitive, routesByPath, routesById, flatRoutes, parseCache }) {
	let routeParams = {};
	const trimmedPath = trimPathRight(pathname);
	const getMatchedParams = (route) => {
		var _a;
		const result = matchPathname(basepath, trimmedPath, {
			to: route.fullPath,
			caseSensitive: ((_a = route.options) == null ? void 0 : _a.caseSensitive) ?? caseSensitive,
			fuzzy: true
		}, parseCache);
		return result;
	};
	let foundRoute = routePathname !== void 0 ? routesByPath[routePathname] : void 0;
	if (foundRoute) routeParams = getMatchedParams(foundRoute);
	else {
		let fuzzyMatch = void 0;
		for (const route of flatRoutes) {
			const matchedParams = getMatchedParams(route);
			if (matchedParams) if (route.path !== "/" && matchedParams["**"]) {
				if (!fuzzyMatch) fuzzyMatch = {
					foundRoute: route,
					routeParams: matchedParams
				};
			} else {
				foundRoute = route;
				routeParams = matchedParams;
				break;
			}
		}
		if (!foundRoute && fuzzyMatch) {
			foundRoute = fuzzyMatch.foundRoute;
			routeParams = fuzzyMatch.routeParams;
		}
	}
	let routeCursor = foundRoute || routesById[rootRouteId];
	const matchedRoutes = [routeCursor];
	while (routeCursor.parentRoute) {
		routeCursor = routeCursor.parentRoute;
		matchedRoutes.push(routeCursor);
	}
	matchedRoutes.reverse();
	return {
		matchedRoutes,
		routeParams,
		foundRoute
	};
}
const startSerializer = {
	stringify: (value) => JSON.stringify(value, function replacer(key, val) {
		const ogVal = this[key];
		const serializer = serializers.find((t) => t.stringifyCondition(ogVal));
		if (serializer) return serializer.stringify(ogVal);
		return val;
	}),
	parse: (value) => JSON.parse(value, function parser(key, val) {
		const ogVal = this[key];
		if (isPlainObject$1(ogVal)) {
			const serializer = serializers.find((t) => t.parseCondition(ogVal));
			if (serializer) return serializer.parse(ogVal);
		}
		return val;
	}),
	encode: (value) => {
		if (Array.isArray(value)) return value.map((v$1) => startSerializer.encode(v$1));
		if (isPlainObject$1(value)) return Object.fromEntries(Object.entries(value).map(([key, v$1]) => [key, startSerializer.encode(v$1)]));
		const serializer = serializers.find((t) => t.stringifyCondition(value));
		if (serializer) return serializer.stringify(value);
		return value;
	},
	decode: (value) => {
		if (isPlainObject$1(value)) {
			const serializer = serializers.find((t) => t.parseCondition(value));
			if (serializer) return serializer.parse(value);
		}
		if (Array.isArray(value)) return value.map((v$1) => startSerializer.decode(v$1));
		if (isPlainObject$1(value)) return Object.fromEntries(Object.entries(value).map(([key, v$1]) => [key, startSerializer.decode(v$1)]));
		return value;
	}
};
const createSerializer = (key, check, toValue, fromValue) => ({
	key,
	stringifyCondition: check,
	stringify: (value) => ({ [`$${key}`]: toValue(value) }),
	parseCondition: (value) => Object.hasOwn(value, `$${key}`),
	parse: (value) => fromValue(value[`$${key}`])
});
const serializers = [
	createSerializer("undefined", (v$1) => v$1 === void 0, () => 0, () => void 0),
	createSerializer("date", (v$1) => v$1 instanceof Date, (v$1) => v$1.toISOString(), (v$1) => new Date(v$1)),
	createSerializer("error", (v$1) => v$1 instanceof Error, (v$1) => ({
		...v$1,
		message: v$1.message,
		stack: void 0,
		cause: v$1.cause
	}), (v$1) => Object.assign(new Error(v$1.message), v$1)),
	createSerializer("formData", (v$1) => v$1 instanceof FormData, (v$1) => {
		const entries = {};
		v$1.forEach((value, key) => {
			const entry = entries[key];
			if (entry !== void 0) if (Array.isArray(entry)) entry.push(value);
			else entries[key] = [entry, value];
			else entries[key] = value;
		});
		return entries;
	}, (v$1) => {
		const formData = new FormData();
		Object.entries(v$1).forEach(([key, value]) => {
			if (Array.isArray(value)) value.forEach((val) => formData.append(key, val));
			else formData.append(key, value);
		});
		return formData;
	}),
	createSerializer("bigint", (v$1) => typeof v$1 === "bigint", (v$1) => v$1.toString(), (v$1) => BigInt(v$1))
];
function warning(condition, message) {
}
var tiny_warning_esm_default = warning;
const startStorage = new AsyncLocalStorage();
async function runWithStartContext(context, fn) {
	return startStorage.run(context, fn);
}
function getStartContext(opts) {
	const context = startStorage.getStore();
	if (!context && (opts == null ? void 0 : opts.throwIfNotFound) !== false) throw new Error(`No Start context found in AsyncLocalStorage. Make sure you are using the function within the server runtime.`);
	return context;
}
const globalMiddleware = [];
const getRouterInstance = () => {
	var _a;
	return (_a = getStartContext({ throwIfNotFound: false })) == null ? void 0 : _a.router;
};
function createServerFn(options, __opts) {
	const resolvedOptions = __opts || options || {};
	if (typeof resolvedOptions.method === "undefined") resolvedOptions.method = "GET";
	return {
		options: resolvedOptions,
		middleware: (middleware) => {
			return createServerFn(void 0, Object.assign(resolvedOptions, { middleware }));
		},
		validator: (validator) => {
			return createServerFn(void 0, Object.assign(resolvedOptions, { validator }));
		},
		type: (type) => {
			return createServerFn(void 0, Object.assign(resolvedOptions, { type }));
		},
		handler: (...args) => {
			const [extractedFn, serverFn] = args;
			Object.assign(resolvedOptions, {
				...extractedFn,
				extractedFn,
				serverFn
			});
			const resolvedMiddleware = [...resolvedOptions.middleware || [], serverFnBaseToMiddleware(resolvedOptions)];
			return Object.assign(async (opts) => {
				return executeMiddleware$1(resolvedMiddleware, "client", {
					...extractedFn,
					...resolvedOptions,
					data: opts == null ? void 0 : opts.data,
					headers: opts == null ? void 0 : opts.headers,
					signal: opts == null ? void 0 : opts.signal,
					context: {},
					router: getRouterInstance()
				}).then((d$1) => {
					if (resolvedOptions.response === "full") return d$1;
					if (d$1.error) throw d$1.error;
					return d$1.result;
				});
			}, {
				...extractedFn,
				__executeServer: async (opts_, signal) => {
					const opts = opts_ instanceof FormData ? extractFormDataContext(opts_) : opts_;
					opts.type = typeof resolvedOptions.type === "function" ? resolvedOptions.type(opts) : resolvedOptions.type;
					const ctx = {
						...extractedFn,
						...opts,
						signal
					};
					const run = () => executeMiddleware$1(resolvedMiddleware, "server", ctx).then((d$1) => ({
						result: d$1.result,
						error: d$1.error,
						context: d$1.sendContext
					}));
					if (ctx.type === "static") {
						let response;
						if (serverFnStaticCache == null ? void 0 : serverFnStaticCache.getItem) response = await serverFnStaticCache.getItem(ctx);
						if (!response) {
							response = await run().then((d$1) => {
								return {
									ctx: d$1,
									error: null
								};
							}).catch((e) => {
								return {
									ctx: void 0,
									error: e
								};
							});
							if (serverFnStaticCache == null ? void 0 : serverFnStaticCache.setItem) await serverFnStaticCache.setItem(ctx, response);
						}
						invariant(response);
						if (response.error) throw response.error;
						return response.ctx;
					}
					return run();
				}
			});
		}
	};
}
async function executeMiddleware$1(middlewares, env, opts) {
	const flattenedMiddlewares = flattenMiddlewares([...globalMiddleware, ...middlewares]);
	const next = async (ctx) => {
		const nextMiddleware = flattenedMiddlewares.shift();
		if (!nextMiddleware) return ctx;
		if (nextMiddleware.options.validator && (env === "client" ? nextMiddleware.options.validateClient : true)) ctx.data = await execValidator(nextMiddleware.options.validator, ctx.data);
		const middlewareFn = env === "client" ? nextMiddleware.options.client : nextMiddleware.options.server;
		if (middlewareFn) return applyMiddleware(middlewareFn, ctx, async (newCtx) => {
			return next(newCtx).catch((error) => {
				if (isRedirect(error) || isNotFound(error)) return {
					...newCtx,
					error
				};
				throw error;
			});
		});
		return next(ctx);
	};
	return next({
		...opts,
		headers: opts.headers || {},
		sendContext: opts.sendContext || {},
		context: opts.context || {}
	});
}
let serverFnStaticCache;
function setServerFnStaticCache(cache) {
	const previousCache = serverFnStaticCache;
	serverFnStaticCache = typeof cache === "function" ? cache() : cache;
	return () => {
		serverFnStaticCache = previousCache;
	};
}
function createServerFnStaticCache(serverFnStaticCache2) {
	return serverFnStaticCache2;
}
async function sha1Hash(message) {
	const msgBuffer = new TextEncoder().encode(message);
	const hashBuffer = await crypto.subtle.digest("SHA-1", msgBuffer);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
	return hashHex;
}
setServerFnStaticCache(() => {
	const getStaticCacheUrl = async (options, hash) => {
		const filename = await sha1Hash(`${options.functionId}__${hash}`);
		return `/__tsr/staticServerFnCache/${filename}.json`;
	};
	const jsonToFilenameSafeString = (json$1) => {
		const sortedKeysReplacer = (key, value) => value && typeof value === "object" && !Array.isArray(value) ? Object.keys(value).sort().reduce((acc, curr) => {
			acc[curr] = value[curr];
			return acc;
		}, {}) : value;
		const jsonString = JSON.stringify(json$1 ?? "", sortedKeysReplacer);
		return jsonString.replace(/[/\\?%*:|"<>]/g, "-").replace(/\s+/g, "_");
	};
	const staticClientCache = typeof document !== "undefined" ? /* @__PURE__ */ new Map() : null;
	return createServerFnStaticCache({
		getItem: async (ctx) => {
			if (typeof document === "undefined") {
				const hash = jsonToFilenameSafeString(ctx.data);
				const url = await getStaticCacheUrl(ctx, hash);
				const publicUrl = "/Users/fatahchan/dev/finflow-start/.output/public";
				const { promises: fs$1 } = await import('node:fs');
				const path = await import('node:path');
				const filePath$1 = path.join(publicUrl, url);
				const [cachedResult, readError] = await fs$1.readFile(filePath$1, "utf-8").then((c$1) => [startSerializer.parse(c$1), null]).catch((e) => [null, e]);
				if (readError && readError.code !== "ENOENT") throw readError;
				return cachedResult;
			}
			return void 0;
		},
		setItem: async (ctx, response) => {
			const { promises: fs$1 } = await import('node:fs');
			const path = await import('node:path');
			const hash = jsonToFilenameSafeString(ctx.data);
			const url = await getStaticCacheUrl(ctx, hash);
			const publicUrl = "/Users/fatahchan/dev/finflow-start/.output/public";
			const filePath$1 = path.join(publicUrl, url);
			await fs$1.mkdir(path.dirname(filePath$1), { recursive: true });
			await fs$1.writeFile(filePath$1, startSerializer.stringify(response));
		},
		fetchItem: async (ctx) => {
			const hash = jsonToFilenameSafeString(ctx.data);
			const url = await getStaticCacheUrl(ctx, hash);
			let result = staticClientCache == null ? void 0 : staticClientCache.get(url);
			if (!result) {
				result = await fetch(url, { method: "GET" }).then((r$1) => r$1.text()).then((d$1) => startSerializer.parse(d$1));
				staticClientCache?.set(url, result);
			}
			return result;
		}
	});
});
function extractFormDataContext(formData) {
	const serializedContext = formData.get("__TSR_CONTEXT");
	formData.delete("__TSR_CONTEXT");
	if (typeof serializedContext !== "string") return {
		context: {},
		data: formData
	};
	try {
		const context = startSerializer.parse(serializedContext);
		return {
			context,
			data: formData
		};
	} catch {
		return { data: formData };
	}
}
function flattenMiddlewares(middlewares) {
	const seen = /* @__PURE__ */ new Set();
	const flattened = [];
	const recurse = (middleware) => {
		middleware.forEach((m$2) => {
			if (m$2.options.middleware) recurse(m$2.options.middleware);
			if (!seen.has(m$2)) {
				seen.add(m$2);
				flattened.push(m$2);
			}
		});
	};
	recurse(middlewares);
	return flattened;
}
const applyMiddleware = async (middlewareFn, ctx, nextFn) => {
	return middlewareFn({
		...ctx,
		next: async (userCtx = {}) => {
			return nextFn({
				...ctx,
				...userCtx,
				context: {
					...ctx.context,
					...userCtx.context
				},
				sendContext: {
					...ctx.sendContext,
					...userCtx.sendContext ?? {}
				},
				headers: mergeHeaders(ctx.headers, userCtx.headers),
				result: userCtx.result !== void 0 ? userCtx.result : ctx.response === "raw" ? userCtx : ctx.result,
				error: userCtx.error ?? ctx.error
			});
		}
	});
};
function execValidator(validator, input) {
	if (validator == null) return {};
	if ("~standard" in validator) {
		const result = validator["~standard"].validate(input);
		if (result instanceof Promise) throw new Error("Async validation not supported");
		if (result.issues) throw new Error(JSON.stringify(result.issues, void 0, 2));
		return result.value;
	}
	if ("parse" in validator) return validator.parse(input);
	if (typeof validator === "function") return validator(input);
	throw new Error("Invalid validator type!");
}
function serverFnBaseToMiddleware(options) {
	return {
		_types: void 0,
		options: {
			validator: options.validator,
			validateClient: options.validateClient,
			client: async ({ next, sendContext,...ctx }) => {
				var _a;
				const payload = {
					...ctx,
					context: sendContext,
					type: typeof ctx.type === "function" ? ctx.type(ctx) : ctx.type
				};
				if (ctx.type === "static" && "production" === "production" && typeof document !== "undefined") {
					invariant(serverFnStaticCache);
					const result = await serverFnStaticCache.fetchItem(payload);
					if (result) {
						if (result.error) throw result.error;
						return next(result.ctx);
					}
					tiny_warning_esm_default(result, `No static cache item found for ${payload.functionId}__${JSON.stringify(payload.data)}, falling back to server function...`);
				}
				const res = await ((_a = options.extractedFn) == null ? void 0 : _a.call(options, payload));
				return next(res);
			},
			server: async ({ next,...ctx }) => {
				var _a;
				const result = await ((_a = options.serverFn) == null ? void 0 : _a.call(options, ctx));
				return next({
					...ctx,
					result
				});
			}
		}
	};
}
var R = ((a) => (a[a.AggregateError = 1] = "AggregateError", a[a.ArrowFunction = 2] = "ArrowFunction", a[a.ErrorPrototypeStack = 4] = "ErrorPrototypeStack", a[a.ObjectAssign = 8] = "ObjectAssign", a[a.BigIntTypedArray = 16] = "BigIntTypedArray", a))(R || {});
function Nr(o$1) {
	switch (o$1) {
		case "\"": return "\\\"";
		case "\\": return "\\\\";
		case `
`: return "\\n";
		case "\r": return "\\r";
		case "\b": return "\\b";
		case "	": return "\\t";
		case "\f": return "\\f";
		case "<": return "\\x3C";
		case "\u2028": return "\\u2028";
		case "\u2029": return "\\u2029";
		default: return;
	}
}
function d(o$1) {
	let e = "", r$1 = 0, t;
	for (let n = 0, a = o$1.length; n < a; n++) t = Nr(o$1[n]), t && (e += o$1.slice(r$1, n) + t, r$1 = n + 1);
	return r$1 === 0 ? e = o$1 : e += o$1.slice(r$1), e;
}
var O$1 = "__SEROVAL_REFS__", Q = "$R", ae = `self.${Q}`;
function xr(o$1) {
	return o$1 == null ? `${ae}=${ae}||[]` : `(${ae}=${ae}||{})["${d(o$1)}"]=[]`;
}
function f$1(o$1, e) {
	if (!o$1) throw e;
}
var Be = /* @__PURE__ */ new Map(), C$1 = /* @__PURE__ */ new Map();
function je(o$1) {
	return Be.has(o$1);
}
function Ke(o$1) {
	return f$1(je(o$1), new ie$1(o$1)), Be.get(o$1);
}
typeof globalThis != "undefined" ? Object.defineProperty(globalThis, O$1, {
	value: C$1,
	configurable: true,
	writable: false,
	enumerable: false
}) : typeof self != "undefined" ? Object.defineProperty(self, O$1, {
	value: C$1,
	configurable: true,
	writable: false,
	enumerable: false
}) : typeof global != "undefined" && Object.defineProperty(global, O$1, {
	value: C$1,
	configurable: true,
	writable: false,
	enumerable: false
});
function Hr(o$1) {
	return o$1;
}
function Ye(o$1, e) {
	for (let r$1 = 0, t = e.length; r$1 < t; r$1++) {
		let n = e[r$1];
		o$1.has(n) || (o$1.add(n), n.extends && Ye(o$1, n.extends));
	}
}
function m$1(o$1) {
	if (o$1) {
		let e = /* @__PURE__ */ new Set();
		return Ye(e, o$1), [...e];
	}
}
var $e = {
	0: "Symbol.asyncIterator",
	1: "Symbol.hasInstance",
	2: "Symbol.isConcatSpreadable",
	3: "Symbol.iterator",
	4: "Symbol.match",
	5: "Symbol.matchAll",
	6: "Symbol.replace",
	7: "Symbol.search",
	8: "Symbol.species",
	9: "Symbol.split",
	10: "Symbol.toPrimitive",
	11: "Symbol.toStringTag",
	12: "Symbol.unscopables"
}, ce = {
	[Symbol.asyncIterator]: 0,
	[Symbol.hasInstance]: 1,
	[Symbol.isConcatSpreadable]: 2,
	[Symbol.iterator]: 3,
	[Symbol.match]: 4,
	[Symbol.matchAll]: 5,
	[Symbol.replace]: 6,
	[Symbol.search]: 7,
	[Symbol.species]: 8,
	[Symbol.split]: 9,
	[Symbol.toPrimitive]: 10,
	[Symbol.toStringTag]: 11,
	[Symbol.unscopables]: 12
}, qe = {
	2: "!0",
	3: "!1",
	1: "void 0",
	0: "null",
	4: "-0",
	5: "1/0",
	6: "-1/0",
	7: "0/0"
};
var ue$1 = {
	0: "Error",
	1: "EvalError",
	2: "RangeError",
	3: "ReferenceError",
	4: "SyntaxError",
	5: "TypeError",
	6: "URIError"
}, s$1 = void 0;
function u$1(o$1, e, r$1, t, n, a, i$1, l$1, c$1, p$1, h$1, X$1) {
	return {
		t: o$1,
		i: e,
		s: r$1,
		l: t,
		c: n,
		m: a,
		p: i$1,
		e: l$1,
		a: c$1,
		f: p$1,
		b: h$1,
		o: X$1
	};
}
function x$1(o$1) {
	return u$1(2, s$1, o$1, s$1, s$1, s$1, s$1, s$1, s$1, s$1, s$1, s$1);
}
var I$1 = x$1(2), A$1 = x$1(3), pe$1 = x$1(1), de = x$1(0), Xe = x$1(4), Qe = x$1(5), er = x$1(6), rr = x$1(7);
function me$1(o$1) {
	return o$1 instanceof EvalError ? 1 : o$1 instanceof RangeError ? 2 : o$1 instanceof ReferenceError ? 3 : o$1 instanceof SyntaxError ? 4 : o$1 instanceof TypeError ? 5 : o$1 instanceof URIError ? 6 : 0;
}
function wr(o$1) {
	let e = ue$1[me$1(o$1)];
	return o$1.name !== e ? { name: o$1.name } : o$1.constructor.name !== e ? { name: o$1.constructor.name } : {};
}
function j$1(o$1, e) {
	let r$1 = wr(o$1), t = Object.getOwnPropertyNames(o$1);
	for (let n = 0, a = t.length, i$1; n < a; n++) i$1 = t[n], i$1 !== "name" && i$1 !== "message" && (i$1 === "stack" ? e & 4 && (r$1 = r$1 || {}, r$1[i$1] = o$1[i$1]) : (r$1 = r$1 || {}, r$1[i$1] = o$1[i$1]));
	return r$1;
}
function fe$1(o$1) {
	return Object.isFrozen(o$1) ? 3 : Object.isSealed(o$1) ? 2 : Object.isExtensible(o$1) ? 0 : 1;
}
function ge(o$1) {
	switch (o$1) {
		case Number.POSITIVE_INFINITY: return Qe;
		case Number.NEGATIVE_INFINITY: return er;
	}
	return o$1 !== o$1 ? rr : Object.is(o$1, -0) ? Xe : u$1(0, s$1, o$1, s$1, s$1, s$1, s$1, s$1, s$1, s$1, s$1, s$1);
}
function w$1(o$1) {
	return u$1(1, s$1, d(o$1), s$1, s$1, s$1, s$1, s$1, s$1, s$1, s$1, s$1);
}
function Se(o$1) {
	return u$1(3, s$1, "" + o$1, s$1, s$1, s$1, s$1, s$1, s$1, s$1, s$1, s$1);
}
function sr(o$1) {
	return u$1(4, o$1, s$1, s$1, s$1, s$1, s$1, s$1, s$1, s$1, s$1, s$1);
}
function he(o$1, e) {
	let r$1 = e.valueOf();
	return u$1(5, o$1, r$1 !== r$1 ? "" : e.toISOString(), s$1, s$1, s$1, s$1, s$1, s$1, s$1, s$1, s$1);
}
function ye(o$1, e) {
	return u$1(6, o$1, s$1, s$1, d(e.source), e.flags, s$1, s$1, s$1, s$1, s$1, s$1);
}
function ve(o$1, e) {
	let r$1 = new Uint8Array(e), t = r$1.length, n = new Array(t);
	for (let a = 0; a < t; a++) n[a] = r$1[a];
	return u$1(19, o$1, n, s$1, s$1, s$1, s$1, s$1, s$1, s$1, s$1, s$1);
}
function or(o$1, e) {
	return u$1(17, o$1, ce[e], s$1, s$1, s$1, s$1, s$1, s$1, s$1, s$1, s$1);
}
function nr(o$1, e) {
	return u$1(18, o$1, d(Ke(e)), s$1, s$1, s$1, s$1, s$1, s$1, s$1, s$1, s$1);
}
function _$1(o$1, e, r$1) {
	return u$1(25, o$1, r$1, s$1, d(e), s$1, s$1, s$1, s$1, s$1, s$1, s$1);
}
function Ne(o$1, e, r$1) {
	return u$1(9, o$1, s$1, e.length, s$1, s$1, s$1, s$1, r$1, s$1, s$1, fe$1(e));
}
function be(o$1, e) {
	return u$1(21, o$1, s$1, s$1, s$1, s$1, s$1, s$1, s$1, e, s$1, s$1);
}
function xe(o$1, e, r$1) {
	return u$1(15, o$1, s$1, e.length, e.constructor.name, s$1, s$1, s$1, s$1, r$1, e.byteOffset, s$1);
}
function Ie(o$1, e, r$1) {
	return u$1(16, o$1, s$1, e.length, e.constructor.name, s$1, s$1, s$1, s$1, r$1, e.byteOffset, s$1);
}
function Ae(o$1, e, r$1) {
	return u$1(20, o$1, s$1, e.byteLength, s$1, s$1, s$1, s$1, s$1, r$1, e.byteOffset, s$1);
}
function we(o$1, e, r$1) {
	return u$1(13, o$1, me$1(e), s$1, s$1, d(e.message), r$1, s$1, s$1, s$1, s$1, s$1);
}
function Ee(o$1, e, r$1) {
	return u$1(14, o$1, me$1(e), s$1, s$1, d(e.message), r$1, s$1, s$1, s$1, s$1, s$1);
}
function Pe(o$1, e, r$1) {
	return u$1(7, o$1, s$1, e, s$1, s$1, s$1, s$1, r$1, s$1, s$1, s$1);
}
function M(o$1, e) {
	return u$1(28, s$1, s$1, s$1, s$1, s$1, s$1, s$1, [o$1, e], s$1, s$1, s$1);
}
function U(o$1, e) {
	return u$1(30, s$1, s$1, s$1, s$1, s$1, s$1, s$1, [o$1, e], s$1, s$1, s$1);
}
function L$1(o$1, e, r$1) {
	return u$1(31, o$1, s$1, s$1, s$1, s$1, s$1, s$1, r$1, e, s$1, s$1);
}
function Re(o$1, e) {
	return u$1(32, o$1, s$1, s$1, s$1, s$1, s$1, s$1, s$1, e, s$1, s$1);
}
function Oe(o$1, e) {
	return u$1(33, o$1, s$1, s$1, s$1, s$1, s$1, s$1, s$1, e, s$1, s$1);
}
function Ce(o$1, e) {
	return u$1(34, o$1, s$1, s$1, s$1, s$1, s$1, s$1, s$1, e, s$1, s$1);
}
var { toString: _e } = Object.prototype;
function Er(o$1, e) {
	return e instanceof Error ? `Seroval caught an error during the ${o$1} process.
  
${e.name}
${e.message}

- For more information, please check the "cause" property of this error.
- If you believe this is an error in Seroval, please submit an issue at https://github.com/lxsmnsyc/seroval/issues/new` : `Seroval caught an error during the ${o$1} process.

"${_e.call(e)}"

For more information, please check the "cause" property of this error.`;
}
var ee$1 = class extends Error {
	constructor(r$1, t) {
		super(Er(r$1, t));
		this.cause = t;
	}
}, E$1 = class extends ee$1 {
	constructor(e) {
		super("parsing", e);
	}
}, Te = class extends ee$1 {
	constructor(e) {
		super("serialization", e);
	}
}, g$1 = class extends Error {
	constructor(r$1) {
		super(`The value ${_e.call(r$1)} of type "${typeof r$1}" cannot be parsed/serialized.
      
There are few workarounds for this problem:
- Transform the value in a way that it can be serialized.
- If the reference is present on multiple runtimes (isomorphic), you can use the Reference API to map the references.`);
		this.value = r$1;
	}
}, y$1 = class extends Error {
	constructor(e) {
		super("Unsupported node type \"" + e.t + "\".");
	}
}, W$1 = class extends Error {
	constructor(e) {
		super("Missing plugin for tag \"" + e + "\".");
	}
}, ie$1 = class extends Error {
	constructor(r$1) {
		super("Missing reference for the value \"" + _e.call(r$1) + "\" of type \"" + typeof r$1 + "\"");
		this.value = r$1;
	}
};
var T$1 = class {
	constructor(e, r$1) {
		this.value = e;
		this.replacement = r$1;
	}
};
function z(o$1, e, r$1) {
	return o$1 & 2 ? (e.length === 1 ? e[0] : "(" + e.join(",") + ")") + "=>" + (r$1.startsWith("{") ? "(" + r$1 + ")" : r$1) : "function(" + e.join(",") + "){return " + r$1 + "}";
}
function S(o$1, e, r$1) {
	return o$1 & 2 ? (e.length === 1 ? e[0] : "(" + e.join(",") + ")") + "=>{" + r$1 + "}" : "function(" + e.join(",") + "){" + r$1 + "}";
}
var ar = {}, ir = {};
var lr = {
	0: {},
	1: {},
	2: {},
	3: {},
	4: {}
};
function Pr(o$1) {
	return z(o$1, ["r"], "(r.p=new Promise(" + S(o$1, ["s", "f"], "r.s=s,r.f=f") + "))");
}
function Rr(o$1) {
	return S(o$1, ["r", "d"], "r.s(d),r.p.s=1,r.p.v=d");
}
function Or(o$1) {
	return S(o$1, ["r", "d"], "r.f(d),r.p.s=2,r.p.v=d");
}
function Cr(o$1) {
	return z(o$1, [
		"b",
		"a",
		"s",
		"l",
		"p",
		"f",
		"e",
		"n"
	], "(b=[],a=!0,s=!1,l=[],p=0,f=" + S(o$1, [
		"v",
		"m",
		"x"
	], "for(x=0;x<p;x++)l[x]&&l[x][m](v)") + ",n=" + S(o$1, [
		"o",
		"x",
		"z",
		"c"
	], "for(x=0,z=b.length;x<z;x++)(c=b[x],(!a&&x===z-1)?o[s?\"return\":\"throw\"](c):o.next(c))") + ",e=" + z(o$1, ["o", "t"], "(a&&(l[t=p++]=o),n(o)," + S(o$1, [], "a&&(l[t]=void 0)") + ")") + ",{__SEROVAL_STREAM__:!0,on:" + z(o$1, ["o"], "e(o)") + ",next:" + S(o$1, ["v"], "a&&(b.push(v),f(v,\"next\"))") + ",throw:" + S(o$1, ["v"], "a&&(b.push(v),f(v,\"throw\"),a=s=!1,l.length=0)") + ",return:" + S(o$1, ["v"], "a&&(b.push(v),f(v,\"return\"),a=!1,s=!0,l.length=0)") + "})");
}
function cr(o$1, e) {
	switch (e) {
		case 0: return "[]";
		case 1: return Pr(o$1);
		case 2: return Rr(o$1);
		case 3: return Or(o$1);
		case 4: return Cr(o$1);
		default: return "";
	}
}
function Fe(o$1) {
	return "__SEROVAL_STREAM__" in o$1;
}
function K() {
	let o$1 = /* @__PURE__ */ new Set(), e = [], r$1 = true, t = true;
	function n(l$1) {
		for (let c$1 of o$1.keys()) c$1.next(l$1);
	}
	function a(l$1) {
		for (let c$1 of o$1.keys()) c$1.throw(l$1);
	}
	function i$1(l$1) {
		for (let c$1 of o$1.keys()) c$1.return(l$1);
	}
	return {
		__SEROVAL_STREAM__: true,
		on(l$1) {
			r$1 && o$1.add(l$1);
			for (let c$1 = 0, p$1 = e.length; c$1 < p$1; c$1++) {
				let h$1 = e[c$1];
				c$1 === p$1 - 1 && !r$1 ? t ? l$1.return(h$1) : l$1.throw(h$1) : l$1.next(h$1);
			}
			return () => {
				r$1 && o$1.delete(l$1);
			};
		},
		next(l$1) {
			r$1 && (e.push(l$1), n(l$1));
		},
		throw(l$1) {
			r$1 && (e.push(l$1), a(l$1), r$1 = false, t = false, o$1.clear());
		},
		return(l$1) {
			r$1 && (e.push(l$1), i$1(l$1), r$1 = false, t = true, o$1.clear());
		}
	};
}
function Ve(o$1) {
	let e = K(), r$1 = o$1[Symbol.asyncIterator]();
	async function t() {
		try {
			let n = await r$1.next();
			n.done ? e.return(n.value) : (e.next(n.value), await t());
		} catch (n) {
			e.throw(n);
		}
	}
	return t().catch(() => {}), e;
}
function J$1(o$1) {
	let e = [], r$1 = -1, t = -1, n = o$1[Symbol.iterator]();
	for (;;) try {
		let a = n.next();
		if (e.push(a.value), a.done) {
			t = e.length - 1;
			break;
		}
	} catch (a) {
		r$1 = e.length, e.push(a);
	}
	return {
		v: e,
		t: r$1,
		d: t
	};
}
var Y$1 = class {
	constructor(e) {
		this.marked = /* @__PURE__ */ new Set();
		this.plugins = e.plugins, this.features = 31 ^ (e.disabledFeatures || 0), this.refs = e.refs || /* @__PURE__ */ new Map();
	}
	markRef(e) {
		this.marked.add(e);
	}
	isMarked(e) {
		return this.marked.has(e);
	}
	createIndex(e) {
		let r$1 = this.refs.size;
		return this.refs.set(e, r$1), r$1;
	}
	getIndexedValue(e) {
		let r$1 = this.refs.get(e);
		return r$1 != null ? (this.markRef(r$1), {
			type: 1,
			value: sr(r$1)
		}) : {
			type: 0,
			value: this.createIndex(e)
		};
	}
	getReference(e) {
		let r$1 = this.getIndexedValue(e);
		return r$1.type === 1 ? r$1 : je(e) ? {
			type: 2,
			value: nr(r$1.value, e)
		} : r$1;
	}
	parseWellKnownSymbol(e) {
		let r$1 = this.getReference(e);
		return r$1.type !== 0 ? r$1.value : (f$1(e in ce, new g$1(e)), or(r$1.value, e));
	}
	parseSpecialReference(e) {
		let r$1 = this.getIndexedValue(lr[e]);
		return r$1.type === 1 ? r$1.value : u$1(26, r$1.value, e, s$1, s$1, s$1, s$1, s$1, s$1, s$1, s$1, s$1);
	}
	parseIteratorFactory() {
		let e = this.getIndexedValue(ar);
		return e.type === 1 ? e.value : u$1(27, e.value, s$1, s$1, s$1, s$1, s$1, s$1, s$1, this.parseWellKnownSymbol(Symbol.iterator), s$1, s$1);
	}
	parseAsyncIteratorFactory() {
		let e = this.getIndexedValue(ir);
		return e.type === 1 ? e.value : u$1(29, e.value, s$1, s$1, s$1, s$1, s$1, s$1, [this.parseSpecialReference(1), this.parseWellKnownSymbol(Symbol.asyncIterator)], s$1, s$1, s$1);
	}
	createObjectNode(e, r$1, t, n) {
		return u$1(t ? 11 : 10, e, s$1, s$1, s$1, s$1, n, s$1, s$1, s$1, s$1, fe$1(r$1));
	}
	createMapNode(e, r$1, t, n) {
		return u$1(8, e, s$1, s$1, s$1, s$1, s$1, {
			k: r$1,
			v: t,
			s: n
		}, s$1, this.parseSpecialReference(0), s$1, s$1);
	}
	createPromiseConstructorNode(e, r$1) {
		return u$1(22, e, r$1, s$1, s$1, s$1, s$1, s$1, s$1, this.parseSpecialReference(1), s$1, s$1);
	}
};
var kr = /^[$A-Z_][0-9A-Z_$]*$/i;
function Le(o$1) {
	let e = o$1[0];
	return (e === "$" || e === "_" || e >= "A" && e <= "Z" || e >= "a" && e <= "z") && kr.test(o$1);
}
function se$1(o$1) {
	switch (o$1.t) {
		case 0: return o$1.s + "=" + o$1.v;
		case 2: return o$1.s + ".set(" + o$1.k + "," + o$1.v + ")";
		case 1: return o$1.s + ".add(" + o$1.v + ")";
		case 3: return o$1.s + ".delete(" + o$1.k + ")";
	}
}
function Fr(o$1) {
	let e = [], r$1 = o$1[0];
	for (let t = 1, n = o$1.length, a, i$1 = r$1; t < n; t++) a = o$1[t], a.t === 0 && a.v === i$1.v ? r$1 = {
		t: 0,
		s: a.s,
		k: s$1,
		v: se$1(r$1)
	} : a.t === 2 && a.s === i$1.s ? r$1 = {
		t: 2,
		s: se$1(r$1),
		k: a.k,
		v: a.v
	} : a.t === 1 && a.s === i$1.s ? r$1 = {
		t: 1,
		s: se$1(r$1),
		k: s$1,
		v: a.v
	} : a.t === 3 && a.s === i$1.s ? r$1 = {
		t: 3,
		s: se$1(r$1),
		k: a.k,
		v: s$1
	} : (e.push(r$1), r$1 = a), i$1 = a;
	return e.push(r$1), e;
}
function fr(o$1) {
	if (o$1.length) {
		let e = "", r$1 = Fr(o$1);
		for (let t = 0, n = r$1.length; t < n; t++) e += se$1(r$1[t]) + ",";
		return e;
	}
	return s$1;
}
var Vr = "Object.create(null)", Dr = "new Set", Br = "new Map", jr = "Promise.resolve", _r = "Promise.reject", Mr = {
	3: "Object.freeze",
	2: "Object.seal",
	1: "Object.preventExtensions",
	0: s$1
}, V = class {
	constructor(e) {
		this.stack = [];
		this.flags = [];
		this.assignments = [];
		this.plugins = e.plugins, this.features = e.features, this.marked = new Set(e.markedRefs);
	}
	createFunction(e, r$1) {
		return z(this.features, e, r$1);
	}
	createEffectfulFunction(e, r$1) {
		return S(this.features, e, r$1);
	}
	markRef(e) {
		this.marked.add(e);
	}
	isMarked(e) {
		return this.marked.has(e);
	}
	pushObjectFlag(e, r$1) {
		e !== 0 && (this.markRef(r$1), this.flags.push({
			type: e,
			value: this.getRefParam(r$1)
		}));
	}
	resolveFlags() {
		let e = "";
		for (let r$1 = 0, t = this.flags, n = t.length; r$1 < n; r$1++) {
			let a = t[r$1];
			e += Mr[a.type] + "(" + a.value + "),";
		}
		return e;
	}
	resolvePatches() {
		let e = fr(this.assignments), r$1 = this.resolveFlags();
		return e ? r$1 ? e + r$1 : e : r$1;
	}
	createAssignment(e, r$1) {
		this.assignments.push({
			t: 0,
			s: e,
			k: s$1,
			v: r$1
		});
	}
	createAddAssignment(e, r$1) {
		this.assignments.push({
			t: 1,
			s: this.getRefParam(e),
			k: s$1,
			v: r$1
		});
	}
	createSetAssignment(e, r$1, t) {
		this.assignments.push({
			t: 2,
			s: this.getRefParam(e),
			k: r$1,
			v: t
		});
	}
	createDeleteAssignment(e, r$1) {
		this.assignments.push({
			t: 3,
			s: this.getRefParam(e),
			k: r$1,
			v: s$1
		});
	}
	createArrayAssign(e, r$1, t) {
		this.createAssignment(this.getRefParam(e) + "[" + r$1 + "]", t);
	}
	createObjectAssign(e, r$1, t) {
		this.createAssignment(this.getRefParam(e) + "." + r$1, t);
	}
	isIndexedValueInStack(e) {
		return e.t === 4 && this.stack.includes(e.i);
	}
	serializeReference(e) {
		return this.assignIndexedValue(e.i, O$1 + ".get(\"" + e.s + "\")");
	}
	serializeArrayItem(e, r$1, t) {
		return r$1 ? this.isIndexedValueInStack(r$1) ? (this.markRef(e), this.createArrayAssign(e, t, this.getRefParam(r$1.i)), "") : this.serialize(r$1) : "";
	}
	serializeArray(e) {
		let r$1 = e.i;
		if (e.l) {
			this.stack.push(r$1);
			let t = e.a, n = this.serializeArrayItem(r$1, t[0], 0), a = n === "";
			for (let i$1 = 1, l$1 = e.l, c$1; i$1 < l$1; i$1++) c$1 = this.serializeArrayItem(r$1, t[i$1], i$1), n += "," + c$1, a = c$1 === "";
			return this.stack.pop(), this.pushObjectFlag(e.o, e.i), this.assignIndexedValue(r$1, "[" + n + (a ? ",]" : "]"));
		}
		return this.assignIndexedValue(r$1, "[]");
	}
	serializeProperty(e, r$1, t) {
		if (typeof r$1 == "string") {
			let n = Number(r$1), a = n >= 0 && n.toString() === r$1 || Le(r$1);
			if (this.isIndexedValueInStack(t)) {
				let i$1 = this.getRefParam(t.i);
				return this.markRef(e.i), a && n !== n ? this.createObjectAssign(e.i, r$1, i$1) : this.createArrayAssign(e.i, a ? r$1 : "\"" + r$1 + "\"", i$1), "";
			}
			return (a ? r$1 : "\"" + r$1 + "\"") + ":" + this.serialize(t);
		}
		return "[" + this.serialize(r$1) + "]:" + this.serialize(t);
	}
	serializeProperties(e, r$1) {
		let t = r$1.s;
		if (t) {
			let n = r$1.k, a = r$1.v;
			this.stack.push(e.i);
			let i$1 = this.serializeProperty(e, n[0], a[0]);
			for (let l$1 = 1, c$1 = i$1; l$1 < t; l$1++) c$1 = this.serializeProperty(e, n[l$1], a[l$1]), i$1 += (c$1 && i$1 && ",") + c$1;
			return this.stack.pop(), "{" + i$1 + "}";
		}
		return "{}";
	}
	serializeObject(e) {
		return this.pushObjectFlag(e.o, e.i), this.assignIndexedValue(e.i, this.serializeProperties(e, e.p));
	}
	serializeWithObjectAssign(e, r$1, t) {
		let n = this.serializeProperties(e, r$1);
		return n !== "{}" ? "Object.assign(" + t + "," + n + ")" : t;
	}
	serializeStringKeyAssignment(e, r$1, t, n) {
		let a = this.serialize(n), i$1 = Number(t), l$1 = i$1 >= 0 && i$1.toString() === t || Le(t);
		if (this.isIndexedValueInStack(n)) l$1 && i$1 !== i$1 ? this.createObjectAssign(e.i, t, a) : this.createArrayAssign(e.i, l$1 ? t : "\"" + t + "\"", a);
		else {
			let c$1 = this.assignments;
			this.assignments = r$1, l$1 && i$1 !== i$1 ? this.createObjectAssign(e.i, t, a) : this.createArrayAssign(e.i, l$1 ? t : "\"" + t + "\"", a), this.assignments = c$1;
		}
	}
	serializeAssignment(e, r$1, t, n) {
		if (typeof t == "string") this.serializeStringKeyAssignment(e, r$1, t, n);
		else {
			let a = this.stack;
			this.stack = [];
			let i$1 = this.serialize(n);
			this.stack = a;
			let l$1 = this.assignments;
			this.assignments = r$1, this.createArrayAssign(e.i, this.serialize(t), i$1), this.assignments = l$1;
		}
	}
	serializeAssignments(e, r$1) {
		let t = r$1.s;
		if (t) {
			let n = [], a = r$1.k, i$1 = r$1.v;
			this.stack.push(e.i);
			for (let l$1 = 0; l$1 < t; l$1++) this.serializeAssignment(e, n, a[l$1], i$1[l$1]);
			return this.stack.pop(), fr(n);
		}
		return s$1;
	}
	serializeDictionary(e, r$1) {
		if (e.p) if (this.features & 8) r$1 = this.serializeWithObjectAssign(e, e.p, r$1);
		else {
			this.markRef(e.i);
			let t = this.serializeAssignments(e, e.p);
			if (t) return "(" + this.assignIndexedValue(e.i, r$1) + "," + t + this.getRefParam(e.i) + ")";
		}
		return this.assignIndexedValue(e.i, r$1);
	}
	serializeNullConstructor(e) {
		return this.pushObjectFlag(e.o, e.i), this.serializeDictionary(e, Vr);
	}
	serializeDate(e) {
		return this.assignIndexedValue(e.i, "new Date(\"" + e.s + "\")");
	}
	serializeRegExp(e) {
		return this.assignIndexedValue(e.i, "/" + e.c + "/" + e.m);
	}
	serializeSetItem(e, r$1) {
		return this.isIndexedValueInStack(r$1) ? (this.markRef(e), this.createAddAssignment(e, this.getRefParam(r$1.i)), "") : this.serialize(r$1);
	}
	serializeSet(e) {
		let r$1 = Dr, t = e.l, n = e.i;
		if (t) {
			let a = e.a;
			this.stack.push(n);
			let i$1 = this.serializeSetItem(n, a[0]);
			for (let l$1 = 1, c$1 = i$1; l$1 < t; l$1++) c$1 = this.serializeSetItem(n, a[l$1]), i$1 += (c$1 && i$1 && ",") + c$1;
			this.stack.pop(), i$1 && (r$1 += "([" + i$1 + "])");
		}
		return this.assignIndexedValue(n, r$1);
	}
	serializeMapEntry(e, r$1, t, n) {
		if (this.isIndexedValueInStack(r$1)) {
			let a = this.getRefParam(r$1.i);
			if (this.markRef(e), this.isIndexedValueInStack(t)) {
				let l$1 = this.getRefParam(t.i);
				return this.createSetAssignment(e, a, l$1), "";
			}
			if (t.t !== 4 && t.i != null && this.isMarked(t.i)) {
				let l$1 = "(" + this.serialize(t) + ",[" + n + "," + n + "])";
				return this.createSetAssignment(e, a, this.getRefParam(t.i)), this.createDeleteAssignment(e, n), l$1;
			}
			let i$1 = this.stack;
			return this.stack = [], this.createSetAssignment(e, a, this.serialize(t)), this.stack = i$1, "";
		}
		if (this.isIndexedValueInStack(t)) {
			let a = this.getRefParam(t.i);
			if (this.markRef(e), r$1.t !== 4 && r$1.i != null && this.isMarked(r$1.i)) {
				let l$1 = "(" + this.serialize(r$1) + ",[" + n + "," + n + "])";
				return this.createSetAssignment(e, this.getRefParam(r$1.i), a), this.createDeleteAssignment(e, n), l$1;
			}
			let i$1 = this.stack;
			return this.stack = [], this.createSetAssignment(e, this.serialize(r$1), a), this.stack = i$1, "";
		}
		return "[" + this.serialize(r$1) + "," + this.serialize(t) + "]";
	}
	serializeMap(e) {
		let r$1 = Br, t = e.e.s, n = e.i, a = e.f, i$1 = this.getRefParam(a.i);
		if (t) {
			let l$1 = e.e.k, c$1 = e.e.v;
			this.stack.push(n);
			let p$1 = this.serializeMapEntry(n, l$1[0], c$1[0], i$1);
			for (let h$1 = 1, X$1 = p$1; h$1 < t; h$1++) X$1 = this.serializeMapEntry(n, l$1[h$1], c$1[h$1], i$1), p$1 += (X$1 && p$1 && ",") + X$1;
			this.stack.pop(), p$1 && (r$1 += "([" + p$1 + "])");
		}
		return a.t === 26 && (this.markRef(a.i), r$1 = "(" + this.serialize(a) + "," + r$1 + ")"), this.assignIndexedValue(n, r$1);
	}
	serializeArrayBuffer(e) {
		let r$1 = "new Uint8Array(", t = e.s, n = t.length;
		if (n) {
			r$1 += "[" + t[0];
			for (let a = 1; a < n; a++) r$1 += "," + t[a];
			r$1 += "]";
		}
		return this.assignIndexedValue(e.i, r$1 + ").buffer");
	}
	serializeTypedArray(e) {
		return this.assignIndexedValue(e.i, "new " + e.c + "(" + this.serialize(e.f) + "," + e.b + "," + e.l + ")");
	}
	serializeDataView(e) {
		return this.assignIndexedValue(e.i, "new DataView(" + this.serialize(e.f) + "," + e.b + "," + e.l + ")");
	}
	serializeAggregateError(e) {
		let r$1 = e.i;
		this.stack.push(r$1);
		let t = this.serializeDictionary(e, "new AggregateError([],\"" + e.m + "\")");
		return this.stack.pop(), t;
	}
	serializeError(e) {
		return this.serializeDictionary(e, "new " + ue$1[e.s] + "(\"" + e.m + "\")");
	}
	serializePromise(e) {
		let r$1, t = e.f, n = e.i, a = e.s ? jr : _r;
		if (this.isIndexedValueInStack(t)) {
			let i$1 = this.getRefParam(t.i);
			r$1 = a + (e.s ? "().then(" + this.createFunction([], i$1) + ")" : "().catch(" + this.createEffectfulFunction([], "throw " + i$1) + ")");
		} else {
			this.stack.push(n);
			let i$1 = this.serialize(t);
			this.stack.pop(), r$1 = a + "(" + i$1 + ")";
		}
		return this.assignIndexedValue(n, r$1);
	}
	serializeWellKnownSymbol(e) {
		return this.assignIndexedValue(e.i, $e[e.s]);
	}
	serializeBoxed(e) {
		return this.assignIndexedValue(e.i, "Object(" + this.serialize(e.f) + ")");
	}
	serializePlugin(e) {
		let r$1 = this.plugins;
		if (r$1) for (let t = 0, n = r$1.length; t < n; t++) {
			let a = r$1[t];
			if (a.tag === e.c) return this.assignIndexedValue(e.i, a.serialize(e.s, this, { id: e.i }));
		}
		throw new W$1(e.c);
	}
	getConstructor(e) {
		let r$1 = this.serialize(e);
		return r$1 === this.getRefParam(e.i) ? r$1 : "(" + r$1 + ")";
	}
	serializePromiseConstructor(e) {
		let r$1 = this.assignIndexedValue(e.s, "{p:0,s:0,f:0}");
		return this.assignIndexedValue(e.i, this.getConstructor(e.f) + "(" + r$1 + ")");
	}
	serializePromiseResolve(e) {
		return this.getConstructor(e.a[0]) + "(" + this.getRefParam(e.i) + "," + this.serialize(e.a[1]) + ")";
	}
	serializePromiseReject(e) {
		return this.getConstructor(e.a[0]) + "(" + this.getRefParam(e.i) + "," + this.serialize(e.a[1]) + ")";
	}
	serializeSpecialReference(e) {
		return this.assignIndexedValue(e.i, cr(this.features, e.s));
	}
	serializeIteratorFactory(e) {
		let r$1 = "", t = false;
		return e.f.t !== 4 && (this.markRef(e.f.i), r$1 = "(" + this.serialize(e.f) + ",", t = true), r$1 += this.assignIndexedValue(e.i, this.createFunction(["s"], this.createFunction([
			"i",
			"c",
			"d",
			"t"
		], "(i=0,t={[" + this.getRefParam(e.f.i) + "]:" + this.createFunction([], "t") + ",next:" + this.createEffectfulFunction([], "if(i>s.d)return{done:!0,value:void 0};if(d=s.v[c=i++],c===s.t)throw d;return{done:c===s.d,value:d}") + "})"))), t && (r$1 += ")"), r$1;
	}
	serializeIteratorFactoryInstance(e) {
		return this.getConstructor(e.a[0]) + "(" + this.serialize(e.a[1]) + ")";
	}
	serializeAsyncIteratorFactory(e) {
		let r$1 = e.a[0], t = e.a[1], n = "";
		r$1.t !== 4 && (this.markRef(r$1.i), n += "(" + this.serialize(r$1)), t.t !== 4 && (this.markRef(t.i), n += (n ? "," : "(") + this.serialize(t)), n && (n += ",");
		let a = this.assignIndexedValue(e.i, this.createFunction(["s"], this.createFunction([
			"b",
			"c",
			"p",
			"d",
			"e",
			"t",
			"f"
		], "(b=[],c=0,p=[],d=-1,e=!1,f=" + this.createEffectfulFunction(["i", "l"], "for(i=0,l=p.length;i<l;i++)p[i].s({done:!0,value:void 0})") + ",s.on({next:" + this.createEffectfulFunction(["v", "t"], "if(t=p.shift())t.s({done:!1,value:v});b.push(v)") + ",throw:" + this.createEffectfulFunction(["v", "t"], "if(t=p.shift())t.f(v);f(),d=b.length,e=!0,b.push(v)") + ",return:" + this.createEffectfulFunction(["v", "t"], "if(t=p.shift())t.s({done:!0,value:v});f(),d=b.length,b.push(v)") + "}),t={[" + this.getRefParam(t.i) + "]:" + this.createFunction([], "t.p") + ",next:" + this.createEffectfulFunction([
			"i",
			"t",
			"v"
		], "if(d===-1){return((i=c++)>=b.length)?(" + this.getRefParam(r$1.i) + "(t={p:0,s:0,f:0}),p.push(t),t.p):{done:!1,value:b[i]}}if(c>d)return{done:!0,value:void 0};if(v=b[i=c++],i!==d)return{done:!1,value:v};if(e)throw v;return{done:!0,value:v}") + "})")));
		return n ? n + a + ")" : a;
	}
	serializeAsyncIteratorFactoryInstance(e) {
		return this.getConstructor(e.a[0]) + "(" + this.serialize(e.a[1]) + ")";
	}
	serializeStreamConstructor(e) {
		let r$1 = this.assignIndexedValue(e.i, this.getConstructor(e.f) + "()"), t = e.a.length;
		if (t) {
			let n = this.serialize(e.a[0]);
			for (let a = 1; a < t; a++) n += "," + this.serialize(e.a[a]);
			return "(" + r$1 + "," + n + "," + this.getRefParam(e.i) + ")";
		}
		return r$1;
	}
	serializeStreamNext(e) {
		return this.getRefParam(e.i) + ".next(" + this.serialize(e.f) + ")";
	}
	serializeStreamThrow(e) {
		return this.getRefParam(e.i) + ".throw(" + this.serialize(e.f) + ")";
	}
	serializeStreamReturn(e) {
		return this.getRefParam(e.i) + ".return(" + this.serialize(e.f) + ")";
	}
	serialize(e) {
		try {
			switch (e.t) {
				case 2: return qe[e.s];
				case 0: return "" + e.s;
				case 1: return "\"" + e.s + "\"";
				case 3: return e.s + "n";
				case 4: return this.getRefParam(e.i);
				case 18: return this.serializeReference(e);
				case 9: return this.serializeArray(e);
				case 10: return this.serializeObject(e);
				case 11: return this.serializeNullConstructor(e);
				case 5: return this.serializeDate(e);
				case 6: return this.serializeRegExp(e);
				case 7: return this.serializeSet(e);
				case 8: return this.serializeMap(e);
				case 19: return this.serializeArrayBuffer(e);
				case 16:
				case 15: return this.serializeTypedArray(e);
				case 20: return this.serializeDataView(e);
				case 14: return this.serializeAggregateError(e);
				case 13: return this.serializeError(e);
				case 12: return this.serializePromise(e);
				case 17: return this.serializeWellKnownSymbol(e);
				case 21: return this.serializeBoxed(e);
				case 22: return this.serializePromiseConstructor(e);
				case 23: return this.serializePromiseResolve(e);
				case 24: return this.serializePromiseReject(e);
				case 25: return this.serializePlugin(e);
				case 26: return this.serializeSpecialReference(e);
				case 27: return this.serializeIteratorFactory(e);
				case 28: return this.serializeIteratorFactoryInstance(e);
				case 29: return this.serializeAsyncIteratorFactory(e);
				case 30: return this.serializeAsyncIteratorFactoryInstance(e);
				case 31: return this.serializeStreamConstructor(e);
				case 32: return this.serializeStreamNext(e);
				case 33: return this.serializeStreamThrow(e);
				case 34: return this.serializeStreamReturn(e);
				default: throw new y$1(e);
			}
		} catch (r$1) {
			throw new Te(r$1);
		}
	}
};
var D$1 = class extends V {
	constructor(r$1) {
		super(r$1);
		this.mode = "cross";
		this.scopeId = r$1.scopeId;
	}
	getRefParam(r$1) {
		return Q + "[" + r$1 + "]";
	}
	assignIndexedValue(r$1, t) {
		return this.getRefParam(r$1) + "=" + t;
	}
	serializeTop(r$1) {
		let t = this.serialize(r$1), n = r$1.i;
		if (n == null) return t;
		let a = this.resolvePatches(), i$1 = this.getRefParam(n), l$1 = this.scopeId == null ? "" : Q, c$1 = a ? "(" + t + "," + a + i$1 + ")" : t;
		if (l$1 === "") return r$1.t === 10 && !a ? "(" + c$1 + ")" : c$1;
		let p$1 = this.scopeId == null ? "()" : "(" + Q + "[\"" + d(this.scopeId) + "\"])";
		return "(" + this.createFunction([l$1], c$1) + ")" + p$1;
	}
};
var v = class extends Y$1 {
	parseItems(e) {
		let r$1 = [];
		for (let t = 0, n = e.length; t < n; t++) t in e && (r$1[t] = this.parse(e[t]));
		return r$1;
	}
	parseArray(e, r$1) {
		return Ne(e, r$1, this.parseItems(r$1));
	}
	parseProperties(e) {
		let r$1 = Object.entries(e), t = [], n = [];
		for (let i$1 = 0, l$1 = r$1.length; i$1 < l$1; i$1++) t.push(d(r$1[i$1][0])), n.push(this.parse(r$1[i$1][1]));
		let a = Symbol.iterator;
		return a in e && (t.push(this.parseWellKnownSymbol(a)), n.push(M(this.parseIteratorFactory(), this.parse(J$1(e))))), a = Symbol.asyncIterator, a in e && (t.push(this.parseWellKnownSymbol(a)), n.push(U(this.parseAsyncIteratorFactory(), this.parse(K())))), a = Symbol.toStringTag, a in e && (t.push(this.parseWellKnownSymbol(a)), n.push(w$1(e[a]))), a = Symbol.isConcatSpreadable, a in e && (t.push(this.parseWellKnownSymbol(a)), n.push(e[a] ? I$1 : A$1)), {
			k: t,
			v: n,
			s: t.length
		};
	}
	parsePlainObject(e, r$1, t) {
		return this.createObjectNode(e, r$1, t, this.parseProperties(r$1));
	}
	parseBoxed(e, r$1) {
		return be(e, this.parse(r$1.valueOf()));
	}
	parseTypedArray(e, r$1) {
		return xe(e, r$1, this.parse(r$1.buffer));
	}
	parseBigIntTypedArray(e, r$1) {
		return Ie(e, r$1, this.parse(r$1.buffer));
	}
	parseDataView(e, r$1) {
		return Ae(e, r$1, this.parse(r$1.buffer));
	}
	parseError(e, r$1) {
		let t = j$1(r$1, this.features);
		return we(e, r$1, t ? this.parseProperties(t) : s$1);
	}
	parseAggregateError(e, r$1) {
		let t = j$1(r$1, this.features);
		return Ee(e, r$1, t ? this.parseProperties(t) : s$1);
	}
	parseMap(e, r$1) {
		let t = [], n = [];
		for (let [a, i$1] of r$1.entries()) t.push(this.parse(a)), n.push(this.parse(i$1));
		return this.createMapNode(e, t, n, r$1.size);
	}
	parseSet(e, r$1) {
		let t = [];
		for (let n of r$1.keys()) t.push(this.parse(n));
		return Pe(e, r$1.size, t);
	}
	parsePlugin(e, r$1) {
		let t = this.plugins;
		if (t) for (let n = 0, a = t.length; n < a; n++) {
			let i$1 = t[n];
			if (i$1.parse.sync && i$1.test(r$1)) return _$1(e, i$1.tag, i$1.parse.sync(r$1, this, { id: e }));
		}
	}
	parseStream(e, r$1) {
		return L$1(e, this.parseSpecialReference(4), []);
	}
	parsePromise(e, r$1) {
		return this.createPromiseConstructorNode(e, this.createIndex({}));
	}
	parseObject(e, r$1) {
		if (Array.isArray(r$1)) return this.parseArray(e, r$1);
		if (Fe(r$1)) return this.parseStream(e, r$1);
		let t = r$1.constructor;
		if (t === T$1) return this.parse(r$1.replacement);
		let n = this.parsePlugin(e, r$1);
		if (n) return n;
		switch (t) {
			case Object: return this.parsePlainObject(e, r$1, false);
			case void 0: return this.parsePlainObject(e, r$1, true);
			case Date: return he(e, r$1);
			case RegExp: return ye(e, r$1);
			case Error:
			case EvalError:
			case RangeError:
			case ReferenceError:
			case SyntaxError:
			case TypeError:
			case URIError: return this.parseError(e, r$1);
			case Number:
			case Boolean:
			case String:
			case BigInt: return this.parseBoxed(e, r$1);
			case ArrayBuffer: return ve(e, r$1);
			case Int8Array:
			case Int16Array:
			case Int32Array:
			case Uint8Array:
			case Uint16Array:
			case Uint32Array:
			case Uint8ClampedArray:
			case Float32Array:
			case Float64Array: return this.parseTypedArray(e, r$1);
			case DataView: return this.parseDataView(e, r$1);
			case Map: return this.parseMap(e, r$1);
			case Set: return this.parseSet(e, r$1);
		}
		if (t === Promise || r$1 instanceof Promise) return this.parsePromise(e, r$1);
		let a = this.features;
		if (a & 16) switch (t) {
			case BigInt64Array:
			case BigUint64Array: return this.parseBigIntTypedArray(e, r$1);
		}
		if (a & 1 && typeof AggregateError != "undefined" && (t === AggregateError || r$1 instanceof AggregateError)) return this.parseAggregateError(e, r$1);
		if (r$1 instanceof Error) return this.parseError(e, r$1);
		if (Symbol.iterator in r$1 || Symbol.asyncIterator in r$1) return this.parsePlainObject(e, r$1, !!t);
		throw new g$1(r$1);
	}
	parseFunction(e) {
		let r$1 = this.getReference(e);
		if (r$1.type !== 0) return r$1.value;
		let t = this.parsePlugin(r$1.value, e);
		if (t) return t;
		throw new g$1(e);
	}
	parse(e) {
		switch (typeof e) {
			case "boolean": return e ? I$1 : A$1;
			case "undefined": return pe$1;
			case "string": return w$1(e);
			case "number": return ge(e);
			case "bigint": return Se(e);
			case "object": {
				if (e) {
					let r$1 = this.getReference(e);
					return r$1.type === 0 ? this.parseObject(r$1.value, e) : r$1.value;
				}
				return de;
			}
			case "symbol": return this.parseWellKnownSymbol(e);
			case "function": return this.parseFunction(e);
			default: throw new g$1(e);
		}
	}
	parseTop(e) {
		try {
			return this.parse(e);
		} catch (r$1) {
			throw r$1 instanceof E$1 ? r$1 : new E$1(r$1);
		}
	}
};
var oe = class extends v {
	constructor(r$1) {
		super(r$1);
		this.alive = true;
		this.pending = 0;
		this.initial = true;
		this.buffer = [];
		this.onParseCallback = r$1.onParse, this.onErrorCallback = r$1.onError, this.onDoneCallback = r$1.onDone;
	}
	onParseInternal(r$1, t) {
		try {
			this.onParseCallback(r$1, t);
		} catch (n) {
			this.onError(n);
		}
	}
	flush() {
		for (let r$1 = 0, t = this.buffer.length; r$1 < t; r$1++) this.onParseInternal(this.buffer[r$1], false);
	}
	onParse(r$1) {
		this.initial ? this.buffer.push(r$1) : this.onParseInternal(r$1, false);
	}
	onError(r$1) {
		if (this.onErrorCallback) this.onErrorCallback(r$1);
		else throw r$1;
	}
	onDone() {
		this.onDoneCallback && this.onDoneCallback();
	}
	pushPendingState() {
		this.pending++;
	}
	popPendingState() {
		--this.pending <= 0 && this.onDone();
	}
	parseProperties(r$1) {
		let t = Object.entries(r$1), n = [], a = [];
		for (let l$1 = 0, c$1 = t.length; l$1 < c$1; l$1++) n.push(d(t[l$1][0])), a.push(this.parse(t[l$1][1]));
		let i$1 = Symbol.iterator;
		return i$1 in r$1 && (n.push(this.parseWellKnownSymbol(i$1)), a.push(M(this.parseIteratorFactory(), this.parse(J$1(r$1))))), i$1 = Symbol.asyncIterator, i$1 in r$1 && (n.push(this.parseWellKnownSymbol(i$1)), a.push(U(this.parseAsyncIteratorFactory(), this.parse(Ve(r$1))))), i$1 = Symbol.toStringTag, i$1 in r$1 && (n.push(this.parseWellKnownSymbol(i$1)), a.push(w$1(r$1[i$1]))), i$1 = Symbol.isConcatSpreadable, i$1 in r$1 && (n.push(this.parseWellKnownSymbol(i$1)), a.push(r$1[i$1] ? I$1 : A$1)), {
			k: n,
			v: a,
			s: n.length
		};
	}
	handlePromiseSuccess(r$1, t) {
		let n = this.parseWithError(t);
		n && this.onParse(u$1(23, r$1, s$1, s$1, s$1, s$1, s$1, s$1, [this.parseSpecialReference(2), n], s$1, s$1, s$1)), this.popPendingState();
	}
	handlePromiseFailure(r$1, t) {
		if (this.alive) {
			let n = this.parseWithError(t);
			n && this.onParse(u$1(24, r$1, s$1, s$1, s$1, s$1, s$1, s$1, [this.parseSpecialReference(3), n], s$1, s$1, s$1));
		}
		this.popPendingState();
	}
	parsePromise(r$1, t) {
		let n = this.createIndex({});
		return t.then(this.handlePromiseSuccess.bind(this, n), this.handlePromiseFailure.bind(this, n)), this.pushPendingState(), this.createPromiseConstructorNode(r$1, n);
	}
	parsePlugin(r$1, t) {
		let n = this.plugins;
		if (n) for (let a = 0, i$1 = n.length; a < i$1; a++) {
			let l$1 = n[a];
			if (l$1.parse.stream && l$1.test(t)) return _$1(r$1, l$1.tag, l$1.parse.stream(t, this, { id: r$1 }));
		}
		return s$1;
	}
	parseStream(r$1, t) {
		let n = L$1(r$1, this.parseSpecialReference(4), []);
		return this.pushPendingState(), t.on({
			next: (a) => {
				if (this.alive) {
					let i$1 = this.parseWithError(a);
					i$1 && this.onParse(Re(r$1, i$1));
				}
			},
			throw: (a) => {
				if (this.alive) {
					let i$1 = this.parseWithError(a);
					i$1 && this.onParse(Oe(r$1, i$1));
				}
				this.popPendingState();
			},
			return: (a) => {
				if (this.alive) {
					let i$1 = this.parseWithError(a);
					i$1 && this.onParse(Ce(r$1, i$1));
				}
				this.popPendingState();
			}
		}), n;
	}
	parseWithError(r$1) {
		try {
			return this.parse(r$1);
		} catch (t) {
			return this.onError(t), s$1;
		}
	}
	start(r$1) {
		let t = this.parseWithError(r$1);
		t && (this.onParseInternal(t, true), this.initial = false, this.flush(), this.pending <= 0 && this.destroy());
	}
	destroy() {
		this.alive && (this.onDone(), this.alive = false);
	}
	isAlive() {
		return this.alive;
	}
};
var G$1 = class extends oe {
	constructor() {
		super(...arguments);
		this.mode = "cross";
	}
};
function gr(o$1, e) {
	let r$1 = m$1(e.plugins), t = new G$1({
		plugins: r$1,
		refs: e.refs,
		disabledFeatures: e.disabledFeatures,
		onParse(n, a) {
			let i$1 = new D$1({
				plugins: r$1,
				features: t.features,
				scopeId: e.scopeId,
				markedRefs: t.marked
			}), l$1;
			try {
				l$1 = i$1.serializeTop(n);
			} catch (c$1) {
				e.onError && e.onError(c$1);
				return;
			}
			e.onSerialize(l$1, a);
		},
		onError: e.onError,
		onDone: e.onDone
	});
	return t.start(o$1), t.destroy.bind(t);
}
var p = {}, ee = Hr({
	tag: "seroval-plugins/web/ReadableStreamFactory",
	test(e) {
		return e === p;
	},
	parse: {
		sync() {},
		async async() {
			return await Promise.resolve(void 0);
		},
		stream() {}
	},
	serialize(e, r$1) {
		return r$1.createFunction(["d"], "new ReadableStream({start:" + r$1.createEffectfulFunction(["c"], "d.on({next:" + r$1.createEffectfulFunction(["v"], "c.enqueue(v)") + ",throw:" + r$1.createEffectfulFunction(["v"], "c.error(v)") + ",return:" + r$1.createEffectfulFunction([], "c.close()") + "})") + "})");
	},
	deserialize() {
		return p;
	}
});
function w(e) {
	let r$1 = K(), a = e.getReader();
	async function t() {
		try {
			let n = await a.read();
			n.done ? r$1.return(n.value) : (r$1.next(n.value), await t());
		} catch (n) {
			r$1.throw(n);
		}
	}
	return t().catch(() => {}), r$1;
}
var re = Hr({
	tag: "seroval/plugins/web/ReadableStream",
	extends: [ee],
	test(e) {
		return typeof ReadableStream == "undefined" ? false : e instanceof ReadableStream;
	},
	parse: {
		sync(e, r$1) {
			return {
				factory: r$1.parse(p),
				stream: r$1.parse(K())
			};
		},
		async async(e, r$1) {
			return {
				factory: await r$1.parse(p),
				stream: await r$1.parse(w(e))
			};
		},
		stream(e, r$1) {
			return {
				factory: r$1.parse(p),
				stream: r$1.parse(w(e))
			};
		}
	},
	serialize(e, r$1) {
		return "(" + r$1.serialize(e.factory) + ")(" + r$1.serialize(e.stream) + ")";
	},
	deserialize(e, r$1) {
		let a = r$1.deserialize(e.stream);
		return new ReadableStream({ start(t) {
			a.on({
				next(n) {
					t.enqueue(n);
				},
				throw(n) {
					t.error(n);
				},
				return() {
					t.close();
				}
			});
		} });
	}
}), u = re;
const minifiedTsrBootStrapScript = "self.$_TSR={c:()=>{document.querySelectorAll(\".\\\\$tsr\").forEach(e=>{e.remove()})}};\n";
const ShallowErrorPlugin = /* @__PURE__ */ Hr({
	tag: "tanstack-start:seroval-plugins/Error",
	test(value) {
		return value instanceof Error;
	},
	parse: {
		sync(value, ctx) {
			return { message: ctx.parse(value.message) };
		},
		async async(value, ctx) {
			return { message: await ctx.parse(value.message) };
		},
		stream(value, ctx) {
			return { message: ctx.parse(value.message) };
		}
	},
	serialize(node, ctx) {
		return "new Error(" + ctx.serialize(node.message) + ")";
	},
	deserialize(node, ctx) {
		return new Error(ctx.deserialize(node.message));
	}
});
const GLOBAL_TSR = "$_TSR";
const SCOPE_ID = "tsr";
function dehydrateMatch(match) {
	const dehydratedMatch = {
		i: match.id,
		u: match.updatedAt,
		s: match.status
	};
	const properties = [
		["__beforeLoadContext", "b"],
		["loaderData", "l"],
		["error", "e"],
		["ssr", "ssr"]
	];
	for (const [key, shorthand] of properties) if (match[key] !== void 0) dehydratedMatch[shorthand] = match[key];
	return dehydratedMatch;
}
function attachRouterServerSsrUtils(router, manifest) {
	router.ssr = { manifest };
	const serializationRefs = /* @__PURE__ */ new Map();
	let initialScriptSent = false;
	const getInitialScript = () => {
		if (initialScriptSent) return "";
		initialScriptSent = true;
		return `${xr(SCOPE_ID)};${minifiedTsrBootStrapScript};`;
	};
	let _dehydrated = false;
	const listeners = [];
	router.serverSsr = {
		injectedHtml: [],
		injectHtml: (getHtml) => {
			const promise = Promise.resolve().then(getHtml);
			router.serverSsr.injectedHtml.push(promise);
			router.emit({
				type: "onInjectedHtml",
				promise
			});
			return promise.then(() => {});
		},
		injectScript: (getScript) => {
			return router.serverSsr.injectHtml(async () => {
				const script = await getScript();
				return `<script class='$tsr'>${getInitialScript()}${script};if (typeof $_TSR !== 'undefined') $_TSR.c()<\/script>`;
			});
		},
		dehydrate: async () => {
			var _a, _b, _c;
			invariant(!_dehydrated);
			let matchesToDehydrate = router.state.matches;
			if (router.isShell()) matchesToDehydrate = matchesToDehydrate.slice(0, 1);
			const matches = matchesToDehydrate.map(dehydrateMatch);
			const dehydratedRouter = {
				manifest: router.ssr.manifest,
				matches
			};
			const lastMatchId = (_a = matchesToDehydrate[matchesToDehydrate.length - 1]) == null ? void 0 : _a.id;
			if (lastMatchId) dehydratedRouter.lastMatchId = lastMatchId;
			dehydratedRouter.dehydratedData = await ((_c = (_b = router.options).dehydrate) == null ? void 0 : _c.call(_b));
			_dehydrated = true;
			const p$1 = createControlledPromise();
			gr(dehydratedRouter, {
				refs: serializationRefs,
				plugins: [u, ShallowErrorPlugin],
				onSerialize: (data, initial) => {
					const serialized = initial ? `${GLOBAL_TSR}["router"]=` + data : data;
					router.serverSsr.injectScript(() => serialized);
				},
				scopeId: SCOPE_ID,
				onDone: () => p$1.resolve(""),
				onError: (err) => p$1.reject(err)
			});
			router.serverSsr.injectHtml(() => p$1);
		},
		isDehydrated() {
			return _dehydrated;
		},
		onRenderFinished: (listener) => listeners.push(listener),
		setRenderFinished: () => {
			listeners.forEach((l$1) => l$1());
		}
	};
}
nodeCrypto.webcrypto?.subtle || {};
var alphabetByEncoding = {};
var alphabetByValue = Array.from({ length: 64 });
for (let i$1 = 0, start = "A".charCodeAt(0), limit = "Z".charCodeAt(0); i$1 + start <= limit; i$1++) {
	const char = String.fromCharCode(i$1 + start);
	alphabetByEncoding[char] = i$1;
	alphabetByValue[i$1] = char;
}
for (let i$1 = 0, start = "a".charCodeAt(0), limit = "z".charCodeAt(0); i$1 + start <= limit; i$1++) {
	const char = String.fromCharCode(i$1 + start);
	const index = i$1 + 26;
	alphabetByEncoding[char] = index;
	alphabetByValue[index] = char;
}
for (let i$1 = 0; i$1 < 10; i$1++) {
	alphabetByEncoding[i$1.toString(10)] = i$1 + 52;
	const char = i$1.toString(10);
	const index = i$1 + 52;
	alphabetByEncoding[char] = index;
	alphabetByValue[index] = char;
}
alphabetByEncoding["-"] = 62;
alphabetByValue[62] = "-";
alphabetByEncoding["_"] = 63;
alphabetByValue[63] = "_";
function hasProp(obj, prop) {
	try {
		return prop in obj;
	} catch {
		return false;
	}
}
var __defProp$2 = Object.defineProperty;
var __defNormalProp$2 = (obj, key, value) => key in obj ? __defProp$2(obj, key, {
	enumerable: true,
	configurable: true,
	writable: true,
	value
}) : obj[key] = value;
var __publicField$2 = (obj, key, value) => {
	__defNormalProp$2(obj, typeof key !== "symbol" ? key + "" : key, value);
	return value;
};
var H3Error = class extends Error {
	constructor(message, opts = {}) {
		super(message, opts);
		__publicField$2(this, "statusCode", 500);
		__publicField$2(this, "fatal", false);
		__publicField$2(this, "unhandled", false);
		__publicField$2(this, "statusMessage");
		__publicField$2(this, "data");
		__publicField$2(this, "cause");
		if (opts.cause && !this.cause) this.cause = opts.cause;
	}
	toJSON() {
		const obj = {
			message: this.message,
			statusCode: sanitizeStatusCode(this.statusCode, 500)
		};
		if (this.statusMessage) obj.statusMessage = sanitizeStatusMessage(this.statusMessage);
		if (this.data !== void 0) obj.data = this.data;
		return obj;
	}
};
__publicField$2(H3Error, "__h3_error__", true);
function createError(input) {
	if (typeof input === "string") return new H3Error(input);
	if (isError(input)) return input;
	const err = new H3Error(input.message ?? input.statusMessage ?? "", { cause: input.cause || input });
	if (hasProp(input, "stack")) try {
		Object.defineProperty(err, "stack", { get() {
			return input.stack;
		} });
	} catch {
		try {
			err.stack = input.stack;
		} catch {}
	}
	if (input.data) err.data = input.data;
	if (input.statusCode) err.statusCode = sanitizeStatusCode(input.statusCode, err.statusCode);
	else if (input.status) err.statusCode = sanitizeStatusCode(input.status, err.statusCode);
	if (input.statusMessage) err.statusMessage = input.statusMessage;
	else if (input.statusText) err.statusMessage = input.statusText;
	if (err.statusMessage) {
		const originalMessage = err.statusMessage;
		const sanitizedMessage = sanitizeStatusMessage(err.statusMessage);
		if (sanitizedMessage !== originalMessage) console.warn("[h3] Please prefer using `message` for longer error messages instead of `statusMessage`. In the future, `statusMessage` will be sanitized by default.");
	}
	if (input.fatal !== void 0) err.fatal = input.fatal;
	if (input.unhandled !== void 0) err.unhandled = input.unhandled;
	return err;
}
function isError(input) {
	return input?.constructor?.__h3_error__ === true;
}
function isMethod(event, expected, allowHead) {
	if (allowHead && event.method === "HEAD") return true;
	if (typeof expected === "string") {
		if (event.method === expected) return true;
	} else if (expected.includes(event.method)) return true;
	return false;
}
function assertMethod(event, expected, allowHead) {
	if (!isMethod(event, expected, allowHead)) throw createError({
		statusCode: 405,
		statusMessage: "HTTP method is not allowed."
	});
}
function getRequestHost(event, opts = {}) {
	if (opts.xForwardedHost) {
		const xForwardedHost = event.node.req.headers["x-forwarded-host"];
		if (xForwardedHost) return xForwardedHost;
	}
	return event.node.req.headers.host || "localhost";
}
function getRequestProtocol(event, opts = {}) {
	if (opts.xForwardedProto !== false && event.node.req.headers["x-forwarded-proto"] === "https") return "https";
	return event.node.req.connection?.encrypted ? "https" : "http";
}
function getRequestURL(event, opts = {}) {
	const host = getRequestHost(event, opts);
	const protocol = getRequestProtocol(event, opts);
	const path = (event.node.req.originalUrl || event.path).replace(/^[/\\]+/g, "/");
	return new URL(path, `${protocol}://${host}`);
}
function toWebRequest(event) {
	return event.web?.request || new Request(getRequestURL(event), {
		duplex: "half",
		method: event.method,
		headers: event.headers,
		body: getRequestWebStream(event)
	});
}
const RawBodySymbol = Symbol.for("h3RawBody");
const PayloadMethods$1 = [
	"PATCH",
	"POST",
	"PUT",
	"DELETE"
];
function readRawBody(event, encoding = "utf8") {
	assertMethod(event, PayloadMethods$1);
	const _rawBody = event._requestBody || event.web?.request?.body || event.node.req[RawBodySymbol] || event.node.req.rawBody || event.node.req.body;
	if (_rawBody) {
		const promise2 = Promise.resolve(_rawBody).then((_resolved) => {
			if (Buffer.isBuffer(_resolved)) return _resolved;
			if (typeof _resolved.pipeTo === "function") return new Promise((resolve, reject) => {
				const chunks = [];
				_resolved.pipeTo(new WritableStream({
					write(chunk) {
						chunks.push(chunk);
					},
					close() {
						resolve(Buffer.concat(chunks));
					},
					abort(reason) {
						reject(reason);
					}
				})).catch(reject);
			});
			else if (typeof _resolved.pipe === "function") return new Promise((resolve, reject) => {
				const chunks = [];
				_resolved.on("data", (chunk) => {
					chunks.push(chunk);
				}).on("end", () => {
					resolve(Buffer.concat(chunks));
				}).on("error", reject);
			});
			if (_resolved.constructor === Object) return Buffer.from(JSON.stringify(_resolved));
			if (_resolved instanceof URLSearchParams) return Buffer.from(_resolved.toString());
			return Buffer.from(_resolved);
		});
		return encoding ? promise2.then((buff) => buff.toString(encoding)) : promise2;
	}
	if (!Number.parseInt(event.node.req.headers["content-length"] || "") && !String(event.node.req.headers["transfer-encoding"] ?? "").split(",").map((e) => e.trim()).filter(Boolean).includes("chunked")) return Promise.resolve(void 0);
	const promise = event.node.req[RawBodySymbol] = new Promise((resolve, reject) => {
		const bodyData = [];
		event.node.req.on("error", (err) => {
			reject(err);
		}).on("data", (chunk) => {
			bodyData.push(chunk);
		}).on("end", () => {
			resolve(Buffer.concat(bodyData));
		});
	});
	const result = encoding ? promise.then((buff) => buff.toString(encoding)) : promise;
	return result;
}
function getRequestWebStream(event) {
	if (!PayloadMethods$1.includes(event.method)) return;
	const bodyStream = event.web?.request?.body || event._requestBody;
	if (bodyStream) return bodyStream;
	const _hasRawBody = RawBodySymbol in event.node.req || "rawBody" in event.node.req || "body" in event.node.req || "__unenv__" in event.node.req;
	if (_hasRawBody) return new ReadableStream({ async start(controller) {
		const _rawBody = await readRawBody(event, false);
		if (_rawBody) controller.enqueue(_rawBody);
		controller.close();
	} });
	return new ReadableStream({ start: (controller) => {
		event.node.req.on("data", (chunk) => {
			controller.enqueue(chunk);
		});
		event.node.req.on("end", () => {
			controller.close();
		});
		event.node.req.on("error", (err) => {
			controller.error(err);
		});
	} });
}
const DISALLOWED_STATUS_CHARS = /[^\u0009\u0020-\u007E]/g;
function sanitizeStatusMessage(statusMessage = "") {
	return statusMessage.replace(DISALLOWED_STATUS_CHARS, "");
}
function sanitizeStatusCode(statusCode, defaultStatusCode = 200) {
	if (!statusCode) return defaultStatusCode;
	if (typeof statusCode === "string") statusCode = Number.parseInt(statusCode, 10);
	if (statusCode < 100 || statusCode > 999) return defaultStatusCode;
	return statusCode;
}
function splitCookiesString(cookiesString) {
	if (Array.isArray(cookiesString)) return cookiesString.flatMap((c$1) => splitCookiesString(c$1));
	if (typeof cookiesString !== "string") return [];
	const cookiesStrings = [];
	let pos = 0;
	let start;
	let ch;
	let lastComma;
	let nextStart;
	let cookiesSeparatorFound;
	const skipWhitespace = () => {
		while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))) pos += 1;
		return pos < cookiesString.length;
	};
	const notSpecialChar = () => {
		ch = cookiesString.charAt(pos);
		return ch !== "=" && ch !== ";" && ch !== ",";
	};
	while (pos < cookiesString.length) {
		start = pos;
		cookiesSeparatorFound = false;
		while (skipWhitespace()) {
			ch = cookiesString.charAt(pos);
			if (ch === ",") {
				lastComma = pos;
				pos += 1;
				skipWhitespace();
				nextStart = pos;
				while (pos < cookiesString.length && notSpecialChar()) pos += 1;
				if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
					cookiesSeparatorFound = true;
					pos = nextStart;
					cookiesStrings.push(cookiesString.slice(start, lastComma));
					start = pos;
				} else pos = lastComma + 1;
			} else pos += 1;
		}
		if (!cookiesSeparatorFound || pos >= cookiesString.length) cookiesStrings.push(cookiesString.slice(start));
	}
	return cookiesStrings;
}
typeof setImmediate === "undefined" ? (fn) => fn() : setImmediate;
function getResponseStatus$1(event) {
	return event.node.res.statusCode;
}
function getResponseHeaders$1(event) {
	return event.node.res.getHeaders();
}
function sendStream(event, stream) {
	if (!stream || typeof stream !== "object") throw new Error("[h3] Invalid stream provided.");
	event.node.res._data = stream;
	if (!event.node.res.socket) {
		event._handled = true;
		return Promise.resolve();
	}
	if (hasProp(stream, "pipeTo") && typeof stream.pipeTo === "function") return stream.pipeTo(new WritableStream({ write(chunk) {
		event.node.res.write(chunk);
	} })).then(() => {
		event.node.res.end();
	});
	if (hasProp(stream, "pipe") && typeof stream.pipe === "function") return new Promise((resolve, reject) => {
		stream.pipe(event.node.res);
		if (stream.on) {
			stream.on("end", () => {
				event.node.res.end();
				resolve();
			});
			stream.on("error", (error) => {
				reject(error);
			});
		}
		event.node.res.on("close", () => {
			if (stream.abort) stream.abort();
		});
	});
	throw new Error("[h3] Invalid or incompatible stream provided.");
}
function sendWebResponse(event, response) {
	for (const [key, value] of response.headers) if (key === "set-cookie") event.node.res.appendHeader(key, splitCookiesString(value));
	else event.node.res.setHeader(key, value);
	if (response.status) event.node.res.statusCode = sanitizeStatusCode(response.status, event.node.res.statusCode);
	if (response.statusText) event.node.res.statusMessage = sanitizeStatusMessage(response.statusText);
	if (response.redirected) event.node.res.setHeader("location", response.url);
	if (!response.body) {
		event.node.res.end();
		return;
	}
	return sendStream(event, response.body);
}
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, {
	enumerable: true,
	configurable: true,
	writable: true,
	value
}) : obj[key] = value;
var __publicField = (obj, key, value) => {
	__defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
	return value;
};
var H3Event = class {
	constructor(req, res) {
		__publicField(this, "__is_event__", true);
		__publicField(this, "node");
		__publicField(this, "web");
		__publicField(this, "context", {});
		__publicField(this, "_method");
		__publicField(this, "_path");
		__publicField(this, "_headers");
		__publicField(this, "_requestBody");
		__publicField(this, "_handled", false);
		__publicField(this, "_onBeforeResponseCalled");
		__publicField(this, "_onAfterResponseCalled");
		this.node = {
			req,
			res
		};
	}
	get method() {
		if (!this._method) this._method = (this.node.req.method || "GET").toUpperCase();
		return this._method;
	}
	get path() {
		return this._path || this.node.req.url || "/";
	}
	get headers() {
		if (!this._headers) this._headers = _normalizeNodeHeaders(this.node.req.headers);
		return this._headers;
	}
	get handled() {
		return this._handled || this.node.res.writableEnded || this.node.res.headersSent;
	}
	respondWith(response) {
		return Promise.resolve(response).then((_response) => sendWebResponse(this, _response));
	}
	toString() {
		return `[${this.method}] ${this.path}`;
	}
	toJSON() {
		return this.toString();
	}
	get req() {
		return this.node.req;
	}
	get res() {
		return this.node.res;
	}
};
function _normalizeNodeHeaders(nodeHeaders) {
	const headers = new Headers();
	for (const [name, value] of Object.entries(nodeHeaders)) if (Array.isArray(value)) for (const item of value) headers.append(name, item);
	else if (value) headers.set(name, value);
	return headers;
}
function defineEventHandler$1(handler) {
	if (typeof handler === "function") {
		handler.__is_handler__ = true;
		return handler;
	}
	const _hooks = {
		onRequest: _normalizeArray(handler.onRequest),
		onBeforeResponse: _normalizeArray(handler.onBeforeResponse)
	};
	const _handler = (event) => {
		return _callHandler(event, handler.handler, _hooks);
	};
	_handler.__is_handler__ = true;
	_handler.__resolve__ = handler.handler.__resolve__;
	_handler.__websocket__ = handler.websocket;
	return _handler;
}
function _normalizeArray(input) {
	return input ? Array.isArray(input) ? input : [input] : void 0;
}
async function _callHandler(event, handler, hooks) {
	if (hooks.onRequest) for (const hook of hooks.onRequest) {
		await hook(event);
		if (event.handled) return;
	}
	const body = await handler(event);
	const response = { body };
	if (hooks.onBeforeResponse) for (const hook of hooks.onBeforeResponse) await hook(event, response);
	return response.body;
}
const eventStorage = new AsyncLocalStorage();
function defineEventHandler(handler) {
	return defineEventHandler$1((event) => {
		return runWithEvent(event, () => handler(event));
	});
}
async function runWithEvent(event, fn) {
	return eventStorage.run(event, fn);
}
function getEvent() {
	const event = eventStorage.getStore();
	if (!event) throw new Error(`No HTTPEvent found in AsyncLocalStorage. Make sure you are using the function within the server runtime.`);
	return event;
}
const HTTPEventSymbol = Symbol("$HTTPEvent");
function isEvent(obj) {
	return typeof obj === "object" && (obj instanceof H3Event || (obj == null ? void 0 : obj[HTTPEventSymbol]) instanceof H3Event || (obj == null ? void 0 : obj.__is_event__) === true);
}
function createWrapperFunction(h3Function) {
	return function(...args) {
		const event = args[0];
		if (!isEvent(event)) args.unshift(getEvent());
		else args[0] = event instanceof H3Event || event.__is_event__ ? event : event[HTTPEventSymbol];
		return h3Function(...args);
	};
}
const getResponseStatus = createWrapperFunction(getResponseStatus$1);
const getResponseHeaders = createWrapperFunction(getResponseHeaders$1);
function requestHandler(handler) {
	return handler;
}
const VIRTUAL_MODULES = {
	routeTree: "tanstack-start-route-tree:v",
	startManifest: "tanstack-start-manifest:v",
	serverFnManifest: "tanstack-start-server-fn-manifest:v"
};
async function loadVirtualModule(id) {
	switch (id) {
		case VIRTUAL_MODULES.routeTree: return await Promise.resolve().then(function () { return routeTree_genDrF7tQRx; });
		case VIRTUAL_MODULES.startManifest: return await import('./_tanstack-start-manifest_v-CClLoxFH.mjs');
		case VIRTUAL_MODULES.serverFnManifest: return await import('./_tanstack-start-server-fn-manifest_v-BPdJ30aI.mjs');
		default: throw new Error(`Unknown virtual module: ${id}`);
	}
}
async function getStartManifest(opts) {
	const { tsrStartManifest } = await loadVirtualModule(VIRTUAL_MODULES.startManifest);
	const startManifest = tsrStartManifest();
	const rootRoute = startManifest.routes[rootRouteId] = startManifest.routes[rootRouteId] || {};
	rootRoute.assets = rootRoute.assets || [];
	let script = `import('${startManifest.clientEntry}')`;
	rootRoute.assets.push({
		tag: "script",
		attrs: {
			type: "module",
			suppressHydrationWarning: true,
			async: true
		},
		children: script
	});
	const manifest = {
		...startManifest,
		routes: Object.fromEntries(Object.entries(startManifest.routes).map(([k, v$1]) => {
			const { preloads, assets } = v$1;
			return [k, {
				preloads,
				assets
			}];
		}))
	};
	return manifest;
}
function sanitizeBase$1(base) {
	return base.replace(/^\/|\/$/g, "");
}
const handleServerAction = async ({ request }) => {
	const controller = new AbortController();
	const signal = controller.signal;
	const abort = () => controller.abort();
	request.signal.addEventListener("abort", abort);
	const method = request.method;
	const url = new URL(request.url, "http://localhost:3000");
	const regex = /* @__PURE__ */ new RegExp(`${sanitizeBase$1("/_serverFn")}/([^/?#]+)`);
	const match = url.pathname.match(regex);
	const serverFnId = match ? match[1] : null;
	const search = Object.fromEntries(url.searchParams.entries());
	const isCreateServerFn = "createServerFn" in search;
	const isRaw = "raw" in search;
	if (typeof serverFnId !== "string") throw new Error("Invalid server action param for serverFnId: " + serverFnId);
	const { default: serverFnManifest } = await loadVirtualModule(VIRTUAL_MODULES.serverFnManifest);
	const serverFnInfo = serverFnManifest[serverFnId];
	if (!serverFnInfo) {
		console.info("serverFnManifest", serverFnManifest);
		throw new Error("Server function info not found for " + serverFnId);
	}
	const fnModule = await serverFnInfo.importer();
	if (!fnModule) {
		console.info("serverFnInfo", serverFnInfo);
		throw new Error("Server function module not resolved for " + serverFnId);
	}
	const action = fnModule[serverFnInfo.functionName];
	if (!action) {
		console.info("serverFnInfo", serverFnInfo);
		console.info("fnModule", fnModule);
		throw new Error(`Server function module export not resolved for serverFn ID: ${serverFnId}`);
	}
	const formDataContentTypes = ["multipart/form-data", "application/x-www-form-urlencoded"];
	const response = await (async () => {
		try {
			let result = await (async () => {
				if (request.headers.get("Content-Type") && formDataContentTypes.some((type) => {
					var _a;
					return (_a = request.headers.get("Content-Type")) == null ? void 0 : _a.includes(type);
				})) {
					invariant(method.toLowerCase() !== "get", "GET requests with FormData payloads are not supported");
					return await action(await request.formData(), signal);
				}
				if (method.toLowerCase() === "get") {
					let payload2 = search;
					if (isCreateServerFn) payload2 = search.payload;
					payload2 = payload2 ? startSerializer.parse(payload2) : payload2;
					return await action(payload2, signal);
				}
				const jsonPayloadAsString = await request.text();
				const payload = startSerializer.parse(jsonPayloadAsString);
				if (isCreateServerFn) return await action(payload, signal);
				return await action(...payload, signal);
			})();
			if (result.result instanceof Response) return result.result;
			if (!isCreateServerFn) {
				result = result.result;
				if (result instanceof Response) return result;
			}
			if (isNotFound(result)) return isNotFoundResponse(result);
			return new Response(result !== void 0 ? startSerializer.stringify(result) : void 0, {
				status: getResponseStatus(getEvent()),
				headers: { "Content-Type": "application/json" }
			});
		} catch (error) {
			if (error instanceof Response) return error;
			if (isNotFound(error)) return isNotFoundResponse(error);
			console.info();
			console.info("Server Fn Error!");
			console.info();
			console.error(error);
			console.info();
			return new Response(startSerializer.stringify(error), {
				status: 500,
				headers: { "Content-Type": "application/json" }
			});
		}
	})();
	request.signal.removeEventListener("abort", abort);
	if (isRaw) return response;
	return response;
};
function isNotFoundResponse(error) {
	const { headers,...rest } = error;
	return new Response(JSON.stringify(rest), {
		status: 200,
		headers: {
			"Content-Type": "application/json",
			...headers || {}
		}
	});
}
function getStartResponseHeaders(opts) {
	const headers = mergeHeaders(getResponseHeaders(), { "Content-Type": "text/html; charset=UTF-8" }, ...opts.router.state.matches.map((match) => {
		return match.headers;
	}));
	return headers;
}
function createStartHandler({ createRouter: createRouter$2 }) {
	let routeTreeModule = null;
	let startRoutesManifest = null;
	let processedServerRouteTree = void 0;
	return (cb) => {
		const originalFetch = globalThis.fetch;
		const startRequestResolver = async ({ request }) => {
			globalThis.fetch = async function(input, init) {
				function resolve(url2, requestOptions) {
					const fetchRequest = new Request(url2, requestOptions);
					return startRequestResolver({ request: fetchRequest });
				}
				function getOrigin() {
					return request.headers.get("Origin") || request.headers.get("Referer") || "http://localhost";
				}
				if (typeof input === "string" && input.startsWith("/")) {
					const url2 = new URL(input, getOrigin());
					return resolve(url2, init);
				} else if (typeof input === "object" && "url" in input && typeof input.url === "string" && input.url.startsWith("/")) {
					const url2 = new URL(input.url, getOrigin());
					return resolve(url2, init);
				}
				return originalFetch(input, init);
			};
			const url = new URL(request.url);
			const href = decodeURIComponent(url.href.replace(url.origin, ""));
			const APP_BASE = "/";
			const router = await createRouter$2();
			const history = createMemoryHistory({ initialEntries: [href] });
			router.update({
				history,
				isShell: false
			});
			const response = await (async () => {
				try {
					const serverFnBase = joinPaths([
						APP_BASE,
						trimPath("/_serverFn"),
						"/"
					]);
					if (href.startsWith(serverFnBase)) return await handleServerAction({ request });
					if (routeTreeModule === null) try {
						routeTreeModule = await loadVirtualModule(VIRTUAL_MODULES.routeTree);
						if (routeTreeModule.serverRouteTree) processedServerRouteTree = processRouteTree({
							routeTree: routeTreeModule.serverRouteTree,
							initRoute: (route, i$1) => {
								route.init({ originalIndex: i$1 });
							}
						});
					} catch (e) {
						console.log(e);
					}
					const executeRouter = () => runWithStartContext({ router }, async () => {
						const requestAcceptHeader = request.headers.get("Accept") || "*/*";
						const splitRequestAcceptHeader = requestAcceptHeader.split(",");
						const supportedMimeTypes = ["*/*", "text/html"];
						const isRouterAcceptSupported = supportedMimeTypes.some((mimeType) => splitRequestAcceptHeader.some((acceptedMimeType) => acceptedMimeType.trim().startsWith(mimeType)));
						if (!isRouterAcceptSupported) return json({ error: "Only HTML requests are supported here" }, { status: 500 });
						if (startRoutesManifest === null) startRoutesManifest = await getStartManifest({ basePath: APP_BASE });
						attachRouterServerSsrUtils(router, startRoutesManifest);
						await router.load();
						if (router.state.redirect) return router.state.redirect;
						await router.serverSsr.dehydrate();
						const responseHeaders = getStartResponseHeaders({ router });
						const response2 = await cb({
							request,
							router,
							responseHeaders
						});
						return response2;
					});
					if (processedServerRouteTree) {
						const [_matchedRoutes, response2] = await handleServerRoutes({
							processedServerRouteTree,
							router,
							request,
							basePath: APP_BASE,
							executeRouter
						});
						if (response2) return response2;
					}
					const routerResponse = await executeRouter();
					return routerResponse;
				} catch (err) {
					if (err instanceof Response) return err;
					throw err;
				}
			})();
			if (isRedirect(response)) {
				if (isResolvedRedirect(response)) {
					if (request.headers.get("x-tsr-redirect") === "manual") return json({
						...response.options,
						isSerializedRedirect: true
					}, { headers: response.headers });
					return response;
				}
				if (response.options.to && typeof response.options.to === "string" && !response.options.to.startsWith("/")) throw new Error(`Server side redirects must use absolute paths via the 'href' or 'to' options. Received: ${JSON.stringify(response.options)}`);
				if ([
					"params",
					"search",
					"hash"
				].some((d$1) => typeof response.options[d$1] === "function")) throw new Error(`Server side redirects must use static search, params, and hash values and do not support functional values. Received functional values for: ${Object.keys(response.options).filter((d$1) => typeof response.options[d$1] === "function").map((d$1) => `"${d$1}"`).join(", ")}`);
				const redirect = router.resolveRedirect(response);
				if (request.headers.get("x-tsr-redirect") === "manual") return json({
					...response.options,
					isSerializedRedirect: true
				}, { headers: response.headers });
				return redirect;
			}
			return response;
		};
		return requestHandler(startRequestResolver);
	};
}
async function handleServerRoutes(opts) {
	var _a, _b;
	const url = new URL(opts.request.url);
	const pathname = url.pathname;
	const serverTreeResult = getMatchedRoutes({
		pathname,
		basepath: opts.basePath,
		caseSensitive: true,
		routesByPath: opts.processedServerRouteTree.routesByPath,
		routesById: opts.processedServerRouteTree.routesById,
		flatRoutes: opts.processedServerRouteTree.flatRoutes
	});
	const routeTreeResult = opts.router.getMatchedRoutes(pathname, void 0);
	let response;
	let matchedRoutes = [];
	matchedRoutes = serverTreeResult.matchedRoutes;
	if (routeTreeResult.foundRoute) {
		if (serverTreeResult.matchedRoutes.length < routeTreeResult.matchedRoutes.length) {
			const closestCommon = [...routeTreeResult.matchedRoutes].reverse().find((r$1) => {
				return opts.processedServerRouteTree.routesById[r$1.id] !== void 0;
			});
			if (closestCommon) {
				let routeId = closestCommon.id;
				matchedRoutes = [];
				do {
					const route = opts.processedServerRouteTree.routesById[routeId];
					if (!route) break;
					matchedRoutes.push(route);
					routeId = (_a = route.parentRoute) == null ? void 0 : _a.id;
				} while (routeId);
				matchedRoutes.reverse();
			}
		}
	}
	if (matchedRoutes.length) {
		const middlewares = flattenMiddlewares(matchedRoutes.flatMap((r$1) => r$1.options.middleware).filter(Boolean)).map((d$1) => d$1.options.server);
		if ((_b = serverTreeResult.foundRoute) == null ? void 0 : _b.options.methods) {
			const method = Object.keys(serverTreeResult.foundRoute.options.methods).find((method2) => method2.toLowerCase() === opts.request.method.toLowerCase());
			if (method) {
				const handler = serverTreeResult.foundRoute.options.methods[method];
				if (handler) if (typeof handler === "function") middlewares.push(handlerToMiddleware(handler));
				else {
					if (handler._options.middlewares && handler._options.middlewares.length) middlewares.push(...flattenMiddlewares(handler._options.middlewares).map((d$1) => d$1.options.server));
					if (handler._options.handler) middlewares.push(handlerToMiddleware(handler._options.handler));
				}
			}
		}
		middlewares.push(handlerToMiddleware(opts.executeRouter));
		const ctx = await executeMiddleware(middlewares, {
			request: opts.request,
			context: {},
			params: serverTreeResult.routeParams,
			pathname
		});
		response = ctx.response;
	}
	return [matchedRoutes, response];
}
function handlerToMiddleware(handler) {
	return async ({ next: _next,...rest }) => {
		const response = await handler(rest);
		if (response) return { response };
		return _next(rest);
	};
}
function executeMiddleware(middlewares, ctx) {
	let index = -1;
	const next = async (ctx2) => {
		index++;
		const middleware = middlewares[index];
		if (!middleware) return ctx2;
		const result = await middleware({
			...ctx2,
			next: async (nextCtx) => {
				const nextResult = await next({
					...ctx2,
					...nextCtx,
					context: {
						...ctx2.context,
						...(nextCtx == null ? void 0 : nextCtx.context) || {}
					}
				});
				return Object.assign(ctx2, handleCtxResult(nextResult));
			}
		}).catch((err) => {
			if (isSpecialResponse(err)) return { response: err };
			throw err;
		});
		return Object.assign(ctx2, handleCtxResult(result));
	};
	return handleCtxResult(next(ctx));
}
function handleCtxResult(result) {
	if (isSpecialResponse(result)) return { response: result };
	return result;
}
function isSpecialResponse(err) {
	return isResponse(err) || isRedirect(err);
}
function isResponse(response) {
	return response instanceof Response;
}
var global_default = "/assets/global-CCJ6cQPh.css";
const Route = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "TanStack Start Starter" }
		],
		links: [{
			rel: "stylesheet",
			href: global_default
		}]
	}),
	component: RootComponent
});
function RootComponent() {
	return /* @__PURE__ */ jsx(RootDocument, { children: /* @__PURE__ */ jsx(Outlet, {}) });
}
function RootDocument({ children }) {
	return /* @__PURE__ */ jsxs("html", { children: [/* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }), /* @__PURE__ */ jsxs("body", { children: [children, /* @__PURE__ */ jsx(Scripts, {})] })] });
}
function sanitizeBase(base) {
	return base.replace(/^\/|\/$/g, "");
}
const createServerRpc = (functionId, serverBase, splitImportFn) => {
	invariant(splitImportFn);
	const sanitizedAppBase = sanitizeBase("/");
	const sanitizedServerBase = sanitizeBase(serverBase);
	const url = `${sanitizedAppBase ? `/${sanitizedAppBase}` : ``}/${sanitizedServerBase}/${functionId}`;
	return Object.assign(splitImportFn, {
		url,
		functionId
	});
};
const $$splitComponentImporter = () => import('./routes-8BAS2Z9z.mjs');
const filePath = "count.txt";
async function readCount() {
	return parseInt(await fs.promises.readFile(filePath, "utf-8").catch(() => "0"));
}
const getCount_createServerFn_handler = createServerRpc("src_routes_index_tsx--getCount_createServerFn_handler", "/_serverFn", (opts, signal) => {
	return getCount.__executeServer(opts, signal);
});
const getCount = createServerFn({ method: "GET" }).handler(getCount_createServerFn_handler, () => {
	return readCount();
});
const Route$1 = createFileRoute("/")({
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	loader: async () => await getCount()
});
const IndexRoute = Route$1.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route
});
const rootRouteChildren = { IndexRoute };
const routeTree = Route._addFileChildren(rootRouteChildren)._addFileTypes();
function createRouter$1() {
	const router = createRouter({
		routeTree,
		scrollRestoration: true,
		defaultNotFoundComponent: () => /* @__PURE__ */ jsx("div", { children: "Not Found" })
	});
	return router;
}
var default_server_entry_default = createStartHandler({ createRouter: createRouter$1 })(defaultStreamHandler);
var server_entry_default = defineEventHandler(function(event) {
	const request = toWebRequest(event);
	return default_server_entry_default({ request });
});

const routeTree_genDrF7tQRx = /*#__PURE__*/Object.freeze({
	__proto__: null,
	routeTree: routeTree
});

export { routeTree as b, Route$1 as c, createServerRpc as d, server_entry_default as default, createServerFn as e };
//# sourceMappingURL=ssr.mjs.map
