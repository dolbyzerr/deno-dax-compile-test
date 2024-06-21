// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

const { Deno: Deno1 } = globalThis;
const noColor = typeof Deno1?.noColor === "boolean" ? Deno1.noColor : false;
let enabled = !noColor;
function code(open, close) {
    return {
        open: `\x1b[${open.join(";")}m`,
        close: `\x1b[${close}m`,
        regexp: new RegExp(`\\x1b\\[${close}m`, "g")
    };
}
function run(str, code) {
    return enabled ? `${code.open}${str.replace(code.regexp, code.open)}${code.close}` : str;
}
function bold(str) {
    return run(str, code([
        1
    ], 22));
}
function italic(str) {
    return run(str, code([
        3
    ], 23));
}
function red(str) {
    return run(str, code([
        31
    ], 39));
}
function green(str) {
    return run(str, code([
        32
    ], 39));
}
function yellow(str) {
    return run(str, code([
        33
    ], 39));
}
function blue(str) {
    return run(str, code([
        34
    ], 39));
}
function cyan(str) {
    return run(str, code([
        36
    ], 39));
}
function white(str) {
    return run(str, code([
        37
    ], 39));
}
function gray(str) {
    return brightBlack(str);
}
function brightBlack(str) {
    return run(str, code([
        90
    ], 39));
}
new RegExp([
    "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
    "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TXZcf-nq-uy=><~]))"
].join("|"), "g");
class RealEnvironment {
    env(key) {
        return Deno.env.get(key);
    }
    stat(path) {
        return Deno.stat(path);
    }
    statSync(path) {
        return Deno.statSync(path);
    }
    get os() {
        return Deno.build.os;
    }
}
async function which(command, environment = new RealEnvironment()) {
    const systemInfo = getSystemInfo(command, environment);
    if (systemInfo == null) {
        return undefined;
    }
    for (const pathItem of systemInfo.pathItems){
        const filePath = pathItem + command;
        if (systemInfo.pathExts) {
            environment.requestPermission?.(pathItem);
            for (const pathExt of systemInfo.pathExts){
                const filePath = pathItem + command + pathExt;
                if (await pathMatches(environment, filePath)) {
                    return filePath;
                }
            }
        } else if (await pathMatches(environment, filePath)) {
            return filePath;
        }
    }
    return undefined;
}
async function pathMatches(environment, path) {
    try {
        const result = await environment.stat(path);
        return result.isFile;
    } catch (err) {
        if (err instanceof Deno.errors.PermissionDenied) {
            throw err;
        }
        return false;
    }
}
function whichSync(command, environment = new RealEnvironment()) {
    const systemInfo = getSystemInfo(command, environment);
    if (systemInfo == null) {
        return undefined;
    }
    for (const pathItem of systemInfo.pathItems){
        const filePath = pathItem + command;
        if (systemInfo.pathExts) {
            environment.requestPermission?.(pathItem);
            for (const pathExt of systemInfo.pathExts){
                const filePath = pathItem + command + pathExt;
                if (pathMatchesSync(environment, filePath)) {
                    return filePath;
                }
            }
        } else if (pathMatchesSync(environment, filePath)) {
            return filePath;
        }
    }
    return undefined;
}
function pathMatchesSync(environment, path) {
    try {
        const result = environment.statSync(path);
        return result.isFile;
    } catch (err) {
        if (err instanceof Deno.errors.PermissionDenied) {
            throw err;
        }
        return false;
    }
}
function getSystemInfo(command, environment) {
    const isWindows = environment.os === "windows";
    const envValueSeparator = isWindows ? ";" : ":";
    const path = environment.env("PATH");
    const pathSeparator = isWindows ? "\\" : "/";
    if (path == null) {
        return undefined;
    }
    return {
        pathItems: splitEnvValue(path).map((item)=>normalizeDir(item)),
        pathExts: getPathExts(),
        isNameMatch: isWindows ? (a, b)=>a.toLowerCase() === b.toLowerCase() : (a, b)=>a === b
    };
    function getPathExts() {
        if (!isWindows) {
            return undefined;
        }
        const pathExtText = environment.env("PATHEXT") ?? ".EXE;.CMD;.BAT;.COM";
        const pathExts = splitEnvValue(pathExtText);
        const lowerCaseCommand = command.toLowerCase();
        for (const pathExt of pathExts){
            if (lowerCaseCommand.endsWith(pathExt.toLowerCase())) {
                return undefined;
            }
        }
        return pathExts;
    }
    function splitEnvValue(value1) {
        return value1.split(envValueSeparator).map((item)=>item.trim()).filter((item)=>item.length > 0);
    }
    function normalizeDir(dirPath) {
        if (!dirPath.endsWith(pathSeparator)) {
            dirPath += pathSeparator;
        }
        return dirPath;
    }
}
class AssertionError extends Error {
    constructor(message){
        super(message);
        this.name = "AssertionError";
    }
}
function assert(expr, msg = "") {
    if (!expr) {
        throw new AssertionError(msg);
    }
}
function copy(src, dst, off = 0) {
    off = Math.max(0, Math.min(off, dst.byteLength));
    const dstBytesAvailable = dst.byteLength - off;
    if (src.byteLength > dstBytesAvailable) {
        src = src.subarray(0, dstBytesAvailable);
    }
    dst.set(src, off);
    return src.byteLength;
}
const MIN_READ = 32 * 1024;
const MAX_SIZE = 2 ** 32 - 2;
class Buffer {
    #buf;
    #off = 0;
    constructor(ab){
        this.#buf = ab === undefined ? new Uint8Array(0) : new Uint8Array(ab);
    }
    bytes(options = {
        copy: true
    }) {
        if (options.copy === false) return this.#buf.subarray(this.#off);
        return this.#buf.slice(this.#off);
    }
    empty() {
        return this.#buf.byteLength <= this.#off;
    }
    get length() {
        return this.#buf.byteLength - this.#off;
    }
    get capacity() {
        return this.#buf.buffer.byteLength;
    }
    truncate(n) {
        if (n === 0) {
            this.reset();
            return;
        }
        if (n < 0 || n > this.length) {
            throw Error("bytes.Buffer: truncation out of range");
        }
        this.#reslice(this.#off + n);
    }
    reset() {
        this.#reslice(0);
        this.#off = 0;
    }
    #tryGrowByReslice(n) {
        const l = this.#buf.byteLength;
        if (n <= this.capacity - l) {
            this.#reslice(l + n);
            return l;
        }
        return -1;
    }
    #reslice(len) {
        assert(len <= this.#buf.buffer.byteLength);
        this.#buf = new Uint8Array(this.#buf.buffer, 0, len);
    }
    readSync(p) {
        if (this.empty()) {
            this.reset();
            if (p.byteLength === 0) {
                return 0;
            }
            return null;
        }
        const nread = copy(this.#buf.subarray(this.#off), p);
        this.#off += nread;
        return nread;
    }
    read(p) {
        const rr = this.readSync(p);
        return Promise.resolve(rr);
    }
    writeSync(p) {
        const m = this.#grow(p.byteLength);
        return copy(p, this.#buf, m);
    }
    write(p) {
        const n = this.writeSync(p);
        return Promise.resolve(n);
    }
    #grow(n) {
        const m = this.length;
        if (m === 0 && this.#off !== 0) {
            this.reset();
        }
        const i = this.#tryGrowByReslice(n);
        if (i >= 0) {
            return i;
        }
        const c = this.capacity;
        if (n <= Math.floor(c / 2) - m) {
            copy(this.#buf.subarray(this.#off), this.#buf);
        } else if (c + n > MAX_SIZE) {
            throw new Error("The buffer cannot be grown beyond the maximum size.");
        } else {
            const buf = new Uint8Array(Math.min(2 * c + n, MAX_SIZE));
            copy(this.#buf.subarray(this.#off), buf);
            this.#buf = buf;
        }
        this.#off = 0;
        this.#reslice(Math.min(m + n, MAX_SIZE));
        return m;
    }
    grow(n) {
        if (n < 0) {
            throw Error("Buffer.grow: negative count");
        }
        const m = this.#grow(n);
        this.#reslice(m);
    }
    async readFrom(r) {
        let n = 0;
        const tmp = new Uint8Array(MIN_READ);
        while(true){
            const shouldGrow = this.capacity - this.length < MIN_READ;
            const buf = shouldGrow ? tmp : new Uint8Array(this.#buf.buffer, this.length);
            const nread = await r.read(buf);
            if (nread === null) {
                return n;
            }
            if (shouldGrow) this.writeSync(buf.subarray(0, nread));
            else this.#reslice(this.length + nread);
            n += nread;
        }
    }
    readFromSync(r) {
        let n = 0;
        const tmp = new Uint8Array(MIN_READ);
        while(true){
            const shouldGrow = this.capacity - this.length < MIN_READ;
            const buf = shouldGrow ? tmp : new Uint8Array(this.#buf.buffer, this.length);
            const nread = r.readSync(buf);
            if (nread === null) {
                return n;
            }
            if (shouldGrow) this.writeSync(buf.subarray(0, nread));
            else this.#reslice(this.length + nread);
            n += nread;
        }
    }
}
function assertPath(path) {
    if (typeof path !== "string") {
        throw new TypeError(`Path must be a string. Received ${JSON.stringify(path)}`);
    }
}
function stripSuffix(name, suffix) {
    if (suffix.length >= name.length) {
        return name;
    }
    const lenDiff = name.length - suffix.length;
    for(let i = suffix.length - 1; i >= 0; --i){
        if (name.charCodeAt(lenDiff + i) !== suffix.charCodeAt(i)) {
            return name;
        }
    }
    return name.slice(0, -suffix.length);
}
function lastPathSegment(path, isSep, start = 0) {
    let matchedNonSeparator = false;
    let end = path.length;
    for(let i = path.length - 1; i >= start; --i){
        if (isSep(path.charCodeAt(i))) {
            if (matchedNonSeparator) {
                start = i + 1;
                break;
            }
        } else if (!matchedNonSeparator) {
            matchedNonSeparator = true;
            end = i + 1;
        }
    }
    return path.slice(start, end);
}
function assertArgs(path, suffix) {
    assertPath(path);
    if (path.length === 0) return path;
    if (typeof suffix !== "string") {
        throw new TypeError(`Suffix must be a string. Received ${JSON.stringify(suffix)}`);
    }
}
const CHAR_FORWARD_SLASH = 47;
function stripTrailingSeparators(segment, isSep) {
    if (segment.length <= 1) {
        return segment;
    }
    let end = segment.length;
    for(let i = segment.length - 1; i > 0; i--){
        if (isSep(segment.charCodeAt(i))) {
            end = i;
        } else {
            break;
        }
    }
    return segment.slice(0, end);
}
function isPosixPathSeparator(code) {
    return code === 47;
}
function isPathSeparator(code) {
    return code === 47 || code === 92;
}
function isWindowsDeviceRoot(code) {
    return code >= 97 && code <= 122 || code >= 65 && code <= 90;
}
function basename(path, suffix = "") {
    assertArgs(path, suffix);
    let start = 0;
    if (path.length >= 2) {
        const drive = path.charCodeAt(0);
        if (isWindowsDeviceRoot(drive)) {
            if (path.charCodeAt(1) === 58) start = 2;
        }
    }
    const lastSegment = lastPathSegment(path, isPathSeparator, start);
    const strippedSegment = stripTrailingSeparators(lastSegment, isPathSeparator);
    return suffix ? stripSuffix(strippedSegment, suffix) : strippedSegment;
}
const SEPARATOR = "\\";
const SEPARATOR_PATTERN = /[\\/]+/;
function assertArg(path) {
    assertPath(path);
    if (path.length === 0) return ".";
}
function dirname(path) {
    assertArg(path);
    const len = path.length;
    let rootEnd = -1;
    let end = -1;
    let matchedSlash = true;
    let offset = 0;
    const code = path.charCodeAt(0);
    if (len > 1) {
        if (isPathSeparator(code)) {
            rootEnd = offset = 1;
            if (isPathSeparator(path.charCodeAt(1))) {
                let j = 2;
                let last = j;
                for(; j < len; ++j){
                    if (isPathSeparator(path.charCodeAt(j))) break;
                }
                if (j < len && j !== last) {
                    last = j;
                    for(; j < len; ++j){
                        if (!isPathSeparator(path.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        last = j;
                        for(; j < len; ++j){
                            if (isPathSeparator(path.charCodeAt(j))) break;
                        }
                        if (j === len) {
                            return path;
                        }
                        if (j !== last) {
                            rootEnd = offset = j + 1;
                        }
                    }
                }
            }
        } else if (isWindowsDeviceRoot(code)) {
            if (path.charCodeAt(1) === 58) {
                rootEnd = offset = 2;
                if (len > 2) {
                    if (isPathSeparator(path.charCodeAt(2))) rootEnd = offset = 3;
                }
            }
        }
    } else if (isPathSeparator(code)) {
        return path;
    }
    for(let i = len - 1; i >= offset; --i){
        if (isPathSeparator(path.charCodeAt(i))) {
            if (!matchedSlash) {
                end = i;
                break;
            }
        } else {
            matchedSlash = false;
        }
    }
    if (end === -1) {
        if (rootEnd === -1) return ".";
        else end = rootEnd;
    }
    return stripTrailingSeparators(path.slice(0, end), isPosixPathSeparator);
}
function extname(path) {
    assertPath(path);
    let start = 0;
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    let preDotState = 0;
    if (path.length >= 2 && path.charCodeAt(1) === 58 && isWindowsDeviceRoot(path.charCodeAt(0))) {
        start = startPart = 2;
    }
    for(let i = path.length - 1; i >= start; --i){
        const code = path.charCodeAt(i);
        if (isPathSeparator(code)) {
            if (!matchedSlash) {
                startPart = i + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i + 1;
        }
        if (code === 46) {
            if (startDot === -1) startDot = i;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        return "";
    }
    return path.slice(startDot, end);
}
function assertArg1(url) {
    url = url instanceof URL ? url : new URL(url);
    if (url.protocol !== "file:") {
        throw new TypeError("Must be a file URL.");
    }
    return url;
}
function fromFileUrl(url) {
    url = assertArg1(url);
    let path = decodeURIComponent(url.pathname.replace(/\//g, "\\").replace(/%(?![0-9A-Fa-f]{2})/g, "%25")).replace(/^\\*([A-Za-z]:)(\\|$)/, "$1\\");
    if (url.hostname !== "") {
        path = `\\\\${url.hostname}${path}`;
    }
    return path;
}
function isAbsolute(path) {
    assertPath(path);
    const len = path.length;
    if (len === 0) return false;
    const code = path.charCodeAt(0);
    if (isPathSeparator(code)) {
        return true;
    } else if (isWindowsDeviceRoot(code)) {
        if (len > 2 && path.charCodeAt(1) === 58) {
            if (isPathSeparator(path.charCodeAt(2))) return true;
        }
    }
    return false;
}
function assertArg2(path) {
    assertPath(path);
    if (path.length === 0) return ".";
}
function normalizeString(path, allowAboveRoot, separator, isPathSeparator) {
    let res = "";
    let lastSegmentLength = 0;
    let lastSlash = -1;
    let dots = 0;
    let code;
    for(let i = 0; i <= path.length; ++i){
        if (i < path.length) code = path.charCodeAt(i);
        else if (isPathSeparator(code)) break;
        else code = CHAR_FORWARD_SLASH;
        if (isPathSeparator(code)) {
            if (lastSlash === i - 1 || dots === 1) {} else if (lastSlash !== i - 1 && dots === 2) {
                if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 || res.charCodeAt(res.length - 2) !== 46) {
                    if (res.length > 2) {
                        const lastSlashIndex = res.lastIndexOf(separator);
                        if (lastSlashIndex === -1) {
                            res = "";
                            lastSegmentLength = 0;
                        } else {
                            res = res.slice(0, lastSlashIndex);
                            lastSegmentLength = res.length - 1 - res.lastIndexOf(separator);
                        }
                        lastSlash = i;
                        dots = 0;
                        continue;
                    } else if (res.length === 2 || res.length === 1) {
                        res = "";
                        lastSegmentLength = 0;
                        lastSlash = i;
                        dots = 0;
                        continue;
                    }
                }
                if (allowAboveRoot) {
                    if (res.length > 0) res += `${separator}..`;
                    else res = "..";
                    lastSegmentLength = 2;
                }
            } else {
                if (res.length > 0) res += separator + path.slice(lastSlash + 1, i);
                else res = path.slice(lastSlash + 1, i);
                lastSegmentLength = i - lastSlash - 1;
            }
            lastSlash = i;
            dots = 0;
        } else if (code === 46 && dots !== -1) {
            ++dots;
        } else {
            dots = -1;
        }
    }
    return res;
}
function normalize(path) {
    assertArg2(path);
    const len = path.length;
    let rootEnd = 0;
    let device;
    let isAbsolute = false;
    const code = path.charCodeAt(0);
    if (len > 1) {
        if (isPathSeparator(code)) {
            isAbsolute = true;
            if (isPathSeparator(path.charCodeAt(1))) {
                let j = 2;
                let last = j;
                for(; j < len; ++j){
                    if (isPathSeparator(path.charCodeAt(j))) break;
                }
                if (j < len && j !== last) {
                    const firstPart = path.slice(last, j);
                    last = j;
                    for(; j < len; ++j){
                        if (!isPathSeparator(path.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        last = j;
                        for(; j < len; ++j){
                            if (isPathSeparator(path.charCodeAt(j))) break;
                        }
                        if (j === len) {
                            return `\\\\${firstPart}\\${path.slice(last)}\\`;
                        } else if (j !== last) {
                            device = `\\\\${firstPart}\\${path.slice(last, j)}`;
                            rootEnd = j;
                        }
                    }
                }
            } else {
                rootEnd = 1;
            }
        } else if (isWindowsDeviceRoot(code)) {
            if (path.charCodeAt(1) === 58) {
                device = path.slice(0, 2);
                rootEnd = 2;
                if (len > 2) {
                    if (isPathSeparator(path.charCodeAt(2))) {
                        isAbsolute = true;
                        rootEnd = 3;
                    }
                }
            }
        }
    } else if (isPathSeparator(code)) {
        return "\\";
    }
    let tail;
    if (rootEnd < len) {
        tail = normalizeString(path.slice(rootEnd), !isAbsolute, "\\", isPathSeparator);
    } else {
        tail = "";
    }
    if (tail.length === 0 && !isAbsolute) tail = ".";
    if (tail.length > 0 && isPathSeparator(path.charCodeAt(len - 1))) {
        tail += "\\";
    }
    if (device === undefined) {
        if (isAbsolute) {
            if (tail.length > 0) return `\\${tail}`;
            else return "\\";
        } else if (tail.length > 0) {
            return tail;
        } else {
            return "";
        }
    } else if (isAbsolute) {
        if (tail.length > 0) return `${device}\\${tail}`;
        else return `${device}\\`;
    } else if (tail.length > 0) {
        return device + tail;
    } else {
        return device;
    }
}
function join(...paths) {
    if (paths.length === 0) return ".";
    let joined;
    let firstPart = null;
    for(let i = 0; i < paths.length; ++i){
        const path = paths[i];
        assertPath(path);
        if (path.length > 0) {
            if (joined === undefined) joined = firstPart = path;
            else joined += `\\${path}`;
        }
    }
    if (joined === undefined) return ".";
    let needsReplace = true;
    let slashCount = 0;
    assert(firstPart !== null);
    if (isPathSeparator(firstPart.charCodeAt(0))) {
        ++slashCount;
        const firstLen = firstPart.length;
        if (firstLen > 1) {
            if (isPathSeparator(firstPart.charCodeAt(1))) {
                ++slashCount;
                if (firstLen > 2) {
                    if (isPathSeparator(firstPart.charCodeAt(2))) ++slashCount;
                    else {
                        needsReplace = false;
                    }
                }
            }
        }
    }
    if (needsReplace) {
        for(; slashCount < joined.length; ++slashCount){
            if (!isPathSeparator(joined.charCodeAt(slashCount))) break;
        }
        if (slashCount >= 2) joined = `\\${joined.slice(slashCount)}`;
    }
    return normalize(joined);
}
function resolve(...pathSegments) {
    let resolvedDevice = "";
    let resolvedTail = "";
    let resolvedAbsolute = false;
    for(let i = pathSegments.length - 1; i >= -1; i--){
        let path;
        const { Deno: Deno1 } = globalThis;
        if (i >= 0) {
            path = pathSegments[i];
        } else if (!resolvedDevice) {
            if (typeof Deno1?.cwd !== "function") {
                throw new TypeError("Resolved a drive-letter-less path without a CWD.");
            }
            path = Deno1.cwd();
        } else {
            if (typeof Deno1?.env?.get !== "function" || typeof Deno1?.cwd !== "function") {
                throw new TypeError("Resolved a relative path without a CWD.");
            }
            path = Deno1.cwd();
            if (path === undefined || path.slice(0, 3).toLowerCase() !== `${resolvedDevice.toLowerCase()}\\`) {
                path = `${resolvedDevice}\\`;
            }
        }
        assertPath(path);
        const len = path.length;
        if (len === 0) continue;
        let rootEnd = 0;
        let device = "";
        let isAbsolute = false;
        const code = path.charCodeAt(0);
        if (len > 1) {
            if (isPathSeparator(code)) {
                isAbsolute = true;
                if (isPathSeparator(path.charCodeAt(1))) {
                    let j = 2;
                    let last = j;
                    for(; j < len; ++j){
                        if (isPathSeparator(path.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        const firstPart = path.slice(last, j);
                        last = j;
                        for(; j < len; ++j){
                            if (!isPathSeparator(path.charCodeAt(j))) break;
                        }
                        if (j < len && j !== last) {
                            last = j;
                            for(; j < len; ++j){
                                if (isPathSeparator(path.charCodeAt(j))) break;
                            }
                            if (j === len) {
                                device = `\\\\${firstPart}\\${path.slice(last)}`;
                                rootEnd = j;
                            } else if (j !== last) {
                                device = `\\\\${firstPart}\\${path.slice(last, j)}`;
                                rootEnd = j;
                            }
                        }
                    }
                } else {
                    rootEnd = 1;
                }
            } else if (isWindowsDeviceRoot(code)) {
                if (path.charCodeAt(1) === 58) {
                    device = path.slice(0, 2);
                    rootEnd = 2;
                    if (len > 2) {
                        if (isPathSeparator(path.charCodeAt(2))) {
                            isAbsolute = true;
                            rootEnd = 3;
                        }
                    }
                }
            }
        } else if (isPathSeparator(code)) {
            rootEnd = 1;
            isAbsolute = true;
        }
        if (device.length > 0 && resolvedDevice.length > 0 && device.toLowerCase() !== resolvedDevice.toLowerCase()) {
            continue;
        }
        if (resolvedDevice.length === 0 && device.length > 0) {
            resolvedDevice = device;
        }
        if (!resolvedAbsolute) {
            resolvedTail = `${path.slice(rootEnd)}\\${resolvedTail}`;
            resolvedAbsolute = isAbsolute;
        }
        if (resolvedAbsolute && resolvedDevice.length > 0) break;
    }
    resolvedTail = normalizeString(resolvedTail, !resolvedAbsolute, "\\", isPathSeparator);
    return resolvedDevice + (resolvedAbsolute ? "\\" : "") + resolvedTail || ".";
}
function assertArgs1(from, to) {
    assertPath(from);
    assertPath(to);
    if (from === to) return "";
}
function relative(from, to) {
    assertArgs1(from, to);
    const fromOrig = resolve(from);
    const toOrig = resolve(to);
    if (fromOrig === toOrig) return "";
    from = fromOrig.toLowerCase();
    to = toOrig.toLowerCase();
    if (from === to) return "";
    let fromStart = 0;
    let fromEnd = from.length;
    for(; fromStart < fromEnd; ++fromStart){
        if (from.charCodeAt(fromStart) !== 92) break;
    }
    for(; fromEnd - 1 > fromStart; --fromEnd){
        if (from.charCodeAt(fromEnd - 1) !== 92) break;
    }
    const fromLen = fromEnd - fromStart;
    let toStart = 0;
    let toEnd = to.length;
    for(; toStart < toEnd; ++toStart){
        if (to.charCodeAt(toStart) !== 92) break;
    }
    for(; toEnd - 1 > toStart; --toEnd){
        if (to.charCodeAt(toEnd - 1) !== 92) break;
    }
    const toLen = toEnd - toStart;
    const length = fromLen < toLen ? fromLen : toLen;
    let lastCommonSep = -1;
    let i = 0;
    for(; i <= length; ++i){
        if (i === length) {
            if (toLen > length) {
                if (to.charCodeAt(toStart + i) === 92) {
                    return toOrig.slice(toStart + i + 1);
                } else if (i === 2) {
                    return toOrig.slice(toStart + i);
                }
            }
            if (fromLen > length) {
                if (from.charCodeAt(fromStart + i) === 92) {
                    lastCommonSep = i;
                } else if (i === 2) {
                    lastCommonSep = 3;
                }
            }
            break;
        }
        const fromCode = from.charCodeAt(fromStart + i);
        const toCode = to.charCodeAt(toStart + i);
        if (fromCode !== toCode) break;
        else if (fromCode === 92) lastCommonSep = i;
    }
    if (i !== length && lastCommonSep === -1) {
        return toOrig;
    }
    let out = "";
    if (lastCommonSep === -1) lastCommonSep = 0;
    for(i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i){
        if (i === fromEnd || from.charCodeAt(i) === 92) {
            if (out.length === 0) out += "..";
            else out += "\\..";
        }
    }
    if (out.length > 0) {
        return out + toOrig.slice(toStart + lastCommonSep, toEnd);
    } else {
        toStart += lastCommonSep;
        if (toOrig.charCodeAt(toStart) === 92) ++toStart;
        return toOrig.slice(toStart, toEnd);
    }
}
const WHITESPACE_ENCODINGS = {
    "\u0009": "%09",
    "\u000A": "%0A",
    "\u000B": "%0B",
    "\u000C": "%0C",
    "\u000D": "%0D",
    "\u0020": "%20"
};
function encodeWhitespace(string) {
    return string.replaceAll(/[\s]/g, (c)=>{
        return WHITESPACE_ENCODINGS[c] ?? c;
    });
}
function toFileUrl(path) {
    if (!isAbsolute(path)) {
        throw new TypeError("Must be an absolute path.");
    }
    const [, hostname, pathname] = path.match(/^(?:[/\\]{2}([^/\\]+)(?=[/\\](?:[^/\\]|$)))?(.*)/);
    const url = new URL("file:///");
    url.pathname = encodeWhitespace(pathname.replace(/%/g, "%25"));
    if (hostname !== undefined && hostname !== "localhost") {
        url.hostname = hostname;
        if (!url.hostname) {
            throw new TypeError("Invalid hostname.");
        }
    }
    return url;
}
const regExpEscapeChars = [
    "!",
    "$",
    "(",
    ")",
    "*",
    "+",
    ".",
    "=",
    "?",
    "[",
    "\\",
    "^",
    "{",
    "|"
];
const rangeEscapeChars = [
    "-",
    "\\",
    "]"
];
function _globToRegExp(c, glob, { extended = true, globstar: globstarOption = true, caseInsensitive = false } = {}) {
    if (glob === "") {
        return /(?!)/;
    }
    let newLength = glob.length;
    for(; newLength > 1 && c.seps.includes(glob[newLength - 1]); newLength--);
    glob = glob.slice(0, newLength);
    let regExpString = "";
    for(let j = 0; j < glob.length;){
        let segment = "";
        const groupStack = [];
        let inRange = false;
        let inEscape = false;
        let endsWithSep = false;
        let i = j;
        for(; i < glob.length && !c.seps.includes(glob[i]); i++){
            if (inEscape) {
                inEscape = false;
                const escapeChars = inRange ? rangeEscapeChars : regExpEscapeChars;
                segment += escapeChars.includes(glob[i]) ? `\\${glob[i]}` : glob[i];
                continue;
            }
            if (glob[i] === c.escapePrefix) {
                inEscape = true;
                continue;
            }
            if (glob[i] === "[") {
                if (!inRange) {
                    inRange = true;
                    segment += "[";
                    if (glob[i + 1] === "!") {
                        i++;
                        segment += "^";
                    } else if (glob[i + 1] === "^") {
                        i++;
                        segment += "\\^";
                    }
                    continue;
                } else if (glob[i + 1] === ":") {
                    let k = i + 1;
                    let value1 = "";
                    while(glob[k + 1] !== undefined && glob[k + 1] !== ":"){
                        value1 += glob[k + 1];
                        k++;
                    }
                    if (glob[k + 1] === ":" && glob[k + 2] === "]") {
                        i = k + 2;
                        if (value1 === "alnum") segment += "\\dA-Za-z";
                        else if (value1 === "alpha") segment += "A-Za-z";
                        else if (value1 === "ascii") segment += "\x00-\x7F";
                        else if (value1 === "blank") segment += "\t ";
                        else if (value1 === "cntrl") segment += "\x00-\x1F\x7F";
                        else if (value1 === "digit") segment += "\\d";
                        else if (value1 === "graph") segment += "\x21-\x7E";
                        else if (value1 === "lower") segment += "a-z";
                        else if (value1 === "print") segment += "\x20-\x7E";
                        else if (value1 === "punct") {
                            segment += "!\"#$%&'()*+,\\-./:;<=>?@[\\\\\\]^_‘{|}~";
                        } else if (value1 === "space") segment += "\\s\v";
                        else if (value1 === "upper") segment += "A-Z";
                        else if (value1 === "word") segment += "\\w";
                        else if (value1 === "xdigit") segment += "\\dA-Fa-f";
                        continue;
                    }
                }
            }
            if (glob[i] === "]" && inRange) {
                inRange = false;
                segment += "]";
                continue;
            }
            if (inRange) {
                if (glob[i] === "\\") {
                    segment += `\\\\`;
                } else {
                    segment += glob[i];
                }
                continue;
            }
            if (glob[i] === ")" && groupStack.length > 0 && groupStack[groupStack.length - 1] !== "BRACE") {
                segment += ")";
                const type = groupStack.pop();
                if (type === "!") {
                    segment += c.wildcard;
                } else if (type !== "@") {
                    segment += type;
                }
                continue;
            }
            if (glob[i] === "|" && groupStack.length > 0 && groupStack[groupStack.length - 1] !== "BRACE") {
                segment += "|";
                continue;
            }
            if (glob[i] === "+" && extended && glob[i + 1] === "(") {
                i++;
                groupStack.push("+");
                segment += "(?:";
                continue;
            }
            if (glob[i] === "@" && extended && glob[i + 1] === "(") {
                i++;
                groupStack.push("@");
                segment += "(?:";
                continue;
            }
            if (glob[i] === "?") {
                if (extended && glob[i + 1] === "(") {
                    i++;
                    groupStack.push("?");
                    segment += "(?:";
                } else {
                    segment += ".";
                }
                continue;
            }
            if (glob[i] === "!" && extended && glob[i + 1] === "(") {
                i++;
                groupStack.push("!");
                segment += "(?!";
                continue;
            }
            if (glob[i] === "{") {
                groupStack.push("BRACE");
                segment += "(?:";
                continue;
            }
            if (glob[i] === "}" && groupStack[groupStack.length - 1] === "BRACE") {
                groupStack.pop();
                segment += ")";
                continue;
            }
            if (glob[i] === "," && groupStack[groupStack.length - 1] === "BRACE") {
                segment += "|";
                continue;
            }
            if (glob[i] === "*") {
                if (extended && glob[i + 1] === "(") {
                    i++;
                    groupStack.push("*");
                    segment += "(?:";
                } else {
                    const prevChar = glob[i - 1];
                    let numStars = 1;
                    while(glob[i + 1] === "*"){
                        i++;
                        numStars++;
                    }
                    const nextChar = glob[i + 1];
                    if (globstarOption && numStars === 2 && [
                        ...c.seps,
                        undefined
                    ].includes(prevChar) && [
                        ...c.seps,
                        undefined
                    ].includes(nextChar)) {
                        segment += c.globstar;
                        endsWithSep = true;
                    } else {
                        segment += c.wildcard;
                    }
                }
                continue;
            }
            segment += regExpEscapeChars.includes(glob[i]) ? `\\${glob[i]}` : glob[i];
        }
        if (groupStack.length > 0 || inRange || inEscape) {
            segment = "";
            for (const c of glob.slice(j, i)){
                segment += regExpEscapeChars.includes(c) ? `\\${c}` : c;
                endsWithSep = false;
            }
        }
        regExpString += segment;
        if (!endsWithSep) {
            regExpString += i < glob.length ? c.sep : c.sepMaybe;
            endsWithSep = true;
        }
        while(c.seps.includes(glob[i]))i++;
        if (!(i > j)) {
            throw new Error("Assertion failure: i > j (potential infinite loop)");
        }
        j = i;
    }
    regExpString = `^${regExpString}$`;
    return new RegExp(regExpString, caseInsensitive ? "i" : "");
}
const constants = {
    sep: "(?:\\\\|/)+",
    sepMaybe: "(?:\\\\|/)*",
    seps: [
        "\\",
        "/"
    ],
    globstar: "(?:[^\\\\/]*(?:\\\\|/|$)+)*",
    wildcard: "[^\\\\/]*",
    escapePrefix: "`"
};
function globToRegExp(glob, options = {}) {
    return _globToRegExp(constants, glob, options);
}
function isGlob(str) {
    const chars = {
        "{": "}",
        "(": ")",
        "[": "]"
    };
    const regex = /\\(.)|(^!|\*|\?|[\].+)]\?|\[[^\\\]]+\]|\{[^\\}]+\}|\(\?[:!=][^\\)]+\)|\([^|]+\|[^\\)]+\))/;
    if (str === "") {
        return false;
    }
    let match;
    while(match = regex.exec(str)){
        if (match[2]) return true;
        let idx = match.index + match[0].length;
        const open = match[1];
        const close = open ? chars[open] : null;
        if (open && close) {
            const n = str.indexOf(close, idx);
            if (n !== -1) {
                idx = n + 1;
            }
        }
        str = str.slice(idx);
    }
    return false;
}
function normalizeGlob(glob, { globstar = false } = {}) {
    if (glob.match(/\0/g)) {
        throw new Error(`Glob contains invalid characters: "${glob}"`);
    }
    if (!globstar) {
        return normalize(glob);
    }
    const s = SEPARATOR_PATTERN.source;
    const badParentPattern = new RegExp(`(?<=(${s}|^)\\*\\*${s})\\.\\.(?=${s}|$)`, "g");
    return normalize(glob.replace(badParentPattern, "\0")).replace(/\0/g, "..");
}
function joinGlobs(globs, { extended = true, globstar = false } = {}) {
    if (!globstar || globs.length === 0) {
        return join(...globs);
    }
    if (globs.length === 0) return ".";
    let joined;
    for (const glob of globs){
        const path = glob;
        if (path.length > 0) {
            if (!joined) joined = path;
            else joined += `${SEPARATOR}${path}`;
        }
    }
    if (!joined) return ".";
    return normalizeGlob(joined, {
        extended,
        globstar
    });
}
function isPosixPathSeparator1(code) {
    return code === 47;
}
function basename1(path, suffix = "") {
    assertArgs(path, suffix);
    const lastSegment = lastPathSegment(path, isPosixPathSeparator1);
    const strippedSegment = stripTrailingSeparators(lastSegment, isPosixPathSeparator1);
    return suffix ? stripSuffix(strippedSegment, suffix) : strippedSegment;
}
const SEPARATOR1 = "/";
const SEPARATOR_PATTERN1 = /\/+/;
function dirname1(path) {
    assertArg(path);
    let end = -1;
    let matchedNonSeparator = false;
    for(let i = path.length - 1; i >= 1; --i){
        if (isPosixPathSeparator1(path.charCodeAt(i))) {
            if (matchedNonSeparator) {
                end = i;
                break;
            }
        } else {
            matchedNonSeparator = true;
        }
    }
    if (end === -1) {
        return isPosixPathSeparator1(path.charCodeAt(0)) ? "/" : ".";
    }
    return stripTrailingSeparators(path.slice(0, end), isPosixPathSeparator1);
}
function extname1(path) {
    assertPath(path);
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    let preDotState = 0;
    for(let i = path.length - 1; i >= 0; --i){
        const code = path.charCodeAt(i);
        if (isPosixPathSeparator1(code)) {
            if (!matchedSlash) {
                startPart = i + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i + 1;
        }
        if (code === 46) {
            if (startDot === -1) startDot = i;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        return "";
    }
    return path.slice(startDot, end);
}
function fromFileUrl1(url) {
    url = assertArg1(url);
    return decodeURIComponent(url.pathname.replace(/%(?![0-9A-Fa-f]{2})/g, "%25"));
}
function isAbsolute1(path) {
    assertPath(path);
    return path.length > 0 && isPosixPathSeparator1(path.charCodeAt(0));
}
function normalize1(path) {
    assertArg2(path);
    const isAbsolute = isPosixPathSeparator1(path.charCodeAt(0));
    const trailingSeparator = isPosixPathSeparator1(path.charCodeAt(path.length - 1));
    path = normalizeString(path, !isAbsolute, "/", isPosixPathSeparator1);
    if (path.length === 0 && !isAbsolute) path = ".";
    if (path.length > 0 && trailingSeparator) path += "/";
    if (isAbsolute) return `/${path}`;
    return path;
}
function join1(...paths) {
    if (paths.length === 0) return ".";
    let joined;
    for(let i = 0; i < paths.length; ++i){
        const path = paths[i];
        assertPath(path);
        if (path.length > 0) {
            if (!joined) joined = path;
            else joined += `/${path}`;
        }
    }
    if (!joined) return ".";
    return normalize1(joined);
}
function resolve1(...pathSegments) {
    let resolvedPath = "";
    let resolvedAbsolute = false;
    for(let i = pathSegments.length - 1; i >= -1 && !resolvedAbsolute; i--){
        let path;
        if (i >= 0) path = pathSegments[i];
        else {
            const { Deno: Deno1 } = globalThis;
            if (typeof Deno1?.cwd !== "function") {
                throw new TypeError("Resolved a relative path without a CWD.");
            }
            path = Deno1.cwd();
        }
        assertPath(path);
        if (path.length === 0) {
            continue;
        }
        resolvedPath = `${path}/${resolvedPath}`;
        resolvedAbsolute = isPosixPathSeparator1(path.charCodeAt(0));
    }
    resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute, "/", isPosixPathSeparator1);
    if (resolvedAbsolute) {
        if (resolvedPath.length > 0) return `/${resolvedPath}`;
        else return "/";
    } else if (resolvedPath.length > 0) return resolvedPath;
    else return ".";
}
function relative1(from, to) {
    assertArgs1(from, to);
    from = resolve1(from);
    to = resolve1(to);
    if (from === to) return "";
    let fromStart = 1;
    const fromEnd = from.length;
    for(; fromStart < fromEnd; ++fromStart){
        if (!isPosixPathSeparator1(from.charCodeAt(fromStart))) break;
    }
    const fromLen = fromEnd - fromStart;
    let toStart = 1;
    const toEnd = to.length;
    for(; toStart < toEnd; ++toStart){
        if (!isPosixPathSeparator1(to.charCodeAt(toStart))) break;
    }
    const toLen = toEnd - toStart;
    const length = fromLen < toLen ? fromLen : toLen;
    let lastCommonSep = -1;
    let i = 0;
    for(; i <= length; ++i){
        if (i === length) {
            if (toLen > length) {
                if (isPosixPathSeparator1(to.charCodeAt(toStart + i))) {
                    return to.slice(toStart + i + 1);
                } else if (i === 0) {
                    return to.slice(toStart + i);
                }
            } else if (fromLen > length) {
                if (isPosixPathSeparator1(from.charCodeAt(fromStart + i))) {
                    lastCommonSep = i;
                } else if (i === 0) {
                    lastCommonSep = 0;
                }
            }
            break;
        }
        const fromCode = from.charCodeAt(fromStart + i);
        const toCode = to.charCodeAt(toStart + i);
        if (fromCode !== toCode) break;
        else if (isPosixPathSeparator1(fromCode)) lastCommonSep = i;
    }
    let out = "";
    for(i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i){
        if (i === fromEnd || isPosixPathSeparator1(from.charCodeAt(i))) {
            if (out.length === 0) out += "..";
            else out += "/..";
        }
    }
    if (out.length > 0) return out + to.slice(toStart + lastCommonSep);
    else {
        toStart += lastCommonSep;
        if (isPosixPathSeparator1(to.charCodeAt(toStart))) ++toStart;
        return to.slice(toStart);
    }
}
function toFileUrl1(path) {
    if (!isAbsolute1(path)) {
        throw new TypeError("Must be an absolute path.");
    }
    const url = new URL("file:///");
    url.pathname = encodeWhitespace(path.replace(/%/g, "%25").replace(/\\/g, "%5C"));
    return url;
}
const constants1 = {
    sep: "/+",
    sepMaybe: "/*",
    seps: [
        "/"
    ],
    globstar: "(?:[^/]*(?:/|$)+)*",
    wildcard: "[^/]*",
    escapePrefix: "\\"
};
function globToRegExp1(glob, options = {}) {
    return _globToRegExp(constants1, glob, options);
}
function normalizeGlob1(glob, { globstar = false } = {}) {
    if (glob.match(/\0/g)) {
        throw new Error(`Glob contains invalid characters: "${glob}"`);
    }
    if (!globstar) {
        return normalize1(glob);
    }
    const s = SEPARATOR_PATTERN1.source;
    const badParentPattern = new RegExp(`(?<=(${s}|^)\\*\\*${s})\\.\\.(?=${s}|$)`, "g");
    return normalize1(glob.replace(badParentPattern, "\0")).replace(/\0/g, "..");
}
function joinGlobs1(globs, { extended = true, globstar = false } = {}) {
    if (!globstar || globs.length === 0) {
        return join1(...globs);
    }
    if (globs.length === 0) return ".";
    let joined;
    for (const glob of globs){
        const path = glob;
        if (path.length > 0) {
            if (!joined) joined = path;
            else joined += `${SEPARATOR1}${path}`;
        }
    }
    if (!joined) return ".";
    return normalizeGlob1(joined, {
        extended,
        globstar
    });
}
const osType = (()=>{
    const { Deno: Deno1 } = globalThis;
    if (typeof Deno1?.build?.os === "string") {
        return Deno1.build.os;
    }
    const { navigator } = globalThis;
    if (navigator?.appVersion?.includes?.("Win")) {
        return "windows";
    }
    return "linux";
})();
const isWindows = osType === "windows";
function basename2(path, suffix = "") {
    return isWindows ? basename(path, suffix) : basename1(path, suffix);
}
const SEPARATOR2 = isWindows ? "\\" : "/";
const SEPARATOR_PATTERN2 = isWindows ? /[\\/]+/ : /\/+/;
function dirname2(path) {
    return isWindows ? dirname(path) : dirname1(path);
}
function extname2(path) {
    return isWindows ? extname(path) : extname1(path);
}
function fromFileUrl2(url) {
    return isWindows ? fromFileUrl(url) : fromFileUrl1(url);
}
function isAbsolute2(path) {
    return isWindows ? isAbsolute(path) : isAbsolute1(path);
}
function join2(...paths) {
    return isWindows ? join(...paths) : join1(...paths);
}
function normalize2(path) {
    return isWindows ? normalize(path) : normalize1(path);
}
function relative2(from, to) {
    return isWindows ? relative(from, to) : relative1(from, to);
}
function resolve2(...pathSegments) {
    return isWindows ? resolve(...pathSegments) : resolve1(...pathSegments);
}
function toFileUrl2(path) {
    return isWindows ? toFileUrl(path) : toFileUrl1(path);
}
function globToRegExp2(glob, options = {}) {
    return options.os === "windows" || !options.os && isWindows ? globToRegExp(glob, options) : globToRegExp1(glob, options);
}
function joinGlobs2(globs, options = {}) {
    return isWindows ? joinGlobs(globs, options) : joinGlobs1(globs, options);
}
async function writeAll(writer, data) {
    let nwritten = 0;
    while(nwritten < data.length){
        nwritten += await writer.write(data.subarray(nwritten));
    }
}
function writeAllSync(writer, data) {
    let nwritten = 0;
    while(nwritten < data.length){
        nwritten += writer.writeSync(data.subarray(nwritten));
    }
}
function readerFromStreamReader(streamReader) {
    const buffer = new Buffer();
    return {
        async read (p) {
            if (buffer.empty()) {
                const res = await streamReader.read();
                if (res.done) {
                    return null;
                }
                await writeAll(buffer, res.value);
            }
            return buffer.read(p);
        }
    };
}
function readerFromStreamReader1(streamReader) {
    return readerFromStreamReader(streamReader);
}
function writerFromStreamWriter(streamWriter) {
    return {
        async write (p) {
            await streamWriter.ready;
            await streamWriter.write(p);
            return p.length;
        }
    };
}
const MIN_BUF_SIZE = 16;
const CR = "\r".charCodeAt(0);
const LF = "\n".charCodeAt(0);
class BufferFullError extends Error {
    partial;
    name;
    constructor(partial){
        super("Buffer full");
        this.partial = partial;
        this.name = "BufferFullError";
    }
}
class PartialReadError extends Error {
    name = "PartialReadError";
    partial;
    constructor(){
        super("Encountered UnexpectedEof, data only partially read");
    }
}
class BufReader {
    #buf;
    #rd;
    #r = 0;
    #w = 0;
    #eof = false;
    static create(r, size = 4096) {
        return r instanceof BufReader ? r : new BufReader(r, size);
    }
    constructor(rd, size = 4096){
        if (size < 16) {
            size = MIN_BUF_SIZE;
        }
        this.#reset(new Uint8Array(size), rd);
    }
    size() {
        return this.#buf.byteLength;
    }
    buffered() {
        return this.#w - this.#r;
    }
    #fill = async ()=>{
        if (this.#r > 0) {
            this.#buf.copyWithin(0, this.#r, this.#w);
            this.#w -= this.#r;
            this.#r = 0;
        }
        if (this.#w >= this.#buf.byteLength) {
            throw Error("bufio: tried to fill full buffer");
        }
        for(let i = 100; i > 0; i--){
            const rr = await this.#rd.read(this.#buf.subarray(this.#w));
            if (rr === null) {
                this.#eof = true;
                return;
            }
            assert(rr >= 0, "negative read");
            this.#w += rr;
            if (rr > 0) {
                return;
            }
        }
        throw new Error(`No progress after ${100} read() calls`);
    };
    reset(r) {
        this.#reset(this.#buf, r);
    }
    #reset = (buf, rd)=>{
        this.#buf = buf;
        this.#rd = rd;
        this.#eof = false;
    };
    async read(p) {
        let rr = p.byteLength;
        if (p.byteLength === 0) return rr;
        if (this.#r === this.#w) {
            if (p.byteLength >= this.#buf.byteLength) {
                const rr = await this.#rd.read(p);
                const nread = rr ?? 0;
                assert(nread >= 0, "negative read");
                return rr;
            }
            this.#r = 0;
            this.#w = 0;
            rr = await this.#rd.read(this.#buf);
            if (rr === 0 || rr === null) return rr;
            assert(rr >= 0, "negative read");
            this.#w += rr;
        }
        const copied = copy(this.#buf.subarray(this.#r, this.#w), p, 0);
        this.#r += copied;
        return copied;
    }
    async readFull(p) {
        let bytesRead = 0;
        while(bytesRead < p.length){
            try {
                const rr = await this.read(p.subarray(bytesRead));
                if (rr === null) {
                    if (bytesRead === 0) {
                        return null;
                    } else {
                        throw new PartialReadError();
                    }
                }
                bytesRead += rr;
            } catch (err) {
                if (err instanceof PartialReadError) {
                    err.partial = p.subarray(0, bytesRead);
                }
                throw err;
            }
        }
        return p;
    }
    async readByte() {
        while(this.#r === this.#w){
            if (this.#eof) return null;
            await this.#fill();
        }
        const c = this.#buf[this.#r];
        this.#r++;
        return c;
    }
    async readString(delim) {
        if (delim.length !== 1) {
            throw new Error("Delimiter should be a single character");
        }
        const buffer = await this.readSlice(delim.charCodeAt(0));
        if (buffer === null) return null;
        return new TextDecoder().decode(buffer);
    }
    async readLine() {
        let line = null;
        try {
            line = await this.readSlice(LF);
        } catch (err) {
            let partial;
            if (err instanceof PartialReadError) {
                partial = err.partial;
                assert(partial instanceof Uint8Array, "bufio: caught error from `readSlice()` without `partial` property");
            }
            if (!(err instanceof BufferFullError)) {
                throw err;
            }
            partial = err.partial;
            if (!this.#eof && partial && partial.byteLength > 0 && partial[partial.byteLength - 1] === CR) {
                assert(this.#r > 0, "bufio: tried to rewind past start of buffer");
                this.#r--;
                partial = partial.subarray(0, partial.byteLength - 1);
            }
            if (partial) {
                return {
                    line: partial,
                    more: !this.#eof
                };
            }
        }
        if (line === null) {
            return null;
        }
        if (line.byteLength === 0) {
            return {
                line,
                more: false
            };
        }
        if (line[line.byteLength - 1] === LF) {
            let drop = 1;
            if (line.byteLength > 1 && line[line.byteLength - 2] === CR) {
                drop = 2;
            }
            line = line.subarray(0, line.byteLength - drop);
        }
        return {
            line,
            more: false
        };
    }
    async readSlice(delim) {
        let s = 0;
        let slice;
        while(true){
            let i = this.#buf.subarray(this.#r + s, this.#w).indexOf(delim);
            if (i >= 0) {
                i += s;
                slice = this.#buf.subarray(this.#r, this.#r + i + 1);
                this.#r += i + 1;
                break;
            }
            if (this.#eof) {
                if (this.#r === this.#w) {
                    return null;
                }
                slice = this.#buf.subarray(this.#r, this.#w);
                this.#r = this.#w;
                break;
            }
            if (this.buffered() >= this.#buf.byteLength) {
                this.#r = this.#w;
                const oldbuf = this.#buf;
                const newbuf = this.#buf.slice(0);
                this.#buf = newbuf;
                throw new BufferFullError(oldbuf);
            }
            s = this.#w - this.#r;
            try {
                await this.#fill();
            } catch (err) {
                if (err instanceof PartialReadError) {
                    err.partial = slice;
                }
                throw err;
            }
        }
        return slice;
    }
    async peek(n) {
        if (n < 0) {
            throw Error("negative count");
        }
        let avail = this.#w - this.#r;
        while(avail < n && avail < this.#buf.byteLength && !this.#eof){
            try {
                await this.#fill();
            } catch (err) {
                if (err instanceof PartialReadError) {
                    err.partial = this.#buf.subarray(this.#r, this.#w);
                }
                throw err;
            }
            avail = this.#w - this.#r;
        }
        if (avail === 0 && this.#eof) {
            return null;
        } else if (avail < n && this.#eof) {
            return this.#buf.subarray(this.#r, this.#r + avail);
        } else if (avail < n) {
            throw new BufferFullError(this.#buf.subarray(this.#r, this.#w));
        }
        return this.#buf.subarray(this.#r, this.#r + n);
    }
}
let wasm;
const heap = new Array(128).fill(undefined);
heap.push(undefined, null, true, false);
function getObject(idx) {
    return heap[idx];
}
function isLikeNone(x) {
    return x === undefined || x === null;
}
let cachedFloat64Memory0 = null;
function getFloat64Memory0() {
    if (cachedFloat64Memory0 === null || cachedFloat64Memory0.byteLength === 0) {
        cachedFloat64Memory0 = new Float64Array(wasm.memory.buffer);
    }
    return cachedFloat64Memory0;
}
let cachedInt32Memory0 = null;
function getInt32Memory0() {
    if (cachedInt32Memory0 === null || cachedInt32Memory0.byteLength === 0) {
        cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32Memory0;
}
let WASM_VECTOR_LEN = 0;
let cachedUint8Memory0 = null;
function getUint8Memory0() {
    if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8Memory0;
}
const cachedTextEncoder = typeof TextEncoder !== "undefined" ? new TextEncoder("utf-8") : {
    encode: ()=>{
        throw Error("TextEncoder not available");
    }
};
const encodeString = function(arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
};
function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }
    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;
    const mem = getUint8Memory0();
    let offset = 0;
    for(; offset < len; offset++){
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);
        offset += ret.written;
    }
    WASM_VECTOR_LEN = offset;
    return ptr;
}
const cachedTextDecoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf-8", {
    ignoreBOM: true,
    fatal: true
}) : {
    decode: ()=>{
        throw Error("TextDecoder not available");
    }
};
if (typeof TextDecoder !== "undefined") cachedTextDecoder.decode();
function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}
let heap_next = heap.length;
function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];
    heap[idx] = obj;
    return idx;
}
function dropObject(idx) {
    if (idx < 132) return;
    heap[idx] = heap_next;
    heap_next = idx;
}
function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}
let cachedBigInt64Memory0 = null;
function getBigInt64Memory0() {
    if (cachedBigInt64Memory0 === null || cachedBigInt64Memory0.byteLength === 0) {
        cachedBigInt64Memory0 = new BigInt64Array(wasm.memory.buffer);
    }
    return cachedBigInt64Memory0;
}
function debugString(val) {
    const type = typeof val;
    if (type == "number" || type == "boolean" || val == null) {
        return `${val}`;
    }
    if (type == "string") {
        return `"${val}"`;
    }
    if (type == "symbol") {
        const description = val.description;
        if (description == null) {
            return "Symbol";
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == "function") {
        const name = val.name;
        if (typeof name == "string" && name.length > 0) {
            return `Function(${name})`;
        } else {
            return "Function";
        }
    }
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = "[";
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++){
            debug += ", " + debugString(val[i]);
        }
        debug += "]";
        return debug;
    }
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        return toString.call(val);
    }
    if (className == "Object") {
        try {
            return "Object(" + JSON.stringify(val) + ")";
        } catch (_) {
            return "Object";
        }
    }
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    return className;
}
function parse(command) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passStringToWasm0(command, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.parse(retptr, ptr0, len0);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        if (r2) {
            throw takeObject(r1);
        }
        return takeObject(r0);
    } finally{
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}
function static_text_render_text(items, cols, rows) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.static_text_render_text(retptr, addHeapObject(items), cols, rows);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        var r3 = getInt32Memory0()[retptr / 4 + 3];
        if (r3) {
            throw takeObject(r2);
        }
        let v1;
        if (r0 !== 0) {
            v1 = getStringFromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1, 1);
        }
        return v1;
    } finally{
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}
function static_text_clear_text(cols, rows) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.static_text_clear_text(retptr, cols, rows);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        let v1;
        if (r0 !== 0) {
            v1 = getStringFromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1, 1);
        }
        return v1;
    } finally{
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}
function static_text_render_once(items, cols, rows) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.static_text_render_once(retptr, addHeapObject(items), cols, rows);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        var r3 = getInt32Memory0()[retptr / 4 + 3];
        if (r3) {
            throw takeObject(r2);
        }
        let v1;
        if (r0 !== 0) {
            v1 = getStringFromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1, 1);
        }
        return v1;
    } finally{
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}
function strip_ansi_codes(text) {
    let deferred2_0;
    let deferred2_1;
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passStringToWasm0(text, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.strip_ansi_codes(retptr, ptr0, len0);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        deferred2_0 = r0;
        deferred2_1 = r1;
        return getStringFromWasm0(r0, r1);
    } finally{
        wasm.__wbindgen_add_to_stack_pointer(16);
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
}
function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_exn_store(addHeapObject(e));
    }
}
const imports = {
    __wbindgen_placeholder__: {
        __wbg_get_57245cc7d7c7619d: function(arg0, arg1) {
            const ret = getObject(arg0)[arg1 >>> 0];
            return addHeapObject(ret);
        },
        __wbindgen_jsval_loose_eq: function(arg0, arg1) {
            const ret = getObject(arg0) == getObject(arg1);
            return ret;
        },
        __wbg_instanceof_Uint8Array_971eeda69eb75003: function(arg0) {
            let result;
            try {
                result = getObject(arg0) instanceof Uint8Array;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        },
        __wbg_instanceof_ArrayBuffer_e5e48f4762c5610b: function(arg0) {
            let result;
            try {
                result = getObject(arg0) instanceof ArrayBuffer;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        },
        __wbg_new_8c3f0052272a457a: function(arg0) {
            const ret = new Uint8Array(getObject(arg0));
            return addHeapObject(ret);
        },
        __wbindgen_boolean_get: function(arg0) {
            const v = getObject(arg0);
            const ret = typeof v === "boolean" ? v ? 1 : 0 : 2;
            return ret;
        },
        __wbindgen_number_get: function(arg0, arg1) {
            const obj = getObject(arg1);
            const ret = typeof obj === "number" ? obj : undefined;
            getFloat64Memory0()[arg0 / 8 + 1] = isLikeNone(ret) ? 0 : ret;
            getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
        },
        __wbindgen_string_get: function(arg0, arg1) {
            const obj = getObject(arg1);
            const ret = typeof obj === "string" ? obj : undefined;
            var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len1 = WASM_VECTOR_LEN;
            getInt32Memory0()[arg0 / 4 + 1] = len1;
            getInt32Memory0()[arg0 / 4 + 0] = ptr1;
        },
        __wbindgen_error_new: function(arg0, arg1) {
            const ret = new Error(getStringFromWasm0(arg0, arg1));
            return addHeapObject(ret);
        },
        __wbindgen_string_new: function(arg0, arg1) {
            const ret = getStringFromWasm0(arg0, arg1);
            return addHeapObject(ret);
        },
        __wbindgen_object_clone_ref: function(arg0) {
            const ret = getObject(arg0);
            return addHeapObject(ret);
        },
        __wbg_set_9182712abebf82ef: function(arg0, arg1, arg2) {
            getObject(arg0)[takeObject(arg1)] = takeObject(arg2);
        },
        __wbg_new_0b9bfdd97583284e: function() {
            const ret = new Object();
            return addHeapObject(ret);
        },
        __wbg_new_1d9a920c6bfc44a8: function() {
            const ret = new Array();
            return addHeapObject(ret);
        },
        __wbg_set_a68214f35c417fa9: function(arg0, arg1, arg2) {
            getObject(arg0)[arg1 >>> 0] = takeObject(arg2);
        },
        __wbindgen_number_new: function(arg0) {
            const ret = arg0;
            return addHeapObject(ret);
        },
        __wbg_length_6e3bbe7c8bd4dbd8: function(arg0) {
            const ret = getObject(arg0).length;
            return ret;
        },
        __wbindgen_is_bigint: function(arg0) {
            const ret = typeof getObject(arg0) === "bigint";
            return ret;
        },
        __wbg_isSafeInteger_dfa0593e8d7ac35a: function(arg0) {
            const ret = Number.isSafeInteger(getObject(arg0));
            return ret;
        },
        __wbindgen_bigint_from_i64: function(arg0) {
            const ret = arg0;
            return addHeapObject(ret);
        },
        __wbindgen_is_object: function(arg0) {
            const val = getObject(arg0);
            const ret = typeof val === "object" && val !== null;
            return ret;
        },
        __wbg_iterator_6f9d4f28845f426c: function() {
            const ret = Symbol.iterator;
            return addHeapObject(ret);
        },
        __wbindgen_in: function(arg0, arg1) {
            const ret = getObject(arg0) in getObject(arg1);
            return ret;
        },
        __wbg_entries_65a76a413fc91037: function(arg0) {
            const ret = Object.entries(getObject(arg0));
            return addHeapObject(ret);
        },
        __wbindgen_bigint_from_u64: function(arg0) {
            const ret = BigInt.asUintN(64, arg0);
            return addHeapObject(ret);
        },
        __wbindgen_jsval_eq: function(arg0, arg1) {
            const ret = getObject(arg0) === getObject(arg1);
            return ret;
        },
        __wbg_new_abda76e883ba8a5f: function() {
            const ret = new Error();
            return addHeapObject(ret);
        },
        __wbg_stack_658279fe44541cf6: function(arg0, arg1) {
            const ret = getObject(arg1).stack;
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            getInt32Memory0()[arg0 / 4 + 1] = len1;
            getInt32Memory0()[arg0 / 4 + 0] = ptr1;
        },
        __wbg_error_f851667af71bcfc6: function(arg0, arg1) {
            let deferred0_0;
            let deferred0_1;
            try {
                deferred0_0 = arg0;
                deferred0_1 = arg1;
                console.error(getStringFromWasm0(arg0, arg1));
            } finally{
                wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
            }
        },
        __wbindgen_object_drop_ref: function(arg0) {
            takeObject(arg0);
        },
        __wbindgen_is_function: function(arg0) {
            const ret = typeof getObject(arg0) === "function";
            return ret;
        },
        __wbg_next_aaef7c8aa5e212ac: function() {
            return handleError(function(arg0) {
                const ret = getObject(arg0).next();
                return addHeapObject(ret);
            }, arguments);
        },
        __wbg_done_1b73b0672e15f234: function(arg0) {
            const ret = getObject(arg0).done;
            return ret;
        },
        __wbg_value_1ccc36bc03462d71: function(arg0) {
            const ret = getObject(arg0).value;
            return addHeapObject(ret);
        },
        __wbg_get_765201544a2b6869: function() {
            return handleError(function(arg0, arg1) {
                const ret = Reflect.get(getObject(arg0), getObject(arg1));
                return addHeapObject(ret);
            }, arguments);
        },
        __wbg_call_97ae9d8645dc388b: function() {
            return handleError(function(arg0, arg1) {
                const ret = getObject(arg0).call(getObject(arg1));
                return addHeapObject(ret);
            }, arguments);
        },
        __wbg_next_579e583d33566a86: function(arg0) {
            const ret = getObject(arg0).next;
            return addHeapObject(ret);
        },
        __wbg_isArray_27c46c67f498e15d: function(arg0) {
            const ret = Array.isArray(getObject(arg0));
            return ret;
        },
        __wbg_length_9e1ae1900cb0fbd5: function(arg0) {
            const ret = getObject(arg0).length;
            return ret;
        },
        __wbindgen_memory: function() {
            const ret = wasm.memory;
            return addHeapObject(ret);
        },
        __wbg_buffer_3f3d764d4747d564: function(arg0) {
            const ret = getObject(arg0).buffer;
            return addHeapObject(ret);
        },
        __wbg_set_83db9690f9353e79: function(arg0, arg1, arg2) {
            getObject(arg0).set(getObject(arg1), arg2 >>> 0);
        },
        __wbindgen_bigint_get_as_i64: function(arg0, arg1) {
            const v = getObject(arg1);
            const ret = typeof v === "bigint" ? v : undefined;
            getBigInt64Memory0()[arg0 / 8 + 1] = isLikeNone(ret) ? BigInt(0) : ret;
            getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
        },
        __wbindgen_debug_string: function(arg0, arg1) {
            const ret = debugString(getObject(arg1));
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            getInt32Memory0()[arg0 / 4 + 1] = len1;
            getInt32Memory0()[arg0 / 4 + 0] = ptr1;
        },
        __wbindgen_throw: function(arg0, arg1) {
            throw new Error(getStringFromWasm0(arg0, arg1));
        }
    }
};
function instantiate() {
    return instantiateWithInstance().exports;
}
let instanceWithExports;
function instantiateWithInstance() {
    if (instanceWithExports == null) {
        const instance = instantiateInstance();
        wasm = instance.exports;
        cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
        instanceWithExports = {
            instance,
            exports: {
                parse,
                static_text_render_text,
                static_text_clear_text,
                static_text_render_once,
                strip_ansi_codes
            }
        };
    }
    return instanceWithExports;
}
function instantiateInstance() {
    const wasmBytes = base64decode("\
AGFzbQEAAAAB7wEiYAAAYAABf2ABfwBgAX8Bf2ACf38AYAJ/fwF/YAN/f38AYAN/f38Bf2AEf39/fw\
BgBH9/f38Bf2AFf39/f38AYAV/f39/fwF/YAZ/f39/f38AYAZ/f39/f38Bf2AHf39/f39/fwBgB39/\
f39/f38Bf2AJf39/f39/fn5+AGAEf39/fgBgA39/fgF/YAV/f35/fwBgBX9/fX9/AGAFf398f38AYA\
J/fgBgBH9+f38AYAN/fn4AYAN/fn4Bf2AEf31/fwBgAn98AGADf3x/AX9gBH98f38AYAR/fH9/AX9g\
AX4Bf2ADfn9/AX9gAXwBfwL4Ei0YX193YmluZGdlbl9wbGFjZWhvbGRlcl9fGl9fd2JnX2dldF81Nz\
I0NWNjN2Q3Yzc2MTlkAAUYX193YmluZGdlbl9wbGFjZWhvbGRlcl9fGV9fd2JpbmRnZW5fanN2YWxf\
bG9vc2VfZXEABRhfX3diaW5kZ2VuX3BsYWNlaG9sZGVyX18sX193YmdfaW5zdGFuY2VvZl9VaW50OE\
FycmF5Xzk3MWVlZGE2OWViNzUwMDMAAxhfX3diaW5kZ2VuX3BsYWNlaG9sZGVyX18tX193YmdfaW5z\
dGFuY2VvZl9BcnJheUJ1ZmZlcl9lNWU0OGY0NzYyYzU2MTBiAAMYX193YmluZGdlbl9wbGFjZWhvbG\
Rlcl9fGl9fd2JnX25ld184YzNmMDA1MjI3MmE0NTdhAAMYX193YmluZGdlbl9wbGFjZWhvbGRlcl9f\
Fl9fd2JpbmRnZW5fYm9vbGVhbl9nZXQAAxhfX3diaW5kZ2VuX3BsYWNlaG9sZGVyX18VX193YmluZG\
dlbl9udW1iZXJfZ2V0AAQYX193YmluZGdlbl9wbGFjZWhvbGRlcl9fFV9fd2JpbmRnZW5fc3RyaW5n\
X2dldAAEGF9fd2JpbmRnZW5fcGxhY2Vob2xkZXJfXxRfX3diaW5kZ2VuX2Vycm9yX25ldwAFGF9fd2\
JpbmRnZW5fcGxhY2Vob2xkZXJfXxVfX3diaW5kZ2VuX3N0cmluZ19uZXcABRhfX3diaW5kZ2VuX3Bs\
YWNlaG9sZGVyX18bX193YmluZGdlbl9vYmplY3RfY2xvbmVfcmVmAAMYX193YmluZGdlbl9wbGFjZW\
hvbGRlcl9fGl9fd2JnX3NldF85MTgyNzEyYWJlYmY4MmVmAAYYX193YmluZGdlbl9wbGFjZWhvbGRl\
cl9fGl9fd2JnX25ld18wYjliZmRkOTc1ODMyODRlAAEYX193YmluZGdlbl9wbGFjZWhvbGRlcl9fGl\
9fd2JnX25ld18xZDlhOTIwYzZiZmM0NGE4AAEYX193YmluZGdlbl9wbGFjZWhvbGRlcl9fGl9fd2Jn\
X3NldF9hNjgyMTRmMzVjNDE3ZmE5AAYYX193YmluZGdlbl9wbGFjZWhvbGRlcl9fFV9fd2JpbmRnZW\
5fbnVtYmVyX25ldwAhGF9fd2JpbmRnZW5fcGxhY2Vob2xkZXJfXx1fX3diZ19sZW5ndGhfNmUzYmJl\
N2M4YmQ0ZGJkOAADGF9fd2JpbmRnZW5fcGxhY2Vob2xkZXJfXxRfX3diaW5kZ2VuX2lzX2JpZ2ludA\
ADGF9fd2JpbmRnZW5fcGxhY2Vob2xkZXJfXyRfX3diZ19pc1NhZmVJbnRlZ2VyX2RmYTA1OTNlOGQ3\
YWMzNWEAAxhfX3diaW5kZ2VuX3BsYWNlaG9sZGVyX18aX193YmluZGdlbl9iaWdpbnRfZnJvbV9pNj\
QAHxhfX3diaW5kZ2VuX3BsYWNlaG9sZGVyX18UX193YmluZGdlbl9pc19vYmplY3QAAxhfX3diaW5k\
Z2VuX3BsYWNlaG9sZGVyX18fX193YmdfaXRlcmF0b3JfNmY5ZDRmMjg4NDVmNDI2YwABGF9fd2Jpbm\
RnZW5fcGxhY2Vob2xkZXJfXw1fX3diaW5kZ2VuX2luAAUYX193YmluZGdlbl9wbGFjZWhvbGRlcl9f\
Hl9fd2JnX2VudHJpZXNfNjVhNzZhNDEzZmM5MTAzNwADGF9fd2JpbmRnZW5fcGxhY2Vob2xkZXJfXx\
pfX3diaW5kZ2VuX2JpZ2ludF9mcm9tX3U2NAAfGF9fd2JpbmRnZW5fcGxhY2Vob2xkZXJfXxNfX3di\
aW5kZ2VuX2pzdmFsX2VxAAUYX193YmluZGdlbl9wbGFjZWhvbGRlcl9fGl9fd2JnX25ld19hYmRhNz\
ZlODgzYmE4YTVmAAEYX193YmluZGdlbl9wbGFjZWhvbGRlcl9fHF9fd2JnX3N0YWNrXzY1ODI3OWZl\
NDQ1NDFjZjYABBhfX3diaW5kZ2VuX3BsYWNlaG9sZGVyX18cX193YmdfZXJyb3JfZjg1MTY2N2FmNz\
FiY2ZjNgAEGF9fd2JpbmRnZW5fcGxhY2Vob2xkZXJfXxpfX3diaW5kZ2VuX29iamVjdF9kcm9wX3Jl\
ZgACGF9fd2JpbmRnZW5fcGxhY2Vob2xkZXJfXxZfX3diaW5kZ2VuX2lzX2Z1bmN0aW9uAAMYX193Ym\
luZGdlbl9wbGFjZWhvbGRlcl9fG19fd2JnX25leHRfYWFlZjdjOGFhNWUyMTJhYwADGF9fd2JpbmRn\
ZW5fcGxhY2Vob2xkZXJfXxtfX3diZ19kb25lXzFiNzNiMDY3MmUxNWYyMzQAAxhfX3diaW5kZ2VuX3\
BsYWNlaG9sZGVyX18cX193YmdfdmFsdWVfMWNjYzM2YmMwMzQ2MmQ3MQADGF9fd2JpbmRnZW5fcGxh\
Y2Vob2xkZXJfXxpfX3diZ19nZXRfNzY1MjAxNTQ0YTJiNjg2OQAFGF9fd2JpbmRnZW5fcGxhY2Vob2\
xkZXJfXxtfX3diZ19jYWxsXzk3YWU5ZDg2NDVkYzM4OGIABRhfX3diaW5kZ2VuX3BsYWNlaG9sZGVy\
X18bX193YmdfbmV4dF81NzllNTgzZDMzNTY2YTg2AAMYX193YmluZGdlbl9wbGFjZWhvbGRlcl9fHl\
9fd2JnX2lzQXJyYXlfMjdjNDZjNjdmNDk4ZTE1ZAADGF9fd2JpbmRnZW5fcGxhY2Vob2xkZXJfXx1f\
X3diZ19sZW5ndGhfOWUxYWUxOTAwY2IwZmJkNQADGF9fd2JpbmRnZW5fcGxhY2Vob2xkZXJfXxFfX3\
diaW5kZ2VuX21lbW9yeQABGF9fd2JpbmRnZW5fcGxhY2Vob2xkZXJfXx1fX3diZ19idWZmZXJfM2Yz\
ZDc2NGQ0NzQ3ZDU2NAADGF9fd2JpbmRnZW5fcGxhY2Vob2xkZXJfXxpfX3diZ19zZXRfODNkYjk2OT\
BmOTM1M2U3OQAGGF9fd2JpbmRnZW5fcGxhY2Vob2xkZXJfXxxfX3diaW5kZ2VuX2JpZ2ludF9nZXRf\
YXNfaTY0AAQYX193YmluZGdlbl9wbGFjZWhvbGRlcl9fF19fd2JpbmRnZW5fZGVidWdfc3RyaW5nAA\
QYX193YmluZGdlbl9wbGFjZWhvbGRlcl9fEF9fd2JpbmRnZW5fdGhyb3cABAPiA+ADHB4IBgMGBAYG\
BAcHDAYKBgYGCAoGBQUGAwYJBQkGCgIHBwQGCAoIBwYHCAcNBAcFBgIGBQYIBAYEBgUOBwYFAgQFEA\
wKBwgLDwUFBwggBgYGBQYFAgwFBAIFBQUIAwYLBQUFCgQECAgGBAQIAQQEBAQEBAQEBQYICAYIBAQK\
BgcIBQYFBAwEBQYEBgIGBQQEBgQEBAQEDAoEBAoKBAUSBAQHBwoEAAQDBgoECAYGBAQFBAsEBgYIBg\
UFAgYEBgQEBgYFAgICBAUACAYEBQICBAQEBAoEBAQECgcBBgYAChECBAQCAgQEAgICBAQEAgQHBgIC\
BAMEBgQEFhYbDAIGBAYIBQQGAgULBgAEAwMHBQIFBQAEBgAEAgAGAwQFCQYCBAUCAgQJBAUEBAIFBA\
UFBQUFAgICBgIEBAQCBAQCAggFAgICDQQBCQkTCgoKCwsVFAIEGQUCGQgFAgICBwQFBgoKCgUKCAUF\
BQUFBQIFBQIDCAIDBAQFBAICAwIFBQYGAgICBAUCBAIFAgQCBAIFBQoFAgIEBgMEBAQFAgIGBAQEBA\
cGBQUGBAQEAgQFBAQEAgYCBwUHBwICBQcFAwUGAwcFBQIDBAUFBQcHBwcBAgQEBQUFBQICGAMAAgIG\
AgICBAUBcAF+fgUDAQARBgkBfwFBgIDAAAsH7AELBm1lbW9yeQIABXBhcnNlAD0Xc3RhdGljX3RleH\
RfcmVuZGVyX3RleHQAVxZzdGF0aWNfdGV4dF9jbGVhcl90ZXh0AHwXc3RhdGljX3RleHRfcmVuZGVy\
X29uY2UAUxBzdHJpcF9hbnNpX2NvZGVzAK8BEV9fd2JpbmRnZW5fbWFsbG9jALMCEl9fd2JpbmRnZW\
5fcmVhbGxvYwDSAh9fX3diaW5kZ2VuX2FkZF90b19zdGFja19wb2ludGVyAOkDD19fd2JpbmRnZW5f\
ZnJlZQDeAxRfX3diaW5kZ2VuX2V4bl9zdG9yZQDdAwn6AQEAQQELfbUDQoED6APtAr0ChwGqA7oB2Q\
O+A9ID6gNrvAPhA7EDxwPmA90BgAHxAvsCsgH3AvoCiQOEA/gC+QL9AvwC9gLzA/QDqQP0AYcEmgOX\
A5UDlAOTA5gDxAPFA4gE5gLlAuQD4APKAdwCmwP7A84C3wPJAvUDlgOHAowEnAJ21AKLBOIDjQHuA4\
MEsAPOA4ADhAT/A6MD/QPNA8sDiQS7Av4DkwLMA5IC4wOIAc8D0QPvA4oE+QHUA35bjwHdAucDjgHY\
AuMCrgGiAdUD8AO+AoAEmALWA5cC1wOzA9gDgwODAXfaArQD2gPcA7cC2wP+ApEBvgEKstgH4AO/QA\
Icfxp+IwBBwAprIgMkACABvSEfAkACQCABIAFhDQBBAiEEDAELIB9C/////////weDIiBCgICAgICA\
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\
AiEXQQAhBQwBCyADQfgCaiAXNwIAIANB9AJqIAQ2AgAgA0HwAmogBTYCACADIAY2AuwCIANBADYC6A\
IgBg0BIANBgAFqIAEgAhBBAkACQAJAAkACQAJAIAMoAoABDQAgA0GIAWoiBygCACEGIANBjAFqIggp\
AgAhGCADKAKEASEFIAMgA0GUAWoiBCgCADYCuAIgAyAYNwOwAiADQYABaiAFIAYQNCADKAKAAQ0BIA\
coAgAhCSAIKQIAIRcgAygChAEhByADIAQoAgAiBjYCiAEgAyAXNwOAASAGDQQgA0GAAWoQlQJBACEG\
IAkhBUEAIQQMAgsgA0GUAWooAgAhBCADQYwBaikCACEXIANBiAFqKAIAIQUgAygChAEhBgwCCyAEKA\
IAIQQgCCkCACEXIAcoAgAhBSADKAKEASEGCyADQbACahCUAgtBACEHDAELIBinIQUgAyAGNgIYIAMg\
FzcDECADKQIUIRggF6chBCADKQK0AiEXIAkhBgsgA0HsAmoQiAMgB0UNAgsgAyAYNwKQASADIAQ2Ao\
wBIAMgFzcChAEgAyAFNgKAASADQegCaiAHIAYQtwECQCADKALoAkUNACADQfwCaigCACEEIANB9AJq\
KQIAIRcgA0HwAmooAgAhBSADKALsAiEGIANBgAFqEOACDAILIANB6AJqQQhqKAIAIQogAygC7AIhCy\
ADIBg3AsACIAMgBDYCvAIgAyAXNwK0AiADIAU2ArACIANBADYCrAMgA0IENwKkAyADQYABakEUaiEM\
IANBgAFqQQxqIQ0gA0GAAWpBCGohCSADQegCakEMaiEOIANBEGpBDGohCCADQegCakEUaiEPQQQhEE\
EAIQYgCiEFIAshEQJAA0ACQAJAAkAgBQ0AQQAhBQwBCyADQgE3AugCIANBgAFqIANB6AJqEN4BIAMt\
AIABDQggAy0AgQENAQsgA0HYAmpBCGogA0GkA2pBCGooAgA2AgAgAyADKQKkAzcD2AIMBgsgA0HoAm\
ogESAFEDUCQCADKALwAiISQQNGDQAgA0HQA2pBCGogD0EIaigCACIENgIAIAMgDykCACIXNwPQAyAD\
KALsAiEHIAMoAugCIRMgAygC9AIhFCADKAL4AiEVIAhBCGoiFiAENgIAIAggFzcCACADIBU2AhggAy\
AUNgIUIAMgEjYCECADQegCaiATIAcQtwEgAygC8AIhByADKALsAiEEAkAgAygC6AJFDQAgA0HAA2pB\
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\
AgwBCyADQagBakEIaiADQZwCaigCACIGNgIAIAMgA0GUAmopAgAiDzcDqAEgA0GIAmpBCGoiBCgCAC\
EFIAMoAowCIQcgBCAGNgIAIAMgDzcDiAICQCAGRQ0AIANCCDcC2AIgA0GIAmoQlQIMAQsCQAJAAkAg\
AygCUCIGQQFLDQAgBkUNAiADQeQCaiADKAJIIgRBCGopAgA3AgAgA0HsAmogBEEQaikCADcCACADIA\
QpAgA3AtwCIAQgBEEYaiAGQRhsQWhqEPgDGkEFIQggA0EFNgLYAiADIAU2AtQCIAMgBzYC0AIgAyAG\
QX9qNgJQDAELIANB0AJqIAEgAkH41cAAQc0AEI8DIAMoAtgCIQgLIANBiAJqEJUCIANByABqEJQCIA\
hBCEYNAiADQRBqQQhqIANB+AJqKQIANwMAIANBIGogA0GAA2opAgA3AwAgA0GSAWogA0GLA2otAAA6\
AAAgAyADKQLwAjcDECADIAMvAIkDOwGQASADKALsAiECIAMoAugCIQcgAygC5AIhBCADKALgAiEFIA\
MoAtwCIQYgAygC1AIhASADKALQAiEJIAMtAIgDIQoMAwsQ0gEACyADQcgAahCUAgsCQCADKALcAiIG\
RQ0AIANB7AJqKAIAIQIgA0HoAmooAgAhByADQeQCaigCACEEIANB4AJqKAIAIQUMAgsgA0EIakEBEO\
kBIAMoAgwhCSADKAIIIghBIToAACADQYgCaiAIQQEgASACENABAkACQAJAIAMoAogCDQAgA0GIAmpB\
EGoiBSgCACEHIANBiAJqQQxqIgsoAgAhBCADQYgCaiADKAKMAiADQYgCakEIaiIGKAIAEGQCQCADKA\
KIAkUNACADQZwCaigCACEKIAUoAgAhByALKAIAIQQgBigCACEFDAILIANBqAFqQRBqIAc2AgAgA0Go\
AWpBDGogBDYCACADQagBakEIaiAGKAIAIgU2AgAgAyADKAKMAiIGNgKsAUEAIQpBASELDAILIANBnA\
JqKAIAIQogA0GYAmooAgAhByADQZQCaigCACEEIANBkAJqKAIAIQULIAMoAowCIQYgA0G8AWogCjYC\
ACADQbgBaiAHNgIAIANBtAFqIAQ2AgAgA0GwAWogBTYCACADIAY2AqwBQQEhCkEAIQsLIAMgCjYCqA\
EgCCAJELcDAkACQAJAAkACQCALRQ0AIAYhASAFIQIMAQsgBg0BIANBrAFqEIgDQQAhBAsgA0GIAmog\
ASACEDACQCADKAKQAiIIQQVHDQAgA0GkAmooAgAhAiADQaACaigCACEHIANBnAJqKAIAIQQgA0GYAm\
ooAgAhBSADKAKUAiEGDAILIANBGGogA0GwAmopAgA3AwAgA0EgaiADQbgCaikCADcDACADQZABakEC\
aiADQcgAakECai0AADoAACADIAMpAqgCNwMQIAMgAy8ASDsBkAEgBEEARyEKIAMoAqQCIQIgAygCoA\
IhByADKAKcAiEEIAMoApgCIQUgAygClAIhBiADKAKMAiEBIAMoAogCIQkMAgsgA0G8AWooAgAhAgtB\
CCEICwJAIAMoAtgCQQhHDQAgA0HcAmoQiAMLIAhBCEYNAQsgA0HQAmpBKGogA0EQakEQaikDADcCAC\
ADQdACakEgaiADQRBqQQhqIgspAwA3AgAgA0GDA2ogA0GSAWotAAA6AAAgAyADKQMQNwLoAiADIAMv\
AZABOwCBAyADIAo6AIADIAMgAjYC5AIgAyAHNgLgAiADIAQ2AtwCIAMgBTYC2AIgAyAGNgLUAiADIA\
g2AtACIANBiAJqIAkgARC3ASADKAKIAkUNASADQZwCaigCACECIANBiAJqQRBqKAIAIQcgA0GUAmoo\
AgAhBCADQYgCakEIaigCACEFIAMoAowCIQYgA0HQAmoQnwILIAAgBjYCDCAAQQg2AgggAEEcaiACNg\
IAIABBGGogBzYCACAAQRRqIAQ2AgAgAEEQaiAFNgIADAELIANBiAJqQQhqKAIAIQkgAygCjAIhCiAD\
QegBakEIaiIMIANB0AJqQRhqIgFBCGopAgA3AwAgA0HoAWpBEGoiDSABQRBqKQIANwMAIANB6AFqQR\
hqIg4gAUEYaigCADYCACADIAEpAgA3A+gBIAMgAjYCJCADIAc2AiAgAyAENgIcIAMgBTYCGCADIAY2\
AhQgAyAINgIQIANBEGpBIGogDCkDADcCACADQRBqQShqIA0pAwA3AgAgA0HAAGogDigCADYCACADIA\
MpA+gBNwIoIANB+ABqIAogCRBqAkACQAJAAkAgAygCeCIFRQ0AAkAgAygCfA0AIANByABqIAtBLBD3\
AxoMAgsgAEEINgIIIAAgA0H8AGoiBikCADcCDCAAQRxqIAZBEGooAgA2AgAgAEEUaiAGQQhqKQIANw\
IADAMLIANBhAFqLQAAIQcgA0GIAmogAygCfCIGIANB+ABqQQhqKAIAIgQQMgJAAkAgAygCkAJBCEcN\
ACADQdACaiAGIAQQMgJAAkACQCADKALYAiICQQhHDQACQCADKALcAiIBRQ0AIANB6AJqKAIAIQQgA0\
HgAmooAgAhAiADQewCaigCACEIIANB5AJqKAIAIQYgA0EsEOkBIAMoAgQhCSADKAIAQbzVwABBLBD3\
AyEKIANBLDYCzAIgAyAJNgLIAiADIAo2AsQCIANBxAJqQZDTwABBAhDiASADQcQCaiAGIAgQ4gEgA0\
G0AWogASACIANBxAJqENgBIANBCDYCsAEgBiAEELcDDAMLIANBqAFqIAYgBEG81cAAQSwQjwMgAkEI\
Rw0BQQANAiADKALcAkUNAiADQeQCaigCACADQegCaigCABC3AwwCCyADQagBaiAGIARBvNXAAEEsEI\
8DCyADQdACahDwAgsgA0GIAmoQ8AIMAQsgA0GoAWogA0GIAmpBPBD3AxoLIAMoArABIgJBCEYNASAD\
QZABakEIaiIGIANBvAFqKQIANwMAIANBkAFqQRBqIgQgA0HEAWooAgA2AgAgAyADKQK0ATcDkAEgAy\
gCrAEhCSADKAKoASEKIANB6AJqIgEgA0HgAWooAgA2AgAgA0HQAmpBEGoiCCADQdgBaikCADcDACAD\
QdACakEIaiILIANB0AFqKQIANwMAIAMgAykCyAE3A9ACIANBiAJqQRBqIgwgBCgCADYCACADQYgCak\
EIaiINIAYpAwA3AwAgAyADKQOQATcDiAJB7AAQpwMiBiADQRBqQTQQ9wMiBCACNgI0IAQgBzoAaCAE\
IAMpA4gCNwI4IARBwABqIA0pAwA3AgAgBEHIAGogDCgCADYCACAEIAMpA9ACNwJMIARB1ABqIAspAw\
A3AgAgBEHcAGogCCkDADcCACAEQeQAaiABKAIANgIAQQchCAsgACAGNgIMIAAgCDYCCCAAIAk2AgQg\
ACAKNgIAIABBEGogA0HIAGpBLBD3AxogBUUNAiADQfwAahCIAwwCCyADQaABaiADQagBakEcaigCAC\
IGNgIAIANBkAFqQQhqIANBqAFqQRRqKQIAIg83AwAgAyADKQK0ASIQNwOQASAAQRxqIAY2AgAgAEEU\
aiAPNwIAIAAgEDcCDCAAQQg2AggLIANBEGoQnwILIANBkANqJAALpRkDCn8BfgF8IwBBkAJrIgIkAC\
ACIAE2AoABAkACQAJAAkACQAJAIAEQoAMNAAJAIAEQBSIDQQFLDQAgAEEAOgAAIAAgA0EARzoAAQwE\
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\
IQogAkGAAmoQ5wELIABBFjoAACAAIAo2AgQgAkHEAWoQkQIMAwsgAkHwAWpBCGogAkGYAWpBCGopAw\
A3AwAgAiACKQOYATcD8AEgAkGUAWpBAmogCi0AADoAACACIAcvAAA7AZQBQQAhBAsgBiACLwGUATsA\
ACAFIAIpA/ABNwMAIAZBAmogAkGUAWpBAmotAAA6AAAgBUEIaiACQfABakEIaikDADcDACACIAw3A9\
gBIAIgCzYC1AEgAiADOgDQAQJAIAQNACACQcQBaiACQdABahDRAQwBCwsgAkHQAWoQrwMgAkHbAWog\
AkHEAWpBCGooAgA2AAAgAEEVOgAAIAIgAikCxAE3ANMBIAAgAikA0AE3AAEgAEEIaiACQdcBaikAAD\
cAAAsgAigCuAEQtgMgAigCsAEgAigCtAEQxgMMBQsCQCABEBRBAUYNACAAIAJBkAFqENECIAIoApAB\
IQEMBQsgAiABEBciAzYClAEgAkGYAWpBEGogAxAQIgM2AgAgAkGkAWpBADYCACACQQA2AqwBIAJBAD\
YCmAEgAiACQZQBajYCoAFBCCEEAkAgA0GAgAIgA0GAgAJJGyIDRQ0AQQggA0EFdBCFAyIERQ0DCyAC\
QZgBakEIaiEHIAJBADYCzAEgAiADNgLIASACIAQ2AsQBIAJB0AFqQRBqIQYgAkHQAWpBAXIhCiACQf\
ABakEBciELIAJBlAFqIQUCQAJAAkACQANAQRYhAwJAIAVFDQAgAkHYAGogBxCbAkEWIQMgAigCWEUN\
ACACQdAAaiACKAJcEOQCIAIgAigCrAFBAWo2AqwBIAIoAlQhAyACQYACaiACKAJQEDMgAi0AgAJBFk\
YNAiACQfABakEIaiACQYACakEIaiIEKQMANwMAIAIgAikDgAI3A/ABIAJBgAJqIAMQMwJAIAItAIAC\
QRZHDQAgAigChAIhBCACQfABahDnAQwECyACQbABakEIaiAEKQMANwMAIAIgAikDgAI3A7ABIAJBwA\
FqQQJqIAtBAmotAAA6AAAgAiALLwAAOwHAASACKAL0ASEEIAItAPABIgNBF0YNAyACKQP4ASEMCyAK\
IAIvAcABOwAAIAYgAikDsAE3AwAgCkECaiACQcABakECai0AADoAACAGQQhqIAJBsAFqQQhqKQMANw\
MAIAIgDDcD2AEgAiAENgLUASACIAM6ANABIANBFkYNAyACQcQBaiACQdABahDRASACKAKgASEFDAAL\
CyACKAKEAiEEIAMQtgMLIABBFjoAACAAIAQ2AgQgAkHEAWoQkQIMAQsgAkHQAWoQrwMgAkHbAWogAk\
HEAWpBCGooAgA2AAAgAEEVOgAAIAIgAikCxAE3ANMBIAAgAikA0AE3AAEgAEEIaiACQdcBaikAADcA\
AAsgAigCmAEgAigCnAEQxgMgAigClAEQtgMMBAsgAiABNgKYASACQQhqIAEQwwICQCACKAIIRQ0AIA\
IgAikDECIMEBg2AtABIAJBmAFqIAJB0AFqELsDIQMgAigC0AEQtgMgAigCmAEhASADRQ0AIAEQtgMg\
ACAMNwMIIABBBDoAAAwGC0HricAAQc8AELABIQMgAEEWOgAAIAAgAzYCBAwDCyAAQRI6AAAMAgsACy\
ACKALUASEBIABBFjoAACAAIAE2AgQgAkHwAWoQkAIMAQsgARC2AwwBCyACKAKwARC2AwsgAkGQAmok\
AAuUEgIUfwN+IwBBwAFrIgMkAEEAIQQgA0EANgIMIANCBDcCBCADQYgBakEMaiEFQQQhBiADQYgBak\
EEaiEHIANBoAFqQQxqIQggA0GIAWpBDWohCSADQaABakENaiEKIANB8ABqQQRqIQsgA0GgAWpBBGoh\
DCADQcAAakEEaiENIANB2ABqQQRqIQ4gA0HwAGpBDWohD0EAIRACQAJAAkADQAJAAkAgAkUNACADQa\
ABaiABIAIQaiADKAKoASERIAMoAqQBIRICQAJAAkACQCADKAKgAQ0AIAMgEjYCXAwBCyAPIAopAAA3\
AAAgD0EHaiAKQQdqIhMoAAA2AAAgAyADLQCsAToAfCADIBE2AnggAyASNgJ0IANBATYCcAJAAkACQC\
ASDQAgA0GgAWogASACEH8CQAJAIAMoAqABDQAgByAMKQIANwIAIAdBCGogDEEIaikCADcCAAwBCwJA\
IAMoAqQBRQ0AIAcgDCkCADcCACAHQRBqIAxBEGooAgA2AgAgB0EIaiAMQQhqKQIANwIADAMLIANBiA\
FqIAEgAhC1AiAMEIgDIAMoAogBDQILIAMgAygCkAEiETYCYCADIAMoAowBIhI2AlxBACEUQQEhFQwC\
CyAOIAspAgA3AgAgDkEQaiALQRBqKAIANgIAIA5BCGogC0EIaikCADcCAEEBIRQgA0EBNgJYIAMoAl\
whEgwDCyADIAMoApwBNgJsIAMgAykClAE3AmQgAyADKAKQASIRNgJgIAMgAygCjAEiEjYCXEEBIRRB\
ACEVCyADIBQ2AlggCxCIAyAVRQ0BCyADIBE2AkggAyASNgJEIANBADYCQAwBCwJAAkACQCASDQAgA0\
GgAWogASACEDUCQCADKAKoASISQQNGDQAgA0GIAWpBCGogCEEIaikCACIXNwMAIANBiAFqQRBqIAhB\
EGooAgAiETYCACADIAgpAgAiGDcDiAEgAykCoAEhGSAMQRBqIBE2AgAgDEEIaiAXNwIAIAwgGDcCAC\
ADIBI2AqABIANBoAFqEKYDIAMgGTcCRCADQQA2AkAMAwsgA0GIAWpBEGogCEEQaigCACISNgIAIANB\
iAFqQQhqIAhBCGopAgAiFzcDACADIAgpAgAiGDcDiAEgC0EQaiIRIBI2AgAgC0EIaiISIBc3AgAgCy\
AYNwIAIANBATYCcCADKAJ0RQ0BIA0gCykCADcCACANQRBqIBEoAgA2AgAgDUEIaiASKQIANwIAIANB\
ATYCQAwCCyANIA4pAgA3AgAgDUEQaiAOQRBqKAIANgIAIA1BCGogDkEIaikCADcCACADQQE2AkAMAg\
sgA0GgAWogASACEF8gAygCqAEhESADKAKkASESAkACQCADKAKgAQ0AIAMgETYCSCADIBI2AkQgA0EA\
NgJADAELIAkgCikAADcAACAJQQdqIBMoAAA2AAAgAyADLQCsAToAlAEgAyARNgKQASADIBI2AowBIA\
NBATYCiAECQAJAAkAgEg0AIANBoAFqQSkgASACEKcBIAMoAqABDQFBACESDAILIA0gBykCADcCACAN\
QRBqIAdBEGooAgA2AgAgDUEIaiAHQQhqKQIANwIAIANBATYCQAwCCyADIAMpArABNwJQIAMgAygCrA\
E2AkxBASESCyADKAKkASERIAMgAygCqAE2AkggAyARNgJEIAMgEjYCQCAHEIgDCyALEIgDCyAURQ0A\
IA4QiAMLIANBKGogA0HAAGoQ3gEgAy0AKA0DIAMtACkNASACIQQLIAAgATYCBCAAQQA2AgAgAEEIai\
AENgIAIABBDGogAykCBDcCACAAQRRqIANBBGpBCGooAgA2AgAMBAsgA0GgAWogASACEEogA0HwAGpB\
CGoiEyAIQQhqKAIANgIAIAMgCCkCADcDcCADKAKoASERIAMoAqQBIRICQAJAAkACQAJAAkACQCADKA\
KgAQ0AIANBoAFqQQhqIhQgEygCACITNgIAIAMgAykDcDcDoAECQCATDQAgA0GgAWoQnANBACESIBYh\
EQwCCyADQcAAakEIaiAUKAIAIhM2AgAgAyADKQOgASIXNwNAIANB2ABqQQhqIhYgEzYCACADIBc3A1\
ggA0GgAWogEiAREL0BIAMoAqgBIRMgAygCpAEhEiADKAKgAQ0CIANBoAFqIBIgExC3ASADKAKoASET\
IAMoAqQBIRIgAygCoAFFDQUgA0HwAGpBCGogCEEIaigCADYCACADIAgpAgA3A3AgEyERDAMLIANB2A\
BqQQhqIANB8ABqQQhqKAIANgIAIAMgAykDcDcDWAsgA0EoakEIaiADQdgAakEIaigCADYCACADIAMp\
A1g3AygMAgsgA0HwAGpBCGogCEEIaigCADYCACADIAgpAgA3A3AgEyERCyADQShqQQhqIANB8ABqQQ\
hqKAIANgIAIAMgAykDcDcDKCADQdgAahCcAwsgA0EQakEIaiADQShqQQhqKAIAIhA2AgAgAyADKQMo\
Ihc3AxAgBUEIaiAQNgIAIAUgFzcCACADIBE2ApABIAMgEjYCjAEgA0EBNgKIASASDQEgACABNgIEIA\
BBADYCACAAQQhqIAI2AgAgAEEMaiADKQIENwIAIABBFGogA0EEakEIaigCADYCACAHEIgDDAULIANB\
EGpBCGogFigCACICNgIAIAMgAykDWCIXNwMQIBQgAjYCACADIBc3A6ABIAUgFzcCACAFQQhqIgEgAj\
YCACADIBI2AowBIAMgEzYCkAECQCAQIAMoAghHDQAgA0EEaiAQEJ4BIAMoAgQhBiADKAIMIRALIAEo\
AgAhAiAGIBBBDGxqIgEgBSkCADcCACABQQhqIAI2AgAgAyADKAIMQQFqIhA2AgwgESEWIBMhAiASIQ\
EMAQsLIABBATYCACAAIAcpAgA3AgQgAEEUaiAHQRBqKAIANgIAIABBDGogB0EIaikCADcCAAwBCyAD\
QSJqIANBKGpBFGooAgAiEjYBACADQRpqIANBKGpBDGopAgAiFzcBACADIAMpAiwiGDcBEiAAQRRqIB\
I2AQAgAEEMaiAXNwEAIAAgGDcBBCAAQQE2AgALIANBBGoQlQILIANBwAFqJAALmBACCn8BfiMAQeAB\
ayIDJAAgA0EYaiABIAIQqwECQAJAAkACQCADKAIYIgRFDQACQCADKAIcIgVFDQAgA0EgaikCACENIA\
BBGGogA0EYakEQaikCADcCACAAQRBqIA03AgAgACAFNgIMIABBAzYCCAwECyADQRxqEIgDIANBGGpB\
JiABIAIQpwECQAJAIAMoAhgNACADQSRqKAIAIQYgA0EgaigCACECIAMoAhwhAQwBCyADKAIcIgUNAi\
ADQRxqEIgDQYCAxAAhBgsMAgsgA0EkaigCACEHIANBIGooAgAhAiADKAIcIQFBgIDEACEGDAELIANB\
IGopAgAhDSAAQRhqIANBGGpBEGopAgA3AgAgAEEQaiANNwIAIAAgBTYCDCAAQQM2AggMAQsgA0EQak\
ECEOkBIAMoAhQhCCADKAIQIgVBvvwAOwAAIANBCGpBARDpASADKAIMIQkgAygCCCIKQT46AAAgA0EC\
EOkBIAMoAgQhCyADKAIAIgxBvvgBOwAAIANBPGpBAjYCACADQThqIAg2AgAgAyAFNgI0IANBAjYCMC\
ADIAs2AiwgAyAMNgIoIANBATYCJCADIAk2AiAgAyAKNgIcIANBPDYCGCADQagBaiAFQQIgASACENAB\
AkACQAJAAkACQAJAAkAgAygCqAENACADQewAaiICQQE6AAAgA0GwAWooAgAhCCADKAKsASEFIAIoAg\
AhCQwBCyADQeAAakEQaiADQagBakEQaikCADcCACADQeAAakEMaiADQagBakEMaigCACIJNgIAIANB\
4ABqQQhqIANBqAFqQQhqKAIAIgg2AgAgAyADKAKsASIFNgJkIANBATYCYAJAAkACQCAFDQAgA0HkAG\
ohCyADQagBaiAKQQEgASACENABAkACQCADKAKoAQ0AIANBkAFqQQxqIANBqAFqQQxqKQIANwIAIAMg\
AykCrAE3ApQBDAELIANBrAFqIQUCQCADKAKsAUUNACADQaQBaiAFQRBqKAIANgIAIANBnAFqIAVBCG\
opAgA3AgAgAyAFKQIANwKUAQwDCyADQZABaiAMQQIgASACENABIAUQiAMgAygCkAENAgtBACEKIANB\
hAFqIgJBADoAACADQfgAakEIaiADQZABakEIaigCACIINgIAIAMgAygClAEiBTYCfCACKAIAIglBCH\
YhAgwCCyAJQQh2IQIgAykCcCENDAMLIANB+ABqQRBqIANBkAFqQRBqKQIANwIAIANB+ABqQQxqIANB\
kAFqQQxqKAIAIgk2AgAgA0H4AGpBCGogA0GQAWpBCGooAgAiCDYCACADIAMoApQBIgU2AnxBASEKIA\
NBATYCeAJAIAUNACADQfwAaiEMIANBqAFqQTwgASACEKcBAkACQCADKAKoAQ0AIANBsAFqKAIAIQgg\
AygCrAEhBUEAIQpBAiEJDAELIANBtAFqKAIAIglBCHYhAiADQbgBaikCACENIANBqAFqQQhqKAIAIQ\
ggAygCrAEhBUEBIQoLIAwQiAMMAQsgCUEIdiECIAMpAogBIQ0LIAsQiAMgCg0BCyADQRhqEMwCIANB\
GGpBJiAFIAgQpwECQAJAIAMoAhgNACADQRhqIAMoAhwgA0EYakEIaiICKAIAEKsBIAMoAhhFDQMgA0\
EoaikCACENIANBJGooAgAhDCACKAIAIQEMAQsgA0EoaikCACENIANBJGooAgAhDCADQSBqKAIAIQEL\
IAMoAhwhAiADQbgBaiANNwIAIANBtAFqIgogDDYCACADQagBakEIaiABNgIAIAMgAjYCrAEgA0EBNg\
KoASACDQMgA0GsAWohCiADQRhqIAUgCBC3AQJAAkACQAJAIAMoAhgNACADQRhqIAMoAhwgA0EYakEI\
aiICKAIAEEogAygCGEUNAiADQfgAakEIaiADQSxqKAIANgIAIAMgA0EkaikCADcDeCACKAIAIQEMAQ\
sgA0H4AGpBCGogA0EsaigCADYCACADIANBJGopAgA3A3ggA0EYakEIaigCACEBCyADKAIcIQIgA0HQ\
AGpBCGogA0H4AGpBCGooAgA2AgAgAyADKQN4NwNQQQAhBQwBCyADQcABakEIaiIFIANBLGooAgA2Ag\
AgAyADQSRqKQIANwPAASACKAIAIQEgAygCHCECIANB0ABqQQhqIAUoAgA2AgAgAyADKQPAATcDUEEB\
IQULIAoQiAMgBQ0CDAQLIAAgAjsAFSAAIAU2AgwgAEEDNgIIIABBF2ogAkEQdjoAACAAQRhqIA03Ag\
AgAEEUaiAJOgAAIABBEGogCDYCACADQRhqEMwCDAQLIANBqAFqQQxqIgFBADYCACADQbgBaiADQRhq\
QQxqKAIANgIAIANB0ABqQQhqIANBvAFqKAIANgIAIAMgASkCADcDUCACKAIAIQEgAygCHCECCyADQc\
AAakEIaiADQdAAakEIaigCACIFNgIAIAMgAykDUCINNwNAIANBGGpBCGogBTYCACADIA03AxggACAH\
NgIMIABBAkEBIAZBgIDEAEYbQQAgBBs2AgggACABNgIEIAAgAjYCACAAIA03AhAgAEEYaiAFNgIAIA\
AgCToAHAwCCyADQdAAakEIaiAKQQhqKAIANgIAIAMgCikCADcDUAsgA0HAAGpBCGogA0HQAGpBCGoo\
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\
ACADKAJoIQ0gAygCZCELDAULIAggCSkCADcCACAIQRBqIAlBEGooAgA2AgAgCEEIaiAJQQhqKQIANw\
IAIANBATYCYCADKAJkIQsMBgsgA0E4aigCACEBIANBNGooAgAhDCADQTBqKAIAIQ0gA0EsaigCACEC\
IAMoAighCwwKCyADIA02AmggAyALNgJkIANBATYCYAtBACEMCyAJEIgDIAxFDQILIANB1ABqIAUQgQ\
IgDSECIAshAQwACwsgCw0BIAMoAlwhCyADKAJYIQwgAygCVCENIAgQiAMLIAMgCzYCuAEgAyAMNgK0\
ASADIA02ArABAkAgCw0AIANBsAFqEJ8DQQAhC0EAIQEMBQtBACEFIANBADYCRCADQQA2AjQgAyANNg\
IsIAMgDDYCKCADIA02AiQgAyANIAtBDGxqNgIwIANBsAFqIANBJGoQqQFBBCELAkACQCADKAKwAUEE\
Rw0AIANBJGoQsgJBACENDAELIANB+ABqIANBJGoQxQEgAygCeEEBaiILQX8gCxsiC0EEIAtBBEsbIg\
1B////P0sNAiANQQR0IgtBf0wNAiALEJ0DIgtFDQMgCyADKQKwATcCACALQQhqIANBsAFqQQhqKQIA\
NwIAIANBATYCaCADIA02AmQgAyALNgJgIANBsAFqIANBJGpBMBD3AxogA0HgAGogA0GwAWoQswEgAy\
gCYCELIAMoAmQhDSADKAJoIQULIAAgATYCBCAAQRRqIAU2AgAgAEEQaiANNgIAIABBDGogCzYCACAA\
QQhqIAI2AgBBACELDAULIANB9ABqKAIAIQEgAygCcCEMIAMoAmwhDSADKAJoIQIMAgsQwgIACwALIA\
NB1ABqEJ8DCyAAIAs2AgQgAEEUaiABNgIAIABBEGogDDYCACAAQQxqIA02AgAgAEEIaiACNgIAQQEh\
CwsgACALNgIAIANB4AFqJAALpw0CDX8DfiMAQYABayIFJAAgBCABEK8CIQYgBUEcaiABIAQQRiAEKQ\
EAIRIgBUEANgJAIAVCBDcCOCASQjCIIRMgEkIgiCEUIBKnIgRBEHYhByAEQf//A3EhCAJAAkACQAJA\
AkACQANAAkACQAJAIAIgA0cNACAFQcQAaiAFQThqIBSnIBOnEHMgBSgCTA0BIAVBEGpBBEEQEOICIA\
UoAhAiAkUNBiAFQQA2AlggBUIBNwJQIAVB4ABqIAVB0ABqENsBIAIgBSkCYDcCACACQQhqIAVB4ABq\
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\
akEIaiAKQQhqKAIANgIAIAMgCikCADcDGAwCCyADKAL0ASEKIAMoAvABIQsgAygC7AEhDSADKALoAS\
EOIANBrAFqEJ8CCyADIAo2AkwgAyALNgJIIAMgDTYCRCADIA42AkAgAyAPNgI8IANBCDYCOAJAIA8N\
ACADQRhqQQhqIANBJGpBCGooAgA2AgAgAyADKQIkNwMYIAgQiAMgASEPIAIhDgwDCyADQRhqQQhqIA\
dBCGooAgA2AgAgAyAHKQIANwMYIA4hAiAPIQELIANBJGoQuAMgA0EIakEIaiADQRhqQQhqKAIAIgo2\
AgAgAyADKQMYIhs3AwggAEEUaiAKNgIAIABBDGogGzcCACAAQQhqIAI2AgAgACABNgIEIABBATYCAA\
wCCyADQRhqQQhqIANBJGpBCGooAgA2AgAgAyADKQIkNwMYCyADQQhqQQhqIANBGGpBCGooAgAiCjYC\
ACADIAMpAxgiGzcDCCADQTBqQQhqIAo2AgAgAyAbNwMwIABBCGogDjYCACAAIA82AgQgAEEMaiAbNw\
IAIABBFGogCjYCACAAQQA2AgALIANBoAJqJAALogsBDn8jAEHwAGsiAyQAIANBIGogASACEKsCIAMo\
AiQhBCADKAIgIQUCQAJAAkACQAJAAkACQAJAAkACQEEALQCwvEEiAkEDRg0AAkAgAg4DAAMCAAtBAE\
ECOgCwvEFBAEEBEJADIQECQAJAAkACQAJAQQAoAsC8QUH/////B3FFDQAQ+gNFDQELQQAoArS8QSEC\
QQBBfzYCtLxBIAINCUEAKALAvEFB/////wdxDQFBACABNgK8vEEMAgsgA0HkAGpCADcCACADQQE2Al\
wgA0Gk58AANgJYIANB8LvBADYCYCADQdgAakHI58AAEMACAAsQ+gMhAkEAIAE2Ary8QSACRQ0BC0EA\
KALAvEFB/////wdxRQ0AEPoDDQBBAEEBOgC4vEELQQBBAzoAsLxBQQBBADYCtLxBCyADQSxqIAUgBB\
A8IAMoAiwNBSADQcAAaigCACEGIANBLGpBCGooAgAhByADKAIwIQggA0EANgJoIAMgCCAHajYCZCAD\
IAg2AmAgAyAHNgJcIAMgCDYCWCADQdgAakEIaiEBIANBOGohCQNAIAMoAmQhCiADKAJgIQsgA0EYai\
ABEMkBIAMoAhwiAkGAgMQARg0DIAMoAhghDCACEKECDQALIAogC2sgDGogAygCYCINaiADKAJkIgJr\
IQ4MAwsgA0HkAGpCADcCACADQQE2AlwgA0HchsAANgJYIANB8LvBADYCYCADQdgAakHghcAAEMACAA\
sgA0HkAGpCADcCACADQQE2AlwgA0GchsAANgJYIANB8LvBADYCYCADQdgAakHghcAAEMACAAtBACEM\
IAMoAmQhAiADKAJgIQ1BACEOCwJAA0AgDSACIgFGDQECQCABQX9qIgItAAAiCsAiC0F/Sg0AAkACQC\
ABQX5qIgItAAAiCsAiD0FASA0AIApBH3EhCgwBCwJAAkAgAUF9aiICLQAAIgrAIhBBQEgNACAKQQ9x\
IQoMAQsgAUF8aiICLQAAQQdxQQZ0IBBBP3FyIQoLIApBBnQgD0E/cXIhCgsgCkEGdCALQT9xciIKQY\
CAxABGDQILIAoQoQINAAsgASANayADKAJoaiEOCwJAAkACQCAOIAxGDQAgA0HEAGogCCAHEMIDIANB\
2ABqIANBxABqEGMgAygCWA0BIANB5ABqKAIAIQYgA0HgAGooAgAhASADKAJcIQIMAgsCQCAGRQ0AIA\
NBPGooAgAhASADKAI4IQIMBQsgA0EIakEEQQwQ4gIgAygCCCIBRQ0CIAFBDjYCCCABQdTUwAA2AgQg\
AUHEj8AANgIAIAkQuAMMBQtBACECIANB2ABqELkCIQELIAkQuAMMAgsACwJAAkAgAygCMEUNACADQd\
gAaiADQTBqEGMCQCADKAJYDQAgA0HkAGooAgAhBiADQeAAaigCACEBIAMoAlwhAgwDC0EAIQIgA0HY\
AGoQuQIhAQwBCyADQcQAaiAFIAQQwgMgA0HYAGogA0HEAGoQYwJAIAMoAlgNACADQeQAaigCACEGIA\
NB4ABqKAIAIQEgAygCXCECDAILQQAhAiADQdgAahC5AiEBCwsgAkUNACADIAY2AmAgAyABNgJcIAMg\
AjYCWEEAIQogA0EANgIsIANBEGogA0HYAGogA0EsahDkASADKAIQIAMoAhRB9IvAABC6AiELIANB2A\
BqEM8CIAIgARChA0EAIQIMAQsgAyABNgIoIANBDjYCSCADIANBKGo2AkQgA0IBNwJkQQEhCiADQQE2\
AlwgA0Gg38AANgJYIAMgA0HEAGo2AmAgA0EsaiADQdgAahBtIAMoAjAhASADKAIsIgsgAygCNBDeAi\
ECIAsgARC3AyADKAIoIgEgASgCACgCABECAEEAIQsLIAUgBBC3AyAAIAo2AgggACACNgIEIAAgCzYC\
ACADQfAAaiQAC5gLAQV/IwBBEGsiAyQAAkACQAJAAkACQAJAAkACQAJAAkAgAQ4oBQgICAgICAgIAQ\
MICAIICAgICAgICAgICAgICAgICAgICAYICAgIBwALIAFB3ABGDQMMBwsgAEGABDsBCiAAQgA3AQIg\
AEHc6AE7AQAMBwsgAEGABDsBCiAAQgA3AQIgAEHc5AE7AQAMBgsgAEGABDsBCiAAQgA3AQIgAEHc3A\
E7AQAMBQsgAEGABDsBCiAAQgA3AQIgAEHcuAE7AQAMBAsgAEGABDsBCiAAQgA3AQIgAEHc4AA7AQAM\
AwsgAkGAgARxRQ0BIABBgAQ7AQogAEIANwECIABB3MQAOwEADAILIAJBgAJxRQ0AIABBgAQ7AQogAE\
IANwECIABB3M4AOwEADAELAkACQAJAAkACQAJAAkAgAkEBcUUNACABQQt0IQRBACECQSEhBUEhIQYC\
QAJAA0ACQAJAQX8gBUEBdiACaiIHQQJ0QfzKwABqKAIAQQt0IgUgBEcgBSAESRsiBUEBRw0AIAchBg\
wBCyAFQf8BcUH/AUcNAiAHQQFqIQILIAYgAmshBSAGIAJLDQAMAgsLIAdBAWohAgsCQAJAAkACQCAC\
QSBLDQAgAkECdCIEQfzKwABqKAIAQRV2IQYgAkEgRw0BQR8hAkHXBSEHDAILQSFBIUGUycAAEOoBAA\
sgBEGAy8AAaigCAEEVdiEHAkAgAg0AQQAhAgwCCyACQX9qIQILIAJBAnRB/MrAAGooAgBB////AHEh\
AgsCQCAHIAZBf3NqRQ0AIAEgAmshBSAGQdcFIAZB1wVLGyEEIAdBf2ohB0EAIQIDQCAEIAZGDQcgAi\
AGQYDMwABqLQAAaiICIAVLDQEgByAGQQFqIgZHDQALIAchBgsgBkEBcQ0BCyABQSBJDQUgAUH/AEkN\
AyABQYCABEkNAiABQYCACEkNASABQdC4c2pB0LorSQ0FIAFBtdlzakEFSQ0FIAFB4ot0akHiC0kNBS\
ABQZ+odGpBnxhJDQUgAUHe4nRqQQ5JDQUgAUF+cUGe8ApGDQUgAUFgcUHgzQpGDQUgAUHGkXVqQQZJ\
DQUgAUGQ/EdqQZD8C0kNBQwDCyADQQZqQQJqQQA6AAAgA0EAOwEGIAMgAUEIdkEPcUG0ycAAai0AAD\
oADCADIAFBDHZBD3FBtMnAAGotAAA6AAsgAyABQRB2QQ9xQbTJwABqLQAAOgAKIAMgAUEUdkEPcUG0\
ycAAai0AADoACSADQQZqIAFBAXJnQQJ2QX5qIgJqIgZBAC8A3slAOwAAIAMgAUEEdkEPcUG0ycAAai\
0AADoADSAGQQJqQQAtAODJQDoAACADQQZqQQhqIgYgAUEPcUG0ycAAai0AADoAACAAIAMpAQY3AAAg\
A0H9ADoADyAAQQhqIAYvAQA7AAAgAEEKOgALIAAgAjoACgwFCyABQfC9wABBLEHIvsAAQcQBQYzAwA\
BBwgMQdQ0BDAMLIAFBzsPAAEEoQZ7EwABBnwJBvcbAAEGvAhB1RQ0CCyAAIAE2AgQgAEGAAToAAAwC\
CyAEQdcFQaTJwAAQ6gEACyADQQZqQQJqQQA6AAAgA0EAOwEGIAMgAUEIdkEPcUG0ycAAai0AADoADC\
ADIAFBDHZBD3FBtMnAAGotAAA6AAsgAyABQRB2QQ9xQbTJwABqLQAAOgAKIAMgAUEUdkEPcUG0ycAA\
ai0AADoACSADQQZqIAFBAXJnQQJ2QX5qIgJqIgZBAC8A3slAOwAAIAMgAUEEdkEPcUG0ycAAai0AAD\
oADSAGQQJqQQAtAODJQDoAACADQQZqQQhqIgYgAUEPcUG0ycAAai0AADoAACAAIAMpAQY3AAAgA0H9\
ADoADyAAQQhqIAYvAQA7AAAgAEEKOgALIAAgAjoACgsgA0EQaiQAC6gKAQN/IwBBEGsiBCQAAkACQA\
JAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkAgAkH/AXEOEBUABgcJAQgVAg4D\
DwQUFAUVCyAAQQA6AIEKIABBADYC8AEgAEEAOwH+CSAAQeQBakEAOgAAIABB4AFqQQA2AgAMFAsCQA\
JAAkAgA0H/AXFBd2oOBQIAFRUBFQsgASgCFCEAAkAgAS0AGEUNACABQQA6ABggASAAQX9qNgIMCyAB\
IAA2AhAMFQsgASgCFCEAAkAgAS0AGEUNACABQQA6ABggASAAQX9qNgIMCyABIAA2AhAMFAsgASgCFC\
EAAkAgAS0AGEUNACABQQA6ABggASAAQX9qNgIMCyABIAA2AhAMEwsgAEH0CWooAgAhAyAAKAL4CSIF\
RQ0HIAVBEEYNCCAFQX9qIgJBEE8NCSAFQRBPDQogACAFQQN0aiIGIAAgAkEDdGooAgQ2AgAgBiADNg\
IEIAAgACgC+AlBAWoiBTYC+AkgACgC9AkhAwwICwJAIABB9AlqKAIARQ0AIABBADYC9AkLIABBADYC\
+AkMEQsgASADQf8BcRD4AQwQCyAAIAEgAxBdDA8LIAAoAvABIgJBAkYNCQJAIAJBAk8NACAAIAJqQf\
wJaiADOgAAIAAgACgC8AFBAWo2AvABDA8LIAJBAkHslMAAEOoBAAsCQCAAQeABaigCAEEgRg0AIABB\
gAFqIAAvAf4JENMBDAILIABBAToAgQoMAQsCQCAAQeABaigCAEEgRg0AIABBgAFqIAAvAf4JENMBDA\
ELIABBAToAgQoLIAAQ1wIMCgtBASEFIABBATYC+AkgACADNgIEIABBADYCAAsgAEH0AWohBiAFQRAg\
BUEQSRshAgNAAkAgAg0AIAVBEUkNCiAFQRBBvJTAABDtAQALIAQgACgCACAAQQRqKAIAIAYgA0HMlM\
AAEKkCIAJBf2ohAiAAQQhqIQAMAAsLIAJBEEH8lMAAEOoBAAsgBUEQQYyVwAAQ6gEACyAAQfQJaigC\
ACICQYAIRg0GAkACQAJAAkACQCADQf8BcUE7Rw0AIAAoAvgJIgNFDQEgA0EQRg0LIANBf2oiBkEQTw\
0DIANBEE8NBCAAIANBA3RqIgMgACAGQQN0aigCBDYCACADIAI2AgQgACgC+AlBAWohAgwCCyACQYAI\
Tw0GIABB9AFqIAJqIAM6AAAgACACQQFqNgL0CQwKCyAAIAI2AgQgAEEANgIAQQEhAgsgACACNgL4CQ\
wICyAGQRBBnJXAABDqAQALIANBEEGslcAAEOoBAAsCQAJAAkACQCAAQeABaigCACICQSBGDQAgAEGA\
AWohBiADQf8BcUFGag4CAgEDCyAAQQE6AIEKDAgLIAYgAC8B/gkQ0wEgAEEAOwH+CQwHCyACIABB5A\
FqLQAAIgNrIgJBH0sNAyAALwH+CSEBIAAgAmpBwAFqIANBAWo6AAAgACgC4AEiAkEgTw0EIAYgAkEB\
dGogATsBACAAQQA7Af4JIAAgAC0A5AFBAWo6AOQBIAAgACgC4AFBAWo2AuABDAYLIABBfyAALwH+CU\
EKbCICIAJBEHYbQf//A3EgA0FQakH/AXFqIgJB//8DIAJB//8DSRs7Af4JDAULIABBAToAgQoMBAsg\
BCADOgAPQfuWwABBKyAEQQ9qQaiXwABBiJrAABDWAQALIAJBIEG4lsAAEOoBAAsgAkEgQciWwAAQ6g\
EACyABEMQCCyAEQRBqJAALjwkBBX8jAEHwAGsiBSQAIAUgAzYCDCAFIAI2AggCQAJAAkAgAUGBAkkN\
AEGAAiEGAkAgACwAgAJBv39KDQBB/wEhBiAALAD/AUG/f0oNAEH+ASEGIAAsAP4BQb9/Sg0AQf0BIQ\
YgACwA/QFBv39MDQILIAUgBjYCFCAFIAA2AhBBBSEGQZy7wAAhBwwCCyAFIAE2AhQgBSAANgIQQQAh\
BkHwu8EAIQcMAQsgACABQQBB/QEgBBC9AwALIAUgBjYCHCAFIAc2AhgCQAJAAkACQAJAIAIgAUsiBg\
0AIAMgAUsNACACIANLDQICQAJAIAJFDQAgAiABTw0AIAAgAmosAABBQEgNAQsgAyECCyAFIAI2AiAg\
ASEDAkAgAiABTw0AQQAgAkF9aiIDIAMgAksbIgMgAkEBaiIGSw0CAkAgAyAGRg0AIAAgBmogACADai\
IIayEGAkAgACACaiIJLAAAQb9/TA0AIAZBf2ohBwwBCyADIAJGDQACQCAJQX9qIgIsAABBv39MDQAg\
BkF+aiEHDAELIAggAkYNAAJAIAlBfmoiAiwAAEG/f0wNACAGQX1qIQcMAQsgCCACRg0AAkAgCUF9ai\
ICLAAAQb9/TA0AIAZBfGohBwwBCyAIIAJGDQAgBkF7aiEHCyAHIANqIQMLIANFDQQCQAJAIAEgA0sN\
ACABIANHDQEMBQsgACADaiwAAEG/f0oNBAsgACABIAMgASAEEL0DAAsgBSACIAMgBhs2AiggBUHcAG\
pBDDYCACAFQdQAakEMNgIAIAVBEDYCTCAFIAVBGGo2AlggBSAFQRBqNgJQIAUgBUEoajYCSCAFQTBq\
QeS8wABBAyAFQcgAakEDEMcBIAVBMGogBBDAAgALIAMgBkGYvcAAEO4BAAsgBUHkAGpBDDYCACAFQd\
wAakEMNgIAIAVB1ABqQRA2AgAgBUEQNgJMIAUgBUEYajYCYCAFIAVBEGo2AlggBSAFQQxqNgJQIAUg\
BUEIajYCSCAFQTBqQay8wABBBCAFQcgAakEEEMcBIAVBMGogBBDAAgALIAEgA2shAQsCQCABRQ0AAk\
ACQAJAAkAgACADaiIBLAAAIgJBf0oNACABLQABQT9xIQAgAkEfcSEGIAJBX0sNASAGQQZ0IAByIQEM\
AgsgBSACQf8BcTYCJEEBIQIMAgsgAEEGdCABLQACQT9xciEAAkAgAkFwTw0AIAAgBkEMdHIhAQwBCy\
AAQQZ0IAEtAANBP3FyIAZBEnRBgIDwAHFyIgFBgIDEAEYNAgsgBSABNgIkQQEhAiABQYABSQ0AQQIh\
AiABQYAQSQ0AQQNBBCABQYCABEkbIQILIAUgAzYCKCAFIAIgA2o2AiwgBUHsAGpBDDYCACAFQeQAak\
EMNgIAIAVB3ABqQRQ2AgAgBUHUAGpBFTYCACAFQRA2AkwgBSAFQRhqNgJoIAUgBUEQajYCYCAFIAVB\
KGo2AlggBSAFQSRqNgJQIAUgBUEgajYCSCAFQTBqQeC7wABBBSAFQcgAakEFEMcBIAVBMGogBBDAAg\
ALQfzkwABBKyAEEKMCAAu9CQIOfwJ+IwBBgAFrIgMkAEEAIQQgA0EANgIcIANCBDcCFCADQSBqQQhq\
IQVBBCEGIANBIGpBBGohByADQcAAakEEaiEIQQAhCQJAAkACQAJAA0ACQAJAIAJFDQAgA0IBNwIgIA\
NB6ABqIANBIGoQ3gEgAy0AaA0EIAMtAGkNASACIQQLIAAgATYCBCAAQQA2AgAgAEEIaiAENgIAIABB\
DGogAykCFDcCACAAQRRqIANBFGpBCGooAgA2AgAMBQsgA0HoAGogASACEIsBIAMoAnghCiADKAJ0IQ\
sgAygCcCEMIAMoAmwhDQJAIAMoAmgNACADQegAakE9IA0gDBCnASADKAJwIQwgAygCbCENAkACQAJA\
AkAgAygCaA0AIANB6ABqIA0gDBBKIAMoAnwhDiADKAJ4IQ8gAygCdCEQIAMoAnAhDCADKAJsIQ0CQC\
ADKAJoDQAgAyAONgJgIAMgDzYCXCADIBA2AlggA0HoAGogDSAMEL0BIAMoAnAhDCADKAJsIQ0gAygC\
aEUNBCADKAJ8IQ4gAygCeCEPIAMoAnQhECADQdgAahCcAwsgDQ0BQQAhDQwCCyADKAJ8IQkgAygCeC\
EKIAMoAnQhCwwFCyADQQhqQSMQ6QEgAygCDCEKIAMoAghB5NfAAEEjEPcDIQkgA0EjNgJwIAMgCjYC\
bCADIAk2AmggA0HoAGpBkNPAAEECEOIBIANB6ABqIBAgDhDiASAIIA0gDCADQegAahDYASAQIA8Qtw\
MgAygCRCENCyADKAJUIQkgAygCUCEKIAMoAkwhCyADKAJIIQwMAwsgAyAONgJUIAMgDzYCUCADKQJQ\
IREgAyAKEOkBIAMoAgQhDiADKAIAIAsgChD3AyEPIAMgETcCUCADIBA2AkwgAyAKNgJIIAMgDjYCRC\
ADIA82AkAgA0HoAGogDSAMELcBIAMoAnAhDCADKAJsIQ0CQCADKAJoRQ0AIAMoAnwhCSADKAJ4IQog\
AygCdCELIANBwABqEKUDDAMLIAMgETcCOCADIBA2AjQgAyAKNgIwIAMgDjYCLCADIA82AiggAyAMNg\
IkIAMgDTYCIAJAIAkgAygCGEcNACADQRRqIAkQnwEgAygCFCEGIAMoAhwhCQsgBUEIaikCACERIAVB\
EGopAgAhEiAGIAlBGGxqIgogBSkCADcCACAKQRBqIBI3AgAgCkEIaiARNwIAIAMgCUEBaiIJNgIcIA\
whAiANIQEMAQsLIAMoAnwhCQsgAyAJNgI0IAMgCjYCMCADIAs2AiwgAyAMNgIoIAMgDTYCJCADQQA2\
AiACQCANRQ0AIABBATYCACAAIAcpAgA3AgQgAEEUaiAHQRBqKAIANgIAIABBDGogB0EIaikCADcCAA\
wCCyAAIAE2AgQgAEEANgIAIABBCGogAjYCACAAQQxqIAMpAhQ3AgAgAEEUaiADQRRqQQhqKAIANgIA\
IAcQiAMMAgsgA0HSAGogA0HoAGpBFGooAgAiDTYBACADQcoAaiADQegAakEMaikCACIRNwEAIAMgAy\
kCbCISNwFCIABBFGogDTYBACAAQQxqIBE3AQAgACASNwEEIABBATYCAAsgA0EUahCUAgsgA0GAAWok\
AAuYCgEBfyMAQTBrIgIkAAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAIAAtAA\
AOEgABAgMEBQYHCAkKCwwNDg8QEQALIAIgAC0AAToACCACQSRqQgE3AgAgAkECNgIcIAJBlOLAADYC\
GCACQQM2AhQgAiACQRBqNgIgIAIgAkEIajYCECABKAIUIAEoAhggAkEYahDtAyEBDBELIAIgACkDCD\
cDCCACQSRqQgE3AgAgAkECNgIcIAJBsOLAADYCGCACQQQ2AhQgAiACQRBqNgIgIAIgAkEIajYCECAB\
KAIUIAEoAhggAkEYahDtAyEBDBALIAIgACkDCDcDCCACQSRqQgE3AgAgAkECNgIcIAJBsOLAADYCGC\
ACQQU2AhQgAiACQRBqNgIgIAIgAkEIajYCECABKAIUIAEoAhggAkEYahDtAyEBDA8LIAIgACsDCDkD\
CCACQSRqQgE3AgAgAkECNgIcIAJB0OLAADYCGCACQQY2AhQgAiACQRBqNgIgIAIgAkEIajYCECABKA\
IUIAEoAhggAkEYahDtAyEBDA4LIAIgACgCBDYCCCACQSRqQgE3AgAgAkECNgIcIAJB7OLAADYCGCAC\
QQc2AhQgAiACQRBqNgIgIAIgAkEIajYCECABKAIUIAEoAhggAkEYahDtAyEBDA0LIAIgACkCBDcCCC\
ACQSRqQgE3AgAgAkEBNgIcIAJBhOPAADYCGCACQQg2AhQgAiACQRBqNgIgIAIgAkEIajYCECABKAIU\
IAEoAhggAkEYahDtAyEBDAwLIAJBJGpCADcCACACQQE2AhwgAkGM48AANgIYIAJB8LvBADYCICABKA\
IUIAEoAhggAkEYahDtAyEBDAsLIAJBJGpCADcCACACQQE2AhwgAkGg48AANgIYIAJB8LvBADYCICAB\
KAIUIAEoAhggAkEYahDtAyEBDAoLIAJBJGpCADcCACACQQE2AhwgAkG048AANgIYIAJB8LvBADYCIC\
ABKAIUIAEoAhggAkEYahDtAyEBDAkLIAJBJGpCADcCACACQQE2AhwgAkHM48AANgIYIAJB8LvBADYC\
ICABKAIUIAEoAhggAkEYahDtAyEBDAgLIAJBJGpCADcCACACQQE2AhwgAkHc48AANgIYIAJB8LvBAD\
YCICABKAIUIAEoAhggAkEYahDtAyEBDAcLIAJBJGpCADcCACACQQE2AhwgAkHo48AANgIYIAJB8LvB\
ADYCICABKAIUIAEoAhggAkEYahDtAyEBDAYLIAJBJGpCADcCACACQQE2AhwgAkH048AANgIYIAJB8L\
vBADYCICABKAIUIAEoAhggAkEYahDtAyEBDAULIAJBJGpCADcCACACQQE2AhwgAkGI5MAANgIYIAJB\
8LvBADYCICABKAIUIAEoAhggAkEYahDtAyEBDAQLIAJBJGpCADcCACACQQE2AhwgAkGg5MAANgIYIA\
JB8LvBADYCICABKAIUIAEoAhggAkEYahDtAyEBDAMLIAJBJGpCADcCACACQQE2AhwgAkG45MAANgIY\
IAJB8LvBADYCICABKAIUIAEoAhggAkEYahDtAyEBDAILIAJBJGpCADcCACACQQE2AhwgAkHQ5MAANg\
IYIAJB8LvBADYCICABKAIUIAEoAhggAkEYahDtAyEBDAELIAEoAhQgACgCBCAAQQhqKAIAIAFBGGoo\
AgAoAgwRBwAhAQsgAkEwaiQAIAELqAgBB38CQAJAIAFB/wlLDQAgAUEFdiECAkACQAJAIAAoAqABIg\
NFDQAgA0F/aiEEIANBAnQgAGpBfGohBSADIAJqQQJ0IABqQXxqIQYgA0EpSSEDA0AgA0UNAiACIARq\
IgdBKE8NAyAGIAUoAgA2AgAgBkF8aiEGIAVBfGohBSAEQX9qIgRBf0cNAAsLIAFBIEkNAyAAQQA2Ag\
AgAUHAAEkNAyAAQQA2AgQgAkEBIAJBAUsbIgRBAkYNAyAAQQA2AgggBEEDRg0DIABBADYCDCAEQQRG\
DQMgAEEANgIQIARBBUYNAyAAQQA2AhQgBEEGRg0DIABBADYCGCAEQQdGDQMgAEEANgIcIARBCEYNAy\
AAQQA2AiAgBEEJRg0DIABBADYCJCAEQQpGDQMgAEEANgIoIARBC0YNAyAAQQA2AiwgBEEMRg0DIABB\
ADYCMCAEQQ1GDQMgAEEANgI0IARBDkYNAyAAQQA2AjggBEEPRg0DIABBADYCPCAEQRBGDQMgAEEANg\
JAIARBEUYNAyAAQQA2AkQgBEESRg0DIABBADYCSCAEQRNGDQMgAEEANgJMIARBFEYNAyAAQQA2AlAg\
BEEVRg0DIABBADYCVCAEQRZGDQMgAEEANgJYIARBF0YNAyAAQQA2AlwgBEEYRg0DIABBADYCYCAEQR\
lGDQMgAEEANgJkIARBGkYNAyAAQQA2AmggBEEbRg0DIABBADYCbCAEQRxGDQMgAEEANgJwIARBHUYN\
AyAAQQA2AnQgBEEeRg0DIABBADYCeCAEQR9GDQMgAEEANgJ8IARBIEYNAyAAQQA2AoABIARBIUYNAy\
AAQQA2AoQBIARBIkYNAyAAQQA2AogBIARBI0YNAyAAQQA2AowBIARBJEYNAyAAQQA2ApABIARBJUYN\
AyAAQQA2ApQBIARBJkYNAyAAQQA2ApgBIARBJ0YNAyAAQQA2ApwBIARBKEYNA0EoQShBlMrAABDqAQ\
ALIARBKEGUysAAEOoBAAsgB0EoQZTKwAAQ6gEAC0G+ysAAQR1BlMrAABCjAgALIAAoAqABIAJqIQUC\
QCABQR9xIgMNACAAIAU2AqABIAAPCwJAAkAgBUF/aiIEQSdLDQAgBSEIIAAgBEECdGooAgAiBkEAIA\
FrIgF2IgRFDQECQCAFQSdLDQAgACAFQQJ0aiAENgIAIAVBAWohCAwCCyAFQShBlMrAABDqAQALIARB\
KEGUysAAEOoBAAsCQAJAIAJBAWoiByAFTw0AIAFBH3EhASAFQQJ0IABqQXhqIQQDQCAFQX5qQShPDQ\
IgBEEEaiAGIAN0IAQoAgAiBiABdnI2AgAgBEF8aiEEIAcgBUF/aiIFSQ0ACwsgACACQQJ0aiIEIAQo\
AgAgA3Q2AgAgACAINgKgASAADwtBf0EoQZTKwAAQ6gEAC4MJAgd/An4jAEHwAGsiAyQAIANByABqIA\
EgAhA6AkACQCADKAJIDQAgA0EwakEIaiADQcgAakEUaigCACICNgIAIAMgA0HIAGpBDGopAgAiCjcD\
MCADKQJMIQsgA0HIAGpBCGoiASACNgIAIAMgCjcDSEEQEKcDIgJBAzYCACACIAMpA0g3AgQgAkEMai\
ABKAIANgIAIANBDGpBEGpCgYCAgBA3AgAgA0EMakEMaiIBIAI2AgAgACALNwIEIABBDGogASkCADcC\
ACAAQRRqQQE2AgAgAEEANgIAIAMgCzcCEAwBCyADQQxqQQxqIANByABqQQxqKQIANwIAIANBDGpBFG\
ogA0HIAGpBFGooAgA2AgAgA0EMakEIaiADQcgAakEIaigCADYCACADIAMoAkwiBDYCECADQQE2Agwg\
A0EQaiEFAkAgBEUNACAAQQE2AgAgACAFKQIANwIEIABBFGogBUEQaigCADYCACAAQQxqIAVBCGopAg\
A3AgAMAQsgA0EaNgIoIANBh9jAADYCJCADQQE6ACwgA0EwaiADQSRqQQhqIgYgASACEC9BAiEEAkAg\
AygCMA0AQQEhBCADQcQAaigCAEEBRw0AIANBMGpBDGooAgAiBygCAA0AQQAhBCAHKAIEIgggB0EMai\
gCACIHQYjawABBAhD0Ag0AIAggB0GK2sAAQQQQ9AINACAIIAdBjtrAAEEEEPQCDQAgCCAHQZLawABB\
BBD0Ag0AIAggB0GW2sAAQQIQ9AINACAIIAdBmNrAAEECEPQCDQAgCCAHQZrawABBBBD0Ag0AIAggB0\
Ge2sAAQQQQ9AINACAIIAdBotrAAEEEEPQCDQAgCCAHQabawABBBRD0Ag0AIAggB0Gr2sAAQQUQ9AIN\
ACAIIAdBsNrAAEEDEPQCDQAgCCAHQbPawABBAhD0AkEBcyEECwJAAkACQCAEQQJGDQAgBEEBcQ0AIA\
NByABqIAYgASACEC8CQAJAIAMoAkgiBEUNAAJAIAMoAkwiBkUNACADQcgAakEQaigCACEEIANByABq\
QQhqKAIAIQcgA0HcAGooAgAhCCADQdQAaigCACEBIANBGhDpASADKAIEIQkgAygCACICQQApAIfYQD\
cAACACQRhqQQAvAJ/YQDsAACACQRBqQQApAJfYQDcAACACQQhqQQApAI/YQDcAACADQRo2AmwgAyAJ\
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\
AlQgAkEBNgJkIAJBoN/AADYCYCACQgE3AmwgAkEPNgJ8IAIgAkH4AGo2AmggAiACQcgAajYCeCACQd\
AAaiACQeAAahDbAkUNAQsLIAJBNGoQ5wJBASEADAILIAMgASAAKAIMEQUAIQAMAQtBACEACyACQYAB\
aiQAIAALuAQBB38jAEGgCmsiAyQAIANBAEGAARD2AyIDQQA2AvABIANBDDoAgAogA0GAAWpBAEHlAB\
D2AxogA0H0CWpCADcCACADQfwJakEANgIAIANB7AFqQQA6AAAgA0EANgLoASADQQA6AIEKIANCADcC\
lAogA0IANwKMCiADQQA6AJwKIANCBDcChAoDQAJAAkACQCACRQ0AIAMgAygCmApBAWo2ApgKIAEtAA\
AhBAJAIAMtAIAKIgVBD0cNACADIANBhApqIAQQXQwDCwJAIARB8JvBAGotAAAiBg0AIAVBCHQgBHJB\
8JvBAGotAAAhBgsgBkHwAXFBBHYhBwJAIAZBD3EiCA0AIAMgA0GECmogByAEED8MAwtBCCEJAkACQA\
JAIAVBd2oOBQACAgIBAgtBDiEJCyADIANBhApqIAkgBBA/CyAGQf8BcUEPTQ0BIAMgA0GECmogByAE\
ED8MAQsgAyADKAKYCjYClAogA0GECmogAy0AnAoQ7AEgAEEIaiADQYQKakEIaigCADYCACAAIAMpAo\
QKNwIAIANBoApqJAAPCwJAAkACQAJAAkAgCEF7ag4JAgQEBAACBAQDAQsgAyADQYQKakEGIAQQPwwD\
CyAIQQFHDQILIANBADoAgQogA0EANgLwASADQQA7Af4JIANBADoA5AEgA0EANgLgAQwBCwJAIAMoAv\
QJRQ0AIANBADYC9AkLIANBADYC+AkLIAMgCDoAgAoLIAFBAWohASACQX9qIQIMAAsLgwQBB38jAEHg\
AGsiBCQAIARBJGogASgCACIFIAIgAxCnAQJAAkAgBCgCJEUNACAEQTxqIAUgAiADEKcBAkACQCAEKA\
I8RQ0AAkAgBCgCQCIFRQ0AIARBzABqKAIAIQYgBEE8akEIaigCACEHIARB0ABqKAIAIQggBEHIAGoo\
AgAhAyABKAIEIQkgBCABQQhqKAIAIgIQ6QEgBCgCBCEKIAQoAgAgCSACEPcDIQkgBCACNgJcIAQgCj\
YCWCAEIAk2AlQgBEHUAGpBkNPAAEECEOIBIARB1ABqIAMgCBDiASAEQQhqIAUgByAEQdQAahCeAyAD\
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\
AkEgaiQADwsgACADQQFqNgIIIAAoAgAgA0EEdGoiAyACKQIENwIAIANBCGogAkEEakEIaikCADcCAA\
wACwuvAQEEfyMAQSBrIgIkACAAKAIAIQMgAEEANgIAIAMoAgghACADQQA2AggCQCAARQ0AIAARAQAh\
AwJAIAEoAgAiBCgCACIARQ0AIAAgACgCACIFQX9qNgIAIAVBAUcNACAEKAIAENACCyABKAIAIAM2Ag\
AgAkEgaiQAQQEPCyACQRRqQgA3AgAgAkEBNgIMIAJB5IrAADYCCCACQfC7wQA2AhAgAkEIakHMi8AA\
EMACAAuoAQIDfwF+IwBBEGsiAyQAIAMgATYCCCADIAEgAmo2AgwCQAJAIANBCGoQxwIiBEGAgMQARg\
0AQQEhBQJAIARBgAFJDQBBAiEFIARBgBBJDQBBA0EEIARBgIAESRshBQsgAyABIAIgBUGE4MAAEIUC\
IAMpAwAhBiAAQQxqIAQ2AgAgACAGNwIEQQAhAQwBCyAAQQA2AgRBASEBCyAAIAE2AgAgA0EQaiQAC6\
MBAQJ/IwBBEGsiAiQAAkACQAJAIAEoAgBFDQACQCABKAIIIgMgASgCDEYNACABIANBEGo2AgggAkEI\
aiADQQxqKAIANgIAIAIgAykCBDcDACADKAIAIgNBBEcNAgsgARC/AyABQQA2AgBBBCEDDAELIABBBD\
YCAAwBCyAAIAM2AgAgACACKQMANwIEIABBDGogAkEIaigCADYCAAsgAkEQaiQAC50BAQF/IwBBIGsi\
AyQAIANBCGogASACEGQCQAJAAkACQCADKAIIDQAgA0EQaigCACECIAMoAgwhAQwBCyADKAIMDQELIA\
AgATYCBCAAQQhqIAI2AgBBACECDAELIAAgA0EMaiICKQIANwIEIABBFGogAkEQaigCADYCACAAQQxq\
IAJBCGopAgA3AgBBASECCyAAIAI2AgAgA0EgaiQAC7QBAQN/IwBBEGsiASQAIAAoAgAiAkEMaigCAC\
EDAkACQAJAAkAgAigCBA4CAAEDCyADDQJB8LvBACECQQAhAwwBCyADDQEgAigCACICKAIEIQMgAigC\
ACECCyABIAM2AgQgASACNgIAIAFBiOjAACAAKAIEIgIoAgwgACgCCCACLQAQEKoBAAsgAUEANgIEIA\
EgAjYCACABQZzowAAgACgCBCICKAIMIAAoAgggAi0AEBCqAQALowEAAkACQAJAAkAgAkF8ag4DAAIB\
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\
IAJBMGokACABC2QBAX8jAEEwayICJAAgAiABNgIMIAIgADYCCCACQRxqQgE3AgAgAkECNgIUIAJBnI\
nAADYCECACQRI2AiwgAiACQShqNgIYIAIgAkEIajYCKCACQRBqELgCIQEgAkEwaiQAIAELeQACQAJA\
AkACQAJAAkACQCAALQAADhUBAQEBAQEBAQEBAQECAQMBAQQBBQYACyAAQQRqEJECCw8LIAAoAgQgAE\
EIaigCABC3Aw8LIAAoAgQgAEEIaigCABC3Aw8LIABBBGoQyAMPCyAAQQRqEMgDDwsgAEEEahCQAgtk\
AQF/IwBBEGsiAyQAAkAgASgCAA0AIAAgASgCBDYCACAAIAFBCGotAAA6AAQgA0EQaiQADwsgAyABKA\
IENgIIIAMgAUEIai0AADoADEH7lsAAQSsgA0EIakHAiMAAIAIQ1gEAC1sBAn8jAEEQayICJAACQAJA\
AkACQCABDQBBASEDDAELIAFBf0wNASACQQhqQQEgARDiAiACKAIIIgNFDQILIAAgATYCBCAAIAM2Ag\
AgAkEQaiQADwsQwgIACwALXgEBfyMAQTBrIgMkACADIAE2AgQgAyAANgIAIANBLGpBEDYCACADQRA2\
AiQgAyADNgIoIAMgA0EEajYCICADQQhqQbSxwABBAiADQSBqQQIQxwEgA0EIaiACEMACAAthAQF/Iw\
BBMGsiAiQAIAIgATYCBCACIAA2AgAgAkEsakEQNgIAIAJBEDYCJCACIAI2AiggAiACQQRqNgIgIAJB\
CGpBlLjAAEEDIAJBIGpBAhDHASACQQhqQciYwAAQwAIAC2IBA38CQCAAKAIMIgIgACgCECIDTw0AAk\
AgACgCCCIEIAAoAgRHDQAgACAEEJ4BIAAoAgghBAsgACAEQQFqNgIIIAAoAgAgBEEMbGoiACABOgAI\
IAAgAzYCBCAAIAI2AgALC14BAX8jAEEwayIDJAAgAyAANgIAIAMgATYCBCADQSxqQRA2AgAgA0EQNg\
IkIAMgA0EEajYCKCADIAM2AiAgA0EIakGQt8AAQQIgA0EgakECEMcBIANBCGogAhDAAgALXgEBfyMA\
QTBrIgMkACADIAA2AgAgAyABNgIEIANBLGpBEDYCACADQRA2AiQgAyADQQRqNgIoIAMgAzYCICADQQ\
hqQcS3wABBAiADQSBqQQIQxwEgA0EIaiACEMACAAteAQF/IwBBEGsiAiQAIAIgADYCCCACIAAgAWo2\
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\
58AANgIEIAAgATYCAAs6AQJ/IwBBEGsiASQAIAFBBGogABC/ASABKAIEIgAgASgCDBAIIQIgACABKA\
IIELcDIAFBEGokACACCz8BAX9BHBCnAyIBQbzUwAA2AgAgASAAKQIANwIEIAFBDGogAEEIaikCADcC\
ACABQRRqIABBEGopAgA3AgAgAQs8AQF/IwBBEGsiAyQAAkAgAA0AIANBEGokACABDwsgAyABNgIMQf\
uWwABBKyADQQxqQbCIwAAgAhDWAQALPAEBfyMAQRBrIgIkACACQQhqIAAgACgCACgCBBEEACACKAII\
IAEgAigCDCgCEBEFACEAIAJBEGokACAAC0IBAn8gACgCBCEBIABB8LvBADYCBCAAKAIAIQIgAEHwu8\
EANgIAAkAgASACRg0AIAIgASACa0EEdhDVAgsgABDxAQs7AgF/AXwgASgCHEEBcSECIAArAwAhAwJA\
IAEoAghFDQAgASADIAIgAUEMaigCABAuDwsgASADIAIQLQs8AQF/IwBBEGsiAiQAIAJBCGogACAAKA\
IAKAIEEQQAIAIoAgggASACKAIMKAIQEQUAIQAgAkEQaiQAIAALQAEBfyMAQSBrIgAkACAAQRRqQgA3\
AgAgAEEBNgIMIABB6NrAADYCCCAAQfC7wQA2AhAgAEEIakHE28AAEMACAAs/AQF/IwBBIGsiAiQAIA\
IgADYCGCACQfCwwAA2AhAgAkHwu8EANgIMIAJBAToAHCACIAE2AhQgAkEMahCqAgALNwEBfyMAQRBr\
IgMkACADQQhqIAEgAhB9IAMoAgwhAiAAIAMoAgg2AgAgACACNgIEIANBEGokAAtAAQF/IwBBIGsiAC\
QAIABBFGpCADcCACAAQQE2AgwgAEHojcAANgIIIABB8LvBADYCECAAQQhqQfCNwAAQwAIACzYBAX8j\
AEEQayICJAAgAiABECogAigCACEBIAAgAikDCDcDCCAAIAFBAEetNwMAIAJBEGokAAs/AAJAIAAtAB\
gNACAAQQAQ7AEgAEEBOgAYIAAgACgCEDYCDAsgACAAKAIUNgIQIABBARDsASAAIAAoAhQ2AgwLQAEB\
fyMAQSBrIgAkACAAQRRqQgA3AgAgAEEBNgIMIABB/OXAADYCCCAAQfC7wQA2AhAgAEEIakGE5sAAEM\
ACAAs3AQF/IwBBEGsiAyQAIANBCGogASACEKsDIAMoAgwhAiAAQe2BwABBBBBnIAIQ6wMgA0EQaiQA\
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\
AwALFABBACAANgKswEFBAEEBOgCowEELDgACQCABRQ0AIAAQTAsLDwAgACgCACAALQAEEPICCw0AIA\
AgASACEOIBQQALDQAgADUCAEEBIAEQegsNACAAKAIAIAEgAhBYCw0AIAAgASACENADQQALDwAgACgC\
ACAAKAIEELcDCw8AIAAoAgAgACgCBBCkAwsNACAAKAIAGgN/DAALCw0AIAAoAgAgASACEFsLDQAgAC\
kDAEEBIAEQegsLACAAIwBqJAAjAAsMACAAKAIAIAEQugELCgAgACABIAIQCwsJACAAECVBAEcLCgAg\
ACABIAIQVgsMACAAKAIAIAEQ2wILDAAgACgCACABENwCCwoAIABBBGoQ4wILCQAgABAeQQFGCwkAIA\
AgARAsAAsMACAAKAIAIAEQqQMLDAAgACgCACABENkDCwwAIAAoAgAgARCBAwsLACAAIAEgAhCsAQsK\
ACAAIAEgAhB4CwoAIAAgASACEE0LCwAgACABIAIQhgILCgBBACgClMBBRQsKACAAKAIAELYDCwkAIA\
AgARDVAgsJACAAQQA2AgALCAAgACABEGALCQAgACABEMcDCwgAIAAgARBgCwgAIAAgARAACwgAIAAQ\
uAEACwYAIAAQTAsGACAAEEwLBgAgABAmCwMAAAsCAAsCAAsCAAsCAAsCAAsCAAsLq7wBAgBBgIDAAA\
uMvAEmAAAAAAAAAAEAAAAnAAAAaW52YWxpZCB0eXBlOiAAABAAEAAOAAAAbwQQAAsAAAD/////////\
/0M6XFVzZXJzXGRhdmlkXC5jYXJnb1xyZWdpc3RyeVxzcmNcaW5kZXguY3JhdGVzLmlvLTZmMTdkMj\
JiYmExNTAwMWZcc2VyZGUtd2FzbS1iaW5kZ2VuLTAuNi4zXHNyY1xsaWIucnMAOAAQAGcAAAA1AAAA\
DgAAACYAAAAAAAAAAQAAACgAAAAmAAAAAAAAAAEAAAApAAAAJgAAAAAAAAABAAAAKgAAAG5hbWV2YW\
x1ZXdvcmRraW5kZmRDb21tYW5kaW5uZXJyZWRpcmVjdFBpcGVsaW5lbmVnYXRlZG1heWJlRmRvcGlv\
RmlsZVNlcXVlbmNlU2hlbGxWYXJzaGVsbFZhcnBpcGVsaW5lQm9vbGVhbkxpc3Rib29sZWFuTGlzdH\
RleHR2YXJpYWJsZWNvbW1hbmRxdW90ZWRzdGRvdXRTdGRlcnJpbnB1dG91dHB1dGN1cnJlbnRuZXh0\
Q29tbWFuZElubmVyU2ltcGxlc2ltcGxlU3Vic2hlbGxzdWJzaGVsbFBpcGVTZXF1ZW5jZVBpcGVsaW\
5lSW5uZXJwaXBlU2VxdWVuY2VlbnZWYXJzYXJnc2l0ZW1zb3ZlcndyaXRlYXBwZW5kaXNBc3luY2Fu\
ZG9yc3Rkb3V0YSBzZXF1ZW5jZQAAJgAAAAAAAAABAAAAKwAAACYAAAAAAAAAAQAAACwAAAAmAAAAAA\
AAAAEAAAAtAAAALgAAAC4AAAAvAAAACAAAAAQAAAAwAAAAMQAAADEAAABDOlxVc2Vyc1xkYXZpZFwu\
Y2FyZ29ccmVnaXN0cnlcc3JjXGluZGV4LmNyYXRlcy5pby02ZjE3ZDIyYmJhMTUwMDFmXGNvbnNvbG\
VfZXJyb3JfcGFuaWNfaG9vay0wLjEuN1xzcmNcbGliLnJzAAAAcAIQAG0AAACVAAAADgAAAE9uY2Ug\
aW5zdGFuY2UgaGFzIHByZXZpb3VzbHkgYmVlbiBwb2lzb25lZAAA8AIQACoAAABvbmUtdGltZSBpbm\
l0aWFsaXphdGlvbiBtYXkgbm90IGJlIHBlcmZvcm1lZCByZWN1cnNpdmVseSQDEAA4AAAAAGNhbm5v\
dCByZWN1cnNpdmVseSBhY3F1aXJlIG11dGV4AAAAZQMQACAAAAAvcnVzdGMvY2M2NmFkNDY4OTU1Nz\
E3YWI5MjYwMGM3NzBkYThjMTYwMWE0ZmYzMy9saWJyYXJ5L3N0ZC9zcmMvc3lzL3dhc20vLi4vdW5z\
dXBwb3J0ZWQvbG9ja3MvbXV0ZXgucnMAAJADEABmAAAAFAAAAAkAAAAyAAAADAAAAAQAAAAzAAAANA\
AAADUAAAAmAAAAAAAAAAEAAAA2AAAANwAAAAQAAAAEAAAAOAAAADkAAAAIAAAABAAAADoAAAAvAAAA\
BAAAAAQAAAA7AAAAaW52YWxpZCB2YWx1ZTogLCBleHBlY3RlZCAAAGAEEAAPAAAAbwQQAAsAAABtaX\
NzaW5nIGZpZWxkIGAAjAQQAA8AAAATMRAAAQAAAGR1cGxpY2F0ZSBmaWVsZCBgAAAArAQQABEAAAAT\
MRAAAQAAACYAAAAAAAAAAQAAADwAAABQb2lzb25FcnJvckNvdWxkbid0IGRlc2VyaWFsaXplIGk2NC\
BvciB1NjQgZnJvbSBhIEJpZ0ludCBvdXRzaWRlIGk2NDo6TUlOLi51NjQ6Ok1BWCBib3VuZHNMYXp5\
IGluc3RhbmNlIGhhcyBwcmV2aW91c2x5IGJlZW4gcG9pc29uZWQ6BRAAKgAAAEM6XFVzZXJzXGRhdm\
lkXC5jYXJnb1xyZWdpc3RyeVxzcmNcaW5kZXguY3JhdGVzLmlvLTZmMTdkMjJiYmExNTAwMWZcb25j\
ZV9jZWxsLTEuMTYuMFxzcmNcbGliLnJzAGwFEABfAAAA9gQAABkAAABzcmNccnNfbGliXHNyY1xsaW\
IucnMAAADcBRAAFQAAABEAAAA4AAAAZGF0YSBkaWQgbm90IG1hdGNoIGFueSB2YXJpYW50IG9mIHVu\
dGFnZ2VkIGVudW0gV2FzbVRleHRJdGVtZmllbGQgaWRlbnRpZmllcmluZGVudHN0cnVjdCB2YXJpYW\
50IFdhc21UZXh0SXRlbTo6SGFuZ2luZ1RleHQAANwFEAAVAAAAOAAAABkAAADcBRAAFQAAAEUAAAAG\
AAAAPgAAAAQAAAAEAAAAPwAAAEAAAABBAAAAbGlicmFyeS9hbGxvYy9zcmMvcmF3X3ZlYy5yc2NhcG\
FjaXR5IG92ZXJmbG93AAAA1AYQABEAAAC4BhAAHAAAABYCAAAFAAAAYSBmb3JtYXR0aW5nIHRyYWl0\
IGltcGxlbWVudGF0aW9uIHJldHVybmVkIGFuIGVycm9yAEIAAAAAAAAAAQAAADYAAABsaWJyYXJ5L2\
FsbG9jL3NyYy9mbXQucnNEBxAAGAAAAGICAAAgAAAAKSBzaG91bGQgYmUgPCBsZW4gKGlzIHJlbW92\
YWwgaW5kZXggKGlzIIIHEAASAAAAbAcQABYAAAD4XRAAAQAAAC8AAAAEAAAABAAAAEMAAABEAAAARQ\
AAAEYAAABHAAAASAAAAEkAAABKAAAALwAAAAgAAAAEAAAASwAAAC8AAAAIAAAABAAAAEwAAABLAAAA\
2AcQAE0AAABOAAAATwAAAE0AAABQAAAALwAAAAwAAAAEAAAAUQAAAC8AAAAMAAAABAAAAFIAAABRAA\
AAFAgQAFMAAABUAAAATwAAAFUAAABQAAAAXBkQAAIAAAAKCkNhdXNlZCBieTpYCBAADAAAAM8OEAAB\
AAAAICAgICAgIAAyAAAADAAAAAQAAABWAAAAVwAAADUAAABhIERpc3BsYXkgaW1wbGVtZW50YXRpb2\
4gcmV0dXJuZWQgYW4gZXJyb3IgdW5leHBlY3RlZGx5ACYAAAAAAAAAAQAAADYAAAAvcnVzdGMvY2M2\
NmFkNDY4OTU1NzE3YWI5MjYwMGM3NzBkYThjMTYwMWE0ZmYzMy9saWJyYXJ5L2FsbG9jL3NyYy9zdH\
JpbmcucnMA3AgQAEsAAACcCQAADgAAAC8AAAAEAAAABAAAAFgAAABZAAAAWgAAAAoKU3RhY2s6CgpD\
OlxVc2Vyc1xkYXZpZFwuY2FyZ29ccmVnaXN0cnlcc3JjXGluZGV4LmNyYXRlcy5pby02ZjE3ZDIyYm\
JhMTUwMDFmXHVuaWNvZGUtd2lkdGgtMC4xLjExXHNyY1x0YWJsZXMucnNaCRAAZgAAACcAAAAZAAAA\
WgkQAGYAAAAtAAAAHQAAAEM6XFVzZXJzXGRhdmlkXC5jYXJnb1xyZWdpc3RyeVxzcmNcaW5kZXguY3\
JhdGVzLmlvLTZmMTdkMjJiYmExNTAwMWZcdnRlLTAuMTMuMFxzcmNcbGliLnJzAAAA4AkQAFkAAADl\
AAAAIQAAAOAJEABZAAAA4AAAADQAAADgCRAAWQAAAHkAAAAcAAAA4AkQAFkAAABOAQAAFQAAAOAJEA\
BZAAAAMAEAACQAAADgCRAAWQAAADIBAAAZAAAA4AkQAFkAAAAVAQAAKAAAAOAJEABZAAAAFwEAAB0A\
AABDOlxVc2Vyc1xkYXZpZFwuY2FyZ29ccmVnaXN0cnlcc3JjXGluZGV4LmNyYXRlcy5pby02ZjE3ZD\
IyYmJhMTUwMDFmXHZ0ZS0wLjEzLjBcc3JjXHBhcmFtcy5yc7wKEABcAAAAPgAAAAkAAAC8ChAAXAAA\
AD8AAAAJAAAAvAoQAFwAAABHAAAACQAAALwKEABcAAAASAAAAAkAAABhc3NlcnRpb24gZmFpbGVkOi\
BtaWQgPD0gc2VsZi5sZW4oKWNhbGxlZCBgUmVzdWx0Ojp1bndyYXAoKWAgb24gYW4gYEVycmAgdmFs\
dWUAAFsAAAABAAAAAQAAAFwAAABhdHRlbXB0IHRvIGpvaW4gaW50byBjb2xsZWN0aW9uIHdpdGggbG\
VuID4gdXNpemU6Ok1BWC9ydXN0Yy9jYzY2YWQ0Njg5NTU3MTdhYjkyNjAwYzc3MGRhOGMxNjAxYTRm\
ZjMzL2xpYnJhcnkvYWxsb2Mvc3JjL3N0ci5ycwAAAO0LEABIAAAAmQAAAAoAAADtCxAASAAAALAAAA\
AWAAAAQ2FwYWNpdHlFcnJvcjogAFgMEAAPAAAAaW5zdWZmaWNpZW50IGNhcGFjaXR5AAAAcAwQABUA\
AADXKBAATwAAALgBAAA3AAAAQzpcVXNlcnNcZGF2aWRcLmNhcmdvXHJlZ2lzdHJ5XHNyY1xpbmRleC\
5jcmF0ZXMuaW8tNmYxN2QyMmJiYTE1MDAxZlxhcnJheXZlYy0wLjcuMlxzcmNcYXJyYXl2ZWNfaW1w\
bC5ycwCgDBAAZwAAACcAAAAgAAAAQzpcVXNlcnNcZGF2aWRcLmNhcmdvXHJlZ2lzdHJ5XHNyY1xpbm\
RleC5jcmF0ZXMuaW8tNmYxN2QyMmJiYTE1MDAxZlxjb25zb2xlX3N0YXRpY190ZXh0LTAuOC4yXHNy\
Y1xhbnNpLnJzAAAAGA0QAGkAAAATAAAAHQAAABtbMUNDOlxVc2Vyc1xkYXZpZFwuY2FyZ29ccmVnaX\
N0cnlcc3JjXGluZGV4LmNyYXRlcy5pby02ZjE3ZDIyYmJhMTUwMDFmXGNvbnNvbGVfc3RhdGljX3Rl\
eHQtMC44LjJcc3JjXHdvcmQucnMAAACYDRAAaQAAACUAAAAkAAAAmA0QAGkAAAA3AAAAIQAAAJgNEA\
BpAAAALQAAAC0AAAAbW0EANA4QAAIAAAA2DhAAAQAAAEIAAAA0DhAAAgAAAEgOEAABAAAAQzpcVXNl\
cnNcZGF2aWRcLmNhcmdvXHJlZ2lzdHJ5XHNyY1xpbmRleC5jcmF0ZXMuaW8tNmYxN2QyMmJiYTE1MD\
AxZlxjb25zb2xlX3N0YXRpY190ZXh0LTAuOC4yXHNyY1xsaWIucnMbWzBHG1sySxtbSgobW0sAXA4Q\
AGgAAACeAQAAHgAAAFwOEABoAAAAnAEAACwAAABsaWJyYXJ5L2NvcmUvc3JjL251bS9kaXlfZmxvYX\
QucnMAAAD0DhAAIQAAAE4AAAAJAAAAYXNzZXJ0aW9uIGZhaWxlZDogZWRlbHRhID49IDAAAAD0DhAA\
IQAAAEwAAAAJAAAAAgAAABQAAADIAAAA0AcAACBOAABADQMAgIQeAAAtMQEAwusLAJQ1dwAAwW/yhi\
MAAAAAAIHvrIVbQW0t7gQAAAAAAAAAAAAAAR9qv2TtOG7tl6fa9Pk/6QNPGAAAAAAAAAAAAAAAAAAA\
AAAAAT6VLgmZ3wP9OBUPL+R0I+z1z9MI3ATE2rDNvBl/M6YDJh/pTgIAAAAAAAAAAAAAAAAAAAAAAA\
AAAAAAAAAAAAAAAAAAAAAAAXwumFuH075yn9nYhy8VEsZQ3mtwbkrPD9iV1W5xsiawZsatJDYVHVrT\
QjwOVP9jwHNVzBfv+WXyKLxV98fcgNztbvTO79xf91MFAGxpYnJhcnkvY29yZS9zcmMvbnVtL2ZsdD\
JkZWMvc3RyYXRlZ3kvZHJhZ29uLnJzAFgQEAAvAAAAwQAAAAkAAABYEBAALwAAAPoAAAANAAAAWBAQ\
AC8AAAABAQAANgAAAGFzc2VydGlvbiBmYWlsZWQ6IGQubWFudCA+IDBYEBAALwAAAHEBAAAkAAAAWB\
AQAC8AAAB2AQAAVwAAAFgQEAAvAAAAgwEAADYAAABYEBAALwAAAGUBAAANAAAAWBAQAC8AAABLAQAA\
IgAAAAAAAADfRRo9A88a5sH7zP4AAAAAysaaxxf+cKvc+9T+AAAAAE/cvL78sXf/9vvc/gAAAAAM1m\
tB75FWvhH85P4AAAAAPPx/kK0f0I0s/Oz+AAAAAIOaVTEoXFHTRvz0/gAAAAC1yaatj6xxnWH8/P4A\
AAAAy4vuI3cinOp7/AT/AAAAAG1TeECRScyulvwM/wAAAABXzrZdeRI8grH8FP8AAAAAN1b7TTaUEM\
LL/Bz/AAAAAE+YSDhv6paQ5vwk/wAAAADHOoIly4V01wD9LP8AAAAA9Je/l83PhqAb/TT/AAAAAOWs\
KheYCjTvNf08/wAAAACOsjUq+2c4slD9RP8AAAAAOz/G0t/UyIRr/Uz/AAAAALrN0xonRN3Fhf1U/w\
AAAACWySW7zp9rk6D9XP8AAAAAhKVifSRsrNu6/WT/AAAAAPbaXw1YZquj1f1s/wAAAAAm8cPek/ji\
8+/9dP8AAAAAuID/qqittbUK/nz/AAAAAItKfGwFX2KHJf6E/wAAAABTMME0YP+8yT/+jP8AAAAAVS\
a6kYyFTpZa/pT/AAAAAL1+KXAkd/nfdP6c/wAAAACPuOW4n73fpo/+pP8AAAAAlH10iM9fqfip/qz/\
AAAAAM+bqI+TcES5xP60/wAAAABrFQ+/+PAIit/+vP8AAAAAtjExZVUlsM35/sT/AAAAAKx/e9DG4j\
+ZFP/M/wAAAAAGOysqxBBc5C7/1P8AAAAA05JzaZkkJKpJ/9z/AAAAAA7KAIPytYf9Y//k/wAAAADr\
GhGSZAjlvH7/7P8AAAAAzIhQbwnMvIyZ//T/AAAAACxlGeJYF7fRs//8/wAAAAAAAAAAAABAnM7/BA\
AAAAAAAAAAABCl1Ojo/wwAAAAAAAAAYqzF63itAwAUAAAAAACECZT4eDk/gR4AHAAAAAAAsxUHyXvO\
l8A4ACQAAAAAAHBc6nvOMn6PUwAsAAAAAABogOmrpDjS1W0ANAAAAAAARSKaFyYnT5+IADwAAAAAAC\
f7xNQxomPtogBEAAAAAACorciMOGXesL0ATAAAAAAA22WrGo4Ix4PYAFQAAAAAAJodcUL5HV3E8gBc\
AAAAAABY5xumLGlNkg0BZAAAAAAA6o1wGmTuAdonAWwAAAAAAEp375qZo22iQgF0AAAAAACFa320e3\
gJ8lwBfAAAAAAAdxjdeaHkVLR3AYQAAAAAAMLFm1uShluGkgGMAAAAAAA9XZbIxVM1yKwBlAAAAAAA\
s6CX+ly0KpXHAZwAAAAAAONfoJm9n0be4QGkAAAAAAAljDnbNMKbpfwBrAAAAAAAXJ+Yo3KaxvYWAr\
QAAAAAAM6+6VRTv9y3MQK8AAAAAADiQSLyF/P8iEwCxAAAAAAApXhc05vOIMxmAswAAAAAAN9TIXvz\
WhaYgQLUAAAAAAA6MB+X3LWg4psC3AAAAAAAlrPjXFPR2ai2AuQAAAAAADxEp6TZfJv70ALsAAAAAA\
AQRKSnTEx2u+sC9AAAAAAAGpxAtu+Oq4sGA/wAAAAAACyEV6YQ7x/QIAMEAQAAAAApMZHp5aQQmzsD\
DAEAAAAAnQycofubEOdVAxQBAAAAACn0O2LZICiscAMcAQAAAACFz6d6XktEgIsDJAEAAAAALd2sA0\
DkIb+lAywBAAAAAI//RF4vnGeOwAM0AQAAAABBuIycnRcz1NoDPAEAAAAAqRvjtJLbGZ71A0QBAAAA\
ANl337puv5brDwRMAQAAAABsaWJyYXJ5L2NvcmUvc3JjL251bS9mbHQyZGVjL3N0cmF0ZWd5L2dyaX\
N1LnJzAAA4FhAALgAAAAoBAAARAAAAAAAAAAAAAABhdHRlbXB0IHRvIGRpdmlkZSBieSB6ZXJvAAAA\
OBYQAC4AAABAAQAACQAAADgWEAAuAAAAqQAAAAUAAABhc3NlcnRpb24gZmFpbGVkOiAhYnVmLmlzX2\
VtcHR5KCkAAAABAAAACgAAAGQAAADoAwAAECcAAKCGAQBAQg8AgJaYAADh9QUAypo7OBYQAC4AAAAz\
AgAAEQAAADgWEAAuAAAAbAIAAAkAAAA4FhAALgAAANwBAAAFAAAAOBYQAC4AAADjAgAATgAAADgWEA\
AuAAAA7wIAAEoAAAA4FhAALgAAAMwCAABKAAAAbGlicmFyeS9jb3JlL3NyYy9udW0vZmx0MmRlYy9t\
b2QucnMuMC5hc3NlcnRpb24gZmFpbGVkOiBidWZbMF0gPiBiXCcwXCcAaBcQACMAAAC9AAAABQAAAG\
gXEAAjAAAAvAAAAAUAAAAtK05hTmluZjBhc3NlcnRpb24gZmFpbGVkOiBidWYubGVuKCkgPj0gbWF4\
bGVuAABoFxAAIwAAAH8CAAANAAAAbGlicmFyeS9jb3JlL3NyYy9mbXQvbW9kLnJzLi4AAAArGBAAAg\
AAAEJvcnJvd011dEVycm9yOgDwXRAAAAAAAEYYEAABAAAARhgQAAEAAABwYW5pY2tlZCBhdCA6CgAA\
QgAAAAAAAAABAAAAXQAAAGluZGV4IG91dCBvZiBib3VuZHM6IHRoZSBsZW4gaXMgIGJ1dCB0aGUgaW\
5kZXggaXMgAACAGBAAIAAAAKAYEAASAAAAPgAAAAQAAAAEAAAAXgAAAD09YXNzZXJ0aW9uIGBsZWZ0\
ICByaWdodGAgZmFpbGVkCiAgbGVmdDogCiByaWdodDogAADWGBAAEAAAAOYYEAAXAAAA/RgQAAkAAA\
AgcmlnaHRgIGZhaWxlZDogCiAgbGVmdDogAAAA1hgQABAAAAAgGRAAEAAAADAZEAAJAAAA/RgQAAkA\
AAA6IAAA8F0QAAAAAABcGRAAAgAAAD4AAAAMAAAABAAAAF8AAABgAAAAYQAAACAgICAgeyAsICB7Ci\
wKIHsgLi4gfX0gfSgoCjB4bGlicmFyeS9jb3JlL3NyYy9mbXQvbnVtLnJzpRkQABsAAABpAAAAFwAA\
ADAwMDEwMjAzMDQwNTA2MDcwODA5MTAxMTEyMTMxNDE1MTYxNzE4MTkyMDIxMjIyMzI0MjUyNjI3Mj\
gyOTMwMzEzMjMzMzQzNTM2MzczODM5NDA0MTQyNDM0NDQ1NDY0NzQ4NDk1MDUxNTI1MzU0NTU1NjU3\
NTg1OTYwNjE2MjYzNjQ2NTY2Njc2ODY5NzA3MTcyNzM3NDc1NzY3Nzc4Nzk4MDgxODI4Mzg0ODU4Nj\
g3ODg4OTkwOTE5MjkzOTQ5NTk2OTc5ODk5PgAAAAQAAAAEAAAAYgAAAGMAAABkAAAAEBgQABsAAAA1\
AQAADQAAADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMD\
AwMDAwMDAwMDAwMDAQGBAAGwAAANgFAAAfAAAAZmFsc2V0cnVlAAAAEBgQABsAAAAbCQAAGgAAABAY\
EAAbAAAAFAkAACIAAAByYW5nZSBzdGFydCBpbmRleCAgb3V0IG9mIHJhbmdlIGZvciBzbGljZSBvZi\
BsZW5ndGggPBsQABIAAABOGxAAIgAAAHJhbmdlIGVuZCBpbmRleCCAGxAAEAAAAE4bEAAiAAAAc2xp\
Y2UgaW5kZXggc3RhcnRzIGF0ICBidXQgZW5kcyBhdCAAoBsQABYAAAC2GxAADQAAAHNvdXJjZSBzbG\
ljZSBsZW5ndGggKCkgZG9lcyBub3QgbWF0Y2ggZGVzdGluYXRpb24gc2xpY2UgbGVuZ3RoICjUGxAA\
FQAAAOkbEAArAAAA+F0QAAEAAAABAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQ\
EBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEB\
AQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAICAgICAgICAgICAgICAgICAgIC\
AgICAgICAgICAgMDAwMDAwMDAwMDAwMDAwMEBAQEBAAAAAAAAAAAAAAAbGlicmFyeS9jb3JlL3NyYy\
9zdHIvcGF0dGVybi5ycwAsHRAAHwAAAEIFAAASAAAALB0QAB8AAABCBQAAKAAAACwdEAAfAAAANQYA\
ABUAAAAsHRAAHwAAAGMGAAAVAAAALB0QAB8AAABkBgAAFQAAAFsuLi5dYnl0ZSBpbmRleCAgaXMgbm\
90IGEgY2hhciBib3VuZGFyeTsgaXQgaXMgaW5zaWRlICAoYnl0ZXMgKSBvZiBgoR0QAAsAAACsHRAA\
JgAAANIdEAAIAAAA2h0QAAYAAAATMRAAAQAAAGJlZ2luIDw9IGVuZCAoIDw9ICkgd2hlbiBzbGljaW\
5nIGAAAAgeEAAOAAAAFh4QAAQAAAAaHhAAEAAAABMxEAABAAAAIGlzIG91dCBvZiBib3VuZHMgb2Yg\
YAAAoR0QAAsAAABMHhAAFgAAABMxEAABAAAAbGlicmFyeS9jb3JlL3NyYy9zdHIvbW9kLnJzAHweEA\
AbAAAAAwEAACwAAABsaWJyYXJ5L2NvcmUvc3JjL3VuaWNvZGUvcHJpbnRhYmxlLnJzAAAAqB4QACUA\
AAAaAAAANgAAAKgeEAAlAAAACgAAACsAAAAABgEBAwEEAgUHBwIICAkCCgULAg4EEAERAhIFExEUAR\
UCFwIZDRwFHQgfASQBagRrAq8DsQK8As8C0QLUDNUJ1gLXAtoB4AXhAucE6ALuIPAE+AL6A/sBDCc7\
Pk5Pj56en3uLk5aisrqGsQYHCTY9Plbz0NEEFBg2N1ZXf6qur7014BKHiY6eBA0OERIpMTQ6RUZJSk\
5PZGVctrcbHAcICgsUFzY5Oqip2NkJN5CRqAcKOz5maY+SEW9fv+7vWmL0/P9TVJqbLi8nKFWdoKGj\
pKeorbq8xAYLDBUdOj9FUaanzM2gBxkaIiU+P+fs7//FxgQgIyUmKDM4OkhKTFBTVVZYWlxeYGNlZm\
tzeH1/iqSqr7DA0K6vbm++k14iewUDBC0DZgMBLy6Agh0DMQ8cBCQJHgUrBUQEDiqAqgYkBCQEKAg0\
C05DgTcJFgoIGDtFOQNjCAkwFgUhAxsFAUA4BEsFLwQKBwkHQCAnBAwJNgM6BRoHBAwHUEk3Mw0zBy\
4ICoEmUksrCCoWGiYcFBcJTgQkCUQNGQcKBkgIJwl1C0I+KgY7BQoGUQYBBRADBYCLYh5ICAqApl4i\
RQsKBg0TOgYKNiwEF4C5PGRTDEgJCkZFG0gIUw1JBwqA9kYKHQNHSTcDDggKBjkHCoE2GQc7AxxWAQ\
8yDYObZnULgMSKTGMNhDAQFo+qgkehuYI5ByoEXAYmCkYKKAUTgrBbZUsEOQcRQAULAg6X+AiE1ioJ\
oueBMw8BHQYOBAiBjIkEawUNAwkHEJJgRwl0PID2CnMIcBVGehQMFAxXCRmAh4FHA4VCDxWEUB8GBo\
DVKwU+IQFwLQMaBAKBQB8ROgUBgdAqguaA9ylMBAoEAoMRREw9gMI8BgEEVQUbNAKBDiwEZAxWCoCu\
OB0NLAQJBwIOBoCag9gEEQMNA3cEXwYMBAEPDAQ4CAoGKAgiToFUDB0DCQc2CA4ECQcJB4DLJQqEBg\
ABAwUFBgYCBwYIBwkRChwLGQwaDRAODA8EEAMSEhMJFgEXBBgBGQMaBxsBHAIfFiADKwMtCy4BMAMx\
AjIBpwKpAqoEqwj6AvsF/QL+A/8JrXh5i42iMFdYi4yQHN0OD0tM+/wuLz9cXV/ihI2OkZKpsbq7xc\
bJyt7k5f8ABBESKTE0Nzo7PUlKXYSOkqmxtLq7xsrOz+TlAAQNDhESKTE0OjtFRklKXmRlhJGbncnO\
zw0RKTo7RUlXW1xeX2RljZGptLq7xcnf5OXwDRFFSWRlgISyvL6/1dfw8YOFi6Smvr/Fx8/a20iYvc\
3Gzs9JTk9XWV5fiY6Psba3v8HGx9cRFhdbXPb3/v+AbXHe3w4fbm8cHV99fq6vf7u8FhceH0ZHTk9Y\
Wlxefn+1xdTV3PDx9XJzj3R1liYuL6evt7/Hz9ffmkCXmDCPH9LUzv9OT1pbBwgPECcv7u9ubzc9P0\
JFkJFTZ3XIydDR2Nnn/v8AIF8igt8EgkQIGwQGEYGsDoCrBR8JgRsDGQgBBC8ENAQHAwEHBgcRClAP\
EgdVBwMEHAoJAwgDBwMCAwMDDAQFAwsGAQ4VBU4HGwdXBwIGFwxQBEMDLQMBBBEGDww6BB0lXyBtBG\
olgMgFgrADGgaC/QNZBxYJGAkUDBQMagYKBhoGWQcrBUYKLAQMBAEDMQssBBoGCwOArAYKBi8xTQOA\
pAg8Aw8DPAc4CCsFgv8RGAgvES0DIQ8hD4CMBIKXGQsViJQFLwU7BwIOGAmAviJ0DIDWGgwFgP8FgN\
8M8p0DNwmBXBSAuAiAywUKGDsDCgY4CEYIDAZ0Cx4DWgRZCYCDGBwKFglMBICKBqukDBcEMaEEgdom\
BwwFBYCmEIH1BwEgKgZMBICNBIC+AxsDDw1saWJyYXJ5L2NvcmUvc3JjL3VuaWNvZGUvdW5pY29kZV\
9kYXRhLnJzbCQQACgAAABQAAAAKAAAAGwkEAAoAAAAXAAAABYAAAAwMTIzNDU2Nzg5YWJjZGVmbGli\
cmFyeS9jb3JlL3NyYy9lc2NhcGUucnNcdXsAAADEJBAAGgAAAGIAAAAjAAAAbGlicmFyeS9jb3JlL3\
NyYy9udW0vYmlnbnVtLnJzAAD0JBAAHgAAAKwBAAABAAAAYXNzZXJ0aW9uIGZhaWxlZDogbm9ib3Jy\
b3dhc3NlcnRpb24gZmFpbGVkOiBkaWdpdHMgPCA0MGFzc2VydGlvbiBmYWlsZWQ6IG90aGVyID4gME\
Vycm9yAAADAACDBCAAkQVgAF0ToAASFyAfDCBgH+8soCsqMCAsb6bgLAKoYC0e+2AuAP4gNp7/YDb9\
AeE2AQohNyQN4TerDmE5LxihOTAcYUjzHqFMQDRhUPBqoVFPbyFSnbyhUgDPYVNl0aFTANohVADg4V\
Wu4mFX7OQhWdDooVkgAO5Z8AF/WgBwAAcALQEBAQIBAgEBSAswFRABZQcCBgICAQQjAR4bWws6CQkB\
GAQBCQEDAQUrAzwIKhgBIDcBAQEECAQBAwcKAh0BOgEBAQIECAEJAQoCGgECAjkBBAIEAgIDAwEeAg\
MBCwI5AQQFAQIEARQCFgYBAToBAQIBBAgBBwMKAh4BOwEBAQwBCQEoAQMBNwEBAwUDAQQHAgsCHQE6\
AQIBAgEDAQUCBwILAhwCOQIBAQIECAEJAQoCHQFIAQQBAgMBAQgBUQECBwwIYgECCQsHSQIbAQEBAQ\
E3DgEFAQIFCwEkCQFmBAEGAQICAhkCBAMQBA0BAgIGAQ8BAAMAAx0CHgIeAkACAQcIAQILCQEtAwEB\
dQIiAXYDBAIJAQYD2wICAToBAQcBAQEBAggGCgIBMB8xBDAHAQEFASgJDAIgBAICAQM4AQECAwEBAz\
oIAgKYAwENAQcEAQYBAwLGQAABwyEAA40BYCAABmkCAAQBCiACUAIAAQMBBAEZAgUBlwIaEg0BJggZ\
Cy4DMAECBAICJwFDBgICAgIMAQgBLwEzAQEDAgIFAgEBKgIIAe4BAgEEAQABABAQEAACAAHiAZUFAA\
MBAgUEKAMEAaUCAAQAAlADRgsxBHsBNg8pAQICCgMxBAICBwE9AyQFAQg+AQwCNAkKBAIBXwMCAQEC\
BgECAZ0BAwgVAjkCAQEBARYBDgcDBcMIAgMBARcBUQECBgEBAgEBAgEC6wECBAYCAQIbAlUIAgEBAm\
oBAQECBgEBZQMCBAEFAAkBAvUBCgIBAQQBkAQCAgQBIAooBgIECAEJBgIDLg0BAgAHAQYBAVIWAgcB\
AgECegYDAQECAQcBAUgCAwEBAQACCwI0BQUBAQEAAQYPAAU7BwABPwRRAQACAC4CFwABAQMEBQgIAg\
ceBJQDADcEMggBDgEWBQEPAAcBEQIHAQIBBWQBoAcAAT0EAAQAB20HAGCA8AAvcnVzdGMvY2M2NmFk\
NDY4OTU1NzE3YWI5MjYwMGM3NzBkYThjMTYwMWE0ZmYzMy9saWJyYXJ5L2NvcmUvc3JjL3N0ci9wYX\
R0ZXJuLnJzAADXKBAATwAAALMFAAAUAAAA1ygQAE8AAACzBQAAIQAAANcoEABPAAAApwUAACEAAABk\
ZXNjcmlwdGlvbigpIGlzIGRlcHJlY2F0ZWQ7IHVzZSBEaXNwbGF5qC8QAFoAAACpAAAAGgAAAAoKAA\
CoLxAAWgAAAI8AAAARAAAAqC8QAFoAAACPAAAAKAAAAKgvEABaAAAAngAAAB8AAABlAAAAGAAAAAQA\
AABmAAAAZQAAABgAAAAEAAAAZwAAAGYAAADEKRAATQAAAGgAAABPAAAATQAAAFAAAABpAAAAHAAAAA\
QAAABqAAAAaQAAABwAAAAEAAAAawAAAGoAAAAAKhAAbAAAAG0AAABPAAAAbgAAAFAAAABvAAAAcAAA\
AHEAAAByAAAASgAAACYmfHxFbXB0eSBjb21tYW5kLkM6XFVzZXJzXGRhdmlkXC5jYXJnb1xnaXRcY2\
hlY2tvdXRzXGRlbm9fdGFza19zaGVsbC0yYjA3MDlmYzcxZjcxY2QzXGVkM2Q0ZDBcc3JjXHBhcnNl\
ci5yc0V4cGVjdGVkIGNvbW1hbmQgZm9sbG93aW5nIGJvb2xlYW4gb3BlcmF0b3IuYioQAFoAAACVAQ\
AAOQAAAENhbm5vdCBzZXQgbXVsdGlwbGUgZW52aXJvbm1lbnQgdmFyaWFibGVzIHdoZW4gdGhlcmUg\
aXMgbm8gZm9sbG93aW5nIGNvbW1hbmQuRXhwZWN0ZWQgY29tbWFuZCBmb2xsb3dpbmcgcGlwZWxpbm\
Ugb3BlcmF0b3IuUmVkaXJlY3RzIGluIHBpcGUgc2VxdWVuY2UgY29tbWFuZHMgYXJlIGN1cnJlbnRs\
eSBub3Qgc3VwcG9ydGVkLk11bHRpcGxlIHJlZGlyZWN0cyBhcmUgY3VycmVudGx5IG5vdCBzdXBwb3\
J0ZWQuJnwmSW52YWxpZCBlbnZpcm9ubWVudCB2YXJpYWJsZSB2YWx1ZS5VbnN1cHBvcnRlZCByZXNl\
cnZlZCB3b3JkLkV4cGVjdGVkIGNsb3Npbmcgc2luZ2xlIHF1b3RlLkV4cGVjdGVkIGNsb3NpbmcgZG\
91YmxlIHF1b3RlLiQ/IyokIGlzIGN1cnJlbnRseSBub3Qgc3VwcG9ydGVkLgAAYSwQAAEAAABiLBAA\
HAAAAEJhY2sgdGlja3MgaW4gc3RyaW5ncyBpcyBjdXJyZW50bHkgbm90IHN1cHBvcnRlZC5+KCl7fT\
w+fCY7IidFeHBlY3RlZCBjbG9zaW5nIHBhcmVudGhlc2lzIG9uIHN1YnNoZWxsLgAAYioQAFoAAABk\
AwAADQAAAGlmdGhlbmVsc2VlbGlmZmlkb2RvbmVjYXNlZXNhY3doaWxldW50aWxmb3JpblVuZXhwZW\
N0ZWQgY2hhcmFjdGVyLkhhc2ggdGFibGUgY2FwYWNpdHkgb3ZlcmZsb3cAAEotEAAcAAAAL2Nhcmdv\
L3JlZ2lzdHJ5L3NyYy9pbmRleC5jcmF0ZXMuaW8tNmYxN2QyMmJiYTE1MDAxZi9oYXNoYnJvd24tMC\
4xNC4wL3NyYy9yYXcvbW9kLnJzcC0QAFQAAABSAAAAKAAAAGNsb3N1cmUgaW52b2tlZCByZWN1cnNp\
dmVseSBvciBhZnRlciBiZWluZyBkcm9wcGVkaW52YWxpZCBhcmdzAAAGLhAADAAAAC9ydXN0Yy9jYz\
Y2YWQ0Njg5NTU3MTdhYjkyNjAwYzc3MGRhOGMxNjAxYTRmZjMzL2xpYnJhcnkvY29yZS9zcmMvZm10\
L21vZC5ycwAcLhAASwAAADUBAAANAAAAAgICAgICAgICAwMBAQEAAAAAAAAAAAAAAAAAAAAAAAABAA\
AAAAAAAAICAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\
AAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAA\
AAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAE5vbmVTb21lCiAgCi\
AgfgDwXRAAAAAAAIAvEAADAAAAgy8QAAQAAADwXRAAAAAAAEM6XFVzZXJzXGRhdmlkXC5jYXJnb1xy\
ZWdpc3RyeVxzcmNcaW5kZXguY3JhdGVzLmlvLTZmMTdkMjJiYmExNTAwMWZcbW9uY2gtMC41LjBcc3\
JjXGxpYi5ycwAAqC8QAFoAAAB1AAAAIgAAAKgvEABaAAAA4QEAABgAAACoLxAAWgAAAOEBAAAnAAAA\
bWVzc2FnZVBhcnNlRXJyb3JGYWlsdXJlRXJyb3Jjb2RlX3NuaXBwZXQAAAAvAAAABAAAAAQAAABzAA\
AAAQAAAEM6XFVzZXJzXGRhdmlkXC5jYXJnb1xyZWdpc3RyeVxzcmNcaW5kZXguY3JhdGVzLmlvLTZm\
MTdkMjJiYmExNTAwMWZcb25jZV9jZWxsLTEuMTYuMFxzcmNcaW1wX3N0ZC5ycwB0MBAAYwAAAKsAAA\
A2AAAAdDAQAGMAAAClAAAACQAAAGEgc3RyaW5nYnl0ZSBhcnJheWJvb2xlYW4gYGAKMRAACQAAABMx\
EAABAAAAaW50ZWdlciBgAAAAJDEQAAkAAAATMRAAAQAAAGZsb2F0aW5nIHBvaW50IGBAMRAAEAAAAB\
MxEAABAAAAY2hhcmFjdGVyIGAAYDEQAAsAAAATMRAAAQAAAHN0cmluZyAAfDEQAAcAAAAAMRAACgAA\
AHVuaXQgdmFsdWUAAJQxEAAKAAAAT3B0aW9uIHZhbHVlqDEQAAwAAABuZXd0eXBlIHN0cnVjdAAAvD\
EQAA4AAABzZXF1ZW5jZdQxEAAIAAAAbWFwAOQxEAADAAAAZW51bfAxEAAEAAAAdW5pdCB2YXJpYW50\
/DEQAAwAAABuZXd0eXBlIHZhcmlhbnQAEDIQAA8AAAB0dXBsZSB2YXJpYW50AAAAKDIQAA0AAABzdH\
J1Y3QgdmFyaWFudAAAQDIQAA4AAABhbnkgdmFsdWV1MTY+AAAABAAAAAQAAAA/AAAAdAAAAHUAAABj\
YWxsZWQgYE9wdGlvbjo6dW53cmFwKClgIG9uIGEgYE5vbmVgIHZhbHVlbGlicmFyeS9zdGQvc3JjL3\
RocmVhZC9tb2QucnNmYWlsZWQgdG8gZ2VuZXJhdGUgdW5pcXVlIHRocmVhZCBJRDogYml0c3BhY2Ug\
ZXhoYXVzdGVkAMQyEAA3AAAApzIQAB0AAABKBAAADQAAAGFscmVhZHkgYm9ycm93ZWRCAAAAAAAAAA\
EAAAAnAAAAbGlicmFyeS9zdGQvc3JjL3N5c19jb21tb24vdGhyZWFkX2luZm8ucnMAAAA0MxAAKQAA\
ABUAAAAzAAAAY2Fubm90IG1vZGlmeSB0aGUgcGFuaWMgaG9vayBmcm9tIGEgcGFuaWNraW5nIHRocm\
VhZHAzEAA0AAAAbGlicmFyeS9zdGQvc3JjL3Bhbmlja2luZy5yc6wzEAAcAAAAhwAAAAkAAACsMxAA\
HAAAAFICAAAeAAAAdgAAAAwAAAAEAAAAdwAAAD4AAAAIAAAABAAAAHgAAAA+AAAACAAAAAQAAAB5AA\
AAegAAAHsAAAAQAAAABAAAAHwAAAB9AAAAQgAAAAAAAAABAAAAXQAAAAABAgMDBAUGBwgJCgsMDQ4D\
AwMDAwMDDwMDAwMDAwMPCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQ\
kJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkQCQkJCQkJCRERERERERESERERERER\
ERIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\
AAAAAAAAAQIDBAUGBwYIBgkKCwwNDg8QBgYGERITFAYVFhcYGRobHB0eHyAhIiMiJCUmJygpKiUrLC\
0uLzAxMjM0NTY3ODk6Bjs8CgoGBgYGBj0GBgYGBgYGBgYGBgYGBj4/QEFCBkMGRAYGBkVGR0hJSktM\
TQYGTgYGBgoGBgYGBgYGBk9QUVJTVFVWV1hZBloGBlsGXF1eXV9gYWJjZGVmZ2gGBgYGBgYGBgYGBg\
YGaWoGBgYGBmsGAQZsBgZtbjs7O29wcXI7czt0dXZ3Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7\
Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Oz\
s7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OwY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7\
Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Oz\
s7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7\
Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Oz\
s7Ozs7Ozs7O3h5BgYGBgZ6e3wGBgYGfQYGfn+AgYKDhIWGBgYGhzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7\
Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Oz\
s7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7\
Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O4gGBgYGBgYGBgYGBgYGBgYGBgYGBg\
YGBgYGBgYGBgYGBgZdXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1d\
XV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dOzs7Oz\
s7OzuJBgYGBgYGBgYGBgaKiwYBcYwGjQYGBgYGBgaOBgYGjwaQBgYGBgYGBgYGBgYGBgYGBgYGBgYG\
BgYGBgaRBgaSBgYGBgYGBgaTBgYGBgaUlQaWlwaYmZqbnJ2en6AuBqEsogYGo6SlpgYGp6ipqqsGrA\
YGBq0GBgaurwawsbKzBgYGBga0BrUGtre4BgYGBrm6uwYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYG\
BgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgZHvA\
YGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYG\
BgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBg\
YGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYG\
BgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBga9vgYGBgYGBgYGBgYGBgYGBg\
a/wME7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7\
Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O8I7Ozs7Ozs7Ozs7Ozs7Ozs7Oz\
s7w8QGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYG\
BgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBg\
YGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgbFOzs7O8bHOzs7OzvIBgYGBgYGBgYGBgYGBgYGBgYGBgYG\
BgYGBgYGBgYGBgYGBgYGBgbJBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBg\
YGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBsrLBgYGBgYGBszNBgbOBgYGBgYGBgYGBgYG\
BgYGBgYGBgYGBgYGBgYGBgYGz9DRBgYGBgYGBgYGBgYGBgYGBgYGBgYG0ga/Br4GBgYGBtPUBgYGBg\
YGBtQGBgYGBgYGBgYGBgYGBgbVBtYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBtcGBtjZ2tsG3N0G\
Bt7f4OHi4zvk5ebn6DvpO+oGBgbrBgYGBuztOzsG7u/wBgYGBgYGBgYGBgYGBgYGBgYGBgY7Ozs7Oz\
s7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7\
Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Oz\
s7Ozs75fEKBgYKCgoLBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYG\
BgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBg\
YGBgYGBgYGBgYGBgYGBgYGXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1d\
XV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV\
1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1d\
XV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV\
1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1d8gAAAAAAAAAAVVVVVVVVVVVVVVVV\
VVVVVVVVVVVVVVUVAAAAAAAAAABd13d1//d//1V1VVVX1Vf1X3V/X/fVf3ddVVVV3VXVVVX11VX9VV\
fVf1f/XfVVVVVV9dVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV1d3d3V1VVVVVVVVVVVVVVVV1VVVVd\
VVVVVVVVVVXX/V1XVf/dVVVVVVVVVVUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVVVVV\
X9////3/9fVf3////f/19VVVVVVVVVVVVVVVVVXVVVVf////////////////////9dVVVVVVVVVVVV\
VVUVAFBVVVVVVVVVVVVVVVVVVVVVVQEAAAAAAAAAAAAAEEEQVVVVVVVVVVVVVVVVVVUAUFVVAABAVF\
VVVVVVVVVVVVUVAAAAAABVVVVVVFVVVVVVVVVVBQAQABQEUFVVVVVVVVUVUVVVVVVVVVUAAAAAAABA\
VVVVVVVVVVVVVVVVVVVVVVVVVVVVVQUAAFRVVVVVVVVVVVVVVVVVFQAAVVVRVVVVVVUFEAAAAQFQVV\
VVVVVVVVVVVQFVVVVVVVVVVVVVVVVVUFUAAFVVVVVVVVVVVVUFAAAAAAAAAAAAAAAAAEBVVVVVVVVV\
VVVVVVVVRVQBAFRRAQBVVQVVVVVVVVVVUVVVVVVVVVVVVVVVVVVVVAFUVVFVVVVVBVVVVVVVVUVBVV\
VVVVVVVVVVVVVVVVVUQRUUUFFVVVVVVVVVUFFVVQEQVFFVVVVVBVVVVVVVBQBRVVVVVVVVVVVVVVVV\
VVUUAVRVUVVBVVUFVVVVVVVVVUVVVVVVVVVVVVVVVVVVVVVUVVVRVVVVVVVVVVVVVVVVVFRVVVVVVV\
VVVVVVVVVVBFQFBFBVQVVVBVVVVVVVVVVVRVVQVVVVVQVVVVVVVVVVUFVVVVVVVVVVVVVVVVUVVAFU\
VVFVVVVVBVVVVVVVVVVRVVVVVVVVVVVVVVVVVVVVVVVFVQVEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV\
EAQFVVFQBAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUQAAVFVVAEBVVVVVVVVVVVVVVVVVVVVVVVVQ\
VVVVVVVVEVFVVVVVVVVVVVVVVVVVAQAAQAAEVQEAAAEAAAAAAAAAAFRVRVVVVVVVVVVVVVVVVVVVVV\
VVVVVVVVVVVVUBBABBQVVVVVVVVVAFVFVVVQFUVVVFQVVRVVVVUVVVVVVVVVVVqqqqqqqqqqqqqqqq\
qqqqqqqqqqqqqqqqAAAAAAAAAABVVVVVVVVVAVVVVVVVVVVVVVVVVQVUVVVVVVVVBVVVVVVVVVUFVV\
VVVVVVVQVVVVVVVVVVVVVVVVVVVVVVEABQVUUBAABVVVFVVVVVVVVVVVVVFQBVVVVVVVVVVVVVVVVV\
QVVVVVVVVVVVUVVVVVVVVVVVVVVVVVVAFVRVRVUBVVVVVVVVFRRVVVVVVVVVVVVVVVVVVUUAQEQBAF\
QVAAAUVVVVVVVVVVVVVVVVAAAAAAAAAEBVVVVVVVVVVVVVVVUAVVVVVVVVVVVVVVVVBEBURVVVVVVV\
VVVVVRUAAFVVVVBVVVVVVVVVBVAQUFVVVVVVVVVVVVVVVVVFUBFQVVVVVVVVVVVVVVVVVVUAAAVVVV\
VVVVVAAAAABABUUVVUUFVVVRUA139fX3//BUD3XdV1VVVVVVVVVVUABAAAVVdV1f1XVVVVVVVVVVVV\
V1VVVVVVVVVVAAAAAAAAAABUVVVV1V1dVdV1VVV9ddVVVVVVVVVVVVXVV9V/////Vf//X1VVVV1V//\
9fVVVVVVVVVV9VVVVVVXVXVVVV1VVVVVVVVffV19VdXXX9193/d1X/VV9VVVdXdVVVVV//9fVVVVVV\
9fVVVVVdXVVVXVVVVVVV1VVVVVV1VaVVVVVpVVVVVVVVVVVVVVVVVVVVqVaWVVVVVVVVVVVVVVX///\
//////////////////////////////////////////3///////////Vf///////////1VVVf/////1\
X1VV3/9fVfX1VV9f9df1X1VVVfVfVdVVVVVpVX1d9VVaVXdVVVVVVVVVVXdVqqqqVVVV399/31VVVZ\
VVVVVVlVVV9VlVpVVVVVXpVfr/7//+///fVe//r/vv+1VZpVVVVVVVVVVWVVVVVV1VVVVmlZpVVVVV\
VVVV9f//VVVVVVWpVVVVVVVVVlVVlVVVVVVVVZVWVVVVVVVVVVVVVVVVVvlfVVVVVVVVVVVVVVVVVV\
VVVVVVVVUVUFVVVVVVVVVVVVVVAAAAAAAAAACqqqqqqqqaqqqqqqqqqqqqqqqqqqqqqqqqqqqqqlVV\
VaqqqqqqWlVVVVVVVaqqqqqqqqqqqqqqqqqqCqCqqqpqqaqqqqqqqqqqqqqqqqqqqqqqqqqqaoGqqq\
qqqqqqqqpVqaqqqqqqqqqqqqqpqqqqqqqqaqqqqqqqqqqqqqqqqqqqqqqqqqqqqlVVlaqqqqqqqqqq\
qqqqaqqqqqqqqqqqqqr//6qqqqqqqqqqqqqqqqqqqlaqqqqqqqqqqqqqqqqqalVVVVVVVVVVVVVVVV\
VVVVVVVVVVVVVVVVUVQAAAUFVVVVVVVVUFVVVVVVVVVVVVVVVVVVVVVVVVVVVQVVVVRUUVVVVVVVVV\
QVVUVVVVVVVQVVVVVVVVAAAAAFBVVRVVVVVVVVVVVVUFAFBVVVVVVRUAAFBVVVWqqqqqqqqqVkBVVV\
VVVVVVVVVVVRUFUFBVVVVVVVVVVVVRVVVVVVVVVVVVVVVVVVVVVQFAQUFVVRVVVVRVVVVVVVVVVVVV\
VVRVVVVVVVVVVVVVVVUEFFQFUVVVVVVVVVVVVVVQVUVVVVVVVVVVVVVVVVFUUVVVVVWqqqqqqqqqqq\
pVVVVVVVVVVVVVVVVVVUVVVVVVVVVVVQAAAACqqlpVAAAAAKqqqqqqqqqqaqqqqqpqqlVVVVVVqqqq\
qqqqqqpWVVVVVVVVVVVVVVVVVVVVqmpVVVVVAV1VVVVVVVVVVVVVVVVVVVVRVVVVVVVVVVVUVVVVVV\
VVVVVVVVVVVVVVVVVVVVUFQFUBQVUAVVVVVVVVVVVVVUAVVVVVVVVVVVVVQVVVVVVVVVVVVVVVVVVV\
VQBVVVVVVVVVVVVVVVVVVVVVFVRVVVVVVVVVVVVVVVVVVVVVVVVVAVUFAABUVVVVVVVVVVVVVVUFUF\
VVVVVVVVVVVVVVVVVVUVVVVVVVVVVVVVVVVVUAAABAVVVVVVVVVVVVVRRUVRVQVVVVVVVVVVVVVVUV\
QEFRRVVVUVVVVVVVVVVVVVVVVUBVVVVVVVVVVRUAAQBUVVVVVVVVVVVVVVVVVVUVVVVVUFVVVVVVVV\
VVVVVVVQUAQFVVARRVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVRVQBFVFVVVVVVVVVRUVAEBVVVVVVVRV\
VVVVVVVVVQUAVABUVVVVVVVVVVVVVVVVVVVVVQAABURVVVVVVUVVVVVVVVVVVVVVVVVVVVVVVVVVVR\
UARBUEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVBVBVEFRVVVVVVVVQVVVVVVVVVVVVVVVVVVVV\
VVVVVVUVAEARVFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUVUQAQVVVVVVVVVVVVAQUQAFVVVVVVVV\
VVVVVVVVVVVVUVAABBVVVVVVVVVVVVVVVVVVVVFUQVVVVVVVVVVVVVVVVVVVVVVVVVVVUABVVUVVVV\
VVVVVQEAQFVVVVVVVVVVVRUAFEBVFVVVAUABVVVVVVVVVVVVVVUFAABAUFVVVVVVVVVVVVVVVVVVVV\
VVVVVVVQBAABBVVVVVBQAAAAAABQAEQVVVVVVVVVVVVVVVVVVVAUBFEAAQVVVVVVVVVVVVVVVVVVVV\
VVVVUBFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVFVRVVVBVVVVVVVVVVVVVVVUFQFVEVVVVVVVVVVVVVV\
VVVVVVVBUAAABQVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQBUVVVVVVVVVVVVVVVVVVUAQFVVVVVVFVVV\
VVVVVVVVVVVVVVVVVRVAVVVVVVVVVVVVVVVVVVVVVVVVVapUVVVaVVVVqqqqqqqqqqqqqqqqqqpVVa\
qqqqqqWlVVVVVVVVVVVVWqqlZVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVqqmqaaqqqqqqqqqqalVV\
VWVVVVVVVVVVallVVVWqVVWqqqqqqqqqqqqqqqqqqqqqqqqqVVVVVVVVVVVBAFVVVVVVVVUAAAAAAA\
AAAAAAAFAAAAAAAEBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVRVQVRUAAABAAQBVVVVVVVVVBVBVVVVV\
BVRVVVVVVVVVVVVVVVVVVQAAAAAAAAAAAAAAAABAFQAAAAAAAAAAAAAAAFRVUVVVVVRVVVVVFQABAA\
AAVVVVVQBAAAAAABQAEARAVVVVVVVVVVVVVVVVVVVVVUVVVVVVVVVVVVVVVVVVVVUAVVVVVVVVVVUA\
QFVVVVVVVVVVVVVVAEBVVVVVVVVVVVVVVVVVVVZVVVVVVVVVVVVVVVVVVVVVVZVVVVVVVVVVVVVVVV\
X//39V/////////1///////////////////19V/////////++rqur/////V1VVVVVqVVVVqqqqqqqq\
qqqqqqpVqqpWVVpVVVWqWlVVVVVVVaqqqqqqqqqqVlVVqaqaqqqqqqqqqqqqqqqqqqqqqqqmqqqqqq\
pVVVWqqqqqqqqqqqqqapWqVVVVqqqqqlZWqqqqqqqqqqqqqqqqqqqqqqpqpqqqqqqqqqqqqqqqqqqq\
qqqqqqqqqqqqqqqqqqqqqpaqqqqqqqqqqqqqqqqqqqpaVVWVaqqqqqqqqlVVVVVlVVVVVVVVaVVVVV\
ZVVVVVVVVVVVVVVVVVVVVVVVVVVZWqqqqqqlVVVVVVVVVVVVVVVapaVVZqqVWqVVWVVlWqqlZVVVVV\
VVVVVaqqqlVWVVVVVVVVqqqqqqqqqqqqqqpqqqqaqqqqqqqqqqqqqqqqqqpVVVVVVVVVVVVVVVWqqq\
pWqqpWVaqqqqqqqqqqqqqqmqpaVaWqqqpVqqpWVaqqVlVRVVVVVVVVVQAAAAAAAAAA////////////\
////////XwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFwAXAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFAAUAAAUF\
BQUCMjIyMjIyMjIyMjIyMjIyO0tLS0tLS0tLS0tLQkJCQkPDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8\
PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8cAAAAAAAAAAAAAAAAAAAAAAAAA\
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUFBQUFBQUF\
BQUFBQUFBQUFBQUFBQUFBQAFAAAFBQUFBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcAwM\
DAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDA\
wMDHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\
AAAAAAAAAAAAAAAAAAAFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUABQAABQUFBQICAgICAgICAgICAg\
ICAgIAICAgICAgICAgICAgICAgI8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PD\
w8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDxwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQUFBQUFBQUFBQUFBQUFBQUFBQUFBQ\
UFAAUAAAUFBQUCMjIyMjIyMjIyMjIyMjIyOwsLCwsLCwsLCwsLACAgICPDw8PDw8PDw8PDw8PDw8PD\
w8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8cAAAAAAAAAAAAAAA\
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\
cHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwAHAAAHBwcHAnJycnJycnJycnJycnJycnuLi4uLi4uLi4uL\
i4KCgoKAkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJ\
CQkJCQkJCQkJCXAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcABwAABwcHBwcHBwcH\
BwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBw\
cHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\
AAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwcHBwcHBwcHBwcHBwcH\
BwcHBwcHBwcHAAcAAAcHBwcCAgICAgICAgICAgICAgICAGBgYGBgYGBgYGBgYGBgYGCQkJCQkJCQkJ\
CQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJcAAAAA\
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\
AAAAAAAAAAcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwAHAAAHBwcHAnJycnJycnJycnJycnJycnsLCw\
sLCwsLCwsLCwBgYGBgkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQ\
kJCQkJCQkJCQkJCQkJCQkJCXAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0ADQAADQ\
0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0N\
DQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NBwAAAAAAAAAAAAAAAAAAAAAAAA\
AAAAAAAAAAAAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQUFBQUFBQ\
UFBQUFBQUFBQUFBQUFBQUFAAUAAAUFBQUCsrKysrKysrKysrKysrKytMTExMTExMTExMTExMTExMTE\
xMTExMTExMTExMTExMTAVMTExMTExMDkxMAUwNDg5MTExMTExMTExMTExMTExMTExMTExMTExMTExM\
TExMcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\
AAAAAAAAAAAAAAAAAAAAUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQAFAAAFBQUFAgICAgICAgICAgIC\
AgICAgTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExM\
TExMTExMTExMTExMTExMTExMTExMTExMTHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFBQUFBQUFBQUFBQUFBQUFBQUFBQUF\
BQUABQAABQUFBQwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDA\
wMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAUFBQUFBQUFBQUF\
BQUFBQUABQUFBQUFBQUFBQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA////\
////////////////////////////////////////////////////////////////AAAAAAAAAAAAAA\
BwcHBwcHBwDHBwcHBwcHBwcHBwcHBwcHAAcAAAcHBwcJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQ\
kJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJ\
CQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQ\
kJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJ\
CQkJCQkJCQkJCQkJCQkJCQkJCQkJCQcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwAHAAAHBwcHBwcHBw\
cHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcH\
BwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\
AAAADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\
AAAAAAAAAABKc1ZhbHVlKCkAAADwXRAACAAAAPhdEAABAAAAAEGMvMEACwwAAAAAAAAAAD0AAAAAqa\
MCBG5hbWUBoKMCjQQAQWpzX3N5czo6QXJyYXk6OmdldDo6X193YmdfZ2V0XzU3MjQ1Y2M3ZDdjNzYx\
OWQ6Omg4MmE0ZGFhNDA3NjU3NTUzATp3YXNtX2JpbmRnZW46Ol9fd2JpbmRnZW5fanN2YWxfbG9vc2\
VfZXE6Omg2YjYyNTI1ZWQ0OGRkOTc0ApABanNfc3lzOjpfOjo8aW1wbCB3YXNtX2JpbmRnZW46OmNh\
c3Q6OkpzQ2FzdCBmb3IganNfc3lzOjpVaW50OEFycmF5Pjo6aW5zdGFuY2VvZjo6X193YmdfaW5zdG\
FuY2VvZl9VaW50OEFycmF5Xzk3MWVlZGE2OWViNzUwMDM6OmhmYTA5N2I3YWEzOGUxNjliA5IBanNf\
c3lzOjpfOjo8aW1wbCB3YXNtX2JpbmRnZW46OmNhc3Q6OkpzQ2FzdCBmb3IganNfc3lzOjpBcnJheU\
J1ZmZlcj46Omluc3RhbmNlb2Y6Ol9fd2JnX2luc3RhbmNlb2ZfQXJyYXlCdWZmZXJfZTVlNDhmNDc2\
MmM1NjEwYjo6aDk2ZGViYTA5MmFjN2M5ZGEERmpzX3N5czo6VWludDhBcnJheTo6bmV3OjpfX3diZ1\
9uZXdfOGMzZjAwNTIyNzJhNDU3YTo6aGIzMDI1NzBjYWQ4NTY4ODYFN3dhc21fYmluZGdlbjo6X193\
YmluZGdlbl9ib29sZWFuX2dldDo6aDE2NDhmMWFiNjRjZjk1NTIGNndhc21fYmluZGdlbjo6X193Ym\
luZGdlbl9udW1iZXJfZ2V0OjpoNjMxZTg0MDYzZjBjYjE2Ngc2d2FzbV9iaW5kZ2VuOjpfX3diaW5k\
Z2VuX3N0cmluZ19nZXQ6OmgxZjM1ZDA1ZTIyYjQ5ZDRhCDV3YXNtX2JpbmRnZW46Ol9fd2JpbmRnZW\
5fZXJyb3JfbmV3OjpoZTA3OTNjNTU5MTE4MWE0Ngk2d2FzbV9iaW5kZ2VuOjpfX3diaW5kZ2VuX3N0\
cmluZ19uZXc6OmgxNGU0MmZjOTZkMjFmOTUzCjx3YXNtX2JpbmRnZW46Ol9fd2JpbmRnZW5fb2JqZW\
N0X2Nsb25lX3JlZjo6aDVkOTNkZTUxMDFmZThjYTcLUXNlcmRlX3dhc21fYmluZGdlbjo6T2JqZWN0\
RXh0OjpzZXQ6Ol9fd2JnX3NldF85MTgyNzEyYWJlYmY4MmVmOjpoZmM4MGQ5OTAyZGZhNThmNQxCan\
Nfc3lzOjpPYmplY3Q6Om5ldzo6X193YmdfbmV3XzBiOWJmZGQ5NzU4MzI4NGU6OmhiMzZmYzllZDJm\
MDc0ZDRjDUFqc19zeXM6OkFycmF5OjpuZXc6Ol9fd2JnX25ld18xZDlhOTIwYzZiZmM0NGE4OjpoYz\
E0YTk5MGIzOGE0ZjJmMQ5BanNfc3lzOjpBcnJheTo6c2V0OjpfX3diZ19zZXRfYTY4MjE0ZjM1YzQx\
N2ZhOTo6aGU0MmJhZmJkYzNlYTFhNGUPNndhc21fYmluZGdlbjo6X193YmluZGdlbl9udW1iZXJfbm\
V3OjpoZjE3NjI1ZDU1Y2FiNWU3YxBHanNfc3lzOjpBcnJheTo6bGVuZ3RoOjpfX3diZ19sZW5ndGhf\
NmUzYmJlN2M4YmQ0ZGJkODo6aGUxMTFiYjM5NjM5MjBjYTgRNXdhc21fYmluZGdlbjo6X193YmluZG\
dlbl9pc19iaWdpbnQ6OmhhNzUyNzY0NDZjZGY1OTE2Elhqc19zeXM6Ok51bWJlcjo6aXNfc2FmZV9p\
bnRlZ2VyOjpfX3diZ19pc1NhZmVJbnRlZ2VyX2RmYTA1OTNlOGQ3YWMzNWE6OmhjZjg2YWQ4N2Q4Zj\
E2NzRkEzt3YXNtX2JpbmRnZW46Ol9fd2JpbmRnZW5fYmlnaW50X2Zyb21faTY0OjpoNTZhZWY5MjE4\
N2E1YzIxZhQ1d2FzbV9iaW5kZ2VuOjpfX3diaW5kZ2VuX2lzX29iamVjdDo6aDI1NmMxNTYwZGVkND\
Y2ZjEVTGpzX3N5czo6U3ltYm9sOjppdGVyYXRvcjo6X193YmdfaXRlcmF0b3JfNmY5ZDRmMjg4NDVm\
NDI2Yzo6aDkyNTgwY2M5ZDM0NWQ1MTIWLndhc21fYmluZGdlbjo6X193YmluZGdlbl9pbjo6aGM2Y2\
VmZTJiNjFhMjIyMjkXSmpzX3N5czo6T2JqZWN0OjplbnRyaWVzOjpfX3diZ19lbnRyaWVzXzY1YTc2\
YTQxM2ZjOTEwMzc6OmhjM2VjODkyZjFhYmE2NzQwGDt3YXNtX2JpbmRnZW46Ol9fd2JpbmRnZW5fYm\
lnaW50X2Zyb21fdTY0OjpoMWFhNDU4MmRhNjM2NGIxOBk0d2FzbV9iaW5kZ2VuOjpfX3diaW5kZ2Vu\
X2pzdmFsX2VxOjpoOGY5ZTU3Y2E5ZTc4M2MxNxpTY29uc29sZV9lcnJvcl9wYW5pY19ob29rOjpFcn\
Jvcjo6bmV3OjpfX3diZ19uZXdfYWJkYTc2ZTg4M2JhOGE1Zjo6aDRhNjdmNzI0ZDU4MmNmZGEbV2Nv\
bnNvbGVfZXJyb3JfcGFuaWNfaG9vazo6RXJyb3I6OnN0YWNrOjpfX3diZ19zdGFja182NTgyNzlmZT\
Q0NTQxY2Y2OjpoYWE1NjU3ZmQ3OGQ0YzNmNhxQY29uc29sZV9lcnJvcl9wYW5pY19ob29rOjplcnJv\
cjo6X193YmdfZXJyb3JfZjg1MTY2N2FmNzFiY2ZjNjo6aDBiNzFiMjEyMjU1MDNiYzEdO3dhc21fYm\
luZGdlbjo6X193YmluZGdlbl9vYmplY3RfZHJvcF9yZWY6Omg0Mjg2MmM3OGVkMWI2NjFhHjd3YXNt\
X2JpbmRnZW46Ol9fd2JpbmRnZW5faXNfZnVuY3Rpb246Omg3Zjk4ZjQ5ZGExN2ZlYTNjH0Zqc19zeX\
M6Okl0ZXJhdG9yOjpuZXh0OjpfX3diZ19uZXh0X2FhZWY3YzhhYTVlMjEyYWM6OmgwMzU2MDJhMTk1\
M2VhMmQwIEpqc19zeXM6Okl0ZXJhdG9yTmV4dDo6ZG9uZTo6X193YmdfZG9uZV8xYjczYjA2NzJlMT\
VmMjM0OjpoNTk0MmQwOTY2NDI3NzU1NCFManNfc3lzOjpJdGVyYXRvck5leHQ6OnZhbHVlOjpfX3di\
Z192YWx1ZV8xY2NjMzZiYzAzNDYyZDcxOjpoOWExMzNjNDIzNjU3ZmQyNiJDanNfc3lzOjpSZWZsZW\
N0OjpnZXQ6Ol9fd2JnX2dldF83NjUyMDE1NDRhMmI2ODY5OjpoNjk0YjYyZDgwMjBmY2VlNSNHanNf\
c3lzOjpGdW5jdGlvbjo6Y2FsbDA6Ol9fd2JnX2NhbGxfOTdhZTlkODY0NWRjMzg4Yjo6aDJmYzg2OG\
U1NjAwNjg2NGIkampzX3N5czo6SXRlcmF0b3I6Omxvb2tzX2xpa2VfaXRlcmF0b3I6Ok1heWJlSXRl\
cmF0b3I6Om5leHQ6Ol9fd2JnX25leHRfNTc5ZTU4M2QzMzU2NmE4Njo6aGQ2OTE5M2Q0YzQzMzViOG\
UlSmpzX3N5czo6QXJyYXk6OmlzX2FycmF5OjpfX3diZ19pc0FycmF5XzI3YzQ2YzY3ZjQ5OGUxNWQ6\
Omg0MjhhYWI0OTMwZmNmODNiJkxqc19zeXM6OlVpbnQ4QXJyYXk6Omxlbmd0aDo6X193YmdfbGVuZ3\
RoXzllMWFlMTkwMGNiMGZiZDU6OmgwYWQ1ZTVjYjNhMzE3ZTA3JzJ3YXNtX2JpbmRnZW46Ol9fd2Jp\
bmRnZW5fbWVtb3J5OjpoZTQ4NzUwM2IxZTEyMTk2ZihVanNfc3lzOjpXZWJBc3NlbWJseTo6TWVtb3\
J5OjpidWZmZXI6Ol9fd2JnX2J1ZmZlcl8zZjNkNzY0ZDQ3NDdkNTY0OjpoYzMzZGVhYWZiM2RmZDQ0\
ZilGanNfc3lzOjpVaW50OEFycmF5OjpzZXQ6Ol9fd2JnX3NldF84M2RiOTY5MGY5MzUzZTc5OjpoZT\
FiODBiZmE1N2UzMjMyOCo9d2FzbV9iaW5kZ2VuOjpfX3diaW5kZ2VuX2JpZ2ludF9nZXRfYXNfaTY0\
OjpoYTBiMTkyYmQ3ZGYwNDVlZCs4d2FzbV9iaW5kZ2VuOjpfX3diaW5kZ2VuX2RlYnVnX3N0cmluZz\
o6aGQ5MTQzYTM5YzczZjUzNDEsMXdhc21fYmluZGdlbjo6X193YmluZGdlbl90aHJvdzo6aDAxZDY5\
Mjk2Y2IxM2ZkMjMtRWNvcmU6OmZtdDo6ZmxvYXQ6OmZsb2F0X3RvX2RlY2ltYWxfY29tbW9uX3Nob3\
J0ZXN0OjpoNmU3OGFiNTJhMjc2NWJiOC5CY29yZTo6Zm10OjpmbG9hdDo6ZmxvYXRfdG9fZGVjaW1h\
bF9jb21tb25fZXhhY3Q6OmgwMmRmYjJhODYyNjIxMjllL0lkZW5vX3Rhc2tfc2hlbGw6OnBhcnNlcj\
o6cGFyc2Vfd29yZF9wYXJ0czo6e3tjbG9zdXJlfX06OmgxYjdkZTcyNTUzOWI1OGZkMEBkZW5vX3Rh\
c2tfc2hlbGw6OnBhcnNlcjo6cGFyc2VfcGlwZWxpbmVfaW5uZXI6OmgzZDY2YmFjYjdiNjcyMWE3MT\
pkbG1hbGxvYzo6ZGxtYWxsb2M6OkRsbWFsbG9jPEE+OjptYWxsb2M6OmhmODI3YmQ2MGNkOGFkYTcz\
MjpkZW5vX3Rhc2tfc2hlbGw6OnBhcnNlcjo6cGFyc2Vfc2VxdWVuY2U6Omg0NjQ4M2U3ZjAzY2NlNm\
EwM2U8c2VyZGVfd2FzbV9iaW5kZ2VuOjpkZTo6RGVzZXJpYWxpemVyIGFzIHNlcmRlOjpkZTo6RGVz\
ZXJpYWxpemVyPjo6ZGVzZXJpYWxpemVfYW55OjpoMDUwMGZiYjAwYmRjY2MyZDQ+ZGVub190YXNrX3\
NoZWxsOjpwYXJzZXI6OnBhcnNlX2NvbW1hbmRfYXJnczo6aGE3MDk3MmE3NWJlYjA2NjQ1OmRlbm9f\
dGFza19zaGVsbDo6cGFyc2VyOjpwYXJzZV9yZWRpcmVjdDo6aGE0NGEwYzM3MTFmMjA3YWY2XDxjb3\
JlOjptYXJrZXI6OlBoYW50b21EYXRhPFQ+IGFzIHNlcmRlOjpkZTo6RGVzZXJpYWxpemVTZWVkPjo6\
ZGVzZXJpYWxpemU6OmhkYTJiMGVhZTRiMjc4ZDZmNzJjb3JlOjpzdHI6OjxpbXBsIHN0cj46OmNvbn\
RhaW5zOjpoZmIwYzNhM2I4NDdkYWRjNTgsY29yZTo6Zm10OjpGb3JtYXR0ZXI6OnBhZDo6aDgzZjkz\
M2UwODU2YzBiMjQ5PGNvbnNvbGVfc3RhdGljX3RleHQ6OnJlbmRlcl90ZXh0X3RvX2xpbmVzOjpoOW\
Y5YTgzYmRmNTQ2OTU4NTo/ZGVub190YXNrX3NoZWxsOjpwYXJzZXI6OnBhcnNlX3F1b3RlZF9zdHJp\
bmc6Omg1NzYzN2ViZDhjOWQyMGFmO1Fjb25zb2xlX3N0YXRpY190ZXh0OjpDb25zb2xlU3RhdGljVG\
V4dDo6cmVuZGVyX2l0ZW1zX3dpdGhfc2l6ZTo6aDBhODEyZTgwNTZkZjcyOGQ8QWRlbm9fdGFza19z\
aGVsbDo6cGFyc2VyOjpwYXJzZV9zZXF1ZW50aWFsX2xpc3Q6Omg1MmJmOGZhN2VhMDQ5MWY5PQVwYX\
JzZT5FY29yZTo6Y2hhcjo6bWV0aG9kczo6PGltcGwgY2hhcj46OmVzY2FwZV9kZWJ1Z19leHQ6Omg0\
YTQ3ZDA2NzI3ZjQ4ZDUwPzF2dGU6OlBhcnNlcjxfPjo6cGVyZm9ybV9hY3Rpb246OmhhZWVhMzcyNG\
JiNTkzZWFhQDFjb3JlOjpzdHI6OnNsaWNlX2Vycm9yX2ZhaWxfcnQ6Omg2M2VlNjdhMmY2ZTc0MDg2\
QTpkZW5vX3Rhc2tfc2hlbGw6OnBhcnNlcjo6cGFyc2VfZW52X3ZhcnM6OmgzMTQ5YjU1ZTliY2NkOG\
Q0QkU8c2VyZGU6OmRlOjpVbmV4cGVjdGVkIGFzIGNvcmU6OmZtdDo6RGlzcGxheT46OmZtdDo6aGRk\
ZDc5ZjZkOThjMjY1OTBDOGNvcmU6Om51bTo6YmlnbnVtOjpCaWczMng0MDo6bXVsX3BvdzI6OmgxZj\
hlZjExNmNiYjg5MWNiRCltb25jaDo6b3I6Ont7Y2xvc3VyZX19OjpoNGQ0MjhlM2YxY2JhYzk1ZUVA\
aGFzaGJyb3duOjpyYXc6OlJhd1RhYmxlPFQsQT46OnJlc2VydmVfcmVoYXNoOjpoZjE4ZTEzMTc2Zm\
ZiYzk1MkZJY29uc29sZV9zdGF0aWNfdGV4dDo6Q29uc29sZVN0YXRpY1RleHQ6OmdldF9sYXN0X2xp\
bmVzOjpoYTdlMGZjMjgzNTE0OWI0N0cxPHN0ciBhcyBjb3JlOjpmbXQ6OkRlYnVnPjo6Zm10OjpoNm\
FmYjE3OGQ1MjAzYzEzNEhCY29yZTo6bnVtOjpmbHQyZGVjOjpzdHJhdGVneTo6ZHJhZ29uOjptdWxf\
cG93MTA6Omg0NzhkNmUwOTBjOGQ5YzZkSQ5fX3J1c3RfcmVhbGxvY0o2ZGVub190YXNrX3NoZWxsOj\
pwYXJzZXI6OnBhcnNlX3dvcmQ6OmhiN2FlMjY3OGE4ODJkOWY4S248c2VyZGVfd2FzbV9iaW5kZ2Vu\
OjpzZXI6Ok9iamVjdFNlcmlhbGl6ZXIgYXMgc2VyZGU6OnNlcjo6U2VyaWFsaXplU3RydWN0Pjo6c2\
VyaWFsaXplX2ZpZWxkOjpoZTdkNzhmMTliZjhhNDc3ZEw4ZGxtYWxsb2M6OmRsbWFsbG9jOjpEbG1h\
bGxvYzxBPjo6ZnJlZTo6aDRhNjAwOWJmY2Y3NjBlODFNMmNvbXBpbGVyX2J1aWx0aW5zOjptZW06Om\
1lbW1vdmU6OmhmZDIzOWQ5NGU0NWI5M2I0Tjpjb3JlOjpudW06OmJpZ251bTo6QmlnMzJ4NDA6Om11\
bF9kaWdpdHM6Omg5MmZkZDlmOGMzNDdkN2RhTzFzZXJkZV93YXNtX2JpbmRnZW46OmZyb21fdmFsdW\
U6OmhiMTRjZWNhMTgxZWFmYmViUFc8c2VyZGU6OmRlOjppbXBsczo6U3RyaW5nVmlzaXRvciBhcyBz\
ZXJkZTo6ZGU6OlZpc2l0b3I+Ojp2aXNpdF9ieXRlczo6aGI2Y2M0MzJjNWE3ZWFlNGRRPWNvbnNvbG\
Vfc3RhdGljX3RleHQ6OnJhd19yZW5kZXJfbGFzdF9pdGVtczo6aDYwOTM5NGY1Yzc2MGYzYTdSbjxz\
ZXJkZV93YXNtX2JpbmRnZW46OnNlcjo6T2JqZWN0U2VyaWFsaXplciBhcyBzZXJkZTo6c2VyOjpTZX\
JpYWxpemVTdHJ1Y3Q+OjpzZXJpYWxpemVfZmllbGQ6Omg1YjVlN2IwNmQyODJhMTBhUxdzdGF0aWNf\
dGV4dF9yZW5kZXJfb25jZVQ+Y29yZTo6Zm10OjpGb3JtYXR0ZXI6OndyaXRlX2Zvcm1hdHRlZF9wYX\
J0czo6aGNkMmE0OWRkYTY5M2I1YTRVbjxzZXJkZV93YXNtX2JpbmRnZW46OnNlcjo6T2JqZWN0U2Vy\
aWFsaXplciBhcyBzZXJkZTo6c2VyOjpTZXJpYWxpemVTdHJ1Y3Q+OjpzZXJpYWxpemVfZmllbGQ6Om\
hmZjQzYjUyODgwOWRhNDMzViNjb3JlOjpmbXQ6OndyaXRlOjpoNzFmYWEyNTE5Y2JiOTg3NVcXc3Rh\
dGljX3RleHRfcmVuZGVyX3RleHRYTDxhbnlob3c6OmZtdDo6SW5kZW50ZWQ8VD4gYXMgY29yZTo6Zm\
10OjpXcml0ZT46OndyaXRlX3N0cjo6aGFiNGNhOWFlNjIxMzNhODlZNWNvcmU6OmZtdDo6Rm9ybWF0\
dGVyOjpwYWRfaW50ZWdyYWw6Omg1OTBjNTRmZmUyYzNhYTUyWkFkbG1hbGxvYzo6ZGxtYWxsb2M6Ok\
RsbWFsbG9jPEE+OjpkaXNwb3NlX2NodW5rOjpoYzExOTVlNmNiZmNlMDBmNVtTPGNvcmU6OmZtdDo6\
YnVpbGRlcnM6OlBhZEFkYXB0ZXIgYXMgY29yZTo6Zm10OjpXcml0ZT46OndyaXRlX3N0cjo6aDBmMj\
Y1Y2I4MDc2ZTVkNWRcPGNvcmU6OmZtdDo6Rm9ybWF0dGVyOjpwYWRfZm9ybWF0dGVkX3BhcnRzOjpo\
YzJiMDc3NTI5Zjc0ZDE5ZV0vdnRlOjpQYXJzZXI8Xz46OnByb2Nlc3NfdXRmODo6aDZlNjZmNzc1NW\
M2NDI4MDZeMWNvbnNvbGVfZXJyb3JfcGFuaWNfaG9vazo6aG9vazo6aGRjNGM1OGUzMjk0ZjI1NGFf\
QmRlbm9fdGFza19zaGVsbDo6cGFyc2VyOjpwYXJzZV9waXBlX3NlcXVlbmNlX29wOjpoZmFlZmQzY2\
I2MTNhZmUxYmBGYW55aG93OjpmbXQ6OjxpbXBsIGFueWhvdzo6ZXJyb3I6OkVycm9ySW1wbD46OmRl\
YnVnOjpoOTg5Yzk4NDkzZDFjY2FiYmE2Y29uc29sZV9zdGF0aWNfdGV4dDo6YW5zaTo6dG9rZW5pem\
U6Omg2YjczZWFhMzY0NDBkZWRmYjltb25jaDo6d2l0aF9mYWlsdXJlX2lucHV0Ojp7e2Nsb3N1cmV9\
fTo6aDIyOTQ2NWIwNjRkZThlMTVjN21vbmNoOjpQYXJzZUVycm9yRmFpbHVyZTo6aW50b19lcnJvcj\
o6aDY4ZDMwMTljMjcyN2M1ZDlkJG1vbmNoOjp3aGl0ZXNwYWNlOjpoMjI3MmJhYjBjMzYwYmE5YmVe\
PGNvcmU6OnN0cjo6aXRlcjo6U3BsaXQ8UD4gYXMgY29yZTo6aXRlcjo6dHJhaXRzOjppdGVyYXRvcj\
o6SXRlcmF0b3I+OjpuZXh0OjpoOThkZmIwY2FlNTlmNzMwZmZuPHNlcmRlX3dhc21fYmluZGdlbjo6\
c2VyOjpPYmplY3RTZXJpYWxpemVyIGFzIHNlcmRlOjpzZXI6OlNlcmlhbGl6ZVN0cnVjdD46OnNlcm\
lhbGl6ZV9maWVsZDo6aGEwOWJmNWVmODVkYjVlYzdnN3NlcmRlX3dhc21fYmluZGdlbjo6c3RhdGlj\
X3N0cl90b19qczo6aDNkYTE4NzQxZTBkZGRiMThoO2NvcmU6OnN0cjo6cGF0dGVybjo6VHdvV2F5U2\
VhcmNoZXI6Om5leHQ6OmgxNWY2OTc3NzIzMTY2OTU2aUZzZXJkZV93YXNtX2JpbmRnZW46OmRlOjpE\
ZXNlcmlhbGl6ZXI6OmludmFsaWRfdHlwZV86OmgyMDdkMDRhZmU4MzBiMjNiakFkZW5vX3Rhc2tfc2\
hlbGw6OnBhcnNlcjo6cGFyc2VfYm9vbGVhbl9saXN0X29wOjpoZmM0MzQyNGVmY2NmZjMwOWtSYW55\
aG93OjplcnJvcjo6PGltcGwgY29yZTo6Zm10OjpEaXNwbGF5IGZvciBhbnlob3c6OkVycm9yPjo6Zm\
10OjpoZTYyMWYwNGFmOTdjOWEzMmw1b25jZV9jZWxsOjppbXA6OmluaXRpYWxpemVfb3Jfd2FpdDo6\
aDBmZTk1YmIwMGE2ZTBlMmVtM2FsbG9jOjpmbXQ6OmZvcm1hdDo6Zm9ybWF0X2lubmVyOjpoYzk0NG\
FlOGJjYmEyYWI1OW48ZGxtYWxsb2M6OmRsbWFsbG9jOjpEbG1hbGxvYzxBPjo6bWVtYWxpZ246Omhh\
ZjQ1Zjk5MmIzMWVmNzZib1hjb3JlOjpudW06OmZsdDJkZWM6OnN0cmF0ZWd5OjpncmlzdTo6Zm9ybW\
F0X2V4YWN0X29wdDo6cG9zc2libHlfcm91bmQ6OmhiMDlmZDU3MDg2ODg2MmQxcDhjb3JlOjpudW06\
OmZsdDJkZWM6OmRpZ2l0c190b19kZWNfc3RyOjpoMjA0NWFkN2RhOGY5ZDBlZHEqbW9uY2g6Om1hcD\
o6e3tjbG9zdXJlfX06OmhjZTVlYjM1OTU2ZWQ3ZWNhcllzZXJkZTo6X19wcml2YXRlOjpkZTo6Y29u\
dGVudDo6Q29udGVudFJlZkRlc2VyaWFsaXplcjxFPjo6aW52YWxpZF90eXBlOjpoMzdmMzYzODE3Mj\
UyNzAzZHM9Y29uc29sZV9zdGF0aWNfdGV4dDo6dHJ1bmNhdGVfbGluZXNfaGVpZ2h0OjpoYzFjYmQ2\
OTUzZjViNWMzZnQ6Y29yZTo6Zm10OjpidWlsZGVyczo6RGVidWdTdHJ1Y3Q6OmZpZWxkOjpoODczZW\
RmNWZiMWNkMThiMnUyY29yZTo6dW5pY29kZTo6cHJpbnRhYmxlOjpjaGVjazo6aGQyODkwMmJmNDIz\
MzFkYjF2OzwmbXV0IFcgYXMgY29yZTo6Zm10OjpXcml0ZT46OndyaXRlX2NoYXI6Omg1YjM5MGNmZD\
RkN2E5ZDdidzs8Jm11dCBXIGFzIGNvcmU6OmZtdDo6V3JpdGU+Ojp3cml0ZV9jaGFyOjpoMTViZmMx\
MWY2YTU2MGZjZHgxY29tcGlsZXJfYnVpbHRpbnM6Om1lbTo6bWVtY3B5OjpoMGNmNDc0OTU5MDFkMD\
Y4NHk2Y29yZTo6c2xpY2U6Om1lbWNocjo6bWVtY2hyX2FsaWduZWQ6OmhkZjJlNDBmYzFjYzA3MjZi\
ei9jb3JlOjpmbXQ6Om51bTo6aW1wOjpmbXRfdTY0OjpoZTVmN2NmNWU5ZTAyZGE0MHs+Y29uc29sZV\
9zdGF0aWNfdGV4dDo6YW5zaTo6c3RyaXBfYW5zaV9jb2Rlczo6aGIyNmE5ZWY5NWI1Y2YwZTJ8FnN0\
YXRpY190ZXh0X2NsZWFyX3RleHR9ZHNlcmRlOjpzZXI6OmltcGxzOjo8aW1wbCBzZXJkZTo6c2VyOj\
pTZXJpYWxpemUgZm9yIGFsbG9jOjp2ZWM6OlZlYzxUPj46OnNlcmlhbGl6ZTo6aDM0NjcxMjQxMjRi\
MGU3YjJ+MDwmVCBhcyBjb3JlOjpmbXQ6OkRlYnVnPjo6Zm10OjpoMDBlNjNiNjIyYzM3NjlhYn8wY2\
9yZTo6b3BzOjpmdW5jdGlvbjo6Rm46OmNhbGw6OmhjMDBlZGUyMjE2NzE5ODBlgAEyPGNoYXIgYXMg\
Y29yZTo6Zm10OjpEZWJ1Zz46OmZtdDo6aDA4MDc0NDVjNWRmZWZkZWGBAUZkbG1hbGxvYzo6ZGxtYW\
xsb2M6OkRsbWFsbG9jPEE+Ojp1bmxpbmtfbGFyZ2VfY2h1bms6OmgxYjg3OTllNDEzMTI3NGU3ggE3\
Y29yZTo6cGFuaWNraW5nOjphc3NlcnRfZmFpbGVkX2lubmVyOjpoZWY4YWE5MTQwZWQzYjE1Y4MBMD\
wmVCBhcyBjb3JlOjpmbXQ6OkRlYnVnPjo6Zm10OjpoMjAyMmM5NTgxYTBmMjFiZYQBRmRsbWFsbG9j\
OjpkbG1hbGxvYzo6RGxtYWxsb2M8QT46Omluc2VydF9sYXJnZV9jaHVuazo6aDZkZjg3ODczZGJiYT\
Q2NDaFAekBY29yZTo6cHRyOjpkcm9wX2luX3BsYWNlPGNvcmU6Om9wdGlvbjo6T3B0aW9uPGNvcmU6\
OmNlbGw6OlJlZkNlbGw8c3RkOjpjb2xsZWN0aW9uczo6aGFzaDo6bWFwOjpIYXNoTWFwPCpjb25zdC\
BzdHIsanNfc3lzOjpKc1N0cmluZyxjb3JlOjpoYXNoOjpCdWlsZEhhc2hlckRlZmF1bHQ8c2VyZGVf\
d2FzbV9iaW5kZ2VuOjpzdGF0aWNfc3RyX3RvX2pzOjpQdHJIYXNoZXI+Pj4+Pjo6aGJlZmEyNGY1MG\
YxNzZiYTaGAUdjb3JlOjpmbXQ6Om51bTo6PGltcGwgY29yZTo6Zm10OjpEZWJ1ZyBmb3IgdTMyPjo6\
Zm10OjpoNDRlZmU5OTJhYzZhYmE4Y4cBNDxjaGFyIGFzIGNvcmU6OmZtdDo6RGlzcGxheT46OmZtdD\
o6aDYxNDlmOGIxODUxZGMwMzOIAU08YWxsb2M6OnN0cmluZzo6U3RyaW5nIGFzIGNvcmU6OmZtdDo6\
V3JpdGU+Ojp3cml0ZV9jaGFyOjpoODIzMThkOThhZjhhNTcyMS40NokBKm1vbmNoOjptYXA6Ont7Y2\
xvc3VyZX19OjpoNDZlNDljMDc1ZDY4NmE0NooBR3NlcmRlX3dhc21fYmluZGdlbjo6c3RhdGljX3N0\
cl90b19qczo6Q0FDSEU6Ol9fZ2V0aXQ6Omg1YjJlYWZhMGQ3OTc1YzRmiwE+ZGVub190YXNrX3NoZW\
xsOjpwYXJzZXI6OnBhcnNlX2Vudl92YXJfbmFtZTo6aGQxOWY3NGVjNTM1MGNlMjOMAUJjb3JlOjpm\
bXQ6OkZvcm1hdHRlcjo6ZGVidWdfdHVwbGVfZmllbGQxX2ZpbmlzaDo6aDQ3ZGI3ZmI2NTRjZjdmZD\
mNATs8Jm11dCBXIGFzIGNvcmU6OmZtdDo6V3JpdGU+Ojp3cml0ZV9jaGFyOjpoNzUwM2NmMmU0MzNm\
MjViMI4BOzwmbXV0IFcgYXMgY29yZTo6Zm10OjpXcml0ZT46OndyaXRlX2NoYXI6OmgzNzIzODI3OG\
EyZDI1NDVmjwEvY29yZTo6Zm10OjpXcml0ZTo6d3JpdGVfY2hhcjo6aDE5OGY1MTg3NjY3N2I5ZDOQ\
ASptb25jaDo6bWFwOjp7e2Nsb3N1cmV9fTo6aDQ4NWI4NjJjYjU1NTA3ZjeRAWg8c3RkOjpwYW5pY2\
tpbmc6OmJlZ2luX3BhbmljX2hhbmRsZXI6OlBhbmljUGF5bG9hZCBhcyBjb3JlOjpwYW5pYzo6Qm94\
TWVVcD46OnRha2VfYm94OjpoMzQ5MWU3MGMwZjA2MDI3MpIBMGFsbG9jOjp2ZWM6OlZlYzxULEE+Oj\
pyZXNlcnZlOjpoN2RiOWYzZTljYjFlOGM1MJMBLmFsbG9jOjpyYXdfdmVjOjpmaW5pc2hfZ3Jvdzo6\
aDZmYzBhY2JhZDMxYzdjOGSUAS5hbGxvYzo6cmF3X3ZlYzo6ZmluaXNoX2dyb3c6OmgzNzJmNDExOW\
UwZjhjNTM3lQE3Y29yZTo6Y2hhcjo6bWV0aG9kczo6ZW5jb2RlX3V0ZjhfcmF3OjpoY2E2NTg3MTZl\
MzhhYzMwOZYBOmNvcmU6OnN0cjo6dmFsaWRhdGlvbnM6Om5leHRfY29kZV9wb2ludDo6aDMyODc3Nj\
NjNTVkNzM4MGGXATp1bmljb2RlX3dpZHRoOjp0YWJsZXM6OmNoYXJ3aWR0aDo6d2lkdGg6OmhhYTBm\
ODA4NTVmY2E5ZGFkmAE+YWxsb2M6OnJhd192ZWM6OlJhd1ZlYzxULEE+Ojpncm93X2Ftb3J0aXplZD\
o6aDQ2ZmVlMTE5ZmJjY2FiMDWZAT9zdGQ6OnN5c19jb21tb246OnRocmVhZF9pbmZvOjpjdXJyZW50\
X3RocmVhZDo6aDhhYTEyM2U4ZmJjMjdkNTeaASNqc19zeXM6OnRyeV9pdGVyOjpoYmI3MTRhYWJjMD\
JlNWVjZZsBQGFsbG9jOjpyYXdfdmVjOjpSYXdWZWM8VCxBPjo6cmVzZXJ2ZV9mb3JfcHVzaDo6aDQ0\
NWU2N2UzZDVkYTFhMTicAUBhbGxvYzo6cmF3X3ZlYzo6UmF3VmVjPFQsQT46OnJlc2VydmVfZm9yX3\
B1c2g6Omg3NGIyNDQwNGZkNWRmNmQ0nQFAYWxsb2M6OnJhd192ZWM6OlJhd1ZlYzxULEE+OjpyZXNl\
cnZlX2Zvcl9wdXNoOjpoYWQxM2IyMTAxNTE5YjMyNZ4BQGFsbG9jOjpyYXdfdmVjOjpSYXdWZWM8VC\
xBPjo6cmVzZXJ2ZV9mb3JfcHVzaDo6aDRmNGI5ZmM2ZmMxN2NmY2KfAUBhbGxvYzo6cmF3X3ZlYzo6\
UmF3VmVjPFQsQT46OnJlc2VydmVfZm9yX3B1c2g6OmgyMDkzYjliYTNjZWQ2NWQ3oAFAYWxsb2M6On\
Jhd192ZWM6OlJhd1ZlYzxULEE+OjpyZXNlcnZlX2Zvcl9wdXNoOjpoODkwNjllNjQ3Y2FhNTNiZKEB\
QGFsbG9jOjpyYXdfdmVjOjpSYXdWZWM8VCxBPjo6cmVzZXJ2ZV9mb3JfcHVzaDo6aDUzMjg4MDViOD\
g1MzJkOGGiAUs8bW9uY2g6OlBhcnNlRXJyb3JGYWlsdXJlRXJyb3IgYXMgY29yZTo6Zm10OjpEZWJ1\
Zz46OmZtdDo6aGRmMjU3ZTc1YzhiOTc0M2OjAW48c2VyZGVfd2FzbV9iaW5kZ2VuOjpzZXI6Ok9iam\
VjdFNlcmlhbGl6ZXIgYXMgc2VyZGU6OnNlcjo6U2VyaWFsaXplU3RydWN0Pjo6c2VyaWFsaXplX2Zp\
ZWxkOjpoOWNhZTZkZjVjOWI1ZTRkY6QBPmFsbG9jOjpyYXdfdmVjOjpSYXdWZWM8VCxBPjo6Z3Jvd1\
9hbW9ydGl6ZWQ6OmgwNzU0NzEwNDhmYTNkYjhmpQE+YWxsb2M6OnJhd192ZWM6OlJhd1ZlYzxULEE+\
Ojpncm93X2Ftb3J0aXplZDo6aDIzOTllMjc3MWE0MDk0NGGmAU5hbGxvYzo6cmF3X3ZlYzo6UmF3Vm\
VjPFQsQT46OnJlc2VydmU6OmRvX3Jlc2VydmVfYW5kX2hhbmRsZTo6aDA4ODA0MjU3YWU5NWI5NzSn\
AS5tb25jaDo6aWZfdHJ1ZTo6e3tjbG9zdXJlfX06Omg4ZTQ1M2VkYjBiNmJjODQwqAFAYWxsb2M6On\
Jhd192ZWM6OlJhd1ZlYzxULEE+OjpyZXNlcnZlX2Zvcl9wdXNoOjpoMWIxZTYyYzcyOTMyMDcyYakB\
bjxjb3JlOjppdGVyOjphZGFwdGVyczo6ZmxhdHRlbjo6RmxhdHRlbjxJPiBhcyBjb3JlOjppdGVyOj\
p0cmFpdHM6Oml0ZXJhdG9yOjpJdGVyYXRvcj46Om5leHQ6OmhmYTkyZmFlOTVkY2YyN2RkqgE3c3Rk\
OjpwYW5pY2tpbmc6OnJ1c3RfcGFuaWNfd2l0aF9ob29rOjpoM2FhMDU0ZDM1YTA4MTdkN6sBMGNvcm\
U6Om9wczo6ZnVuY3Rpb246OkZuOjpjYWxsOjpoY2Q2OTMwZWRjOGNkYjA2MqwBMWNvbXBpbGVyX2J1\
aWx0aW5zOjptZW06Om1lbXNldDo6aDNlZjQyM2I5MmRjZmRmYjetAS5hbGxvYzo6cmF3X3ZlYzo6Zm\
luaXNoX2dyb3c6OmgwOGMxM2Q0YjFkNWY5ZGY4rgFNPG1vbmNoOjpQYXJzZUVycm9yRmFpbHVyZUVy\
cm9yIGFzIGNvcmU6OmZtdDo6RGlzcGxheT46OmZtdDo6aDg3NjE3YmVhMDU1MGEzOGSvARBzdHJpcF\
9hbnNpX2NvZGVzsAFRPHNlcmRlX3dhc21fYmluZGdlbjo6ZXJyb3I6OkVycm9yIGFzIHNlcmRlOjpk\
ZTo6RXJyb3I+OjpjdXN0b206OmhmNjZlZjQxMDFlZmI0NjA4sQExYWxsb2M6OnN0cjo6PGltcGwgc3\
RyPjo6cmVwZWF0OjpoNjI3ZGY3MWUxNzcxZjZjNLIBP3dhc21fYmluZGdlbjo6Y29udmVydDo6Y2xv\
c3VyZXM6Omludm9rZTNfbXV0OjpoZDdhMTc3MGU5ODU1NWU1YbMBOWFsbG9jOjp2ZWM6OlZlYzxULE\
E+OjpleHRlbmRfZGVzdWdhcmVkOjpoODMxNWQ0ODVkZDdjNjJmZLQBR29uY2VfY2VsbDo6aW1wOjpP\
bmNlQ2VsbDxUPjo6aW5pdGlhbGl6ZTo6e3tjbG9zdXJlfX06Omg1MmI1ODBkODNlYmRkOWQ3tQEjbW\
9uY2g6Om5leHRfY2hhcjo6aGVhMmE1ZTExZWQ0OTQ0YjW2AUNjb3JlOjppdGVyOjphZGFwdGVyczo6\
ZmxhdHRlbjo6YW5kX3RoZW5fb3JfY2xlYXI6OmgxMjFmOGFmNmQ5OGEzNWQxtwEpbW9uY2g6OnNraX\
Bfd2hpdGVzcGFjZTo6aGM3YzE3ZDJiZWMxMzdiNjK4AUNzdGQ6OnBhbmlja2luZzo6YmVnaW5fcGFu\
aWNfaGFuZGxlcjo6e3tjbG9zdXJlfX06OmgyZjczZTRjZjZjZDYzMTlhuQGWATxyc19saWI6Ol86Oj\
xpbXBsIHNlcmRlOjpkZTo6RGVzZXJpYWxpemUgZm9yIHJzX2xpYjo6V2FzbVRleHRJdGVtPjo6ZGVz\
ZXJpYWxpemU6Ol9fRmllbGRWaXNpdG9yIGFzIHNlcmRlOjpkZTo6VmlzaXRvcj46OnZpc2l0X2J5dG\
VzOjpoMzhhNDgyNGQ5N2FjYTViZroBQzx3YXNtX2JpbmRnZW46OkpzVmFsdWUgYXMgY29yZTo6Zm10\
OjpEZWJ1Zz46OmZtdDo6aGJkMzljMDU4MTc5N2I4ODa7AVU8anNfc3lzOjpJbnRvSXRlciBhcyBjb3\
JlOjppdGVyOjp0cmFpdHM6Oml0ZXJhdG9yOjpJdGVyYXRvcj46Om5leHQ6OmgxMTZiZDM5ZTkzZTRl\
ZjZlvAFpc2VyZGU6OmRlOjppbXBsczo6PGltcGwgc2VyZGU6OmRlOjpEZXNlcmlhbGl6ZSBmb3IgYW\
xsb2M6OnN0cmluZzo6U3RyaW5nPjo6ZGVzZXJpYWxpemU6OmgxZDYxNzY5YjUyNWVjZGM1vQEwY29y\
ZTo6b3BzOjpmdW5jdGlvbjo6Rm46OmNhbGw6OmhlMzAwZDdmMjQxZDY3Yjk2vgFjPHN0ZDo6cGFuaW\
NraW5nOjpiZWdpbl9wYW5pY19oYW5kbGVyOjpQYW5pY1BheWxvYWQgYXMgY29yZTo6cGFuaWM6OkJv\
eE1lVXA+OjpnZXQ6Omg1M2UzZDk4YzUzMTk3Yjk2vwElYWxsb2M6OmZtdDo6Zm9ybWF0OjpoNDIxNj\
gxNmM1YTExNWM1M8ABQXNlcmRlX3dhc21fYmluZGdlbjo6ZGU6OkRlc2VyaWFsaXplcjo6YXNfYnl0\
ZXM6OmgxMDQ1OTY5NDlmZmQwODg5wQEoYWxsb2M6OmZtdDo6Zm9ybWF0OjpoNDIxNjgxNmM1YTExNW\
M1My42NsIBZ2FueWhvdzo6Y2hhaW46OjxpbXBsIGNvcmU6Oml0ZXI6OnRyYWl0czo6aXRlcmF0b3I6\
Okl0ZXJhdG9yIGZvciBhbnlob3c6OkNoYWluPjo6bmV4dDo6aGMzZGI5NDJlNzU1MTE1ZTDDAVZjb3\
JlOjpzdHI6OnRyYWl0czo6PGltcGwgY29yZTo6b3BzOjppbmRleDo6SW5kZXg8ST4gZm9yIHN0cj46\
OmluZGV4OjpoYmI4MzhkYjljNGRhMjBjZcQBMG1vbmNoOjpQYXJzZUVycm9yRmFpbHVyZTo6bmV3Oj\
poYWU0YTNjNmRjZWM0NDdjNsUBczxjb3JlOjppdGVyOjphZGFwdGVyczo6ZmxhdHRlbjo6RmxhdHRl\
bjxJPiBhcyBjb3JlOjppdGVyOjp0cmFpdHM6Oml0ZXJhdG9yOjpJdGVyYXRvcj46OnNpemVfaGludD\
o6aGQ0OWRhY2UwNjlkYThiMjHGAURoYXNoYnJvd246OnJhdzo6VGFibGVMYXlvdXQ6OmNhbGN1bGF0\
ZV9sYXlvdXRfZm9yOjpoZWE5NDU5MzE4NDA4OWI5YccBMmNvcmU6OmZtdDo6QXJndW1lbnRzOjpuZX\
dfdjE6OmhkNTVkZWY0NjRmOGQyMWU3Ljc5yAEzY29yZTo6Zm10OjpBcmd1bWVudHM6Om5ld192MTo6\
aGQ1NWRlZjQ2NGY4ZDIxZTcuMzI0yQFhPGNvcmU6OnN0cjo6aXRlcjo6Q2hhckluZGljZXMgYXMgY2\
9yZTo6aXRlcjo6dHJhaXRzOjppdGVyYXRvcjo6SXRlcmF0b3I+OjpuZXh0OjpoZjMzZmZkZmI1YzFk\
OWEzN8oBSjxhbGxvYzo6c3RyaW5nOjpTdHJpbmcgYXMgY29yZTo6Zm10OjpXcml0ZT46OndyaXRlX2\
NoYXI6Omg4MjMxOGQ5OGFmOGE1NzIxywFFaGFzaGJyb3duOjpyYXc6OlJhd1RhYmxlSW5uZXI8QT46\
OmZpbmRfaW5zZXJ0X3Nsb3Q6OmhiMTNlNjA5Yjk4ODg5Y2IyzAEzc3RkOjpzeW5jOjptdXRleDo6TX\
V0ZXg8VD46OmxvY2s6OmhlOTk4Mzg0Y2VmNzEwMTg5zQExYWxsb2M6OnN0cmluZzo6U3RyaW5nOjpw\
dXNoOjpoYTY1YzIyOTQxNWFmZjEyNC42NM4BMXNlcmRlOjpkZTo6RXJyb3I6OmludmFsaWRfdHlwZT\
o6aDQyN2E3ZTE4NjljZWQ3MmXPATJzZXJkZTo6ZGU6OkVycm9yOjppbnZhbGlkX3ZhbHVlOjpoZjll\
ZTlmOTI1MGJjMGE2Y9ABKm1vbmNoOjp0YWc6Ont7Y2xvc3VyZX19OjpoZDg4YTBjNDY5Y2JlMjExY9\
EBLWFsbG9jOjp2ZWM6OlZlYzxULEE+OjpwdXNoOjpoZDdlNDQwYzQ1MDQ5ODhlONIBPmFsbG9jOjp2\
ZWM6OlZlYzxULEE+OjpyZW1vdmU6OmFzc2VydF9mYWlsZWQ6Omg0MjVhZDczNDlkODgxZjMz0wEsdn\
RlOjpwYXJhbXM6OlBhcmFtczo6cHVzaDo6aDdiMjgyMTlkZTdiM2E5MGLUAUNjb3JlOjp1bmljb2Rl\
Ojp1bmljb2RlX2RhdGE6OndoaXRlX3NwYWNlOjpsb29rdXA6OmgzODZjZTAxMjE3NDllYzg01QE4ZG\
Vub190YXNrX3NoZWxsOjpwYXJzZXI6OnBhcnNlX29wX3N0cjo6aDU1NDdmNzI1NjNhYzQ0M2PWAS5j\
b3JlOjpyZXN1bHQ6OnVud3JhcF9mYWlsZWQ6Omg4YjNkYjBmMTExNzFiNTdi1wE5YWxsb2M6OnZlYz\
o6VmVjPFQsQT46OmludG9fYm94ZWRfc2xpY2U6OmgyZmJhNmExOTczNzZmZmY42AEwbW9uY2g6OlBh\
cnNlRXJyb3JGYWlsdXJlOjpuZXc6Omg1MjFjM2E5ODNlMGM1ZDM52QF8PGFsbG9jOjp2ZWM6OlZlYz\
xULEE+IGFzIGFsbG9jOjp2ZWM6OnNwZWNfZXh0ZW5kOjpTcGVjRXh0ZW5kPCZULGNvcmU6OnNsaWNl\
OjppdGVyOjpJdGVyPFQ+Pj46OnNwZWNfZXh0ZW5kOjpoYmYzOTM1NGZlMzQzMWRkMtoBfDxhbGxvYz\
o6dmVjOjpWZWM8VCxBPiBhcyBhbGxvYzo6dmVjOjpzcGVjX2V4dGVuZDo6U3BlY0V4dGVuZDwmVCxj\
b3JlOjpzbGljZTo6aXRlcjo6SXRlcjxUPj4+OjpzcGVjX2V4dGVuZDo6aGVkODdkYzU0NmJiOTA0OT\
XbATFjb25zb2xlX3N0YXRpY190ZXh0OjpMaW5lOjpuZXc6OmhiYWMxNTIwNmYyZWEyODRl3AFbPGFs\
bG9jOjp2ZWM6OlZlYzxULEE+IGFzIGNvcmU6Oml0ZXI6OnRyYWl0czo6Y29sbGVjdDo6RXh0ZW5kPF\
Q+Pjo6ZXh0ZW5kOjpoYzU3OTUwZmFiYjNhYjA4MN0BSjxjb3JlOjpvcHM6OnJhbmdlOjpSYW5nZTxJ\
ZHg+IGFzIGNvcmU6OmZtdDo6RGVidWc+OjpmbXQ6OmhjMTc2ZjkyMzliMzVhMzJm3gEmbW9uY2g6Om\
lzX2JhY2t0cmFjZTo6aGViMGNhMDA4NjdkY2I3NmLfAUs8YWxsb2M6OmFsbG9jOjpHbG9iYWwgYXMg\
Y29yZTo6YWxsb2M6OkFsbG9jYXRvcj46OnNocmluazo6aGFhYTM4YjFjZGQ5N2ZjZGTgAS1qc19zeX\
M6OlVpbnQ4QXJyYXk6OnRvX3ZlYzo6aDU4MTRmZWFkZDFkMjc5YWbhAWs8c2VyZGU6Ol9fcHJpdmF0\
ZTo6c2VyOjpUYWdnZWRTZXJpYWxpemVyPFM+IGFzIHNlcmRlOjpzZXI6OlNlcmlhbGl6ZXI+OjpzZX\
JpYWxpemVfc3RydWN0OjpoYmU2NGJkMjg1ODQyYmJjNuIBOmFsbG9jOjp2ZWM6OlZlYzxULEE+Ojpl\
eHRlbmRfZnJvbV9zbGljZTo6aDg4ZjE2MDEwMjQzNmFjMTXjAXxjb3JlOjpzdHI6OnRyYWl0czo6PG\
ltcGwgY29yZTo6c2xpY2U6OmluZGV4OjpTbGljZUluZGV4PHN0cj4gZm9yIGNvcmU6Om9wczo6cmFu\
Z2U6OlJhbmdlRnJvbTx1c2l6ZT4+OjpnZXQ6OmhiNTVjNDZhODlkOTI2NDEx5AGCAWRlbm9fdGFza1\
9zaGVsbDo6cGFyc2VyOjpfOjo8aW1wbCBzZXJkZTo6c2VyOjpTZXJpYWxpemUgZm9yIGRlbm9fdGFz\
a19zaGVsbDo6cGFyc2VyOjpTZXF1ZW50aWFsTGlzdD46OnNlcmlhbGl6ZTo6aGIzY2VjOWMwM2I1Nm\
Q3ZGLlATRzZXJkZTo6ZGU6OkVycm9yOjpkdXBsaWNhdGVfZmllbGQ6Omg4Y2JiYWZmZjUwZDM0OTFh\
5gEyc2VyZGU6OmRlOjpFcnJvcjo6bWlzc2luZ19maWVsZDo6aGE4MzJiNmJkNTE0YzI2M2bnAVNjb3\
JlOjpwdHI6OmRyb3BfaW5fcGxhY2U8c2VyZGU6Ol9fcHJpdmF0ZTo6ZGU6OmNvbnRlbnQ6OkNvbnRl\
bnQ+OjpoOTQ0MjkxYjY2YjUyNjA1ZegBNGNvcmU6OnJlc3VsdDo6UmVzdWx0PFQsRT46OnVud3JhcD\
o6aDQxZDc3OTViMTU1OTgzZDLpATthbGxvYzo6cmF3X3ZlYzo6UmF3VmVjPFQsQT46OmFsbG9jYXRl\
X2luOjpoMDk3Njg2YzQ4OGE0ZDE0MOoBNmNvcmU6OnBhbmlja2luZzo6cGFuaWNfYm91bmRzX2NoZW\
NrOjpoOTI0NWQ0YTgyNWNjNTEwN+sBTmNvcmU6OnNsaWNlOjo8aW1wbCBbVF0+Ojpjb3B5X2Zyb21f\
c2xpY2U6Omxlbl9taXNtYXRjaF9mYWlsOjpoMjYzOGZjYjVhZWJkZTRlNewBQWNvbnNvbGVfc3RhdG\
ljX3RleHQ6OmFuc2k6OlBlcmZvcm1lcjo6ZmluYWxpemU6Omg4OTZlOWNkZWUzODJlOWE07QE/Y29y\
ZTo6c2xpY2U6OmluZGV4OjpzbGljZV9lbmRfaW5kZXhfbGVuX2ZhaWw6Omg4OGZhYjU5ZjM1OWMzYj\
gz7gE9Y29yZTo6c2xpY2U6OmluZGV4OjpzbGljZV9pbmRleF9vcmRlcl9mYWlsOjpoMTM0YWI2MWM5\
ODBhZjYzNu8BQTxzdHIgYXMgdW5pY29kZV93aWR0aDo6VW5pY29kZVdpZHRoU3RyPjo6d2lkdGg6Om\
gzZDMzNzczMjI2ZmFlZmZj8AFBY29yZTo6c2xpY2U6OmluZGV4OjpzbGljZV9zdGFydF9pbmRleF9s\
ZW5fZmFpbDo6aGY3ZmMyMDI1MzY5MDQxMmTxAYIBPDxhbGxvYzo6dmVjOjpkcmFpbjo6RHJhaW48VC\
xBPiBhcyBjb3JlOjpvcHM6OmRyb3A6OkRyb3A+Ojpkcm9wOjpEcm9wR3VhcmQ8VCxBPiBhcyBjb3Jl\
OjpvcHM6OmRyb3A6OkRyb3A+Ojpkcm9wOjpoMTdmZWQwZGFkMjJhMmNiNfIBW2NvcmU6OnB0cjo6ZH\
JvcF9pbl9wbGFjZTxhbGxvYzo6dmVjOjpWZWM8Y29uc29sZV9zdGF0aWNfdGV4dDo6VGV4dEl0ZW0+\
Pjo6aDliYzA3Y2U3NTcwYTk3ZTPzATNjb25zb2xlX3N0YXRpY190ZXh0Ojp2dHNfbW92ZV91cDo6aG\
VmNGM1YWNlZjFiM2YxZjP0ATA8JlQgYXMgY29yZTo6Zm10OjpEZWJ1Zz46OmZtdDo6aGUwMTBjOWNl\
MDU4MGNkMjH1AVE8b25jZV9jZWxsOjpzeW5jOjpMYXp5PFQsRj4gYXMgY29yZTo6b3BzOjpkZXJlZj\
o6RGVyZWY+OjpkZXJlZjo6aDFkMWJlMmU1ZDc5MTVkOTX2ATRjb3JlOjpzbGljZTo6bWVtY2hyOjpt\
ZW1jaHJfbmFpdmU6Omg1MmNkMWQ0OWNiNzQ2Yzll9wFuPHNlcmRlX3dhc21fYmluZGdlbjo6c2VyOj\
pPYmplY3RTZXJpYWxpemVyIGFzIHNlcmRlOjpzZXI6OlNlcmlhbGl6ZVN0cnVjdD46OnNlcmlhbGl6\
ZV9maWVsZDo6aGU0NThhNGQ5Mzg3NWI0NDH4AUJjb25zb2xlX3N0YXRpY190ZXh0OjphbnNpOjpQZX\
Jmb3JtZXI6Om1hcmtfY2hhcjo6aDgyNjM0Y2E5NmYwMWFmZGT5AVA8YXJyYXl2ZWM6OmVycm9yczo6\
Q2FwYWNpdHlFcnJvcjxUPiBhcyBjb3JlOjpmbXQ6OkRlYnVnPjo6Zm10OjpoMzkxYjM4MzYzMzcxMT\
djNvoBM2FsbG9jOjpzeW5jOjpBcmM8VCxBPjo6ZHJvcF9zbG93OjpoZTQzZmNiM2M4ZTk4OTFhOPsB\
M2FsbG9jOjpzeW5jOjpBcmM8VCxBPjo6ZHJvcF9zbG93OjpoNWQ2MzU4ZTE4MzlkNzUxY/wBjgF3YX\
NtX2JpbmRnZW46OmNvbnZlcnQ6OmltcGxzOjo8aW1wbCB3YXNtX2JpbmRnZW46OmNvbnZlcnQ6OnRy\
YWl0czo6UmV0dXJuV2FzbUFiaSBmb3IgY29yZTo6cmVzdWx0OjpSZXN1bHQ8VCxFPj46OnJldHVybl\
9hYmk6Omg5Nzg0OTkwMzNlZWQxMGI5/QEtYWxsb2M6OnZlYzo6VmVjPFQsQT46OnB1c2g6Omg2ZTA5\
Mzc5MThmNjBkODlm/gEtYWxsb2M6OnZlYzo6VmVjPFQsQT46OnB1c2g6Omg1OGE3ZThhYTI2YjM1Nz\
k0/wEtYWxsb2M6OnZlYzo6VmVjPFQsQT46OnB1c2g6OmgxOTdkMTBmYjEyODZlZTAxgAJWY29yZTo6\
c3RyOjp0cmFpdHM6OjxpbXBsIGNvcmU6Om9wczo6aW5kZXg6OkluZGV4PEk+IGZvciBzdHI+Ojppbm\
RleDo6aGU1Y2VmYTc5YzNmMWNmOGGBAi1hbGxvYzo6dmVjOjpWZWM8VCxBPjo6cHVzaDo6aDNmMGQ2\
NDg1ZGNjYzE4NDKCAi1hbGxvYzo6dmVjOjpWZWM8VCxBPjo6cHVzaDo6aDM5ODA3NzEwNWE0YmY0NT\
aDAjthbGxvYzo6cmF3X3ZlYzo6UmF3VmVjPFQsQT46OmFsbG9jYXRlX2luOjpoNTY1ZTY2OWUzNDFi\
NWQ0YoQCiAF3YXNtX2JpbmRnZW46OmNvbnZlcnQ6OmltcGxzOjo8aW1wbCB3YXNtX2JpbmRnZW46Om\
NvbnZlcnQ6OnRyYWl0czo6SW50b1dhc21BYmkgZm9yIGNvcmU6Om9wdGlvbjo6T3B0aW9uPFQ+Pjo6\
aW50b19hYmk6OmhlZTI1ZTU2MWNhMWVjYjNihQJWY29yZTo6c3RyOjp0cmFpdHM6OjxpbXBsIGNvcm\
U6Om9wczo6aW5kZXg6OkluZGV4PEk+IGZvciBzdHI+OjppbmRleDo6aGIxYThjOTBjY2VmMTBkYTGG\
AjFjb21waWxlcl9idWlsdGluczo6bWVtOjptZW1jbXA6OmgxNDc2OWRiY2RkNTRlODc1hwI5Y29yZT\
o6b3BzOjpmdW5jdGlvbjo6Rm5PbmNlOjpjYWxsX29uY2U6Omg1OTI2NGI2ZjEzOTFhMDA3iAIwc2Vy\
ZGU6OmRlOjpWaXNpdG9yOjp2aXNpdF9zdHI6Omg4MjQwM2Y3OGNlNGQyMmY4iQIyc2VyZGU6OmRlOj\
pWaXNpdG9yOjp2aXNpdF9ieXRlczo6aDQyNDIzMTVjNWRkOWY5YWKKAi5jb3JlOjpvcHRpb246OmV4\
cGVjdF9mYWlsZWQ6OmhlYTIyY2YxMzVhZDY0ZTk4iwJWY29yZTo6c3RyOjp0cmFpdHM6OjxpbXBsIG\
NvcmU6Om9wczo6aW5kZXg6OkluZGV4PEk+IGZvciBzdHI+OjppbmRleDo6aDVkMzhhNTgyYmQ2ZWUz\
ZDGMAkhoYXNoYnJvd246OnJhdzo6UmF3VGFibGVJbm5lcjxBPjo6cHJlcGFyZV9pbnNlcnRfc2xvdD\
o6aDg4OGM3MDJmNjNkNjU2NjONAlJjb3JlOjpwdHI6OmRyb3BfaW5fcGxhY2U8YWxsb2M6OnZlYzo6\
VmVjPHJzX2xpYjo6V2FzbVRleHRJdGVtPj46OmgwMTk4OThhZTU3NjdhOGEwjgJoPGNvcmU6Oml0ZX\
I6OmFkYXB0ZXJzOjpmdXNlOjpGdXNlPEk+IGFzIGNvcmU6Oml0ZXI6OnRyYWl0czo6aXRlcmF0b3I6\
Okl0ZXJhdG9yPjo6bmV4dDo6aDYyNzI5MWRjYTg3MmZhZjePAocBd2FzbV9iaW5kZ2VuOjpjb252ZX\
J0OjpzbGljZXM6OjxpbXBsIHdhc21fYmluZGdlbjo6Y29udmVydDo6dHJhaXRzOjpJbnRvV2FzbUFi\
aSBmb3IgYWxsb2M6OnN0cmluZzo6U3RyaW5nPjo6aW50b19hYmk6OmgzOGJkMGQyYjM1MTYzYjE3kA\
JkY29yZTo6cHRyOjpkcm9wX2luX3BsYWNlPGFsbG9jOjp2ZWM6OlZlYzxzZXJkZTo6X19wcml2YXRl\
OjpkZTo6Y29udGVudDo6Q29udGVudD4+OjpoMzVkODc2ZTU0ZDA5ZTkwYZECjQFjb3JlOjpwdHI6Om\
Ryb3BfaW5fcGxhY2U8YWxsb2M6OnZlYzo6VmVjPChzZXJkZTo6X19wcml2YXRlOjpkZTo6Y29udGVu\
dDo6Q29udGVudCxzZXJkZTo6X19wcml2YXRlOjpkZTo6Y29udGVudDo6Q29udGVudCk+Pjo6aDBjMW\
M2Y2I1NzBjOTY0OTmSAixjb3JlOjplcnJvcjo6RXJyb3I6OmNhdXNlOjpoZmNiMzIyZTcyYTI0ZDc0\
Y5MCTjxhbnlob3c6OmVycm9yOjpFcnJvckltcGw8RT4gYXMgY29yZTo6ZXJyb3I6OkVycm9yPjo6c2\
91cmNlOjpoZmUyZWM4NmJlMDJjODQ2ZpQCXWNvcmU6OnB0cjo6ZHJvcF9pbl9wbGFjZTxhbGxvYzo6\
dmVjOjpWZWM8ZGVub190YXNrX3NoZWxsOjpwYXJzZXI6OkVudlZhcj4+OjpoN2RmNDAyZTJiMmVkYT\
UyY5UCW2NvcmU6OnB0cjo6ZHJvcF9pbl9wbGFjZTxhbGxvYzo6dmVjOjpWZWM8ZGVub190YXNrX3No\
ZWxsOjpwYXJzZXI6OldvcmQ+Pjo6aGRlNGZiYThhMWE1YTFhZTGWAl9jb3JlOjpwdHI6OmRyb3BfaW\
5fcGxhY2U8YWxsb2M6OnZlYzo6VmVjPGRlbm9fdGFza19zaGVsbDo6cGFyc2VyOjpSZWRpcmVjdD4+\
OjpoNDg2NzAwZmE0N2RhZmIyOJcCLGNvcmU6OmVycm9yOjpFcnJvcjo6Y2F1c2U6OmhjOTBkYzliN2\
FlMWVmYzRmmAJOPGFueWhvdzo6ZXJyb3I6OkVycm9ySW1wbDxFPiBhcyBjb3JlOjplcnJvcjo6RXJy\
b3I+Ojpzb3VyY2U6OmhjZmJhMWU2ZjczMDFhZjllmQI8ZGxtYWxsb2M6OmRsbWFsbG9jOjpEbG1hbG\
xvYzxBPjo6aW5pdF90b3A6Omg1Y2NlNjI5NmExODMyYmFhmgJTY29yZTo6cHRyOjpkcm9wX2luX3Bs\
YWNlPGNvbnNvbGVfc3RhdGljX3RleHQ6OkNvbnNvbGVTdGF0aWNUZXh0Pjo6aDc0MDgzMTI5YWZmOW\
E0ODmbAlY8anNfc3lzOjpBcnJheUl0ZXIgYXMgY29yZTo6aXRlcjo6dHJhaXRzOjppdGVyYXRvcjo6\
SXRlcmF0b3I+OjpuZXh0OjpoNzAyMzRiZjZkNDIwYTU1NJwCOjwmbXV0IFcgYXMgY29yZTo6Zm10Oj\
pXcml0ZT46OndyaXRlX3N0cjo6aDdiMTNjZDc5YTk2YjRmNTSdAlU8c2VyZGU6OmRlOjppbXBsczo6\
U3RyaW5nVmlzaXRvciBhcyBzZXJkZTo6ZGU6OlZpc2l0b3I+Ojp2aXNpdF9zdHI6OmhjOWQyYjBiMT\
Y3M2JhZDQxngJOY29yZTo6cHRyOjpkcm9wX2luX3BsYWNlPGRlbm9fdGFza19zaGVsbDo6cGFyc2Vy\
OjpXb3JkUGFydD46Omg2YzZhZDczNmU5NWZlZGU2nwJOY29yZTo6cHRyOjpkcm9wX2luX3BsYWNlPG\
Rlbm9fdGFza19zaGVsbDo6cGFyc2VyOjpTZXF1ZW5jZT46OmhjZTA1NzVlZTk4M2U5NDAyoAI7YWxs\
b2M6OnJhd192ZWM6OlJhd1ZlYzxULEE+OjphbGxvY2F0ZV9pbjo6aGFmZTA0NDAxNTM2MjJhZWGhAk\
Jjb3JlOjpjaGFyOjptZXRob2RzOjo8aW1wbCBjaGFyPjo6aXNfd2hpdGVzcGFjZTo6aDBhZTczZDkz\
YWRjOWZiYTOiAjBhbGxvYzo6dmVjOjpWZWM8VCxBPjo6cmVzZXJ2ZTo6aGM0ZWQyYzkwM2RiOTNlNz\
OjAiljb3JlOjpwYW5pY2tpbmc6OnBhbmljOjpoMGYwYzA1YjIwZGE5M2RkN6QCMGFsbG9jOjp2ZWM6\
OlZlYzxULEE+OjpyZXNlcnZlOjpoYTBiZjgxZTc3NzUxMGIyOKUCaTxoYXNoYnJvd246OnJhdzo6Ym\
l0bWFzazo6Qml0TWFza0l0ZXIgYXMgY29yZTo6aXRlcjo6dHJhaXRzOjppdGVyYXRvcjo6SXRlcmF0\
b3I+OjpuZXh0OjpoMDA0MmMzMGJiZjQwZjQwYqYCMHNlcmRlOjpkZTo6VmlzaXRvcjo6dmlzaXRfdT\
Y0OjpoZDNlOTc5NTk5YzE0NzAzNqcCMHNlcmRlOjpkZTo6VmlzaXRvcjo6dmlzaXRfaTY0OjpoOTBl\
YzVmN2Y3ZjYyMDQ2N6gCMHNlcmRlOjpkZTo6VmlzaXRvcjo6dmlzaXRfZjY0OjpoYmJhOGQyMzI4Mj\
lmOTJjMKkCYTxjb3JlOjpvcHM6OnJhbmdlOjpSYW5nZTx1c2l6ZT4gYXMgY29yZTo6c2xpY2U6Omlu\
ZGV4OjpTbGljZUluZGV4PFtUXT4+OjppbmRleDo6aDU3NWNmNDg5ZGRhODRkOGaqAhFydXN0X2JlZ2\
luX3Vud2luZKsCiAF3YXNtX2JpbmRnZW46OmNvbnZlcnQ6OnNsaWNlczo6PGltcGwgd2FzbV9iaW5k\
Z2VuOjpjb252ZXJ0Ojp0cmFpdHM6OkZyb21XYXNtQWJpIGZvciBhbGxvYzo6Ym94ZWQ6OkJveDxbVF\
0+Pjo6ZnJvbV9hYmk6OmgxMzg2OGVmYmVkMzQ3MDM5rAJePHNlcmRlOjpkZTo6dmFsdWU6OlNlcURl\
c2VyaWFsaXplcjxJLEU+IGFzIHNlcmRlOjpkZTo6U2VxQWNjZXNzPjo6c2l6ZV9oaW50OjpoNWQ5Nj\
E4MWFjZjY1ZmFhNq0ClAE8cnNfbGliOjpfOjo8aW1wbCBzZXJkZTo6ZGU6OkRlc2VyaWFsaXplIGZv\
ciByc19saWI6Oldhc21UZXh0SXRlbT46OmRlc2VyaWFsaXplOjpfX0ZpZWxkVmlzaXRvciBhcyBzZX\
JkZTo6ZGU6OlZpc2l0b3I+Ojp2aXNpdF9zdHI6OmhkOWNjMmQzMzU2Mzk1Y2JkrgI4Y29yZTo6c2xp\
Y2U6OjxpbXBsIFtUXT46OnNwbGl0X2F0X211dDo6aDg3NTJlNmQ2MDc4N2E0MjCvAlE8Y29uc29sZV\
9zdGF0aWNfdGV4dDo6Q29uc29sZVNpemUgYXMgY29yZTo6Y21wOjpQYXJ0aWFsRXE+OjplcTo6aDNi\
MzMyMjRjNmFkYjNkZDOwAnJjb3JlOjpwdHI6OmRyb3BfaW5fcGxhY2U8W2Rlbm9fdGFza19zaGVsbD\
o6cGFyc2VyOjpwYXJzZV93b3JkX3BhcnRzOjp7e2Nsb3N1cmV9fTo6UGVuZGluZ1BhcnRdPjo6aDE5\
N2M1ZjJiZTdiNGIzYWOxAkRoYXNoYnJvd246OnJhdzo6UmF3VGFibGVJbm5lcjxBPjo6YWxsb2NhdG\
lvbl9pbmZvOjpoOWNiMWIxY2IzYjM5NTJkOLICqAFjb3JlOjpwdHI6OmRyb3BfaW5fcGxhY2U8Y29y\
ZTo6aXRlcjo6YWRhcHRlcnM6OmZsYXR0ZW46OkZsYXR0ZW48YWxsb2M6OnZlYzo6aW50b19pdGVyOj\
pJbnRvSXRlcjxhbGxvYzo6dmVjOjpWZWM8ZGVub190YXNrX3NoZWxsOjpwYXJzZXI6OldvcmRQYXJ0\
Pj4+Pjo6aGQwZWY4ODAzNDgxOTJjZDCzAhFfX3diaW5kZ2VuX21hbGxvY7QCQ2NvcmU6OmZtdDo6Rm\
9ybWF0dGVyOjpwYWRfaW50ZWdyYWw6OndyaXRlX3ByZWZpeDo6aDhiNDQ3ZDFkNzIzOTVhZDO1AjBj\
b3JlOjpvcHM6OmZ1bmN0aW9uOjpGbjo6Y2FsbDo6aDhlMzIxNGE3NTYzZGZjNGW2AktkbG1hbGxvYz\
o6ZGxtYWxsb2M6OkRsbWFsbG9jPEE+OjpyZWxlYXNlX3VudXNlZF9zZWdtZW50czo6aDcwYWJlNmJm\
MThjMzZiZGG3Ams8c3RkOjpwYW5pY2tpbmc6OmJlZ2luX3BhbmljX2hhbmRsZXI6OlN0clBhbmljUG\
F5bG9hZCBhcyBjb3JlOjpwYW5pYzo6Qm94TWVVcD46OnRha2VfYm94OjpoNTcyNjFmMzcyZTk4Yzg2\
NLgCOHNlcmRlX3dhc21fYmluZGdlbjo6ZXJyb3I6OkVycm9yOjpuZXc6OmgzYjM4OTFmZTM2M2U4Nz\
QzuQJAYW55aG93OjplcnJvcjo6PGltcGwgYW55aG93OjpFcnJvcj46OmZyb21fc3RkOjpoYTI4MmE0\
OGIxNmQxYzZmM7oCNGNvcmU6OnJlc3VsdDo6UmVzdWx0PFQsRT46OnVud3JhcDo6aDA0ZTY4NWU4Ym\
ZkYWU3NWK7Aks8YW55aG93OjplcnJvcjo6RXJyb3JJbXBsPEU+IGFzIGNvcmU6OmZtdDo6RGlzcGxh\
eT46OmZtdDo6aDgyMjk5ZTAyZmZhM2VmMzK8AlE8YWxsb2M6OnZlYzo6ZHJhaW46OkRyYWluPFQsQT\
4gYXMgY29yZTo6b3BzOjpkcm9wOjpEcm9wPjo6ZHJvcDo6aDMyNTgzNDM4ZTVmYTA2N2K9Aktjb3Jl\
OjpmbXQ6OmZsb2F0Ojo8aW1wbCBjb3JlOjpmbXQ6OkRpc3BsYXkgZm9yIGY2ND46OmZtdDo6aGI3OG\
JiMThmZGUwNjE5NWG+Aks8YW55aG93OjplcnJvcjo6RXJyb3JJbXBsPEU+IGFzIGNvcmU6OmZtdDo6\
RGlzcGxheT46OmZtdDo6aGJmMWEyYzIxYjY3ZDJlODC/AkFoYXNoYnJvd246OnJhdzo6RmFsbGliaW\
xpdHk6OmNhcGFjaXR5X292ZXJmbG93OjpoMTE0ODBmNGE2YjdkYWQxNcACLWNvcmU6OnBhbmlja2lu\
Zzo6cGFuaWNfZm10OjpoM2UxZGQzZDA4Mjg4NTY5ZcECeGRlbm9fdGFza19zaGVsbDo6cGFyc2VyOj\
pfOjo8aW1wbCBzZXJkZTo6c2VyOjpTZXJpYWxpemUgZm9yIGRlbm9fdGFza19zaGVsbDo6cGFyc2Vy\
OjpXb3JkPjo6c2VyaWFsaXplOjpoOTZhNzc2MmI5MjhlN2RiN8ICNGFsbG9jOjpyYXdfdmVjOjpjYX\
BhY2l0eV9vdmVyZmxvdzo6aDk1NmViZTZiZjA0YjljNzPDAjJ3YXNtX2JpbmRnZW46OmJpZ2ludF9n\
ZXRfYXNfaTY0OjpoOTdhNzkzNjcyYTg3N2FmMsQCRGNvbnNvbGVfc3RhdGljX3RleHQ6OmFuc2k6Ol\
BlcmZvcm1lcjo6bWFya19lc2NhcGU6Omg2OWYxYjY3N2EyNTdiYzBjxQI4c3RkOjp0aHJlYWQ6OlRo\
cmVhZElkOjpuZXc6OmV4aGF1c3RlZDo6aDQyODYyODIzNWRhNDQ4MmTGAm48c2VyZGVfd2FzbV9iaW\
5kZ2VuOjpzZXI6Ok9iamVjdFNlcmlhbGl6ZXIgYXMgc2VyZGU6OnNlcjo6U2VyaWFsaXplU3RydWN0\
Pjo6c2VyaWFsaXplX2ZpZWxkOjpoODlkYTI0ODM4MzAyNGNkMMcCWzxjb3JlOjpzdHI6Oml0ZXI6Ok\
NoYXJzIGFzIGNvcmU6Oml0ZXI6OnRyYWl0czo6aXRlcmF0b3I6Okl0ZXJhdG9yPjo6bmV4dDo6aDYz\
ZWE3N2U5MDlhYTgxNTjIAjFjb3JlOjpwYW5pY2tpbmc6OmFzc2VydF9mYWlsZWQ6Omg3OGU2NDhkYT\
U5YTE1YzdkyQJPPHN0ZDo6c3luYzo6cG9pc29uOjpQb2lzb25FcnJvcjxUPiBhcyBjb3JlOjpmbXQ6\
OkRlYnVnPjo6Zm10OjpoZTRkZTZhZDQ0MWE3NjFlY8oCSDxjb3JlOjpvcHRpb246Ok9wdGlvbjxUPi\
BhcyBjb3JlOjpjbXA6OlBhcnRpYWxFcT46OmVxOjpoYWJmMzcyZDFmYTM0MjdlMcsCMWNvcmU6OnBh\
bmlja2luZzo6YXNzZXJ0X2ZhaWxlZDo6aDhiN2E3MzE1N2ZhYjg5NjXMAsoFY29yZTo6cHRyOjpkcm\
9wX2luX3BsYWNlPG1vbmNoOjpvcjxkZW5vX3Rhc2tfc2hlbGw6OnBhcnNlcjo6UmVkaXJlY3RPcCxt\
b25jaDo6bWFwPCZzdHIsZGVub190YXNrX3NoZWxsOjpwYXJzZXI6OlJlZGlyZWN0T3AsbW9uY2g6On\
RhZzwmc3RyPjo6e3tjbG9zdXJlfX0sZGVub190YXNrX3NoZWxsOjpwYXJzZXI6OnBhcnNlX3JlZGly\
ZWN0Ojp7e2Nsb3N1cmV9fT46Ont7Y2xvc3VyZX19LG1vbmNoOjpvcjxkZW5vX3Rhc2tfc2hlbGw6On\
BhcnNlcjo6UmVkaXJlY3RPcCxtb25jaDo6bWFwPCZzdHIsZGVub190YXNrX3NoZWxsOjpwYXJzZXI6\
OlJlZGlyZWN0T3AsbW9uY2g6Om9yPCZzdHIsbW9uY2g6OnRhZzwmc3RyPjo6e3tjbG9zdXJlfX0sbW\
9uY2g6OnRhZzwmc3RyPjo6e3tjbG9zdXJlfX0+Ojp7e2Nsb3N1cmV9fSxkZW5vX3Rhc2tfc2hlbGw6\
OnBhcnNlcjo6cGFyc2VfcmVkaXJlY3Q6Ont7Y2xvc3VyZX19Pjo6e3tjbG9zdXJlfX0sbW9uY2g6Om\
1hcDxjaGFyLGRlbm9fdGFza19zaGVsbDo6cGFyc2VyOjpSZWRpcmVjdE9wLG1vbmNoOjppZl90cnVl\
PGNoYXIsbW9uY2g6Om5leHRfY2hhcixtb25jaDo6Y2g6Ont7Y2xvc3VyZX19Pjo6e3tjbG9zdXJlfX\
0sZGVub190YXNrX3NoZWxsOjpwYXJzZXI6OnBhcnNlX3JlZGlyZWN0Ojp7e2Nsb3N1cmV9fT46Ont7\
Y2xvc3VyZX19Pjo6e3tjbG9zdXJlfX0+Ojp7e2Nsb3N1cmV9fT46Omg2MzQyNDdhODU0ZTRjMjMwzQ\
IxY29yZTo6cGFuaWNraW5nOjphc3NlcnRfZmFpbGVkOjpoYmI2YzgwY2RjNTA2NTBhN84CTjxzZXJk\
ZV93YXNtX2JpbmRnZW46OmVycm9yOjpFcnJvciBhcyBjb3JlOjpmbXQ6OkRlYnVnPjo6Zm10OjpoND\
dkZDI5ODQ0YzA5YmVkY88CSDxhbGxvYzo6dmVjOjpWZWM8VCxBPiBhcyBjb3JlOjpvcHM6OmRyb3A6\
OkRyb3A+Ojpkcm9wOjpoNmQzOWFiYTE2YmJiZTlhOdACM2FsbG9jOjpzeW5jOjpBcmM8VCxBPjo6ZH\
JvcF9zbG93OjpoZjIyMTZjNGMwZjA3MTBhZdECRXNlcmRlX3dhc21fYmluZGdlbjo6ZGU6OkRlc2Vy\
aWFsaXplcjo6aW52YWxpZF90eXBlOjpoNjEzY2RlN2Y1NDFmZWYzMtICEl9fd2JpbmRnZW5fcmVhbG\
xvY9MCQGFsbG9jOjpyYXdfdmVjOjpSYXdWZWM8VCxBPjo6cmVzZXJ2ZV9mb3JfcHVzaDo6aDNiYmJh\
MWE2N2VmZTE0ZGPUAjo8Jm11dCBXIGFzIGNvcmU6OmZtdDo6V3JpdGU+Ojp3cml0ZV9mbXQ6OmhlND\
gxNjMxM2YyNGNlM2Qy1QJIY29yZTo6cHRyOjpkcm9wX2luX3BsYWNlPFtjb25zb2xlX3N0YXRpY190\
ZXh0OjpMaW5lXT46Omg2ZDQ0ZTM0NjYxMjcyNDc11gJAYWxsb2M6OnJhd192ZWM6OlJhd1ZlYzxULE\
E+OjpyZXNlcnZlX2Zvcl9wdXNoOjpoNWUzYjAzMzJiNGEwNmY4ZtcCMHZ0ZTo6UGFyc2VyPF8+Ojpp\
bnRlcm1lZGlhdGVzOjpoZTFiMjQ5MDk1OGVkNDA0MtgCOjwmbXV0IFcgYXMgY29yZTo6Zm10OjpXcm\
l0ZT46OndyaXRlX2ZtdDo6aDUwZWIyZGEyMTE1Yjg3OTTZAkBhbGxvYzo6cmF3X3ZlYzo6UmF3VmVj\
PFQsQT46OnJlc2VydmVfZm9yX3B1c2g6OmhkMzQ1YTk0YmY3NWNjOTll2gI6PCZtdXQgVyBhcyBjb3\
JlOjpmbXQ6OldyaXRlPjo6d3JpdGVfZm10OjpoOGMwMWEyZTFjNDc0MDUzMNsCLmNvcmU6OmZtdDo6\
V3JpdGU6OndyaXRlX2ZtdDo6aDRiNWZhYjExNmEwODM5OGbcAi5jb3JlOjpmbXQ6OldyaXRlOjp3cm\
l0ZV9mbXQ6OmhlM2MyZGI3ODA0N2IwMGEy3QIuY29yZTo6Zm10OjpXcml0ZTo6d3JpdGVfZm10Ojpo\
ODU1NjcxM2E4ZDMzZTk3M94CZ3NlcmRlOjpzZXI6OmltcGxzOjo8aW1wbCBzZXJkZTo6c2VyOjpTZX\
JpYWxpemUgZm9yIGFsbG9jOjpzdHJpbmc6OlN0cmluZz46OnNlcmlhbGl6ZTo6aDYxMTFhY2JkZjI1\
YzFlNzDfAlNjb3JlOjpwdHI6OmRyb3BfaW5fcGxhY2U8ZGVub190YXNrX3NoZWxsOjpwYXJzZXI6Ol\
BpcGVsaW5lSW5uZXI+OjpoZDk1NDE0YjZkNzc4NGQ3ZOACUmNvcmU6OnB0cjo6ZHJvcF9pbl9wbGFj\
ZTxkZW5vX3Rhc2tfc2hlbGw6OnBhcnNlcjo6Q29tbWFuZElubmVyPjo6aGE3NWJiMzc3YzViNGQ4MT\
HhAjp3YXNtX2JpbmRnZW46Ol9fcnQ6OnRha2VfbGFzdF9leGNlcHRpb246OmhmZWNjM2U0ZTE2MjQy\
YTgw4gI2YWxsb2M6OmFsbG9jOjpHbG9iYWw6OmFsbG9jX2ltcGw6OmhmZjJmNWE4ODkzODYyMjRkLj\
E54wJKY29yZTo6cHRyOjpkcm9wX2luX3BsYWNlPG1vbmNoOjpQYXJzZUVycm9yRmFpbHVyZUVycm9y\
Pjo6aGI0YzY3MmUyNDExMzhhNjbkAjdzZXJkZV93YXNtX2JpbmRnZW46OmRlOjpjb252ZXJ0X3BhaX\
I6Omg4NWU1OTcxMDFkOTU3YzE25QI/cnNfbGliOjpzdGF0aWNfdGV4dF9yZW5kZXJfb25jZTo6e3tj\
bG9zdXJlfX06Omg3NzM2YjAxZDVhMDUyZjU45gJIY29yZTo6b3BzOjpmdW5jdGlvbjo6Rm5PbmNlOj\
pjYWxsX29uY2V7e3Z0YWJsZS5zaGltfX06OmgxMjM5NGFhMzg4NTU2NGZl5wJGY29yZTo6cHRyOjpk\
cm9wX2luX3BsYWNlPGFueWhvdzo6Y2hhaW46OkNoYWluU3RhdGU+OjpoYzZjZDEzNTBmMTUyYzMyNO\
gCYWNvcmU6OnB0cjo6ZHJvcF9pbl9wbGFjZTxbYWxsb2M6OnZlYzo6VmVjPGRlbm9fdGFza19zaGVs\
bDo6cGFyc2VyOjpXb3JkUGFydD5dPjo6aDM2NDg2OGU1ZDgwN2IxYWbpAlBjb3JlOjpwdHI6OmRyb3\
BfaW5fcGxhY2U8W2Rlbm9fdGFza19zaGVsbDo6cGFyc2VyOjpXb3JkUGFydF0+OjpoM2IwYTkxODdi\
MTU0Y2E0N+oCQGNvcmU6OnB0cjo6ZHJvcF9pbl9wbGFjZTxzdGQ6OnRocmVhZDo6VGhyZWFkPjo6aD\
cxYTRlOTU2NTdhYWVhNzbrAlg8YWxsb2M6OnZlYzo6aW50b19pdGVyOjpJbnRvSXRlcjxULEE+IGFz\
IGNvcmU6Om9wczo6ZHJvcDo6RHJvcD46OmRyb3A6Omg4Nzk4YTYxZTQ0M2JkOGMz7AI7Y29yZTo6c2\
xpY2U6OjxpbXBsIFtUXT46OmNvcHlfZnJvbV9zbGljZTo6aDY3ODc5ZWRkMTA5NDk0YzftAk5jb3Jl\
OjpmbXQ6Om51bTo6aW1wOjo8aW1wbCBjb3JlOjpmbXQ6OkRpc3BsYXkgZm9yIGk2ND46OmZtdDo6aG\
E5ZTQzZGI0YjQ5NjdlYzPuAlg8YWxsb2M6OnZlYzo6aW50b19pdGVyOjpJbnRvSXRlcjxULEE+IGFz\
IGNvcmU6Om9wczo6ZHJvcDo6RHJvcD46OmRyb3A6OmhhNGIxMWY3MDA2OGMwYjRh7wKCAWNvcmU6On\
B0cjo6ZHJvcF9pbl9wbGFjZTxjb3JlOjpyZXN1bHQ6OlJlc3VsdDwoJnN0cixkZW5vX3Rhc2tfc2hl\
bGw6OnBhcnNlcjo6UGlwZWxpbmVJbm5lciksbW9uY2g6OlBhcnNlRXJyb3I+Pjo6aGEwYWVjZGQ1Zj\
EwYWM3NDXwAn1jb3JlOjpwdHI6OmRyb3BfaW5fcGxhY2U8Y29yZTo6cmVzdWx0OjpSZXN1bHQ8KCZz\
dHIsZGVub190YXNrX3NoZWxsOjpwYXJzZXI6OlNlcXVlbmNlKSxtb25jaDo6UGFyc2VFcnJvcj4+Oj\
poNWRiOGJlMmZiNTU2ZjBhOfECP3dhc21fYmluZGdlbjo6Y29udmVydDo6Y2xvc3VyZXM6Omludm9r\
ZTRfbXV0OjpoY2I1ODg5Zjc3Y2FmNWRkZfICcWNvcmU6OnB0cjo6ZHJvcF9pbl9wbGFjZTxzdGQ6On\
N5bmM6Om11dGV4OjpNdXRleEd1YXJkPGNvbnNvbGVfc3RhdGljX3RleHQ6OkNvbnNvbGVTdGF0aWNU\
ZXh0Pj46OmhhMjc5MTE2ODYxNzcyZTk38wIsc3RkOjpwYW5pY2tpbmc6OnBhbmlja2luZzo6aDBjMj\
NlY2Y4NDk0OTJlZGP0AkY8W0FdIGFzIGNvcmU6OnNsaWNlOjpjbXA6OlNsaWNlUGFydGlhbEVxPEI+\
Pjo6ZXF1YWw6OmgwYzhkOTI4MTExYjhlNjNl9QI1Y29yZTo6c3RyOjo8aW1wbCBzdHI+OjpzdGFydH\
Nfd2l0aDo6aGNmYWQ4N2Q4YWY0NjRjYjH2Aj93YXNtX2JpbmRnZW46OmNvbnZlcnQ6OmNsb3N1cmVz\
OjppbnZva2UzX211dDo6aDEwNWUxYjUzMjAyZDRkOTL3Aj93YXNtX2JpbmRnZW46OmNvbnZlcnQ6Om\
Nsb3N1cmVzOjppbnZva2UzX211dDo6aDE1Mzc0ZTQxZjk5MjJkOGX4Aj93YXNtX2JpbmRnZW46OmNv\
bnZlcnQ6OmNsb3N1cmVzOjppbnZva2UzX211dDo6aDE4YTg3M2I4ZjBmZmE3ODb5Aj93YXNtX2Jpbm\
RnZW46OmNvbnZlcnQ6OmNsb3N1cmVzOjppbnZva2UzX211dDo6aDFiNjM2ZDhlNTY5ZDdkYTj6Aj93\
YXNtX2JpbmRnZW46OmNvbnZlcnQ6OmNsb3N1cmVzOjppbnZva2UzX211dDo6aDI0ZGE3ZWEzN2Y3ZT\
kxM2T7Aj93YXNtX2JpbmRnZW46OmNvbnZlcnQ6OmNsb3N1cmVzOjppbnZva2UzX211dDo6aDNhMzM0\
NjhhZTk1MjE0Yzn8Aj93YXNtX2JpbmRnZW46OmNvbnZlcnQ6OmNsb3N1cmVzOjppbnZva2UzX211dD\
o6aGI0YzlkNzc1ZTlkY2RhZTf9Aj93YXNtX2JpbmRnZW46OmNvbnZlcnQ6OmNsb3N1cmVzOjppbnZv\
a2UzX211dDo6aGY1M2Q3YzcyOTBkOGQ2ZjT+Al5jb3JlOjpwdHI6OmRyb3BfaW5fcGxhY2U8c3RkOj\
pwYW5pY2tpbmc6OmJlZ2luX3BhbmljX2hhbmRsZXI6OlBhbmljUGF5bG9hZD46OmgzMDlhYTViMTlm\
YzJmODcz/wIxYWxsb2M6OnJhd192ZWM6OmhhbmRsZV9yZXNlcnZlOjpoNWUyMGI1MGMxMGM4YTJlOY\
ADMWFueWhvdzo6ZXJyb3I6Om9iamVjdF9kb3duY2FzdDo6aDIwZTYzNGRhMTRmYzk0Y2OBAzQ8Ym9v\
bCBhcyBjb3JlOjpmbXQ6OkRpc3BsYXk+OjpmbXQ6OmgyOTY2YWYyODdhZjBlY2Q5ggOOAWNvcmU6On\
B0cjo6ZHJvcF9pbl9wbGFjZTxjb3JlOjpyZXN1bHQ6OlJlc3VsdDwoJnN0cixhbGxvYzo6dmVjOjpW\
ZWM8ZGVub190YXNrX3NoZWxsOjpwYXJzZXI6OldvcmRQYXJ0PiksbW9uY2g6OlBhcnNlRXJyb3I+Pj\
o6aGI1MzJhYzgzZDcyOGViNTGDAzFhbnlob3c6OmVycm9yOjpvYmplY3RfZG93bmNhc3Q6OmhiM2Nm\
YTI4MzViN2M2MTkwhAM/d2FzbV9iaW5kZ2VuOjpjb252ZXJ0OjpjbG9zdXJlczo6aW52b2tlMl9tdX\
Q6OmgzNDVmM2EzZTM1MzBmMzdjhQMzYWxsb2M6OmFsbG9jOjpHbG9iYWw6OmFsbG9jX2ltcGw6Omhm\
ZjJmNWE4ODkzODYyMjRkhgN4Y29yZTo6cHRyOjpkcm9wX2luX3BsYWNlPGNvcmU6OnJlc3VsdDo6Um\
VzdWx0PHJzX2xpYjo6V2FzbVRleHRJdGVtLHNlcmRlX3dhc21fYmluZGdlbjo6ZXJyb3I6OkVycm9y\
Pj46Omg1YjMyY2NhNDhmNTg4MjM5hwNNY29yZTo6cHRyOjpkcm9wX2luX3BsYWNlPGRlbm9fdGFza1\
9zaGVsbDo6cGFyc2VyOjpDb21tYW5kPjo6aDEzODJjYjMzZDBlOTFjNTKIAz5jb3JlOjpwdHI6OmRy\
b3BfaW5fcGxhY2U8bW9uY2g6OlBhcnNlRXJyb3I+OjpoMDZlMjFiZmM1NTE5M2Q1YokDP3dhc21fYm\
luZGdlbjo6Y29udmVydDo6Y2xvc3VyZXM6Omludm9rZTFfbXV0OjpoMzk1Yzg5ZTIwMjUyNmIyZooD\
N2FsbG9jOjphbGxvYzo6R2xvYmFsOjphbGxvY19pbXBsOjpoZmYyZjVhODg5Mzg2MjI0ZC4zMTSLAw\
xfX3J1c3RfYWxsb2OMA248c2VyZGVfd2FzbV9iaW5kZ2VuOjpzZXI6Ok9iamVjdFNlcmlhbGl6ZXIg\
YXMgc2VyZGU6OnNlcjo6U2VyaWFsaXplU3RydWN0Pjo6c2VyaWFsaXplX2ZpZWxkOjpoOTQ5NjExNT\
cxZTEzYzM5MY0DKm1vbmNoOjpQYXJzZUVycm9yOjpmYWlsOjpoZGZhNTkwZGRiZjY3NTRhOI4DKm1v\
bmNoOjpQYXJzZUVycm9yOjpmYWlsOjpoYTIzOWZmZTM1ZmI3YjE4OI8DKm1vbmNoOjpQYXJzZUVycm\
9yOjpmYWlsOjpoYzFhNTNjMWUyZjFhZmRlNJADMGFsbG9jOjphbGxvYzo6ZXhjaGFuZ2VfbWFsbG9j\
OjpoMGVkZDRjOTFlMWU1NmQ4OZEDbjxzZXJkZV93YXNtX2JpbmRnZW46OnNlcjo6T2JqZWN0U2VyaW\
FsaXplciBhcyBzZXJkZTo6c2VyOjpTZXJpYWxpemVTdHJ1Y3Q+OjpzZXJpYWxpemVfZmllbGQ6Omgx\
Y2YyZmFkZDFkZGQ1ZWNlkgNuPHNlcmRlX3dhc21fYmluZGdlbjo6c2VyOjpPYmplY3RTZXJpYWxpem\
VyIGFzIHNlcmRlOjpzZXI6OlNlcmlhbGl6ZVN0cnVjdD46OnNlcmlhbGl6ZV9maWVsZDo6aGQ1Y2E1\
ZWQzNDQ2MjUwZjiTAzI8VCBhcyBzZXJkZTo6ZGU6OkV4cGVjdGVkPjo6Zm10OjpoMzMyYWU1OWFlNT\
Y5NDU1OJQDMjxUIGFzIHNlcmRlOjpkZTo6RXhwZWN0ZWQ+OjpmbXQ6Omg5YmU3ZWEwNjhhYTBlZjc1\
lQMyPFQgYXMgc2VyZGU6OmRlOjpFeHBlY3RlZD46OmZtdDo6aGM3MzYzMjFlODY4NGM0MmKWAzI8VC\
BhcyBzZXJkZTo6ZGU6OkV4cGVjdGVkPjo6Zm10OjpoNTVmZTc0ZDMxZmYwOTVkZpcDMjxUIGFzIHNl\
cmRlOjpkZTo6RXhwZWN0ZWQ+OjpmbXQ6OmgxZGQwYWY2MWI5NmY2ODUzmAMyPFQgYXMgc2VyZGU6Om\
RlOjpFeHBlY3RlZD46OmZtdDo6aGFiYTk1MGQ4MDhmN2Q5NmWZA1djb3JlOjpwdHI6OmRyb3BfaW5f\
cGxhY2U8YWxsb2M6OnZlYzo6VmVjPGNvbnNvbGVfc3RhdGljX3RleHQ6OkxpbmU+Pjo6aDViNDhmOD\
FiZjgwNTI5YzGaA0g8Y29yZTo6Y2VsbDo6Qm9ycm93TXV0RXJyb3IgYXMgY29yZTo6Zm10OjpEZWJ1\
Zz46OmZtdDo6aDQ1YWU2ODgyZTkyNTk3NmGbAz48Y29yZTo6Zm10OjpFcnJvciBhcyBjb3JlOjpmbX\
Q6OkRlYnVnPjo6Zm10OjpoOWIyNWU4Y2I0MDliM2Y4YpwDX2NvcmU6OnB0cjo6ZHJvcF9pbl9wbGFj\
ZTxhbGxvYzo6dmVjOjpWZWM8ZGVub190YXNrX3NoZWxsOjpwYXJzZXI6OldvcmRQYXJ0Pj46Omg1Yj\
A3YzQ0ODJlOWNiNTg5nQM3YWxsb2M6OmFsbG9jOjpHbG9iYWw6OmFsbG9jX2ltcGw6OmhmZjJmNWE4\
ODkzODYyMjRkLjIyOJ4DKm1vbmNoOjpQYXJzZUVycm9yOjpmYWlsOjpoNjcxNzY4NTdmNDE5NWY1ZJ\
8DcGNvcmU6OnB0cjo6ZHJvcF9pbl9wbGFjZTxhbGxvYzo6dmVjOjpWZWM8YWxsb2M6OnZlYzo6VmVj\
PGRlbm9fdGFza19zaGVsbDo6cGFyc2VyOjpXb3JkUGFydD4+Pjo6aDZhMmNkZWIwNjRjZDNkYzegA0\
NzZXJkZV93YXNtX2JpbmRnZW46OmRlOjpEZXNlcmlhbGl6ZXI6OmlzX251bGxpc2g6OmhlZDlhZDA5\
NDQ1MjRiODJmoQNPPGFsbG9jOjpyYXdfdmVjOjpSYXdWZWM8VCxBPiBhcyBjb3JlOjpvcHM6OmRyb3\
A6OkRyb3A+Ojpkcm9wOjpoNzM0ZjYwNGY2MzJkZWI4NaIDTzxhbGxvYzo6cmF3X3ZlYzo6UmF3VmVj\
PFQsQT4gYXMgY29yZTo6b3BzOjpkcm9wOjpEcm9wPjo6ZHJvcDo6aDVmMTAyNWU3NzRjYWRlOGKjA0\
48YW55aG93Ojp3cmFwcGVyOjpNZXNzYWdlRXJyb3I8TT4gYXMgY29yZTo6Zm10OjpEZWJ1Zz46OmZt\
dDo6aGZjYTQzZWQ5YzNhZTNiOGakA088YWxsb2M6OnJhd192ZWM6OlJhd1ZlYzxULEE+IGFzIGNvcm\
U6Om9wczo6ZHJvcDo6RHJvcD46OmRyb3A6Omg2YmRiMmJjNWJmNmEzMWNmpQNMY29yZTo6cHRyOjpk\
cm9wX2luX3BsYWNlPGRlbm9fdGFza19zaGVsbDo6cGFyc2VyOjpFbnZWYXI+OjpoZDgyN2I5MzdhYj\
Q2NWFiYaYDTmNvcmU6OnB0cjo6ZHJvcF9pbl9wbGFjZTxkZW5vX3Rhc2tfc2hlbGw6OnBhcnNlcjo6\
UmVkaXJlY3Q+OjpoNzAzYjdhNWUzYjY4ZTRjMKcDNGFsbG9jOjphbGxvYzo6ZXhjaGFuZ2VfbWFsbG\
9jOjpoMGVkZDRjOTFlMWU1NmQ4OS4yMzCoA2Bjb3JlOjpwdHI6OmRyb3BfaW5fcGxhY2U8Y29yZTo6\
cmVzdWx0OjpSZXN1bHQ8KCZzdHIsY2hhciksbW9uY2g6OlBhcnNlRXJyb3I+Pjo6aDRhNDMwNDY0ND\
MyMzI0N2GpA0c8YWxsb2M6OnN0cmluZzo6U3RyaW5nIGFzIGNvcmU6OmZtdDo6RGVidWc+OjpmbXQ6\
OmhhMGM4YWNkYTZiYWFmNDVmLjMxNqoDMDwmVCBhcyBjb3JlOjpmbXQ6OkRlYnVnPjo6Zm10OjpoMW\
NkODQzMDE0ZTQwNTY0OasDazwmc2VyZGVfd2FzbV9iaW5kZ2VuOjpzZXI6OlNlcmlhbGl6ZXIgYXMg\
c2VyZGU6OnNlcjo6U2VyaWFsaXplcj46OnNlcmlhbGl6ZV91bml0X3ZhcmlhbnQ6OmhlZjVhNjI4Nz\
JhY2U5ZDE3rANiPCZzZXJkZV93YXNtX2JpbmRnZW46OnNlcjo6U2VyaWFsaXplciBhcyBzZXJkZTo6\
c2VyOjpTZXJpYWxpemVyPjo6c2VyaWFsaXplX3N0cjo6aDZkMTA2MWRlNmI4YTMzYzKtA1djb3JlOj\
pwdHI6OmRyb3BfaW5fcGxhY2U8Y29yZTo6b3B0aW9uOjpPcHRpb248cnNfbGliOjpXYXNtVGV4dEl0\
ZW0+Pjo6aDQyZjg2NDhmMjMzZTVjZjWuA2ljb3JlOjpwdHI6OmRyb3BfaW5fcGxhY2U8Y29yZTo6b3\
B0aW9uOjpPcHRpb248c2VyZGU6Ol9fcHJpdmF0ZTo6ZGU6OmNvbnRlbnQ6OkNvbnRlbnQ+Pjo6aDY3\
ODYwZGQ1MWQ5Mzk5YjevA5IBY29yZTo6cHRyOjpkcm9wX2luX3BsYWNlPGNvcmU6Om9wdGlvbjo6T3\
B0aW9uPChzZXJkZTo6X19wcml2YXRlOjpkZTo6Y29udGVudDo6Q29udGVudCxzZXJkZTo6X19wcml2\
YXRlOjpkZTo6Y29udGVudDo6Q29udGVudCk+Pjo6aDc4Njg0ZjhkZTY5NWM1NjiwAyxhbnlob3c6Om\
Vycm9yOjpvYmplY3RfcmVmOjpoNDlhNzVhOTYyNmQ3MzIyN7EDRDxjb3JlOjpmbXQ6OkFyZ3VtZW50\
cyBhcyBjb3JlOjpmbXQ6OkRpc3BsYXk+OjpmbXQ6OmgyMDAyYTFlMDllZjk3ZDk4sgNkY29yZTo6cH\
RyOjpkcm9wX2luX3BsYWNlPGNvcmU6Om9wdGlvbjo6T3B0aW9uPGRlbm9fdGFza19zaGVsbDo6cGFy\
c2VyOjpXb3JkUGFydD4+OjpoZDU4OGJhMGZkZjRhM2RlZLMDLGFueWhvdzo6ZXJyb3I6Om9iamVjdF\
9yZWY6OmhhMTM0NzIzYmU0NDhmNDVjtANCY29yZTo6cHRyOjpkcm9wX2luX3BsYWNlPGFsbG9jOjpz\
dHJpbmc6OlN0cmluZz46OmhmY2Y2YmVmMjg1MGFmOTE2tQMyPCZUIGFzIGNvcmU6OmZtdDo6RGlzcG\
xheT46OmZtdDo6aGZhMzQwMThmNWRhMjNjYTO2A0Jjb3JlOjpwdHI6OmRyb3BfaW5fcGxhY2U8d2Fz\
bV9iaW5kZ2VuOjpKc1ZhbHVlPjo6aDZhNTNkYTRkY2YzNTJkYzS3A088YWxsb2M6OnJhd192ZWM6Ol\
Jhd1ZlYzxULEE+IGFzIGNvcmU6Om9wczo6ZHJvcDo6RHJvcD46OmRyb3A6OmgwN2ZkOWFmMDA3MGJj\
YjdjuANpY29yZTo6cHRyOjpkcm9wX2luX3BsYWNlPGFsbG9jOjp2ZWM6OlZlYzxkZW5vX3Rhc2tfc2\
hlbGw6OnBhcnNlcjo6U2VxdWVudGlhbExpc3RJdGVtPj46OmgzODNkMGM5ZDQ1ZmE4OTMzuQNEY29y\
ZTo6cHRyOjpkcm9wX2luX3BsYWNlPGFsbG9jOjpib3Jyb3c6OkNvdzxzdHI+Pjo6aGE4MGQxNjc2OT\
Q5NmRiZWO6A0Fjb3JlOjpwdHI6OmRyb3BfaW5fcGxhY2U8cnNfbGliOjpXYXNtVGV4dEl0ZW0+Ojpo\
N2VkY2NkMTM3OTc1NzkzNbsDT2NvcmU6OmNtcDo6aW1wbHM6OjxpbXBsIGNvcmU6OmNtcDo6UGFydG\
lhbEVxPCZCPiBmb3IgJkE+OjplcTo6aDIzODM2Mzk0MWFkNzY1ODK8AzI8JlQgYXMgY29yZTo6Zm10\
OjpEaXNwbGF5Pjo6Zm10OjpoMTE0MTkxMTdkOWQ0MTdmML0DLmNvcmU6OnN0cjo6c2xpY2VfZXJyb3\
JfZmFpbDo6aGExZTNlMDI5MzVjYzEwNGS+AzA8JlQgYXMgY29yZTo6Zm10OjpEZWJ1Zz46OmZtdDo6\
aDMxMDc5MzliZGVmMjI3MWO/A4UBY29yZTo6cHRyOjpkcm9wX2luX3BsYWNlPGNvcmU6Om9wdGlvbj\
o6T3B0aW9uPGFsbG9jOjp2ZWM6OmludG9faXRlcjo6SW50b0l0ZXI8ZGVub190YXNrX3NoZWxsOjpw\
YXJzZXI6OldvcmRQYXJ0Pj4+OjpoZjQ1NWJiMjc5MzQxZWJiMcADQ2NvcmU6OnB0cjo6ZHJvcF9pbl\
9wbGFjZTxvbmNlX2NlbGw6OmltcDo6V2FpdGVyPjo6aGM0Y2I4YjQ0M2JjMDZiODXBA088YWxsb2M6\
OmFsbG9jOjpHbG9iYWwgYXMgY29yZTo6YWxsb2M6OkFsbG9jYXRvcj46OmRlYWxsb2NhdGU6OmgxYz\
QzNjY5OGFjNzZjNjVjwgNDZGVub190YXNrX3NoZWxsOjpwYXJzZXI6OmZhaWxfZm9yX3RyYWlsaW5n\
X2lucHV0OjpoYTFmMTAyMzNlMmNlZjgwOMMDNndhc21fYmluZGdlbjo6Y2FzdDo6SnNDYXN0OjpkeW\
5fcmVmOjpoY2Q5ZTY4Njg1YTJhOTIzMsQDSGNvcmU6Om9wczo6ZnVuY3Rpb246OkZuT25jZTo6Y2Fs\
bF9vbmNle3t2dGFibGUuc2hpbX19OjpoZTM4YTc2NjViNDNjMGY0OMUDQHJzX2xpYjo6U1RBVElDX1\
RFWFQ6Ont7Y2xvc3VyZX19Ojp7e2Nsb3N1cmV9fTo6aDAwMGRlMjJlNzQ2MWVlYTDGA2djb3JlOjpw\
dHI6OmRyb3BfaW5fcGxhY2U8Y29yZTo6b3B0aW9uOjpPcHRpb248c2VyZGVfd2FzbV9iaW5kZ2VuOj\
pkZTo6RGVzZXJpYWxpemVyPj46Omg2NWFmMzYwNjViMTQ0MmRmxwMyPCZUIGFzIGNvcmU6OmZtdDo6\
RGlzcGxheT46OmZtdDo6aDg4OTAxMzBjMmJmNjYwMDDIA2Zjb3JlOjpwdHI6OmRyb3BfaW5fcGxhY2\
U8YWxsb2M6OmJveGVkOjpCb3g8c2VyZGU6Ol9fcHJpdmF0ZTo6ZGU6OmNvbnRlbnQ6OkNvbnRlbnQ+\
Pjo6aGM2NDY0OWI3MTE0MzU2MmXJA3xjb3JlOjpwdHI6OmRyb3BfaW5fcGxhY2U8KHNlcmRlOjpfX3\
ByaXZhdGU6OmRlOjpjb250ZW50OjpDb250ZW50LHNlcmRlOjpfX3ByaXZhdGU6OmRlOjpjb250ZW50\
OjpDb250ZW50KT46OmhjYjlmZTJlMjkwNWYxMzliygM6YWxsb2M6OnZlYzo6VmVjPFQsQT46OmV4dG\
VuZF9mcm9tX3NsaWNlOjpoOTcyZTc5NjMwNTg5YTQ1YssDMmNvcmU6OmVycm9yOjpFcnJvcjo6ZGVz\
Y3JpcHRpb246Omg0NzZiZDJkNWUyMGY3NGZjzAMuY29yZTo6ZXJyb3I6OkVycm9yOjp0eXBlX2lkOj\
poMTdkMWEwNTQ0ZjQzNGJjNs0DLmNvcmU6OmVycm9yOjpFcnJvcjo6dHlwZV9pZDo6aGE3YjQ2ODQ1\
MjViZjVlMDTOAy5hbnlob3c6OmVycm9yOjpvYmplY3RfYm94ZWQ6OmhlODI0ZDhlZTZkMTZiNzQ5zw\
M6PCZtdXQgVyBhcyBjb3JlOjpmbXQ6OldyaXRlPjo6d3JpdGVfc3RyOjpoYjg0YWJhNzg1ZjJjMGE4\
ZtADOmFsbG9jOjp2ZWM6OlZlYzxULEE+OjpleHRlbmRfZnJvbV9zbGljZTo6aGU4ODMxMzczZTRkZT\
YxNDTRAzs8Jm11dCBXIGFzIGNvcmU6OmZtdDo6V3JpdGU+Ojp3cml0ZV9jaGFyOjpoNWY2NDhiZmVi\
Zjc3OGRjYdIDMjwmVCBhcyBjb3JlOjpmbXQ6OkRpc3BsYXk+OjpmbXQ6OmhlOGE2MzVkYzc2OGFiMz\
Zl0wNNPHZ0ZTo6VnRVdGY4UmVjZWl2ZXI8UD4gYXMgdXRmOHBhcnNlOjpSZWNlaXZlcj46OmNvZGVw\
b2ludDo6aDBjM2IyNmU4YmNkOGNjMWTUAzE8VCBhcyBjb3JlOjphbnk6OkFueT46OnR5cGVfaWQ6Om\
gzNTA5OWNjMDRlMzMxMDlk1QMuY29yZTo6ZXJyb3I6OkVycm9yOjp0eXBlX2lkOjpoNDFlMjliNWE3\
YmQ3ZGE0OdYDLmNvcmU6OmVycm9yOjpFcnJvcjo6dHlwZV9pZDo6aGY3ODcwZTY0NmVhMzYwYzDXAy\
1hbnlob3c6OmVycm9yOjpvYmplY3RfZHJvcDo6aDI2N2IwM2RjNzc0Mjc3OTPYAy5hbnlob3c6OmVy\
cm9yOjpvYmplY3RfYm94ZWQ6Omg0ODQ5ZDJjNTNiOWMyYmQ22QNFPGFsbG9jOjpzdHJpbmc6OlN0cm\
luZyBhcyBjb3JlOjpmbXQ6OkRpc3BsYXk+OjpmbXQ6Omg2ZjNkMzQwYTViZWE3NmUx2gMxPFQgYXMg\
Y29yZTo6YW55OjpBbnk+Ojp0eXBlX2lkOjpoYWU0MTkzNzUwYTE2NzE1NdsDZjxzdGQ6OnBhbmlja2\
luZzo6YmVnaW5fcGFuaWNfaGFuZGxlcjo6U3RyUGFuaWNQYXlsb2FkIGFzIGNvcmU6OnBhbmljOjpC\
b3hNZVVwPjo6Z2V0OjpoOWVhZjUzZWE5YTUyOWFhONwDMTxUIGFzIGNvcmU6OmFueTo6QW55Pjo6dH\
lwZV9pZDo6aGJiYmVmYjBkMDExYTlkZjXdAxRfX3diaW5kZ2VuX2V4bl9zdG9yZd4DD19fd2JpbmRn\
ZW5fZnJlZd8DkQFjb3JlOjpwdHI6OmRyb3BfaW5fcGxhY2U8c3RkOjpzeW5jOjpwb2lzb246OlBvaX\
NvbkVycm9yPHN0ZDo6c3luYzo6bXV0ZXg6Ok11dGV4R3VhcmQ8Y29uc29sZV9zdGF0aWNfdGV4dDo6\
Q29uc29sZVN0YXRpY1RleHQ+Pj46OmgxNTk5N2JiNmRjM2E2YWRk4ANJPGFsbG9jOjpzdHJpbmc6Ol\
N0cmluZyBhcyBjb3JlOjpmbXQ6OldyaXRlPjo6d3JpdGVfc3RyOjpoNTRlZGE3NWM3YWJlM2UyNOED\
TmNvcmU6OmZtdDo6bnVtOjppbXA6OjxpbXBsIGNvcmU6OmZtdDo6RGlzcGxheSBmb3IgdTMyPjo6Zm\
10OjpoN2Y1MjZhNGIyZjMyZjc0M+IDOjwmbXV0IFcgYXMgY29yZTo6Zm10OjpXcml0ZT46OndyaXRl\
X3N0cjo6aGRiMDU2YTQ5YWQwZmRjZjDjA0w8YWxsb2M6OnN0cmluZzo6U3RyaW5nIGFzIGNvcmU6Om\
ZtdDo6V3JpdGU+Ojp3cml0ZV9zdHI6Omg1NGVkYTc1YzdhYmUzZTI0LjQ55ANCY29yZTo6cHRyOjpk\
cm9wX2luX3BsYWNlPGFsbG9jOjpzdHJpbmc6OlN0cmluZz46OmgyNTk4ODU4NmM3YjFjOTdm5QNYPG\
FsbG9jOjp2ZWM6OmludG9faXRlcjo6SW50b0l0ZXI8VCxBPiBhcyBjb3JlOjpvcHM6OmRyb3A6OkRy\
b3A+Ojpkcm9wOjpoMmI0MzMyMjdlNDNiODRhNOYDOWNvcmU6Om9wczo6ZnVuY3Rpb246OkZuT25jZT\
o6Y2FsbF9vbmNlOjpoNzc3NDg3NzA4MGYzZjlmNecDOjwmbXV0IFcgYXMgY29yZTo6Zm10OjpXcml0\
ZT46OndyaXRlX3N0cjo6aDhmMDAxOTM5MzE4YTcwZTboA05jb3JlOjpmbXQ6Om51bTo6aW1wOjo8aW\
1wbCBjb3JlOjpmbXQ6OkRpc3BsYXkgZm9yIHU2ND46OmZtdDo6aGMxNjI4MThkMDBhNjcxYzbpAx9f\
X3diaW5kZ2VuX2FkZF90b19zdGFja19wb2ludGVy6gMwPCZUIGFzIGNvcmU6OmZtdDo6RGVidWc+Oj\
pmbXQ6Omg0Mzk5ZDg1MDFmMmQzZmIz6wM1c2VyZGVfd2FzbV9iaW5kZ2VuOjpPYmplY3RFeHQ6OnNl\
dDo6aGNlYzAxYmQ0NTBhNmMwOGTsAypqc19zeXM6OkFycmF5Ojppc19hcnJheTo6aGNkZjIwMjAxZG\
JmNDcyYmTtAzJjb3JlOjpmbXQ6OkZvcm1hdHRlcjo6d3JpdGVfZm10OjpoZDlkZDE0ZDZkYzgwMjkz\
OO4DOjwmbXV0IFcgYXMgY29yZTo6Zm10OjpXcml0ZT46OndyaXRlX2ZtdDo6aGZlYWZlNTU2YzE2OT\
E2MTnvAzo8Jm11dCBXIGFzIGNvcmU6OmZtdDo6V3JpdGU+Ojp3cml0ZV9mbXQ6Omg5OTMwNTI4OTg1\
Zjc3MmYx8ANkY29yZTo6cHRyOjpkcm9wX2luX3BsYWNlPGFueWhvdzo6ZXJyb3I6OkVycm9ySW1wbD\
xtb25jaDo6UGFyc2VFcnJvckZhaWx1cmVFcnJvcj4+OjpoNThlMDNiNjYxYjA4Yjc4OPEDNXdhc21f\
YmluZGdlbjo6SnNWYWx1ZTo6aXNfZnVuY3Rpb246Omg1OTg2OTMxNjgwZjUxZTQ08gMqd2FzbV9iaW\
5kZ2VuOjp0aHJvd19zdHI6Omg5NDg4MDQyMDM2ZDM2Y2Qw8wMwPCZUIGFzIGNvcmU6OmZtdDo6RGVi\
dWc+OjpmbXQ6OmhmZGZlNGFjMmY5ZGI4NGJh9AMyPCZUIGFzIGNvcmU6OmZtdDo6RGlzcGxheT46Om\
ZtdDo6aDgzMmUxMTYzZDM4M2NiZDf1AzA8JlQgYXMgY29yZTo6Zm10OjpEZWJ1Zz46OmZtdDo6aGE4\
NGFjZDQwZTE4MmRjZGL2AwZtZW1zZXT3AwZtZW1jcHn4AwdtZW1tb3Zl+QMGbWVtY21w+gNBc3RkOj\
pwYW5pY2tpbmc6OnBhbmljX2NvdW50Ojppc196ZXJvX3Nsb3dfcGF0aDo6aDljMTM3MzM0ZTZiYmVm\
OWb7A01jb3JlOjpwdHI6OmRyb3BfaW5fcGxhY2U8c2VyZGVfd2FzbV9iaW5kZ2VuOjplcnJvcjo6RX\
Jyb3I+OjpoZmUzN2UzYzI2M2Q1ZWYyNvwDSDxhbGxvYzo6dmVjOjpWZWM8VCxBPiBhcyBjb3JlOjpv\
cHM6OmRyb3A6OkRyb3A+Ojpkcm9wOjpoNmQ1MDM5ZTc5MTM4NjNkYv0DLGNvcmU6OmVycm9yOjpFcn\
Jvcjo6Y2F1c2U6Omg2NGQwMzc1YWQ4YWQzYmRk/gNJPGFueWhvdzo6ZXJyb3I6OkVycm9ySW1wbDxF\
PiBhcyBjb3JlOjpmbXQ6OkRlYnVnPjo6Zm10OjpoNzIxYjNiN2YwNzM5MTEyM/8DUDxhbnlob3c6On\
dyYXBwZXI6Ok1lc3NhZ2VFcnJvcjxNPiBhcyBjb3JlOjpmbXQ6OkRpc3BsYXk+OjpmbXQ6OmhiZTEx\
M2UwODk2MWRhMjkzgARJPGFueWhvdzo6ZXJyb3I6OkVycm9ySW1wbDxFPiBhcyBjb3JlOjpmbXQ6Ok\
RlYnVnPjo6Zm10OjpoNmExOWIyYWZlNGJlZmVmYYEEJWpzX3N5czo6QXJyYXk6OmdldDo6aGMwZjgy\
NzczN2ZmYWJlM2KCBElzdGQ6OnN5c19jb21tb246OmJhY2t0cmFjZTo6X19ydXN0X2VuZF9zaG9ydF\
9iYWNrdHJhY2U6Omg5OGFjNjFhNmFiYmZmN2U5gwQtYW55aG93OjplcnJvcjo6b2JqZWN0X2Ryb3A6\
Omg0NjBiZTQ5YTQzMzE1MDRjhAQzYW55aG93OjplcnJvcjo6b2JqZWN0X2Ryb3BfZnJvbnQ6OmgxYj\
lhYjFjMWUyYTM1N2Y1hQQtanNfc3lzOjpVaW50OEFycmF5OjpsZW5ndGg6Omg0NWFkZDcxZjdiY2U5\
ZmMzhgQKcnVzdF9wYW5pY4cEgwFjb3JlOjpwdHI6OmRyb3BfaW5fcGxhY2U8c2VyZGU6OmRlOjppbX\
Bsczo6PGltcGwgc2VyZGU6OmRlOjpEZXNlcmlhbGl6ZSBmb3IgdTE2Pjo6ZGVzZXJpYWxpemU6OlBy\
aW1pdGl2ZVZpc2l0b3I+OjpoNDRhODRhODliNjA0ZDhkNIgEMmNvcmU6OnB0cjo6ZHJvcF9pbl9wbG\
FjZTwmYm9vbD46Omg5ZGNjMjM4YmIwNzczMmFiiQQuY29yZTo6ZXJyb3I6OkVycm9yOjpwcm92aWRl\
OjpoNTJiOGViZGYwODNiODFhN4oEUGNvcmU6OnB0cjo6ZHJvcF9pbl9wbGFjZTxhcnJheXZlYzo6ZX\
Jyb3JzOjpDYXBhY2l0eUVycm9yPHU4Pj46Omg5ZDgwOGM5Mzc3NTE0ZjAyiwQvY29yZTo6cHRyOjpk\
cm9wX2luX3BsYWNlPCgpPjo6aDhiMjEwZjViNjljMzM4MjiMBGljb3JlOjpwdHI6OmRyb3BfaW5fcG\
xhY2U8Jm11dCBzdGQ6OmlvOjpXcml0ZTo6d3JpdGVfZm10OjpBZGFwdGVyPGFsbG9jOjp2ZWM6OlZl\
Yzx1OD4+Pjo6aGU3MDZhMTE5NjAwZDVjYTgAbwlwcm9kdWNlcnMCCGxhbmd1YWdlAQRSdXN0AAxwcm\
9jZXNzZWQtYnkDBXJ1c3RjHTEuNzMuMCAoY2M2NmFkNDY4IDIwMjMtMTAtMDMpBndhbHJ1cwYwLjIw\
LjMMd2FzbS1iaW5kZ2VuBjAuMi45MAAsD3RhcmdldF9mZWF0dXJlcwIrD211dGFibGUtZ2xvYmFscy\
sIc2lnbi1leHQ=\
    ");
    const wasmModule = new WebAssembly.Module(wasmBytes);
    return new WebAssembly.Instance(wasmModule, imports);
}
function base64decode(b64) {
    const binString = atob(b64);
    const size = binString.length;
    const bytes = new Uint8Array(size);
    for(let i = 0; i < size; i++){
        bytes[i] = binString.charCodeAt(i);
    }
    return bytes;
}
const wasmInstance = instantiate();
const encoder = new TextEncoder();
var LoggerRefreshItemKind;
const decoder = new TextDecoder();
var Keys;
(function(Keys) {
    Keys[Keys["Up"] = 0] = "Up";
    Keys[Keys["Down"] = 1] = "Down";
    Keys[Keys["Left"] = 2] = "Left";
    Keys[Keys["Right"] = 3] = "Right";
    Keys[Keys["Enter"] = 4] = "Enter";
    Keys[Keys["Space"] = 5] = "Space";
    Keys[Keys["Backspace"] = 6] = "Backspace";
})(Keys || (Keys = {}));
async function* readKeys() {
    const { strip_ansi_codes } = wasmInstance;
    while(true){
        const buf = new Uint8Array(8);
        const byteCount = await Deno.stdin.read(buf);
        if (byteCount == null) {
            break;
        }
        if (byteCount === 3) {
            if (buf[0] === 27 && buf[1] === 91) {
                if (buf[2] === 65) {
                    yield Keys.Up;
                    continue;
                } else if (buf[2] === 66) {
                    yield Keys.Down;
                    continue;
                } else if (buf[2] === 67) {
                    yield Keys.Right;
                    continue;
                } else if (buf[2] === 68) {
                    yield Keys.Left;
                    continue;
                }
            }
        } else if (byteCount === 1) {
            if (buf[0] === 3) {
                break;
            } else if (buf[0] === 13) {
                yield Keys.Enter;
                continue;
            } else if (buf[0] === 32) {
                yield Keys.Space;
                continue;
            } else if (buf[0] === 127) {
                yield Keys.Backspace;
                continue;
            }
        }
        const text = strip_ansi_codes(decoder.decode(buf.slice(0, byteCount ?? 0)));
        if (text.length > 0) {
            yield text;
        }
    }
}
function hideCursor() {
    Deno.stderr.writeSync(encoder.encode("\x1B[?25l"));
}
function showCursor() {
    Deno.stderr.writeSync(encoder.encode("\x1B[?25h"));
}
let isOutputTty = safeConsoleSize() != null && isTerminal(Deno.stderr);
function isTerminal(pipe) {
    if (typeof pipe.isTerminal === "function") {
        return pipe.isTerminal();
    } else if (pipe.rid != null && typeof Deno.isatty === "function") {
        return Deno.isatty(pipe.rid);
    } else {
        throw new Error("Unsupported pipe.");
    }
}
function resultOrExit(result) {
    if (result == null) {
        Deno.exit(130);
    } else {
        return result;
    }
}
(function(LoggerRefreshItemKind) {
    LoggerRefreshItemKind[LoggerRefreshItemKind["ProgressBars"] = 0] = "ProgressBars";
    LoggerRefreshItemKind[LoggerRefreshItemKind["Selection"] = 1] = "Selection";
})(LoggerRefreshItemKind || (LoggerRefreshItemKind = {}));
const refreshItems = {
    [LoggerRefreshItemKind.ProgressBars]: undefined,
    [LoggerRefreshItemKind.Selection]: undefined
};
function setItems(kind, items, size) {
    refreshItems[kind] = items;
    refresh(size);
}
const logger = {
    setItems,
    logOnce,
    logAboveStaticText
};
function createSelection(options) {
    if (!isOutputTty || !isTerminal(Deno.stdin)) {
        throw new Error(`Cannot prompt when not a tty. (Prompt: '${options.message}')`);
    }
    if (safeConsoleSize() == null) {
        throw new Error(`Cannot prompt when can't get console size. (Prompt: '${options.message}')`);
    }
    return ensureSingleSelection(async ()=>{
        logger.setItems(LoggerRefreshItemKind.Selection, options.render());
        for await (const key of readKeys()){
            const keyResult = options.onKey(key);
            if (keyResult != null) {
                const size = Deno.consoleSize();
                logger.setItems(LoggerRefreshItemKind.Selection, [], size);
                if (options.noClear) {
                    logger.logOnce(options.render(), size);
                }
                return keyResult;
            }
            logger.setItems(LoggerRefreshItemKind.Selection, options.render());
        }
        logger.setItems(LoggerRefreshItemKind.Selection, []);
        return undefined;
    });
}
let lastPromise = Promise.resolve();
function ensureSingleSelection(action) {
    const currentLastPromise = lastPromise;
    const currentPromise = (async ()=>{
        try {
            await currentLastPromise;
        } catch  {}
        hideCursor();
        try {
            Deno.stdin.setRaw(true);
            try {
                return await action();
            } finally{
                Deno.stdin.setRaw(false);
            }
        } finally{
            showCursor();
        }
    })();
    lastPromise = currentPromise;
    return currentPromise;
}
function safeConsoleSize() {
    try {
        return Deno.consoleSize();
    } catch  {
        return undefined;
    }
}
const staticText = {
    set (items, size) {
        if (items.length === 0) {
            return this.clear(size);
        }
        const { columns, rows } = size ?? Deno.consoleSize();
        const newText = wasmInstance.static_text_render_text(items, columns, rows);
        if (newText != null) {
            Deno.stderr.writeSync(encoder.encode(newText));
        }
    },
    outputItems (items, size) {
        const { columns, rows } = size ?? Deno.consoleSize();
        const newText = wasmInstance.static_text_render_once(items, columns, rows);
        if (newText != null) {
            Deno.stderr.writeSync(encoder.encode(newText + "\n"));
        }
    },
    clear (size) {
        const { columns, rows } = size ?? Deno.consoleSize();
        const newText = wasmInstance.static_text_clear_text(columns, rows);
        if (newText != null) {
            Deno.stderr.writeSync(encoder.encode(newText));
        }
    }
};
function refresh(size) {
    if (!isOutputTty) {
        return;
    }
    const items = Object.values(refreshItems).flatMap((items)=>items ?? []);
    staticText.set(items, size);
}
function logAboveStaticText(inner, providedSize) {
    if (!isOutputTty) {
        inner();
        return;
    }
    const size = providedSize ?? safeConsoleSize();
    if (size != null) {
        staticText.clear(size);
    }
    inner();
    refresh(size);
}
function logOnce(items, size) {
    logAboveStaticText(()=>{
        staticText.outputItems(items, size);
    }, size);
}
function confirm(optsOrMessage, options) {
    return maybeConfirm(optsOrMessage, options).then(resultOrExit);
}
function maybeConfirm(optsOrMessage, options) {
    const opts = typeof optsOrMessage === "string" ? {
        message: optsOrMessage,
        ...options
    } : optsOrMessage;
    return createSelection({
        message: opts.message,
        noClear: opts.noClear,
        ...innerConfirm(opts)
    });
}
function innerConfirm(opts) {
    const drawState = {
        title: opts.message,
        default: opts.default,
        inputText: "",
        hasCompleted: false
    };
    return {
        render: ()=>render(drawState),
        onKey: (key)=>{
            switch(key){
                case "Y":
                case "y":
                    drawState.inputText = "Y";
                    break;
                case "N":
                case "n":
                    drawState.inputText = "N";
                    break;
                case Keys.Backspace:
                    drawState.inputText = "";
                    break;
                case Keys.Enter:
                    if (drawState.inputText.length === 0) {
                        if (drawState.default == null) {
                            return undefined;
                        }
                        drawState.inputText = drawState.default ? "Y" : "N";
                    }
                    drawState.hasCompleted = true;
                    return drawState.inputText === "Y" ? true : drawState.inputText === "N" ? false : drawState.default;
            }
        }
    };
}
function render(state) {
    return [
        bold(blue(state.title)) + " " + (state.hasCompleted ? "" : state.default == null ? "(Y/N) " : state.default ? "(Y/n) " : "(y/N) ") + state.inputText + (state.hasCompleted ? "" : "\u2588")
    ];
}
function multiSelect(opts) {
    return maybeMultiSelect(opts).then(resultOrExit);
}
function maybeMultiSelect(opts) {
    if (opts.options.length === 0) {
        throw new Error(`You must provide at least one option. (Prompt: '${opts.message}')`);
    }
    return createSelection({
        message: opts.message,
        noClear: opts.noClear,
        ...innerMultiSelect(opts)
    });
}
function innerMultiSelect(opts) {
    const drawState = {
        title: opts.message,
        activeIndex: 0,
        items: opts.options.map((option)=>{
            if (typeof option === "string") {
                option = {
                    text: option
                };
            }
            return {
                selected: option.selected ?? false,
                text: option.text
            };
        }),
        hasCompleted: false
    };
    return {
        render: ()=>render1(drawState),
        onKey: (key)=>{
            switch(key){
                case Keys.Up:
                    if (drawState.activeIndex === 0) {
                        drawState.activeIndex = drawState.items.length - 1;
                    } else {
                        drawState.activeIndex--;
                    }
                    break;
                case Keys.Down:
                    drawState.activeIndex = (drawState.activeIndex + 1) % drawState.items.length;
                    break;
                case Keys.Space:
                    {
                        const item = drawState.items[drawState.activeIndex];
                        item.selected = !item.selected;
                        break;
                    }
                case Keys.Enter:
                    drawState.hasCompleted = true;
                    return drawState.items.map((value1, index)=>[
                            value1,
                            index
                        ]).filter(([value1])=>value1.selected).map(([, index])=>index);
            }
            return undefined;
        }
    };
}
function render1(state) {
    const items = [];
    items.push(bold(blue(state.title)));
    if (state.hasCompleted) {
        if (state.items.some((i)=>i.selected)) {
            for (const item of state.items){
                if (item.selected) {
                    items.push({
                        text: ` - ${item.text}`,
                        indent: 3
                    });
                }
            }
        } else {
            items.push(italic(" <None>"));
        }
    } else {
        for (const [i, item] of state.items.entries()){
            const prefix = i === state.activeIndex ? "> " : "  ";
            items.push({
                text: `${prefix}[${item.selected ? "x" : " "}] ${item.text}`,
                indent: 6
            });
        }
    }
    return items;
}
const units = [
    "B",
    "KiB",
    "MiB",
    "GiB",
    "TiB",
    "PiB",
    "EiB",
    "ZiB",
    "YiB"
];
function humanDownloadSize(byteCount, totalBytes) {
    const exponent = Math.min(units.length - 1, Math.floor(Math.log(totalBytes) / Math.log(1024)));
    const unit = units[exponent];
    const prettyBytes = (Math.floor(byteCount / Math.pow(1024, exponent) * 100) / 100).toFixed(exponent === 0 ? 0 : 2);
    return `${prettyBytes} ${unit}`;
}
const intervalMs = 60;
const progressBars = [];
let renderIntervalId;
function addProgressBar(render) {
    const pb = {
        render
    };
    progressBars.push(pb);
    if (renderIntervalId == null && isOutputTty) {
        renderIntervalId = setInterval(forceRender, intervalMs);
    }
    return pb;
}
function removeProgressBar(pb) {
    const index = progressBars.indexOf(pb);
    if (index === -1) {
        return false;
    }
    progressBars.splice(index, 1);
    if (progressBars.length === 0) {
        clearInterval(renderIntervalId);
        logger.setItems(LoggerRefreshItemKind.ProgressBars, []);
        renderIntervalId = undefined;
    }
    return true;
}
function forceRender() {
    if (!isShowingProgressBars()) {
        return;
    }
    const size = Deno.consoleSize();
    const items = progressBars.map((p)=>p.render(size)).flat();
    logger.setItems(LoggerRefreshItemKind.ProgressBars, items, size);
}
function isShowingProgressBars() {
    return isOutputTty && progressBars.length > 0;
}
class ProgressBar {
    #state;
    #pb;
    #withCount = 0;
    #onLog;
    #noClear;
    constructor(onLog, opts){
        if (arguments.length !== 2) {
            throw new Error("Invalid usage. Create the progress bar via `$.progress`.");
        }
        this.#onLog = onLog;
        this.#state = {
            message: opts.message,
            prefix: opts.prefix,
            length: opts.length,
            currentPos: 0,
            tickCount: 0,
            hasCompleted: false,
            kind: "raw"
        };
        this.#pb = addProgressBar((size)=>{
            this.#state.tickCount++;
            return renderProgressBar(this.#state, size);
        });
        this.#noClear = opts.noClear ?? false;
        this.#logIfNonInteractive();
    }
    prefix(prefix) {
        this.#state.prefix = prefix;
        if (prefix != null && prefix.length > 0) {
            this.#logIfNonInteractive();
        }
        return this;
    }
    message(message) {
        this.#state.message = message;
        if (message != null && message.length > 0) {
            this.#logIfNonInteractive();
        }
        return this;
    }
    kind(kind) {
        this.#state.kind = kind;
        return this;
    }
    #logIfNonInteractive() {
        if (isOutputTty) {
            return;
        }
        let text = this.#state.prefix ?? "";
        if (text.length > 0) {
            text += " ";
        }
        text += this.#state.message ?? "";
        if (text.length > 0) {
            this.#onLog(text);
        }
    }
    position(position) {
        this.#state.currentPos = position;
        return this;
    }
    increment(inc = 1) {
        this.#state.currentPos += inc;
        return this;
    }
    length(size) {
        this.#state.length = size;
        return this;
    }
    noClear(value1 = true) {
        this.#noClear = value1;
        return this;
    }
    forceRender() {
        return forceRender();
    }
    finish() {
        if (removeProgressBar(this.#pb)) {
            this.#state.hasCompleted = true;
            if (this.#noClear) {
                const text = renderProgressBar(this.#state, safeConsoleSize()).map((item)=>typeof item === "string" ? item : item.text).join("\n");
                this.#onLog(text);
            }
        }
    }
    with(action) {
        this.#withCount++;
        let wasAsync = false;
        try {
            const result = action();
            if (result instanceof Promise) {
                wasAsync = true;
                return result.finally(()=>{
                    this.#decrementWith();
                });
            } else {
                return result;
            }
        } finally{
            if (!wasAsync) {
                this.#decrementWith();
            }
        }
    }
    #decrementWith() {
        this.#withCount--;
        if (this.#withCount === 0) {
            this.finish();
        }
    }
}
const tickStrings = [
    "⠋",
    "⠙",
    "⠹",
    "⠸",
    "⠼",
    "⠴",
    "⠦",
    "⠧",
    "⠇",
    "⠏"
];
function renderProgressBar(state, size) {
    if (state.hasCompleted) {
        let text = "";
        if (state.prefix != null) {
            text += green(state.prefix);
        }
        if (state.message != null) {
            if (text.length > 0) {
                text += " ";
            }
            text += state.message;
        }
        return text.length > 0 ? [
            text
        ] : [];
    } else if (state.length == null || state.length === 0) {
        let text = green(tickStrings[Math.abs(state.tickCount) % tickStrings.length]);
        if (state.prefix != null) {
            text += ` ${green(state.prefix)}`;
        }
        if (state.message != null) {
            text += ` ${state.message}`;
        }
        return [
            text
        ];
    } else {
        let firstLine = "";
        if (state.prefix != null) {
            firstLine += green(state.prefix);
        }
        if (state.message != null) {
            if (firstLine.length > 0) {
                firstLine += " ";
            }
            firstLine += state.message;
        }
        const percent = Math.min(state.currentPos / state.length, 1);
        const currentPosText = state.kind === "bytes" ? humanDownloadSize(state.currentPos, state.length) : state.currentPos.toString();
        const lengthText = state.kind === "bytes" ? humanDownloadSize(state.length, state.length) : state.length.toString();
        const maxWidth = size == null ? 75 : Math.max(10, Math.min(75, size.columns - 5));
        const sameLineTextWidth = 6 + lengthText.length * 2 + state.length.toString().length * 2;
        const totalBars = Math.max(1, maxWidth - sameLineTextWidth);
        const completedBars = Math.floor(totalBars * percent);
        let secondLine = "";
        secondLine += "[";
        if (completedBars != totalBars) {
            if (completedBars > 0) {
                secondLine += cyan("#".repeat(completedBars - 1) + ">");
            }
            secondLine += blue("-".repeat(totalBars - completedBars));
        } else {
            secondLine += cyan("#".repeat(completedBars));
        }
        secondLine += `] (${currentPosText}/${lengthText})`;
        const result = [];
        if (firstLine.length > 0) {
            result.push(firstLine);
        }
        result.push(secondLine);
        return result;
    }
}
const defaultMask = {
    char: "*",
    lastVisible: false
};
function prompt(optsOrMessage, options) {
    return maybePrompt(optsOrMessage, options).then(resultOrExit);
}
function maybePrompt(optsOrMessage, options) {
    const opts = typeof optsOrMessage === "string" ? {
        message: optsOrMessage,
        ...options
    } : optsOrMessage;
    return createSelection({
        message: opts.message,
        noClear: opts.noClear,
        ...innerPrompt(opts)
    });
}
function innerPrompt(opts) {
    let mask = opts.mask ?? false;
    if (mask && typeof mask === "boolean") {
        mask = defaultMask;
    }
    const drawState = {
        title: opts.message,
        inputText: opts.default ?? "",
        mask,
        hasCompleted: false
    };
    return {
        render: ()=>render2(drawState),
        onKey: (key)=>{
            if (typeof key === "string") {
                drawState.inputText += key;
            } else {
                switch(key){
                    case Keys.Space:
                        drawState.inputText += " ";
                        break;
                    case Keys.Backspace:
                        drawState.inputText = drawState.inputText.slice(0, -1);
                        break;
                    case Keys.Enter:
                        drawState.hasCompleted = true;
                        return drawState.inputText;
                }
            }
            return undefined;
        }
    };
}
function render2(state) {
    let { inputText } = state;
    if (state.mask) {
        const __char = state.mask.char ?? defaultMask.char;
        const lastVisible = state.mask.lastVisible ?? defaultMask.lastVisible;
        const shouldShowLast = lastVisible && !state.hasCompleted;
        const safeLengthMinusOne = Math.max(0, inputText.length - 1);
        const masked = __char.repeat(shouldShowLast ? safeLengthMinusOne : inputText.length);
        const unmasked = shouldShowLast ? inputText.slice(safeLengthMinusOne) : "";
        inputText = `${masked}${unmasked}`;
    }
    return [
        bold(blue(state.title)) + " " + inputText + (state.hasCompleted ? "" : "\u2588")
    ];
}
function select(opts) {
    return maybeSelect(opts).then(resultOrExit);
}
function maybeSelect(opts) {
    if (opts.options.length <= 1) {
        throw new Error(`You must provide at least two options. (Prompt: '${opts.message}')`);
    }
    return createSelection({
        message: opts.message,
        noClear: opts.noClear,
        ...innerSelect(opts)
    });
}
function innerSelect(opts) {
    const drawState = {
        title: opts.message,
        activeIndex: (opts.initialIndex ?? 0) % opts.options.length,
        items: opts.options,
        hasCompleted: false
    };
    return {
        render: ()=>render3(drawState),
        onKey: (key)=>{
            switch(key){
                case Keys.Up:
                    if (drawState.activeIndex === 0) {
                        drawState.activeIndex = drawState.items.length - 1;
                    } else {
                        drawState.activeIndex--;
                    }
                    break;
                case Keys.Down:
                    drawState.activeIndex = (drawState.activeIndex + 1) % drawState.items.length;
                    break;
                case Keys.Enter:
                    drawState.hasCompleted = true;
                    return drawState.activeIndex;
            }
        }
    };
}
function render3(state) {
    const items = [];
    items.push(bold(blue(state.title)));
    if (state.hasCompleted) {
        items.push({
            text: ` - ${state.items[state.activeIndex]}`,
            indent: 3
        });
    } else {
        for (const [i, text] of state.items.entries()){
            const prefix = i === state.activeIndex ? "> " : "  ";
            items.push({
                text: `${prefix}${text}`,
                indent: 4
            });
        }
    }
    return items;
}
const symbols = {
    writable: Symbol.for("dax.writableStream"),
    readable: Symbol.for("dax.readableStream")
};
class TimeoutError extends Error {
    constructor(message){
        super(message);
    }
    get name() {
        return "TimeoutError";
    }
}
function formatMillis(ms) {
    if (ms < 1000) {
        return `${formatValue(ms)} millisecond${ms === 1 ? "" : "s"}`;
    } else if (ms < 60 * 1000) {
        const s = ms / 1000;
        return `${formatValue(s)} ${pluralize("second", s)}`;
    } else {
        const mins = ms / 60 / 1000;
        return `${formatValue(mins)} ${pluralize("minute", mins)}`;
    }
    function formatValue(value1) {
        const text = value1.toFixed(2);
        if (text.endsWith(".00")) {
            return value1.toFixed(0);
        } else if (text.endsWith("0")) {
            return value1.toFixed(1);
        } else {
            return text;
        }
    }
    function pluralize(text, value1) {
        const suffix = value1 === 1 ? "" : "s";
        return text + suffix;
    }
}
function delayToIterator(delay) {
    if (typeof delay !== "number" && typeof delay !== "string") {
        return delay;
    }
    const ms = delayToMs(delay);
    return {
        next () {
            return ms;
        }
    };
}
function delayToMs(delay) {
    if (typeof delay === "number") {
        return delay;
    } else if (typeof delay === "string") {
        const msMatch = delay.match(/^([0-9]+)ms$/);
        if (msMatch != null) {
            return parseInt(msMatch[1], 10);
        }
        const secondsMatch = delay.match(/^([0-9]+\.?[0-9]*)s$/);
        if (secondsMatch != null) {
            return Math.round(parseFloat(secondsMatch[1]) * 1000);
        }
        const minutesMatch = delay.match(/^([0-9]+\.?[0-9]*)m$/);
        if (minutesMatch != null) {
            return Math.round(parseFloat(minutesMatch[1]) * 1000 * 60);
        }
        const minutesSecondsMatch = delay.match(/^([0-9]+\.?[0-9]*)m([0-9]+\.?[0-9]*)s$/);
        if (minutesSecondsMatch != null) {
            return Math.round(parseFloat(minutesSecondsMatch[1]) * 1000 * 60 + parseFloat(minutesSecondsMatch[2]) * 1000);
        }
        const hoursMatch = delay.match(/^([0-9]+\.?[0-9]*)h$/);
        if (hoursMatch != null) {
            return Math.round(parseFloat(hoursMatch[1]) * 1000 * 60 * 60);
        }
        const hoursMinutesMatch = delay.match(/^([0-9]+\.?[0-9]*)h([0-9]+\.?[0-9]*)m$/);
        if (hoursMinutesMatch != null) {
            return Math.round(parseFloat(hoursMinutesMatch[1]) * 1000 * 60 * 60 + parseFloat(hoursMinutesMatch[2]) * 1000 * 60);
        }
        const hoursMinutesSecondsMatch = delay.match(/^([0-9]+\.?[0-9]*)h([0-9]+\.?[0-9]*)m([0-9]+\.?[0-9]*)s$/);
        if (hoursMinutesSecondsMatch != null) {
            return Math.round(parseFloat(hoursMinutesSecondsMatch[1]) * 1000 * 60 * 60 + parseFloat(hoursMinutesSecondsMatch[2]) * 1000 * 60 + parseFloat(hoursMinutesSecondsMatch[3]) * 1000);
        }
    }
    throw new Error(`Unknown delay value: ${delay}`);
}
function filterEmptyRecordValues(record) {
    const result = {};
    for (const [key, value1] of Object.entries(record)){
        if (value1 != null) {
            result[key] = value1;
        }
    }
    return result;
}
function resolvePath(cwd, arg) {
    return resolve2(isAbsolute2(arg) ? arg : join2(cwd, arg));
}
class Box {
    value;
    constructor(value1){
        this.value = value1;
    }
}
class TreeBox {
    #value;
    constructor(value1){
        this.#value = value1;
    }
    getValue() {
        let tree = this;
        while(tree.#value instanceof TreeBox){
            tree = tree.#value;
        }
        return tree.#value;
    }
    setValue(value1) {
        this.#value = value1;
    }
    createChild() {
        return new TreeBox(this);
    }
}
class LoggerTreeBox extends TreeBox {
    getValue() {
        const innerValue = super.getValue();
        return (...args)=>{
            return logger.logAboveStaticText(()=>{
                innerValue(...args);
            });
        };
    }
}
async function safeLstat(path) {
    try {
        return await Deno.lstat(path);
    } catch (err) {
        if (err instanceof Deno.errors.NotFound) {
            return undefined;
        } else {
            throw err;
        }
    }
}
function getFileNameFromUrl(url) {
    const parsedUrl = url instanceof URL ? url : new URL(url);
    const fileName = parsedUrl.pathname.split("/").at(-1);
    return fileName?.length === 0 ? undefined : fileName;
}
async function getExecutableShebangFromPath(path) {
    try {
        const file = await Deno.open(path, {
            read: true
        });
        try {
            return await getExecutableShebang(file);
        } finally{
            try {
                file.close();
            } catch  {}
        }
    } catch (err) {
        if (err instanceof Deno.errors.NotFound) {
            return false;
        }
        throw err;
    }
}
const decoder1 = new TextDecoder();
async function getExecutableShebang(reader) {
    const text = "#!/usr/bin/env ";
    const buffer = new Uint8Array(text.length);
    const bytesReadCount = await reader.read(buffer);
    if (bytesReadCount !== text.length || decoder1.decode(buffer) !== text) {
        return undefined;
    }
    const bufReader = new BufReader(reader);
    const line = await bufReader.readLine();
    if (line == null) {
        return undefined;
    }
    const result = decoder1.decode(line.line).trim();
    const dashS = "-S ";
    if (result.startsWith(dashS)) {
        return {
            stringSplit: true,
            command: result.slice(dashS.length)
        };
    } else {
        return {
            stringSplit: false,
            command: result
        };
    }
}
const nodeENotEmpty = "ENOTEMPTY: ";
const nodeENOENT = "ENOENT: ";
function errorToString(err) {
    let message;
    if (err instanceof Error) {
        message = err.message;
    } else {
        message = String(err);
    }
    if (message.startsWith(nodeENotEmpty)) {
        return message.slice(nodeENotEmpty.length);
    } else if (message.startsWith(nodeENOENT)) {
        return message.slice(nodeENOENT.length);
    } else {
        return message;
    }
}
function parseArgKinds(flags) {
    const result = [];
    let had_dash_dash = false;
    for (const arg of flags){
        if (had_dash_dash) {
            result.push({
                arg,
                kind: "Arg"
            });
        } else if (arg == "-") {
            result.push({
                arg: "-",
                kind: "Arg"
            });
        } else if (arg == "--") {
            had_dash_dash = true;
        } else if (arg.startsWith("--")) {
            result.push({
                arg: arg.replace(/^--/, ""),
                kind: "LongFlag"
            });
        } else if (arg.startsWith("-")) {
            const flags = arg.replace(/^-/, "");
            if (!isNaN(parseFloat(flags))) {
                result.push({
                    arg,
                    kind: "Arg"
                });
            } else {
                for (const c of flags){
                    result.push({
                        arg: c,
                        kind: "ShortFlag"
                    });
                }
            }
        } else {
            result.push({
                arg,
                kind: "Arg"
            });
        }
    }
    return result;
}
function bailUnsupported(arg) {
    switch(arg.kind){
        case "Arg":
            throw Error(`unsupported argument: ${arg.arg}`);
        case "ShortFlag":
            throw Error(`unsupported flag: -${arg.arg}`);
        case "LongFlag":
            throw Error(`unsupported flag: --${arg.arg}`);
    }
}
async function catCommand(context) {
    try {
        const code = await executeCat(context);
        return {
            code
        };
    } catch (err) {
        return context.error(`cat: ${errorToString(err)}`);
    }
}
async function executeCat(context) {
    const flags = parseCatArgs(context.args);
    let exitCode = 0;
    const buf = new Uint8Array(1024);
    for (const path of flags.paths){
        if (path === "-") {
            if (typeof context.stdin === "object") {
                while(!context.signal.aborted){
                    const size = await context.stdin.read(buf);
                    if (!size || size === 0) {
                        break;
                    } else {
                        const maybePromise = context.stdout.write(buf.slice(0, size));
                        if (maybePromise instanceof Promise) {
                            await maybePromise;
                        }
                    }
                }
                exitCode = context.signal.abortedExitCode ?? 0;
            } else {
                context.stdin;
                throw new Error(`not supported. stdin was '${context.stdin}'`);
            }
        } else {
            let file;
            try {
                file = await Deno.open(resolvePath(context.cwd, path), {
                    read: true
                });
                while(!context.signal.aborted){
                    const size = file.readSync(buf);
                    if (!size || size === 0) {
                        break;
                    } else {
                        const maybePromise = context.stdout.write(buf.slice(0, size));
                        if (maybePromise instanceof Promise) {
                            await maybePromise;
                        }
                    }
                }
                exitCode = context.signal.abortedExitCode ?? 0;
            } catch (err) {
                const maybePromise = context.stderr.writeLine(`cat ${path}: ${errorToString(err)}`);
                if (maybePromise instanceof Promise) {
                    await maybePromise;
                }
                exitCode = 1;
            } finally{
                file?.close();
            }
        }
    }
    return exitCode;
}
function parseCatArgs(args) {
    const paths = [];
    for (const arg of parseArgKinds(args)){
        if (arg.kind === "Arg") {
            paths.push(arg.arg);
        } else {
            bailUnsupported(arg);
        }
    }
    if (paths.length === 0) {
        paths.push("-");
    }
    return {
        paths
    };
}
async function cdCommand(context) {
    try {
        const dir = await executeCd(context.cwd, context.args);
        return {
            code: 0,
            changes: [
                {
                    kind: "cd",
                    dir
                }
            ]
        };
    } catch (err) {
        return context.error(`cd: ${errorToString(err)}`);
    }
}
async function executeCd(cwd, args) {
    const arg = parseArgs(args);
    const result = resolvePath(cwd, arg);
    if (!await isDirectory(result)) {
        throw new Error(`${result}: Not a directory`);
    }
    return result;
}
async function isDirectory(path) {
    try {
        const info = await Deno.stat(path);
        return info.isDirectory;
    } catch (err) {
        if (err instanceof Deno.errors.NotFound) {
            return false;
        } else {
            throw err;
        }
    }
}
function parseArgs(args) {
    if (args.length === 0) {
        throw new Error("expected at least 1 argument");
    } else if (args.length > 1) {
        throw new Error("too many arguments");
    } else {
        return args[0];
    }
}
async function cpCommand(context) {
    try {
        await executeCp(context.cwd, context.args);
        return {
            code: 0
        };
    } catch (err) {
        return context.error(`cp: ${errorToString(err)}`);
    }
}
async function executeCp(cwd, args) {
    const flags = await parseCpArgs(cwd, args);
    for (const { from, to } of flags.operations){
        await doCopyOperation(flags, from, to);
    }
}
async function parseCpArgs(cwd, args) {
    const paths = [];
    let recursive = false;
    for (const arg of parseArgKinds(args)){
        if (arg.kind === "Arg") paths.push(arg.arg);
        else if (arg.arg === "recursive" && arg.kind === "LongFlag" || arg.arg === "r" && arg.kind == "ShortFlag" || arg.arg === "R" && arg.kind === "ShortFlag") {
            recursive = true;
        } else bailUnsupported(arg);
    }
    if (paths.length === 0) throw Error("missing file operand");
    else if (paths.length === 1) throw Error(`missing destination file operand after '${paths[0]}'`);
    return {
        recursive,
        operations: await getCopyAndMoveOperations(cwd, paths)
    };
}
async function doCopyOperation(flags, from, to) {
    const fromInfo = await safeLstat(from.path);
    if (fromInfo?.isDirectory) {
        if (flags.recursive) {
            const toInfo = await safeLstat(to.path);
            if (toInfo?.isFile) {
                throw Error("destination was a file");
            } else if (toInfo?.isSymlink) {
                throw Error("no support for copying to symlinks");
            } else if (fromInfo.isSymlink) {
                throw Error("no support for copying from symlinks");
            } else {
                await copyDirRecursively(from.path, to.path);
            }
        } else {
            throw Error("source was a directory; maybe specify -r");
        }
    } else {
        await Deno.copyFile(from.path, to.path);
    }
}
async function copyDirRecursively(from, to) {
    await Deno.mkdir(to, {
        recursive: true
    });
    const readDir = Deno.readDir(from);
    for await (const entry of readDir){
        const newFrom = join2(from, basename2(entry.name));
        const newTo = join2(to, basename2(entry.name));
        if (entry.isDirectory) {
            await copyDirRecursively(newFrom, newTo);
        } else if (entry.isFile) {
            await Deno.copyFile(newFrom, newTo);
        }
    }
}
async function mvCommand(context) {
    try {
        await executeMove(context.cwd, context.args);
        return {
            code: 0
        };
    } catch (err) {
        return context.error(`mv: ${errorToString(err)}`);
    }
}
async function executeMove(cwd, args) {
    const flags = await parseMvArgs(cwd, args);
    for (const { from, to } of flags.operations){
        await Deno.rename(from.path, to.path);
    }
}
async function parseMvArgs(cwd, args) {
    const paths = [];
    for (const arg of parseArgKinds(args)){
        if (arg.kind === "Arg") paths.push(arg.arg);
        else bailUnsupported(arg);
    }
    if (paths.length === 0) throw Error("missing operand");
    else if (paths.length === 1) throw Error(`missing destination file operand after '${paths[0]}'`);
    return {
        operations: await getCopyAndMoveOperations(cwd, paths)
    };
}
async function getCopyAndMoveOperations(cwd, paths) {
    const specified_destination = paths.splice(paths.length - 1, 1)[0];
    const destination = resolvePath(cwd, specified_destination);
    const fromArgs = paths;
    const operations = [];
    if (fromArgs.length > 1) {
        if (!await safeLstat(destination).then((p)=>p?.isDirectory)) {
            throw Error(`target '${specified_destination}' is not a directory`);
        }
        for (const from of fromArgs){
            const fromPath = resolvePath(cwd, from);
            const toPath = join2(destination, basename2(fromPath));
            operations.push({
                from: {
                    specified: from,
                    path: fromPath
                },
                to: {
                    specified: specified_destination,
                    path: toPath
                }
            });
        }
    } else {
        const fromPath = resolvePath(cwd, fromArgs[0]);
        const toPath = await safeLstat(destination).then((p)=>p?.isDirectory) ? calculateDestinationPath(destination, fromPath) : destination;
        operations.push({
            from: {
                specified: fromArgs[0],
                path: fromPath
            },
            to: {
                specified: specified_destination,
                path: toPath
            }
        });
    }
    return operations;
}
function calculateDestinationPath(destination, from) {
    return join2(destination, basename2(from));
}
function echoCommand(context) {
    try {
        const maybePromise = context.stdout.writeLine(context.args.join(" "));
        if (maybePromise instanceof Promise) {
            return maybePromise.then(()=>({
                    code: 0
                })).catch((err)=>handleFailure(context, err));
        } else {
            return {
                code: 0
            };
        }
    } catch (err) {
        return handleFailure(context, err);
    }
}
function handleFailure(context, err) {
    return context.error(`echo: ${errorToString(err)}`);
}
function exitCommand(context) {
    try {
        const code = parseArgs1(context.args);
        return {
            kind: "exit",
            code
        };
    } catch (err) {
        return context.error(2, `exit: ${errorToString(err)}`);
    }
}
function parseArgs1(args) {
    if (args.length === 0) return 1;
    if (args.length > 1) throw new Error("too many arguments");
    const exitCode = parseInt(args[0], 10);
    if (isNaN(exitCode)) throw new Error("numeric argument required.");
    if (exitCode < 0) {
        const code = -exitCode % 256;
        return 256 - code;
    }
    return exitCode % 256;
}
function exportCommand(context) {
    const changes = [];
    for (const arg of context.args){
        const equalsIndex = arg.indexOf("=");
        if (equalsIndex >= 0) {
            changes.push({
                kind: "envvar",
                name: arg.substring(0, equalsIndex),
                value: arg.substring(equalsIndex + 1)
            });
        }
    }
    return {
        code: 0,
        changes
    };
}
async function mkdirCommand(context) {
    try {
        await executeMkdir(context.cwd, context.args);
        return {
            code: 0
        };
    } catch (err) {
        return context.error(`mkdir: ${errorToString(err)}`);
    }
}
async function executeMkdir(cwd, args) {
    const flags = parseArgs2(args);
    for (const specifiedPath of flags.paths){
        const path = resolvePath(cwd, specifiedPath);
        const info = await safeLstat(path);
        if (info?.isFile || !flags.parents && info?.isDirectory) {
            throw Error(`cannot create directory '${specifiedPath}': File exists`);
        }
        if (flags.parents) {
            await Deno.mkdir(path, {
                recursive: true
            });
        } else {
            await Deno.mkdir(path);
        }
    }
}
function parseArgs2(args) {
    const result = {
        parents: false,
        paths: []
    };
    for (const arg of parseArgKinds(args)){
        if (arg.arg === "parents" && arg.kind === "LongFlag" || arg.arg === "p" && arg.kind == "ShortFlag") {
            result.parents = true;
        } else {
            if (arg.kind !== "Arg") bailUnsupported(arg);
            result.paths.push(arg.arg.trim());
        }
    }
    if (result.paths.length === 0) {
        throw Error("missing operand");
    }
    return result;
}
function printEnvCommand(context) {
    let args;
    if (Deno.build.os === "windows") {
        args = context.args.map((arg)=>arg.toUpperCase());
    } else {
        args = context.args;
    }
    try {
        const result = executePrintEnv(context.env, args);
        const code = args.some((arg)=>context.env[arg] === undefined) ? 1 : 0;
        const maybePromise = context.stdout.writeLine(result);
        if (maybePromise instanceof Promise) {
            return maybePromise.then(()=>({
                    code
                })).catch((err)=>handleError1(context, err));
        } else {
            return {
                code
            };
        }
    } catch (err) {
        return handleError1(context, err);
    }
}
function handleError1(context, err) {
    return context.error(`printenv: ${errorToString(err)}`);
}
function executePrintEnv(env, args) {
    const isWindows = Deno.build.os === "windows";
    if (args.length === 0) {
        return Object.entries(env).map(([key, val])=>`${isWindows ? key.toUpperCase() : key}=${val}`).join("\n");
    } else {
        if (isWindows) {
            args = args.map((arg)=>arg.toUpperCase());
        }
        return Object.entries(env).filter(([key])=>args.includes(key)).map(([_key, val])=>val).join("\n");
    }
}
function pwdCommand(context) {
    try {
        const output = executePwd(context.cwd, context.args);
        const maybePromise = context.stdout.writeLine(output);
        const result = {
            code: 0
        };
        if (maybePromise instanceof Promise) {
            return maybePromise.then(()=>result).catch((err)=>handleError2(context, err));
        } else {
            return result;
        }
    } catch (err) {
        return handleError2(context, err);
    }
}
function handleError2(context, err) {
    return context.error(`pwd: ${errorToString(err)}`);
}
function executePwd(cwd, args) {
    const flags = parseArgs3(args);
    if (flags.logical) {
        return resolve2(cwd);
    } else {
        return cwd;
    }
}
function parseArgs3(args) {
    let logical = false;
    for (const arg of parseArgKinds(args)){
        if (arg.arg === "L" && arg.kind === "ShortFlag") {
            logical = true;
        } else if (arg.arg === "P" && arg.kind == "ShortFlag") {} else if (arg.kind === "Arg") {} else {
            bailUnsupported(arg);
        }
    }
    return {
        logical
    };
}
async function rmCommand(context) {
    try {
        await executeRemove(context.cwd, context.args);
        return {
            code: 0
        };
    } catch (err) {
        return context.error(`rm: ${errorToString(err)}`);
    }
}
async function executeRemove(cwd, args) {
    const flags = parseArgs4(args);
    await Promise.all(flags.paths.map((specifiedPath)=>{
        if (specifiedPath.length === 0) {
            throw new Error("Bug in dax. Specified path should have not been empty.");
        }
        const path = resolvePath(cwd, specifiedPath);
        if (path === "/") {
            throw new Error("Cannot delete root directory. Maybe bug in dax? Please report this.");
        }
        return Deno.remove(path, {
            recursive: flags.recursive
        }).catch((err)=>{
            if (flags.force && err instanceof Deno.errors.NotFound) {
                return Promise.resolve();
            } else {
                return Promise.reject(err);
            }
        });
    }));
}
function parseArgs4(args) {
    const result = {
        recursive: false,
        force: false,
        dir: false,
        paths: []
    };
    for (const arg of parseArgKinds(args)){
        if (arg.arg === "recursive" && arg.kind === "LongFlag" || arg.arg === "r" && arg.kind == "ShortFlag" || arg.arg === "R" && arg.kind === "ShortFlag") {
            result.recursive = true;
        } else if (arg.arg == "dir" && arg.kind === "LongFlag" || arg.arg == "d" && arg.kind === "ShortFlag") {
            result.dir = true;
        } else if (arg.arg == "force" && arg.kind === "LongFlag" || arg.arg == "f" && arg.kind === "ShortFlag") {
            result.force = true;
        } else {
            if (arg.kind !== "Arg") bailUnsupported1(arg);
            result.paths.push(arg.arg.trim());
        }
    }
    if (result.paths.length === 0) {
        throw Error("missing operand");
    }
    return result;
}
function bailUnsupported1(arg) {
    switch(arg.kind){
        case "Arg":
            throw Error(`unsupported argument: ${arg.arg}`);
        case "ShortFlag":
            throw Error(`unsupported flag: -${arg.arg}`);
        case "LongFlag":
            throw Error(`unsupported flag: --${arg.arg}`);
    }
}
function getAbortedResult() {
    return {
        kind: "exit",
        code: 124
    };
}
async function sleepCommand(context) {
    try {
        const ms = parseArgs5(context.args);
        await new Promise((resolve)=>{
            const timeoutId = setTimeout(finish, ms);
            context.signal.addListener(signalListener);
            function signalListener(_signal) {
                if (context.signal.aborted) {
                    finish();
                }
            }
            function finish() {
                resolve();
                clearInterval(timeoutId);
                context.signal.removeListener(signalListener);
            }
        });
        if (context.signal.aborted) {
            return getAbortedResult();
        }
        return {
            code: 0
        };
    } catch (err) {
        return context.error(`sleep: ${errorToString(err)}`);
    }
}
function parseArgs5(args) {
    let totalTimeMs = 0;
    if (args.length === 0) {
        throw new Error("missing operand");
    }
    for (const arg of args){
        if (arg.startsWith("-")) {
            throw new Error(`unsupported: ${arg}`);
        }
        const value1 = parseFloat(arg);
        if (isNaN(value1)) {
            throw new Error(`error parsing argument '${arg}' to number.`);
        }
        totalTimeMs = value1 * 1000;
    }
    return totalTimeMs;
}
async function exists(path, options) {
    try {
        const stat = await Deno.stat(path);
        if (options && (options.isReadable || options.isDirectory || options.isFile)) {
            if (options.isDirectory && options.isFile) {
                throw new TypeError("ExistsOptions.options.isDirectory and ExistsOptions.options.isFile must not be true together.");
            }
            if (options.isDirectory && !stat.isDirectory || options.isFile && !stat.isFile) {
                return false;
            }
            if (options.isReadable) {
                if (stat.mode === null) {
                    return true;
                }
                if (Deno.uid() === stat.uid) {
                    return (stat.mode & 0o400) === 0o400;
                } else if (Deno.gid() === stat.gid) {
                    return (stat.mode & 0o040) === 0o040;
                }
                return (stat.mode & 0o004) === 0o004;
            }
        }
        return true;
    } catch (error) {
        if (error instanceof Deno.errors.NotFound) {
            return false;
        }
        if (error instanceof Deno.errors.PermissionDenied) {
            if ((await Deno.permissions.query({
                name: "read",
                path
            })).state === "granted") {
                return !options?.isReadable;
            }
        }
        throw error;
    }
}
function existsSync(path, options) {
    try {
        const stat = Deno.statSync(path);
        if (options && (options.isReadable || options.isDirectory || options.isFile)) {
            if (options.isDirectory && options.isFile) {
                throw new TypeError("ExistsOptions.options.isDirectory and ExistsOptions.options.isFile must not be true together.");
            }
            if (options.isDirectory && !stat.isDirectory || options.isFile && !stat.isFile) {
                return false;
            }
            if (options.isReadable) {
                if (stat.mode === null) {
                    return true;
                }
                if (Deno.uid() === stat.uid) {
                    return (stat.mode & 0o400) === 0o400;
                } else if (Deno.gid() === stat.gid) {
                    return (stat.mode & 0o040) === 0o040;
                }
                return (stat.mode & 0o004) === 0o004;
            }
        }
        return true;
    } catch (error) {
        if (error instanceof Deno.errors.NotFound) {
            return false;
        }
        if (error instanceof Deno.errors.PermissionDenied) {
            if (Deno.permissions.querySync({
                name: "read",
                path
            }).state === "granted") {
                return !options?.isReadable;
            }
        }
        throw error;
    }
}
async function testCommand(context) {
    try {
        const [testFlag, testPath] = parseArgs6(context.cwd, context.args);
        let result;
        switch(testFlag){
            case "-f":
                result = (await safeLstat(testPath))?.isFile ?? false;
                break;
            case "-d":
                result = (await safeLstat(testPath))?.isDirectory ?? false;
                break;
            case "-e":
                result = await exists(testPath);
                break;
            case "-s":
                result = ((await safeLstat(testPath))?.size ?? 0) > 0;
                break;
            case "-L":
                result = (await safeLstat(testPath))?.isSymlink ?? false;
                break;
            default:
                throw new Error("unsupported test type");
        }
        return {
            code: result ? 0 : 1
        };
    } catch (err) {
        return context.error(2, `test: ${errorToString(err)}`);
    }
}
function parseArgs6(cwd, args) {
    if (args.length !== 2) {
        throw new Error("expected 2 arguments");
    }
    if (args[0] == null || !args[0].startsWith("-")) {
        throw new Error("missing test type flag");
    }
    return [
        args[0],
        resolvePath(cwd, args[1])
    ];
}
async function touchCommand(context) {
    try {
        await executetouch(context.args);
        return {
            code: 0
        };
    } catch (err) {
        return context.error(`touch: ${errorToString(err)}`);
    }
}
async function executetouch(args) {
    const flags = parseArgs7(args);
    for (const path of flags.paths){
        const f = await Deno.create(path);
        f.close();
    }
}
function parseArgs7(args) {
    const paths = [];
    for (const arg of parseArgKinds(args)){
        if (arg.kind === "Arg") paths.push(arg.arg);
        else bailUnsupported(arg);
    }
    if (paths.length === 0) throw Error("missing file operand");
    return {
        paths
    };
}
function unsetCommand(context) {
    try {
        return {
            code: 0,
            changes: parseNames(context.args).map((name)=>({
                    kind: "unsetvar",
                    name
                }))
        };
    } catch (err) {
        return context.error(`unset: ${errorToString(err)}`);
    }
}
function parseNames(args) {
    if (args[0] === "-f") {
        throw Error(`unsupported flag: -f`);
    } else if (args[0] === "-v") {
        return args.slice(1);
    } else {
        return args;
    }
}
const encoder1 = new TextEncoder();
class NullPipeReader {
    read(_p) {
        return Promise.resolve(null);
    }
}
class NullPipeWriter {
    writeSync(p) {
        return p.length;
    }
}
class ShellPipeWriter {
    #kind;
    #inner;
    constructor(kind, inner){
        this.#kind = kind;
        this.#inner = inner;
    }
    get kind() {
        return this.#kind;
    }
    get inner() {
        return this.#inner;
    }
    write(p) {
        if ("write" in this.#inner) {
            return this.#inner.write(p);
        } else {
            return this.#inner.writeSync(p);
        }
    }
    writeAll(data) {
        if ("write" in this.#inner) {
            return writeAll(this.#inner, data);
        } else {
            return writeAllSync(this.#inner, data);
        }
    }
    writeText(text) {
        return this.writeAll(encoder1.encode(text));
    }
    writeLine(text) {
        return this.writeText(text + "\n");
    }
}
class CapturingBufferWriter {
    #buffer;
    #innerWriter;
    constructor(innerWriter, buffer){
        this.#innerWriter = innerWriter;
        this.#buffer = buffer;
    }
    getBuffer() {
        return this.#buffer;
    }
    async write(p) {
        const nWritten = await this.#innerWriter.write(p);
        this.#buffer.writeSync(p.slice(0, nWritten));
        return nWritten;
    }
}
class CapturingBufferWriterSync {
    #buffer;
    #innerWriter;
    constructor(innerWriter, buffer){
        this.#innerWriter = innerWriter;
        this.#buffer = buffer;
    }
    getBuffer() {
        return this.#buffer;
    }
    writeSync(p) {
        const nWritten = this.#innerWriter.writeSync(p);
        this.#buffer.writeSync(p.slice(0, nWritten));
        return nWritten;
    }
}
const lineFeedCharCode = "\n".charCodeAt(0);
class InheritStaticTextBypassWriter {
    #buffer;
    #innerWriter;
    constructor(innerWriter){
        this.#innerWriter = innerWriter;
        this.#buffer = new Buffer();
    }
    writeSync(p) {
        const index = p.findLastIndex((v)=>v === lineFeedCharCode);
        if (index === -1) {
            this.#buffer.writeSync(p);
        } else {
            this.#buffer.writeSync(p.slice(0, index + 1));
            this.flush();
            this.#buffer.writeSync(p.slice(index + 1));
        }
        return p.byteLength;
    }
    flush() {
        const bytes = this.#buffer.bytes({
            copy: false
        });
        logger.logAboveStaticText(()=>{
            writeAllSync(this.#innerWriter, bytes);
        });
        this.#buffer.reset();
    }
}
class PipedBuffer {
    #inner;
    #hasSet = false;
    constructor(){
        this.#inner = new Buffer();
    }
    getBuffer() {
        if (this.#inner instanceof Buffer) {
            return this.#inner;
        } else {
            return undefined;
        }
    }
    setError(err) {
        if ("setError" in this.#inner) {
            this.#inner.setError(err);
        }
    }
    close() {
        if ("close" in this.#inner) {
            this.#inner.close();
        }
    }
    writeSync(p) {
        return this.#inner.writeSync(p);
    }
    setListener(listener) {
        if (this.#hasSet) {
            throw new Error("Piping to multiple outputs is currently not supported.");
        }
        if (this.#inner instanceof Buffer) {
            writeAllSync(listener, this.#inner.bytes({
                copy: false
            }));
        }
        this.#inner = listener;
        this.#hasSet = true;
    }
}
class PipeSequencePipe {
    #inner = new Buffer();
    #readListener;
    #closed = false;
    close() {
        this.#readListener?.();
        this.#closed = true;
    }
    writeSync(p) {
        const value1 = this.#inner.writeSync(p);
        if (this.#readListener !== undefined) {
            const listener = this.#readListener;
            this.#readListener = undefined;
            listener();
        }
        return value1;
    }
    read(p) {
        if (this.#readListener !== undefined) {
            throw new Error("Misuse of PipeSequencePipe");
        }
        if (this.#inner.length === 0) {
            if (this.#closed) {
                return Promise.resolve(null);
            } else {
                return new Promise((resolve)=>{
                    this.#readListener = ()=>{
                        resolve(this.#inner.readSync(p));
                    };
                });
            }
        } else {
            return Promise.resolve(this.#inner.readSync(p));
        }
    }
}
async function pipeReadableToWriterSync(readable, writer, signal) {
    const reader = readable.getReader();
    while(!signal.aborted){
        const result = await reader.read();
        if (result.done) {
            break;
        }
        const maybePromise = writer.writeAll(result.value);
        if (maybePromise) {
            await maybePromise;
        }
    }
}
const spawnCommand = (path, options)=>{
    const child = new Deno.Command(path, options).spawn();
    child.status;
    return {
        stdin () {
            return child.stdin;
        },
        kill (signo) {
            child.kill(signo);
        },
        waitExitCode () {
            return child.status.then((status)=>status.code);
        },
        stdout () {
            return child.stdout;
        },
        stderr () {
            return child.stderr;
        }
    };
};
const neverAbortedSignal = new AbortController().signal;
class RealEnv {
    setCwd(cwd) {
        Deno.chdir(cwd);
    }
    getCwd() {
        return Deno.cwd();
    }
    setEnvVar(key, value1) {
        if (value1 == null) {
            Deno.env.delete(key);
        } else {
            Deno.env.set(key, value1);
        }
    }
    getEnvVar(key) {
        return Deno.env.get(key);
    }
    getEnvVars() {
        return Deno.env.toObject();
    }
    clone() {
        return cloneEnv(this);
    }
}
class ShellEnv {
    #cwd;
    #envVars = {};
    setCwd(cwd) {
        this.#cwd = cwd;
    }
    getCwd() {
        if (this.#cwd == null) {
            throw new Error("The cwd must be initialized.");
        }
        return this.#cwd;
    }
    setEnvVar(key, value1) {
        if (Deno.build.os === "windows") {
            key = key.toUpperCase();
        }
        if (value1 == null) {
            delete this.#envVars[key];
        } else {
            this.#envVars[key] = value1;
        }
    }
    getEnvVar(key) {
        if (Deno.build.os === "windows") {
            key = key.toUpperCase();
        }
        return this.#envVars[key];
    }
    getEnvVars() {
        return {
            ...this.#envVars
        };
    }
    clone() {
        return cloneEnv(this);
    }
}
class RealEnvWriteOnly {
    real = new RealEnv();
    shell = new ShellEnv();
    setCwd(cwd) {
        this.real.setCwd(cwd);
        this.shell.setCwd(cwd);
    }
    getCwd() {
        return this.shell.getCwd();
    }
    setEnvVar(key, value1) {
        this.real.setEnvVar(key, value1);
        this.shell.setEnvVar(key, value1);
    }
    getEnvVar(key) {
        return this.shell.getEnvVar(key);
    }
    getEnvVars() {
        return this.shell.getEnvVars();
    }
    clone() {
        return cloneEnv(this);
    }
}
function initializeEnv(env, opts) {
    env.setCwd(opts.cwd);
    for (const [key, value1] of Object.entries(opts.env)){
        env.setEnvVar(key, value1);
    }
}
function cloneEnv(env) {
    const result = new ShellEnv();
    initializeEnv(result, {
        cwd: env.getCwd(),
        env: env.getEnvVars()
    });
    return result;
}
class StreamFds {
    #readers = new Map();
    #writers = new Map();
    insertReader(fd, stream) {
        this.#readers.set(fd, stream);
    }
    insertWriter(fd, stream) {
        this.#writers.set(fd, stream);
    }
    getReader(fd) {
        return this.#readers.get(fd)?.();
    }
    getWriter(fd) {
        return this.#writers.get(fd)?.();
    }
}
class Context {
    stdin;
    stdout;
    stderr;
    #env;
    #shellVars;
    #static;
    constructor(opts){
        this.stdin = opts.stdin;
        this.stdout = opts.stdout;
        this.stderr = opts.stderr;
        this.#env = opts.env;
        this.#shellVars = opts.shellVars;
        this.#static = opts.static;
    }
    get signal() {
        return this.#static.signal;
    }
    applyChanges(changes) {
        if (changes == null) {
            return;
        }
        for (const change of changes){
            switch(change.kind){
                case "cd":
                    this.#env.setCwd(change.dir);
                    break;
                case "envvar":
                    this.setEnvVar(change.name, change.value);
                    break;
                case "shellvar":
                    this.setShellVar(change.name, change.value);
                    break;
                case "unsetvar":
                    this.setShellVar(change.name, undefined);
                    this.setEnvVar(change.name, undefined);
                    break;
                default:
                    {
                        throw new Error(`Not implemented env change: ${change}`);
                    }
            }
        }
    }
    setEnvVar(key, value1) {
        if (Deno.build.os === "windows") {
            key = key.toUpperCase();
        }
        if (key === "PWD") {
            if (value1 != null && isAbsolute2(value1)) {
                this.#env.setCwd(resolve2(value1));
            }
        } else {
            delete this.#shellVars[key];
            this.#env.setEnvVar(key, value1);
        }
    }
    setShellVar(key, value1) {
        if (Deno.build.os === "windows") {
            key = key.toUpperCase();
        }
        if (this.#env.getEnvVar(key) != null || key === "PWD") {
            this.setEnvVar(key, value1);
        } else if (value1 == null) {
            delete this.#shellVars[key];
        } else {
            this.#shellVars[key] = value1;
        }
    }
    getEnvVars() {
        return this.#env.getEnvVars();
    }
    getCwd() {
        return this.#env.getCwd();
    }
    getVar(key) {
        if (Deno.build.os === "windows") {
            key = key.toUpperCase();
        }
        if (key === "PWD") {
            return this.#env.getCwd();
        }
        return this.#env.getEnvVar(key) ?? this.#shellVars[key];
    }
    getCommand(command) {
        return this.#static.commands[command] ?? null;
    }
    getFdReader(fd) {
        return this.#static.fds?.getReader(fd);
    }
    getFdWriter(fd) {
        return this.#static.fds?.getWriter(fd);
    }
    asCommandContext(args) {
        const context = this;
        return {
            get args () {
                return args;
            },
            get cwd () {
                return context.getCwd();
            },
            get env () {
                return context.getEnvVars();
            },
            get stdin () {
                return context.stdin;
            },
            get stdout () {
                return context.stdout;
            },
            get stderr () {
                return context.stderr;
            },
            get signal () {
                return context.signal;
            },
            error (codeOrText, maybeText) {
                return context.error(codeOrText, maybeText);
            }
        };
    }
    error(codeOrText, maybeText) {
        let code;
        let text;
        if (typeof codeOrText === "number") {
            code = codeOrText;
            text = maybeText;
        } else {
            code = 1;
            text = codeOrText;
        }
        const maybePromise = this.stderr.writeLine(text);
        if (maybePromise instanceof Promise) {
            return maybePromise.then(()=>({
                    code
                }));
        } else {
            return {
                code
            };
        }
    }
    withInner(opts) {
        return new Context({
            stdin: opts.stdin ?? this.stdin,
            stdout: opts.stdout ?? this.stdout,
            stderr: opts.stderr ?? this.stderr,
            env: this.#env.clone(),
            shellVars: {
                ...this.#shellVars
            },
            static: this.#static
        });
    }
    clone() {
        return new Context({
            stdin: this.stdin,
            stdout: this.stdout,
            stderr: this.stderr,
            env: this.#env.clone(),
            shellVars: {
                ...this.#shellVars
            },
            static: this.#static
        });
    }
}
function parseCommand(command) {
    return wasmInstance.parse(command);
}
async function spawn(list, opts) {
    const env = opts.exportEnv ? opts.clearedEnv ? new RealEnvWriteOnly() : new RealEnv() : new ShellEnv();
    initializeEnv(env, opts);
    const context = new Context({
        env,
        stdin: opts.stdin,
        stdout: opts.stdout,
        stderr: opts.stderr,
        shellVars: {},
        static: {
            commands: opts.commands,
            fds: opts.fds,
            signal: opts.signal
        }
    });
    const result = await executeSequentialList(list, context);
    return result.code;
}
async function executeSequentialList(list, context) {
    let finalExitCode = 0;
    const finalChanges = [];
    for (const item of list.items){
        if (item.isAsync) {
            throw new Error("Async commands are not supported. Run a command concurrently in the JS code instead.");
        }
        const result = await executeSequence(item.sequence, context);
        switch(result.kind){
            case undefined:
                if (result.changes) {
                    context.applyChanges(result.changes);
                    finalChanges.push(...result.changes);
                }
                finalExitCode = result.code;
                break;
            case "exit":
                return result;
            default:
        }
    }
    return {
        code: finalExitCode,
        changes: finalChanges
    };
}
function executeSequence(sequence, context) {
    if (context.signal.aborted) {
        return Promise.resolve(getAbortedResult());
    }
    switch(sequence.kind){
        case "pipeline":
            return executePipeline(sequence, context);
        case "booleanList":
            return executeBooleanList(sequence, context);
        case "shellVar":
            return executeShellVar(sequence, context);
        default:
            {
                throw new Error(`Not implemented: ${sequence}`);
            }
    }
}
function executePipeline(pipeline, context) {
    if (pipeline.negated) {
        throw new Error("Negated pipelines are not implemented.");
    }
    return executePipelineInner(pipeline.inner, context);
}
async function executeBooleanList(list, context) {
    const changes = [];
    const firstResult = await executeSequence(list.current, context.clone());
    let exitCode = 0;
    switch(firstResult.kind){
        case "exit":
            return firstResult;
        case undefined:
            if (firstResult.changes) {
                context.applyChanges(firstResult.changes);
                changes.push(...firstResult.changes);
            }
            exitCode = firstResult.code;
            break;
        default:
            {
                throw new Error("Not handled.");
            }
    }
    const next = findNextSequence(list, exitCode);
    if (next == null) {
        return {
            code: exitCode,
            changes
        };
    } else {
        const nextResult = await executeSequence(next, context.clone());
        switch(nextResult.kind){
            case "exit":
                return nextResult;
            case undefined:
                if (nextResult.changes) {
                    changes.push(...nextResult.changes);
                }
                return {
                    code: nextResult.code,
                    changes
                };
            default:
                {
                    throw new Error("Not Implemented");
                }
        }
    }
    function findNextSequence(current, exitCode) {
        if (opMovesNextForExitCode(current.op, exitCode)) {
            return current.next;
        } else {
            let next = current.next;
            while(next.kind === "booleanList"){
                if (opMovesNextForExitCode(next.op, exitCode)) {
                    return next.next;
                } else {
                    next = next.next;
                }
            }
            return undefined;
        }
    }
    function opMovesNextForExitCode(op, exitCode) {
        switch(op){
            case "or":
                return exitCode !== 0;
            case "and":
                return exitCode === 0;
        }
    }
}
async function executeShellVar(sequence, context) {
    const value1 = await evaluateWord(sequence.value, context);
    return {
        code: 0,
        changes: [
            {
                kind: "shellvar",
                name: sequence.name,
                value: value1
            }
        ]
    };
}
function executePipelineInner(inner, context) {
    switch(inner.kind){
        case "command":
            return executeCommand(inner, context);
        case "pipeSequence":
            return executePipeSequence(inner, context);
        default:
            {
                throw new Error(`Not implemented: ${inner.kind}`);
            }
    }
}
async function executeCommand(command, context) {
    if (command.redirect != null) {
        const redirectResult = await resolveRedirectPipe(command.redirect, context);
        let redirectPipe;
        if (redirectResult.kind === "input") {
            const { pipe } = redirectResult;
            context = context.withInner({
                stdin: pipe
            });
            redirectPipe = pipe;
        } else if (redirectResult.kind === "output") {
            const { pipe, toFd } = redirectResult;
            const writer = new ShellPipeWriter("piped", pipe);
            redirectPipe = pipe;
            if (toFd === 1) {
                context = context.withInner({
                    stdout: writer
                });
            } else if (toFd === 2) {
                context = context.withInner({
                    stderr: writer
                });
            } else {
                throw new Error(`Not handled fd: ${toFd}`);
            }
        } else {
            return redirectResult;
        }
        const result = await executeCommandInner(command.inner, context);
        try {
            if (isAsyncDisposable(redirectPipe)) {
                await redirectPipe[Symbol.asyncDispose]();
            } else if (isDisposable(redirectPipe)) {
                redirectPipe[Symbol.dispose]();
            }
        } catch (err) {
            if (result.code === 0) {
                return context.error(`failed disposing redirected pipe. ${errorToString(err)}`);
            }
        }
        return result;
    } else {
        return executeCommandInner(command.inner, context);
    }
}
async function resolveRedirectPipe(redirect, context) {
    function handleFileOpenError(outputPath, err) {
        return context.error(`failed opening file for redirect (${outputPath}). ${errorToString(err)}`);
    }
    const toFd = resolveRedirectToFd(redirect, context);
    if (typeof toFd !== "number") {
        return toFd;
    }
    const { ioFile } = redirect;
    if (ioFile.kind === "fd") {
        switch(redirect.op.kind){
            case "input":
                {
                    if (ioFile.value === 0) {
                        return {
                            kind: "input",
                            pipe: getStdinReader(context.stdin)
                        };
                    } else if (ioFile.value === 1 || ioFile.value === 2) {
                        return context.error(`redirecting stdout or stderr to a command input is not supported`);
                    } else {
                        const pipe = context.getFdReader(ioFile.value);
                        if (pipe == null) {
                            return context.error(`could not find fd reader: ${ioFile.value}`);
                        } else {
                            return {
                                kind: "input",
                                pipe
                            };
                        }
                    }
                }
            case "output":
                {
                    if (ioFile.value === 0) {
                        return context.error(`redirecting output to stdin is not supported`);
                    } else if (ioFile.value === 1) {
                        return {
                            kind: "output",
                            pipe: context.stdout.inner,
                            toFd
                        };
                    } else if (ioFile.value === 2) {
                        return {
                            kind: "output",
                            pipe: context.stderr.inner,
                            toFd
                        };
                    } else {
                        const pipe = context.getFdWriter(ioFile.value);
                        if (pipe == null) {
                            return context.error(`could not find fd: ${ioFile.value}`);
                        } else {
                            return {
                                kind: "output",
                                pipe,
                                toFd
                            };
                        }
                    }
                }
            default:
                {
                    redirect.op;
                    throw new Error("not implemented redirect op.");
                }
        }
    } else if (ioFile.kind === "word") {
        const words = await evaluateWordParts(ioFile.value, context);
        if (words.length === 0) {
            return context.error("redirect path must be 1 argument, but found 0");
        } else if (words.length > 1) {
            return context.error(`redirect path must be 1 argument, but found ${words.length} (${words.join(" ")}). ` + `Did you mean to quote it (ex. "${words.join(" ")}")?`);
        }
        switch(redirect.op.kind){
            case "input":
                {
                    const outputPath = isAbsolute2(words[0]) ? words[0] : join2(context.getCwd(), words[0]);
                    try {
                        const file = await Deno.open(outputPath, {
                            read: true
                        });
                        return {
                            kind: "input",
                            pipe: file
                        };
                    } catch (err) {
                        return handleFileOpenError(outputPath, err);
                    }
                }
            case "output":
                {
                    if (words[0] === "/dev/null") {
                        return {
                            kind: "output",
                            pipe: new NullPipeWriter(),
                            toFd: toFd
                        };
                    }
                    const outputPath = isAbsolute2(words[0]) ? words[0] : join2(context.getCwd(), words[0]);
                    try {
                        const file = await Deno.open(outputPath, {
                            write: true,
                            create: true,
                            append: redirect.op.value === "append",
                            truncate: redirect.op.value !== "append"
                        });
                        return {
                            kind: "output",
                            pipe: file,
                            toFd: toFd
                        };
                    } catch (err) {
                        return handleFileOpenError(outputPath, err);
                    }
                }
            default:
                {
                    redirect.op;
                    throw new Error("not implemented redirect op.");
                }
        }
    } else {
        throw new Error("not implemented redirect io file.");
    }
}
function getStdinReader(stdin) {
    if (stdin === "inherit") {
        return Deno.stdin;
    } else if (stdin === "null") {
        return new NullPipeReader();
    } else {
        return stdin;
    }
}
function resolveRedirectToFd(redirect, context) {
    const maybeFd = redirect.maybeFd;
    if (maybeFd == null) {
        return 1;
    }
    if (maybeFd.kind === "stdoutStderr") {
        return context.error("redirecting to both stdout and stderr is not implemented");
    }
    if (maybeFd.fd !== 1 && maybeFd.fd !== 2) {
        return context.error(`only redirecting to stdout (1) and stderr (2) is supported`);
    } else {
        return maybeFd.fd;
    }
}
function executeCommandInner(command, context) {
    switch(command.kind){
        case "simple":
            return executeSimpleCommand(command, context);
        case "subshell":
            return executeSubshell(command, context);
        default:
            {
                throw new Error(`Not implemented: ${command.kind}`);
            }
    }
}
async function executeSimpleCommand(command, parentContext) {
    const context = parentContext.clone();
    for (const envVar of command.envVars){
        context.setEnvVar(envVar.name, await evaluateWord(envVar.value, context));
    }
    const commandArgs = await evaluateArgs(command.args, context);
    return await executeCommandArgs(commandArgs, context);
}
function checkMapCwdNotExistsError(cwd, err) {
    if (err.code === "ENOENT" && !existsSync(cwd)) {
        throw new Error(`Failed to launch command because the cwd does not exist (${cwd}).`, {
            cause: err
        });
    } else {
        throw err;
    }
}
function executeCommandArgs(commandArgs, context) {
    const commandName = commandArgs.shift();
    const command = context.getCommand(commandName);
    if (command != null) {
        return Promise.resolve(command(context.asCommandContext(commandArgs)));
    }
    const unresolvedCommand = {
        name: commandName,
        baseDir: context.getCwd()
    };
    return executeUnresolvedCommand(unresolvedCommand, commandArgs, context);
}
async function executeUnresolvedCommand(unresolvedCommand, commandArgs, context) {
    const resolvedCommand = await resolveCommand(unresolvedCommand, context);
    if (resolvedCommand === false) {
        context.stderr.writeLine(`dax: ${unresolvedCommand.name}: command not found`);
        return {
            code: 127
        };
    }
    if (resolvedCommand.kind === "shebang") {
        return executeUnresolvedCommand(resolvedCommand.command, [
            ...resolvedCommand.args,
            ...commandArgs
        ], context);
    }
    resolvedCommand.kind;
    return executeCommandAtPath(resolvedCommand.path, commandArgs, context);
}
async function executeCommandAtPath(commandPath, commandArgs, context) {
    const pipeStringVals = {
        stdin: getStdioStringValue(context.stdin),
        stdout: getStdioStringValue(context.stdout.kind),
        stderr: getStdioStringValue(context.stderr.kind)
    };
    let p;
    const cwd = context.getCwd();
    try {
        p = spawnCommand(commandPath, {
            args: commandArgs,
            cwd,
            env: context.getEnvVars(),
            clearEnv: true,
            ...pipeStringVals
        });
    } catch (err) {
        throw checkMapCwdNotExistsError(cwd, err);
    }
    const listener = (signal)=>p.kill(signal);
    context.signal.addListener(listener);
    const completeController = new AbortController();
    const completeSignal = completeController.signal;
    let stdinError;
    const stdinPromise = writeStdin(context.stdin, p, completeSignal).catch(async (err)=>{
        if (completeSignal.aborted) {
            return;
        }
        const maybePromise = context.stderr.writeLine(`stdin pipe broken. ${errorToString(err)}`);
        if (maybePromise != null) {
            await maybePromise;
        }
        stdinError = err;
        try {
            p.kill("SIGKILL");
        } catch (err) {
            if (!(err instanceof Deno.errors.PermissionDenied || err instanceof Deno.errors.NotFound)) {
                throw err;
            }
        }
    });
    try {
        const readStdoutTask = pipeStringVals.stdout === "piped" ? readStdOutOrErr(p.stdout(), context.stdout) : Promise.resolve();
        const readStderrTask = pipeStringVals.stderr === "piped" ? readStdOutOrErr(p.stderr(), context.stderr) : Promise.resolve();
        const [exitCode] = await Promise.all([
            p.waitExitCode().catch((err)=>Promise.reject(checkMapCwdNotExistsError(cwd, err))),
            readStdoutTask,
            readStderrTask
        ]);
        if (stdinError != null) {
            return {
                code: 1,
                kind: "exit"
            };
        } else {
            return {
                code: exitCode
            };
        }
    } finally{
        completeController.abort();
        context.signal.removeListener(listener);
        await stdinPromise;
    }
    async function writeStdin(stdin, p, signal) {
        if (typeof stdin === "string") {
            return;
        }
        const processStdin = p.stdin();
        await pipeReaderToWritable(stdin, processStdin, signal);
        try {
            await processStdin.close();
        } catch  {}
    }
    async function readStdOutOrErr(readable, writer) {
        if (typeof writer === "string") {
            return;
        }
        await pipeReadableToWriterSync(readable, writer, neverAbortedSignal);
    }
    function getStdioStringValue(value1) {
        if (value1 === "inheritPiped") {
            return "piped";
        } else if (value1 === "inherit" || value1 === "null" || value1 === "piped") {
            return value1;
        } else {
            return "piped";
        }
    }
}
async function executeSubshell(subshell, context) {
    const result = await executeSequentialList(subshell, context);
    return {
        code: result.code
    };
}
async function pipeReaderToWritable(reader, writable, signal) {
    const abortedPromise = new Promise((resolve)=>{
        signal.addEventListener("abort", listener);
        function listener() {
            signal.removeEventListener("abort", listener);
            resolve();
        }
    });
    const writer = writable.getWriter();
    try {
        while(!signal.aborted){
            const buffer = new Uint8Array(1024);
            const length = await Promise.race([
                abortedPromise,
                reader.read(buffer)
            ]);
            if (length === 0 || length == null) {
                break;
            }
            await writer.write(buffer.subarray(0, length));
        }
    } finally{
        await writer.close();
    }
}
async function pipeReaderToWriterSync(reader, writer, signal) {
    const buffer = new Uint8Array(1024);
    while(!signal.aborted){
        const bytesRead = await reader.read(buffer);
        if (bytesRead == null || bytesRead === 0) {
            break;
        }
        const maybePromise = writer.writeAll(buffer.slice(0, bytesRead));
        if (maybePromise) {
            await maybePromise;
        }
    }
}
function pipeCommandPipeReaderToWriterSync(reader, writer, signal) {
    switch(reader){
        case "inherit":
            return pipeReadableToWriterSync(Deno.stdin.readable, writer, signal);
        case "null":
            return Promise.resolve();
        default:
            {
                return pipeReaderToWriterSync(reader, writer, signal);
            }
    }
}
async function resolveCommand(unresolvedCommand, context) {
    if (unresolvedCommand.name.includes("/")) {
        const commandPath = isAbsolute2(unresolvedCommand.name) ? unresolvedCommand.name : resolve2(unresolvedCommand.baseDir, unresolvedCommand.name);
        const result = await getExecutableShebangFromPath(commandPath);
        if (result === false) {
            return false;
        } else if (result != null) {
            const args = await parseShebangArgs(result, context);
            const name = args.shift();
            args.push(commandPath);
            return {
                kind: "shebang",
                command: {
                    name,
                    baseDir: dirname2(commandPath)
                },
                args
            };
        } else {
            return {
                kind: "path",
                path: commandPath
            };
        }
    }
    const commandPath = await whichFromContext(unresolvedCommand.name, context);
    if (commandPath == null) {
        return false;
    }
    return {
        kind: "path",
        path: commandPath
    };
}
class WhichEnv extends RealEnvironment {
    requestPermission(folderPath) {
        Deno.permissions.requestSync({
            name: "read",
            path: folderPath
        });
    }
}
const denoWhichRealEnv = new WhichEnv();
async function whichFromContext(commandName, context) {
    if (commandName.toUpperCase() === "DENO") {
        return Deno.execPath();
    }
    return await which(commandName, {
        os: Deno.build.os,
        stat: denoWhichRealEnv.stat,
        env (key) {
            return context.getVar(key);
        },
        requestPermission: denoWhichRealEnv.requestPermission
    });
}
async function executePipeSequence(sequence, context) {
    const waitTasks = [];
    let lastOutput = context.stdin;
    let nextInner = sequence;
    while(nextInner != null){
        let innerCommand;
        switch(nextInner.kind){
            case "pipeSequence":
                switch(nextInner.op){
                    case "stdout":
                        {
                            innerCommand = nextInner.current;
                            break;
                        }
                    case "stdoutstderr":
                        {
                            return context.error(`piping to both stdout and stderr is not implemented (ex. |&)`);
                        }
                    default:
                        {
                            nextInner.op;
                            return context.error(`not implemented pipe sequence op: ${nextInner.op}`);
                        }
                }
                nextInner = nextInner.next;
                break;
            case "command":
                innerCommand = nextInner;
                nextInner = undefined;
                break;
        }
        const buffer = new PipeSequencePipe();
        const newContext = context.withInner({
            stdout: new ShellPipeWriter("piped", buffer),
            stdin: lastOutput
        });
        const commandPromise = executeCommand(innerCommand, newContext);
        waitTasks.push(commandPromise);
        commandPromise.finally(()=>{
            buffer.close();
        });
        lastOutput = buffer;
    }
    waitTasks.push(pipeCommandPipeReaderToWriterSync(lastOutput, context.stdout, context.signal).then(()=>({
            code: 0
        })));
    const results = await Promise.all(waitTasks);
    const secondLastResult = results[results.length - 2];
    return secondLastResult;
}
async function parseShebangArgs(info, context) {
    function throwUnsupported() {
        throw new Error("Unsupported shebang. Please report this as a bug.");
    }
    if (!info.stringSplit) {
        return [
            info.command
        ];
    }
    const command = parseCommand(info.command);
    if (command.items.length !== 1) {
        throwUnsupported();
    }
    const item = command.items[0];
    if (item.sequence.kind !== "pipeline" || item.isAsync) {
        throwUnsupported();
    }
    const sequence = item.sequence;
    if (sequence.negated) {
        throwUnsupported();
    }
    if (sequence.inner.kind !== "command" || sequence.inner.redirect != null) {
        throwUnsupported();
    }
    const innerCommand = sequence.inner.inner;
    if (innerCommand.kind !== "simple") {
        throwUnsupported();
    }
    if (innerCommand.envVars.length > 0) {
        throwUnsupported();
    }
    return await evaluateArgs(innerCommand.args, context);
}
async function evaluateArgs(args, context) {
    const result = [];
    for (const arg of args){
        result.push(...await evaluateWordParts(arg, context));
    }
    return result;
}
async function evaluateWord(word, context) {
    const result = await evaluateWordParts(word, context);
    return result.join(" ");
}
async function evaluateWordParts(wordParts, context, quoted = false) {
    const result = [];
    let currentText = "";
    let hasQuoted = false;
    for (const stringPart of wordParts){
        let evaluationResult = undefined;
        switch(stringPart.kind){
            case "text":
                currentText += stringPart.value;
                break;
            case "variable":
                evaluationResult = context.getVar(stringPart.value);
                break;
            case "quoted":
                {
                    const text = (await evaluateWordParts(stringPart.value, context, true)).join("");
                    currentText += text;
                    hasQuoted = true;
                    continue;
                }
            case "command":
            default:
                throw new Error(`Not implemented: ${stringPart.kind}`);
        }
        if (evaluationResult != null) {
            if (quoted) {
                currentText += evaluationResult;
            } else {
                const parts = evaluationResult.split(" ").map((t)=>t.trim()).filter((t)=>t.length > 0);
                if (parts.length > 0) {
                    currentText += parts[0];
                    result.push(currentText);
                    result.push(...parts.slice(1));
                    currentText = result.pop();
                }
            }
        }
    }
    if (hasQuoted || currentText.length !== 0) {
        result.push(currentText);
    }
    return result;
}
function isDisposable(value1) {
    return value1 != null && typeof value1[Symbol.dispose] === "function";
}
function isAsyncDisposable(value1) {
    return value1 != null && typeof value1[Symbol.asyncDispose] === "function";
}
async function whichCommand(context) {
    try {
        return await executeWhich(context);
    } catch (err) {
        return context.error(`which: ${errorToString(err)}`);
    }
}
async function executeWhich(context) {
    let flags;
    try {
        flags = parseArgs8(context.args);
    } catch (err) {
        return await context.error(2, `which: ${errorToString(err)}`);
    }
    if (flags.commandName == null) {
        return {
            code: 1
        };
    }
    const path = await whichFromContext(flags.commandName, {
        getVar (key) {
            return context.env[key];
        }
    });
    if (path != null) {
        await context.stdout.writeLine(path);
        return {
            code: 0
        };
    } else {
        return {
            code: 1
        };
    }
}
function parseArgs8(args) {
    let commandName;
    for (const arg of parseArgKinds(args)){
        if (arg.kind === "Arg") {
            if (commandName != null) {
                throw Error("unsupported too many arguments");
            }
            commandName = arg.arg;
        } else {
            bailUnsupported2(arg);
        }
    }
    return {
        commandName
    };
}
function bailUnsupported2(arg) {
    switch(arg.kind){
        case "Arg":
            throw Error(`unsupported argument: ${arg.arg}`);
        case "ShortFlag":
            throw Error(`unsupported flag: -${arg.arg}`);
        case "LongFlag":
            throw Error(`unsupported flag: --${arg.arg}`);
    }
}
function getFileInfoType(fileInfo) {
    return fileInfo.isFile ? "file" : fileInfo.isDirectory ? "dir" : fileInfo.isSymlink ? "symlink" : undefined;
}
async function ensureDir(dir) {
    try {
        const fileInfo = await Deno.lstat(dir);
        if (!fileInfo.isDirectory) {
            throw new Error(`Ensure path exists, expected 'dir', got '${getFileInfoType(fileInfo)}'`);
        }
        return;
    } catch (err) {
        if (!(err instanceof Deno.errors.NotFound)) {
            throw err;
        }
    }
    try {
        await Deno.mkdir(dir, {
            recursive: true
        });
    } catch (err) {
        if (!(err instanceof Deno.errors.AlreadyExists)) {
            throw err;
        }
        const fileInfo = await Deno.lstat(dir);
        if (!fileInfo.isDirectory) {
            throw new Error(`Ensure path exists, expected 'dir', got '${getFileInfoType(fileInfo)}'`);
        }
    }
}
function ensureDirSync(dir) {
    try {
        const fileInfo = Deno.lstatSync(dir);
        if (!fileInfo.isDirectory) {
            throw new Error(`Ensure path exists, expected 'dir', got '${getFileInfoType(fileInfo)}'`);
        }
        return;
    } catch (err) {
        if (!(err instanceof Deno.errors.NotFound)) {
            throw err;
        }
    }
    try {
        Deno.mkdirSync(dir, {
            recursive: true
        });
    } catch (err) {
        if (!(err instanceof Deno.errors.AlreadyExists)) {
            throw err;
        }
        const fileInfo = Deno.lstatSync(dir);
        if (!fileInfo.isDirectory) {
            throw new Error(`Ensure path exists, expected 'dir', got '${getFileInfoType(fileInfo)}'`);
        }
    }
}
function toPathString(pathUrl) {
    return pathUrl instanceof URL ? fromFileUrl2(pathUrl) : pathUrl;
}
function isSubdir(src, dest, sep = SEPARATOR2) {
    if (src === dest) {
        return false;
    }
    src = toPathString(src);
    const srcArray = src.split(sep);
    dest = toPathString(dest);
    const destArray = dest.split(sep);
    return srcArray.every((current, i)=>destArray[i] === current);
}
const isWindows1 = Deno.build.os === "windows";
async function ensureValidCopy(src, dest, options) {
    let destStat;
    try {
        destStat = await Deno.lstat(dest);
    } catch (err) {
        if (err instanceof Deno.errors.NotFound) {
            return;
        }
        throw err;
    }
    if (options.isFolder && !destStat.isDirectory) {
        throw new Error(`Cannot overwrite non-directory '${dest}' with directory '${src}'.`);
    }
    if (!options.overwrite) {
        throw new Deno.errors.AlreadyExists(`'${dest}' already exists.`);
    }
    return destStat;
}
function ensureValidCopySync(src, dest, options) {
    let destStat;
    try {
        destStat = Deno.lstatSync(dest);
    } catch (err) {
        if (err instanceof Deno.errors.NotFound) {
            return;
        }
        throw err;
    }
    if (options.isFolder && !destStat.isDirectory) {
        throw new Error(`Cannot overwrite non-directory '${dest}' with directory '${src}'.`);
    }
    if (!options.overwrite) {
        throw new Deno.errors.AlreadyExists(`'${dest}' already exists.`);
    }
    return destStat;
}
async function copyFile(src, dest, options) {
    await ensureValidCopy(src, dest, options);
    await Deno.copyFile(src, dest);
    if (options.preserveTimestamps) {
        const statInfo = await Deno.stat(src);
        assert(statInfo.atime instanceof Date, `statInfo.atime is unavailable`);
        assert(statInfo.mtime instanceof Date, `statInfo.mtime is unavailable`);
        await Deno.utime(dest, statInfo.atime, statInfo.mtime);
    }
}
function copyFileSync(src, dest, options) {
    ensureValidCopySync(src, dest, options);
    Deno.copyFileSync(src, dest);
    if (options.preserveTimestamps) {
        const statInfo = Deno.statSync(src);
        assert(statInfo.atime instanceof Date, `statInfo.atime is unavailable`);
        assert(statInfo.mtime instanceof Date, `statInfo.mtime is unavailable`);
        Deno.utimeSync(dest, statInfo.atime, statInfo.mtime);
    }
}
async function copySymLink(src, dest, options) {
    await ensureValidCopy(src, dest, options);
    const originSrcFilePath = await Deno.readLink(src);
    const type = getFileInfoType(await Deno.lstat(src));
    if (isWindows1) {
        await Deno.symlink(originSrcFilePath, dest, {
            type: type === "dir" ? "dir" : "file"
        });
    } else {
        await Deno.symlink(originSrcFilePath, dest);
    }
    if (options.preserveTimestamps) {
        const statInfo = await Deno.lstat(src);
        assert(statInfo.atime instanceof Date, `statInfo.atime is unavailable`);
        assert(statInfo.mtime instanceof Date, `statInfo.mtime is unavailable`);
        await Deno.utime(dest, statInfo.atime, statInfo.mtime);
    }
}
function copySymlinkSync(src, dest, options) {
    ensureValidCopySync(src, dest, options);
    const originSrcFilePath = Deno.readLinkSync(src);
    const type = getFileInfoType(Deno.lstatSync(src));
    if (isWindows1) {
        Deno.symlinkSync(originSrcFilePath, dest, {
            type: type === "dir" ? "dir" : "file"
        });
    } else {
        Deno.symlinkSync(originSrcFilePath, dest);
    }
    if (options.preserveTimestamps) {
        const statInfo = Deno.lstatSync(src);
        assert(statInfo.atime instanceof Date, `statInfo.atime is unavailable`);
        assert(statInfo.mtime instanceof Date, `statInfo.mtime is unavailable`);
        Deno.utimeSync(dest, statInfo.atime, statInfo.mtime);
    }
}
async function copyDir(src, dest, options) {
    const destStat = await ensureValidCopy(src, dest, {
        ...options,
        isFolder: true
    });
    if (!destStat) {
        await ensureDir(dest);
    }
    if (options.preserveTimestamps) {
        const srcStatInfo = await Deno.stat(src);
        assert(srcStatInfo.atime instanceof Date, `statInfo.atime is unavailable`);
        assert(srcStatInfo.mtime instanceof Date, `statInfo.mtime is unavailable`);
        await Deno.utime(dest, srcStatInfo.atime, srcStatInfo.mtime);
    }
    src = toPathString(src);
    dest = toPathString(dest);
    const promises = [];
    for await (const entry of Deno.readDir(src)){
        const srcPath = join2(src, entry.name);
        const destPath = join2(dest, basename2(srcPath));
        if (entry.isSymlink) {
            promises.push(copySymLink(srcPath, destPath, options));
        } else if (entry.isDirectory) {
            promises.push(copyDir(srcPath, destPath, options));
        } else if (entry.isFile) {
            promises.push(copyFile(srcPath, destPath, options));
        }
    }
    await Promise.all(promises);
}
function copyDirSync(src, dest, options) {
    const destStat = ensureValidCopySync(src, dest, {
        ...options,
        isFolder: true
    });
    if (!destStat) {
        ensureDirSync(dest);
    }
    if (options.preserveTimestamps) {
        const srcStatInfo = Deno.statSync(src);
        assert(srcStatInfo.atime instanceof Date, `statInfo.atime is unavailable`);
        assert(srcStatInfo.mtime instanceof Date, `statInfo.mtime is unavailable`);
        Deno.utimeSync(dest, srcStatInfo.atime, srcStatInfo.mtime);
    }
    src = toPathString(src);
    dest = toPathString(dest);
    for (const entry of Deno.readDirSync(src)){
        const srcPath = join2(src, entry.name);
        const destPath = join2(dest, basename2(srcPath));
        if (entry.isSymlink) {
            copySymlinkSync(srcPath, destPath, options);
        } else if (entry.isDirectory) {
            copyDirSync(srcPath, destPath, options);
        } else if (entry.isFile) {
            copyFileSync(srcPath, destPath, options);
        }
    }
}
async function copy1(src, dest, options = {}) {
    src = resolve2(toPathString(src));
    dest = resolve2(toPathString(dest));
    if (src === dest) {
        throw new Error("Source and destination cannot be the same.");
    }
    const srcStat = await Deno.lstat(src);
    if (srcStat.isDirectory && isSubdir(src, dest)) {
        throw new Error(`Cannot copy '${src}' to a subdirectory of itself, '${dest}'.`);
    }
    if (srcStat.isSymlink) {
        await copySymLink(src, dest, options);
    } else if (srcStat.isDirectory) {
        await copyDir(src, dest, options);
    } else if (srcStat.isFile) {
        await copyFile(src, dest, options);
    }
}
function copySync(src, dest, options = {}) {
    src = resolve2(toPathString(src));
    dest = resolve2(toPathString(dest));
    if (src === dest) {
        throw new Error("Source and destination cannot be the same.");
    }
    const srcStat = Deno.lstatSync(src);
    if (srcStat.isDirectory && isSubdir(src, dest)) {
        throw new Error(`Cannot copy '${src}' to a subdirectory of itself, '${dest}'.`);
    }
    if (srcStat.isSymlink) {
        copySymlinkSync(src, dest, options);
    } else if (srcStat.isDirectory) {
        copyDirSync(src, dest, options);
    } else if (srcStat.isFile) {
        copyFileSync(src, dest, options);
    }
}
async function emptyDir(dir) {
    try {
        const items = await Array.fromAsync(Deno.readDir(dir));
        await Promise.all(items.map((item)=>{
            if (item && item.name) {
                const filepath = join2(toPathString(dir), item.name);
                return Deno.remove(filepath, {
                    recursive: true
                });
            }
        }));
    } catch (err) {
        if (!(err instanceof Deno.errors.NotFound)) {
            throw err;
        }
        await Deno.mkdir(dir, {
            recursive: true
        });
    }
}
function emptyDirSync(dir) {
    try {
        const items = [
            ...Deno.readDirSync(dir)
        ];
        while(items.length){
            const item = items.shift();
            if (item && item.name) {
                const filepath = join2(toPathString(dir), item.name);
                Deno.removeSync(filepath, {
                    recursive: true
                });
            }
        }
    } catch (err) {
        if (!(err instanceof Deno.errors.NotFound)) {
            throw err;
        }
        Deno.mkdirSync(dir, {
            recursive: true
        });
    }
}
async function ensureFile(filePath) {
    try {
        const stat = await Deno.lstat(filePath);
        if (!stat.isFile) {
            throw new Error(`Ensure path exists, expected 'file', got '${getFileInfoType(stat)}'`);
        }
    } catch (err) {
        if (err instanceof Deno.errors.NotFound) {
            await ensureDir(dirname2(toPathString(filePath)));
            await Deno.writeFile(filePath, new Uint8Array());
            return;
        }
        throw err;
    }
}
function ensureFileSync(filePath) {
    try {
        const stat = Deno.lstatSync(filePath);
        if (!stat.isFile) {
            throw new Error(`Ensure path exists, expected 'file', got '${getFileInfoType(stat)}'`);
        }
    } catch (err) {
        if (err instanceof Deno.errors.NotFound) {
            ensureDirSync(dirname2(toPathString(filePath)));
            Deno.writeFileSync(filePath, new Uint8Array());
            return;
        }
        throw err;
    }
}
function createWalkEntrySync(path) {
    path = toPathString(path);
    path = normalize2(path);
    const name = basename2(path);
    const info = Deno.statSync(path);
    return {
        path,
        name,
        isFile: info.isFile,
        isDirectory: info.isDirectory,
        isSymlink: info.isSymlink
    };
}
async function createWalkEntry(path) {
    path = toPathString(path);
    path = normalize2(path);
    const name = basename2(path);
    const info = await Deno.stat(path);
    return {
        path,
        name,
        isFile: info.isFile,
        isDirectory: info.isDirectory,
        isSymlink: info.isSymlink
    };
}
class WalkError extends Error {
    root;
    constructor(cause, root){
        super(`${cause instanceof Error ? cause.message : cause} for path "${root}"`);
        this.cause = cause;
        this.name = this.constructor.name;
        this.root = root;
    }
}
function include(path, exts, match, skip) {
    if (exts && !exts.some((ext)=>path.endsWith(ext))) {
        return false;
    }
    if (match && !match.some((pattern)=>!!path.match(pattern))) {
        return false;
    }
    if (skip && skip.some((pattern)=>!!path.match(pattern))) {
        return false;
    }
    return true;
}
function wrapErrorWithPath(err, root) {
    if (err instanceof WalkError) return err;
    return new WalkError(err, root);
}
async function* walk(root, { maxDepth = Infinity, includeFiles = true, includeDirs = true, includeSymlinks = true, followSymlinks = false, canonicalize = true, exts = undefined, match = undefined, skip = undefined } = {}) {
    if (maxDepth < 0) {
        return;
    }
    root = toPathString(root);
    if (includeDirs && include(root, exts, match, skip)) {
        yield await createWalkEntry(root);
    }
    if (maxDepth < 1 || !include(root, undefined, undefined, skip)) {
        return;
    }
    try {
        for await (const entry of Deno.readDir(root)){
            let path = join2(root, entry.name);
            let { isSymlink, isDirectory } = entry;
            if (isSymlink) {
                if (!followSymlinks) {
                    if (includeSymlinks && include(path, exts, match, skip)) {
                        yield {
                            path,
                            ...entry
                        };
                    }
                    continue;
                }
                const realPath = await Deno.realPath(path);
                if (canonicalize) {
                    path = realPath;
                }
                ({ isSymlink, isDirectory } = await Deno.lstat(realPath));
            }
            if (isSymlink || isDirectory) {
                yield* walk(path, {
                    maxDepth: maxDepth - 1,
                    includeFiles,
                    includeDirs,
                    includeSymlinks,
                    followSymlinks,
                    exts,
                    match,
                    skip
                });
            } else if (includeFiles && include(path, exts, match, skip)) {
                yield {
                    path,
                    ...entry
                };
            }
        }
    } catch (err) {
        throw wrapErrorWithPath(err, normalize2(root));
    }
}
function* walkSync(root, { maxDepth = Infinity, includeFiles = true, includeDirs = true, includeSymlinks = true, followSymlinks = false, canonicalize = true, exts = undefined, match = undefined, skip = undefined } = {}) {
    root = toPathString(root);
    if (maxDepth < 0) {
        return;
    }
    if (includeDirs && include(root, exts, match, skip)) {
        yield createWalkEntrySync(root);
    }
    if (maxDepth < 1 || !include(root, undefined, undefined, skip)) {
        return;
    }
    let entries;
    try {
        entries = Deno.readDirSync(root);
    } catch (err) {
        throw wrapErrorWithPath(err, normalize2(root));
    }
    for (const entry of entries){
        let path = join2(root, entry.name);
        let { isSymlink, isDirectory } = entry;
        if (isSymlink) {
            if (!followSymlinks) {
                if (includeSymlinks && include(path, exts, match, skip)) {
                    yield {
                        path,
                        ...entry
                    };
                }
                continue;
            }
            const realPath = Deno.realPathSync(path);
            if (canonicalize) {
                path = realPath;
            }
            ({ isSymlink, isDirectory } = Deno.lstatSync(realPath));
        }
        if (isSymlink || isDirectory) {
            yield* walkSync(path, {
                maxDepth: maxDepth - 1,
                includeFiles,
                includeDirs,
                includeSymlinks,
                followSymlinks,
                exts,
                match,
                skip
            });
        } else if (includeFiles && include(path, exts, match, skip)) {
            yield {
                path,
                ...entry
            };
        }
    }
}
const isWindows2 = Deno.build.os === "windows";
function split(path) {
    const s = SEPARATOR_PATTERN2.source;
    const segments = path.replace(new RegExp(`^${s}|${s}$`, "g"), "").split(SEPARATOR_PATTERN2);
    const isAbsolute_ = isAbsolute2(path);
    return {
        segments,
        isAbsolute: isAbsolute_,
        hasTrailingSep: !!path.match(new RegExp(`${s}$`)),
        winRoot: isWindows2 && isAbsolute_ ? segments.shift() : undefined
    };
}
function throwUnlessNotFound(error) {
    if (!(error instanceof Deno.errors.NotFound)) {
        throw error;
    }
}
function comparePath(a, b) {
    if (a.path < b.path) return -1;
    if (a.path > b.path) return 1;
    return 0;
}
async function* expandGlob(glob, { root, exclude = [], includeDirs = true, extended = true, globstar = true, caseInsensitive, followSymlinks, canonicalize } = {}) {
    const { segments, isAbsolute: isGlobAbsolute, hasTrailingSep, winRoot } = split(toPathString(glob));
    root ??= isGlobAbsolute ? winRoot ?? "/" : Deno.cwd();
    const globOptions = {
        extended,
        globstar,
        caseInsensitive
    };
    const absRoot = isGlobAbsolute ? root : resolve2(root);
    const resolveFromRoot = (path)=>resolve2(absRoot, path);
    const excludePatterns = exclude.map(resolveFromRoot).map((s)=>globToRegExp2(s, globOptions));
    const shouldInclude = (path)=>!excludePatterns.some((p)=>!!path.match(p));
    let fixedRoot = isGlobAbsolute ? winRoot !== undefined ? winRoot : "/" : absRoot;
    while(segments.length > 0 && !isGlob(segments[0])){
        const seg = segments.shift();
        assert(seg !== undefined);
        fixedRoot = joinGlobs2([
            fixedRoot,
            seg
        ], globOptions);
    }
    let fixedRootInfo;
    try {
        fixedRootInfo = await createWalkEntry(fixedRoot);
    } catch (error) {
        return throwUnlessNotFound(error);
    }
    async function* advanceMatch(walkInfo, globSegment) {
        if (!walkInfo.isDirectory) {
            return;
        } else if (globSegment === "..") {
            const parentPath = joinGlobs2([
                walkInfo.path,
                ".."
            ], globOptions);
            try {
                if (shouldInclude(parentPath)) {
                    return yield await createWalkEntry(parentPath);
                }
            } catch (error) {
                throwUnlessNotFound(error);
            }
            return;
        } else if (globSegment === "**") {
            return yield* walk(walkInfo.path, {
                skip: excludePatterns,
                maxDepth: globstar ? Infinity : 1,
                followSymlinks,
                canonicalize
            });
        }
        const globPattern = globToRegExp2(globSegment, globOptions);
        for await (const walkEntry of walk(walkInfo.path, {
            maxDepth: 1,
            skip: excludePatterns,
            followSymlinks
        })){
            if (walkEntry.path !== walkInfo.path && walkEntry.name.match(globPattern)) {
                yield walkEntry;
            }
        }
    }
    let currentMatches = [
        fixedRootInfo
    ];
    for (const segment of segments){
        const nextMatchMap = new Map();
        await Promise.all(currentMatches.map(async (currentMatch)=>{
            for await (const nextMatch of advanceMatch(currentMatch, segment)){
                nextMatchMap.set(nextMatch.path, nextMatch);
            }
        }));
        currentMatches = [
            ...nextMatchMap.values()
        ].sort(comparePath);
    }
    if (hasTrailingSep) {
        currentMatches = currentMatches.filter((entry)=>entry.isDirectory);
    }
    if (!includeDirs) {
        currentMatches = currentMatches.filter((entry)=>!entry.isDirectory);
    }
    yield* currentMatches;
}
function* expandGlobSync(glob, { root, exclude = [], includeDirs = true, extended = true, globstar = true, caseInsensitive, followSymlinks, canonicalize } = {}) {
    const { segments, isAbsolute: isGlobAbsolute, hasTrailingSep, winRoot } = split(toPathString(glob));
    root ??= isGlobAbsolute ? winRoot ?? "/" : Deno.cwd();
    const globOptions = {
        extended,
        globstar,
        caseInsensitive
    };
    const absRoot = isGlobAbsolute ? root : resolve2(root);
    const resolveFromRoot = (path)=>resolve2(absRoot, path);
    const excludePatterns = exclude.map(resolveFromRoot).map((s)=>globToRegExp2(s, globOptions));
    const shouldInclude = (path)=>!excludePatterns.some((p)=>!!path.match(p));
    let fixedRoot = isGlobAbsolute ? winRoot !== undefined ? winRoot : "/" : absRoot;
    while(segments.length > 0 && !isGlob(segments[0])){
        const seg = segments.shift();
        assert(seg !== undefined);
        fixedRoot = joinGlobs2([
            fixedRoot,
            seg
        ], globOptions);
    }
    let fixedRootInfo;
    try {
        fixedRootInfo = createWalkEntrySync(fixedRoot);
    } catch (error) {
        return throwUnlessNotFound(error);
    }
    function* advanceMatch(walkInfo, globSegment) {
        if (!walkInfo.isDirectory) {
            return;
        } else if (globSegment === "..") {
            const parentPath = joinGlobs2([
                walkInfo.path,
                ".."
            ], globOptions);
            try {
                if (shouldInclude(parentPath)) {
                    return yield createWalkEntrySync(parentPath);
                }
            } catch (error) {
                throwUnlessNotFound(error);
            }
            return;
        } else if (globSegment === "**") {
            return yield* walkSync(walkInfo.path, {
                skip: excludePatterns,
                maxDepth: globstar ? Infinity : 1,
                followSymlinks,
                canonicalize
            });
        }
        const globPattern = globToRegExp2(globSegment, globOptions);
        for (const walkEntry of walkSync(walkInfo.path, {
            maxDepth: 1,
            skip: excludePatterns,
            followSymlinks
        })){
            if (walkEntry.path !== walkInfo.path && walkEntry.name.match(globPattern)) {
                yield walkEntry;
            }
        }
    }
    let currentMatches = [
        fixedRootInfo
    ];
    for (const segment of segments){
        const nextMatchMap = new Map();
        for (const currentMatch of currentMatches){
            for (const nextMatch of advanceMatch(currentMatch, segment)){
                nextMatchMap.set(nextMatch.path, nextMatch);
            }
        }
        currentMatches = [
            ...nextMatchMap.values()
        ].sort(comparePath);
    }
    if (hasTrailingSep) {
        currentMatches = currentMatches.filter((entry)=>entry.isDirectory);
    }
    if (!includeDirs) {
        currentMatches = currentMatches.filter((entry)=>!entry.isDirectory);
    }
    yield* currentMatches;
}
const PERIOD_CHAR_CODE = ".".charCodeAt(0);
function createPath(path) {
    if (path instanceof Path) {
        return path;
    } else {
        return new Path(path);
    }
}
class Path {
    #path;
    #knownResolved = false;
    static instanceofSymbol = Symbol.for("dax.Path");
    constructor(path){
        if (path instanceof URL) {
            this.#path = fromFileUrl2(path);
        } else if (path instanceof Path) {
            this.#path = path.toString();
        } else if (typeof path === "string") {
            if (path.startsWith("file://")) {
                this.#path = fromFileUrl2(path);
            } else {
                this.#path = path;
            }
        } else {
            this.#path = fromFileUrl2(path.url);
        }
    }
    static [Symbol.hasInstance](instance) {
        return instance?.constructor?.instanceofSymbol === Path.instanceofSymbol;
    }
    [Symbol.for("Deno.customInspect")]() {
        return `Path("${this.#path}")`;
    }
    [Symbol.for("nodejs.util.inspect.custom")]() {
        return `Path("${this.#path}")`;
    }
    toString() {
        return this.#path;
    }
    toFileUrl() {
        const resolvedPath = this.resolve();
        return toFileUrl2(resolvedPath.toString());
    }
    equals(otherPath) {
        return this.resolve().toString() === otherPath.resolve().toString();
    }
    join(...pathSegments) {
        return new Path(join2(this.#path, ...pathSegments));
    }
    resolve(...pathSegments) {
        if (this.#knownResolved && pathSegments.length === 0) {
            return this;
        }
        const resolvedPath = resolve2(this.#path, ...pathSegments);
        if (pathSegments.length === 0 && resolvedPath === this.#path) {
            this.#knownResolved = true;
            return this;
        } else {
            const pathRef = new Path(resolvedPath);
            pathRef.#knownResolved = true;
            return pathRef;
        }
    }
    normalize() {
        return new Path(normalize2(this.#path));
    }
    isDirSync() {
        return this.statSync()?.isDirectory ?? false;
    }
    isFileSync() {
        return this.statSync()?.isFile ?? false;
    }
    isSymlinkSync() {
        return this.lstatSync()?.isSymlink ?? false;
    }
    isAbsolute() {
        return isAbsolute2(this.#path);
    }
    isRelative() {
        return !this.isAbsolute();
    }
    async stat() {
        try {
            return await Deno.stat(this.#path);
        } catch (err) {
            if (err instanceof Deno.errors.NotFound) {
                return undefined;
            } else {
                throw err;
            }
        }
    }
    statSync() {
        try {
            return Deno.statSync(this.#path);
        } catch (err) {
            if (err instanceof Deno.errors.NotFound) {
                return undefined;
            } else {
                throw err;
            }
        }
    }
    async lstat() {
        try {
            return await Deno.lstat(this.#path);
        } catch (err) {
            if (err instanceof Deno.errors.NotFound) {
                return undefined;
            } else {
                throw err;
            }
        }
    }
    lstatSync() {
        try {
            return Deno.lstatSync(this.#path);
        } catch (err) {
            if (err instanceof Deno.errors.NotFound) {
                return undefined;
            } else {
                throw err;
            }
        }
    }
    dirname() {
        return dirname2(this.#path);
    }
    basename() {
        return basename2(this.#path);
    }
    *ancestors() {
        let ancestor = this.parent();
        while(ancestor != null){
            yield ancestor;
            ancestor = ancestor.parent();
        }
    }
    *components() {
        const path = this.normalize();
        let last_index = 0;
        if (path.#path.startsWith("\\\\?\\")) {
            last_index = nextSlash(path.#path, 4);
            if (last_index === -1) {
                yield path.#path;
                return;
            } else {
                yield path.#path.substring(0, last_index);
                last_index += 1;
            }
        } else if (path.#path.startsWith("/")) {
            last_index += 1;
        }
        while(true){
            const index = nextSlash(path.#path, last_index);
            if (index < 0) {
                const part = path.#path.substring(last_index);
                if (part.length > 0) {
                    yield part;
                }
                return;
            }
            yield path.#path.substring(last_index, index);
            last_index = index + 1;
        }
        function nextSlash(path, start) {
            for(let i = start; i < path.length; i++){
                const c = path.charCodeAt(i);
                if (c === 47 || c === 92) {
                    return i;
                }
            }
            return -1;
        }
    }
    *#rcomponents() {
        const path = this.normalize();
        let last_index = undefined;
        while(last_index == null || last_index > 0){
            const index = nextSlash(path.#path, last_index == null ? undefined : last_index - 1);
            if (index < 0) {
                const part = path.#path.substring(0, last_index);
                if (part.length > 0) {
                    yield part;
                }
                return;
            }
            const part = path.#path.substring(index + 1, last_index);
            if (last_index != null || part.length > 0) {
                yield part;
            }
            last_index = index;
        }
        function nextSlash(path, start) {
            for(let i = start ?? path.length - 1; i >= 0; i--){
                const c = path.charCodeAt(i);
                if (c === 47 || c === 92) {
                    return i;
                }
            }
            return -1;
        }
    }
    startsWith(path) {
        const startsWithComponents = ensurePath(path).components();
        for (const component of this.components()){
            const next = startsWithComponents.next();
            if (next.done) {
                return true;
            }
            if (next.value !== component) {
                return false;
            }
        }
        return startsWithComponents.next().done ?? true;
    }
    endsWith(path) {
        const endsWithComponents = ensurePath(path).#rcomponents();
        for (const component of this.#rcomponents()){
            const next = endsWithComponents.next();
            if (next.done) {
                return true;
            }
            if (next.value !== component) {
                return false;
            }
        }
        return endsWithComponents.next().done ?? true;
    }
    parent() {
        const resolvedPath = this.resolve();
        const dirname = resolvedPath.dirname();
        if (dirname === resolvedPath.#path) {
            return undefined;
        } else {
            return new Path(dirname);
        }
    }
    parentOrThrow() {
        const parent = this.parent();
        if (parent == null) {
            throw new Error(`Cannot get the parent directory of '${this.#path}'.`);
        }
        return parent;
    }
    extname() {
        const extName = extname2(this.#path);
        return extName.length === 0 ? undefined : extName;
    }
    withExtname(ext) {
        const currentExt = this.extname();
        const hasLeadingPeriod = ext.charCodeAt(0) === PERIOD_CHAR_CODE;
        if (!hasLeadingPeriod && ext.length !== 0) {
            ext = "." + ext;
        }
        return new Path(this.#path.substring(0, this.#path.length - (currentExt?.length ?? 0)) + ext);
    }
    withBasename(basename) {
        const currentBaseName = this.basename();
        return new Path(this.#path.substring(0, this.#path.length - currentBaseName.length) + basename);
    }
    relative(to) {
        const toPath = ensurePath(to);
        return relative2(this.resolve().#path, toPath.resolve().#path);
    }
    exists() {
        return this.lstat().then((info)=>info != null);
    }
    existsSync() {
        return this.lstatSync() != null;
    }
    realPath() {
        return Deno.realPath(this.#path).then((path)=>new Path(path));
    }
    realPathSync() {
        return new Path(Deno.realPathSync(this.#path));
    }
    async *expandGlob(glob, options) {
        const entries = expandGlob(glob, {
            root: this.resolve().toString(),
            ...options
        });
        for await (const entry of entries){
            yield this.#stdWalkEntryToDax(entry);
        }
    }
    *expandGlobSync(glob, options) {
        const entries = expandGlobSync(glob, {
            root: this.resolve().toString(),
            ...options
        });
        for (const entry of entries){
            yield this.#stdWalkEntryToDax(entry);
        }
    }
    async *walk(options) {
        for await (const entry of walk(this.resolve().toString(), options)){
            yield this.#stdWalkEntryToDax(entry);
        }
    }
    *walkSync(options) {
        for (const entry of walkSync(this.resolve().toString(), options)){
            yield this.#stdWalkEntryToDax(entry);
        }
    }
    #stdWalkEntryToDax(entry) {
        return {
            ...entry,
            path: new Path(entry.path)
        };
    }
    async mkdir(options) {
        await Deno.mkdir(this.#path, {
            recursive: true,
            ...options
        });
        return this;
    }
    mkdirSync(options) {
        Deno.mkdirSync(this.#path, {
            recursive: true,
            ...options
        });
        return this;
    }
    async symlinkTo(target, opts) {
        await createSymlink(this.#resolveCreateSymlinkOpts(target, opts));
    }
    symlinkToSync(target, opts) {
        createSymlinkSync(this.#resolveCreateSymlinkOpts(target, opts));
    }
    #resolveCreateSymlinkOpts(target, opts) {
        if (opts?.kind == null) {
            if (typeof target === "string") {
                return {
                    fromPath: this.resolve(),
                    targetPath: ensurePath(target),
                    text: target,
                    type: opts?.type
                };
            } else {
                throw new Error("Please specify if this symlink is absolute or relative. Otherwise provide the target text.");
            }
        }
        const targetPath = ensurePath(target).resolve();
        if (opts?.kind === "relative") {
            const fromPath = this.resolve();
            let relativePath;
            if (fromPath.dirname() === targetPath.dirname()) {
                relativePath = targetPath.basename();
            } else {
                relativePath = fromPath.relative(targetPath);
            }
            return {
                fromPath,
                targetPath,
                text: relativePath,
                type: opts?.type
            };
        } else {
            return {
                fromPath: this.resolve(),
                targetPath,
                text: targetPath.#path,
                type: opts?.type
            };
        }
    }
    async linkTo(targetPath) {
        const targetPathRef = ensurePath(targetPath).resolve();
        await Deno.link(targetPathRef.toString(), this.resolve().toString());
    }
    linkToSync(targetPath) {
        const targetPathRef = ensurePath(targetPath).resolve();
        Deno.linkSync(targetPathRef.toString(), this.resolve().toString());
    }
    async *readDir() {
        const dir = this.resolve();
        for await (const entry of Deno.readDir(dir.#path)){
            yield {
                ...entry,
                path: dir.join(entry.name)
            };
        }
    }
    *readDirSync() {
        const dir = this.resolve();
        for (const entry of Deno.readDirSync(dir.#path)){
            yield {
                ...entry,
                path: dir.join(entry.name)
            };
        }
    }
    async *readDirFilePaths() {
        const dir = this.resolve();
        for await (const entry of Deno.readDir(dir.#path)){
            if (entry.isFile) {
                yield dir.join(entry.name);
            }
        }
    }
    *readDirFilePathsSync() {
        const dir = this.resolve();
        for (const entry of Deno.readDirSync(dir.#path)){
            if (entry.isFile) {
                yield dir.join(entry.name);
            }
        }
    }
    readBytes(options) {
        return Deno.readFile(this.#path, options);
    }
    readBytesSync() {
        return Deno.readFileSync(this.#path);
    }
    readMaybeBytes(options) {
        return notFoundToUndefined(()=>this.readBytes(options));
    }
    readMaybeBytesSync() {
        return notFoundToUndefinedSync(()=>this.readBytesSync());
    }
    readText(options) {
        return Deno.readTextFile(this.#path, options);
    }
    readTextSync() {
        return Deno.readTextFileSync(this.#path);
    }
    readMaybeText(options) {
        return notFoundToUndefined(()=>this.readText(options));
    }
    readMaybeTextSync() {
        return notFoundToUndefinedSync(()=>this.readTextSync());
    }
    async readJson(options) {
        return this.#parseJson(await this.readText(options));
    }
    readJsonSync() {
        return this.#parseJson(this.readTextSync());
    }
    #parseJson(text) {
        try {
            return JSON.parse(text);
        } catch (err) {
            throw new Error(`Failed parsing JSON in '${this.toString()}'.`, {
                cause: err
            });
        }
    }
    readMaybeJson(options) {
        return notFoundToUndefined(()=>this.readJson(options));
    }
    readMaybeJsonSync() {
        return notFoundToUndefinedSync(()=>this.readJsonSync());
    }
    async write(data, options) {
        await this.#withFileForWriting(options, (file)=>file.write(data));
        return this;
    }
    writeSync(data, options) {
        this.#withFileForWritingSync(options, (file)=>{
            file.writeSync(data);
        });
        return this;
    }
    async writeText(text, options) {
        await this.#withFileForWriting(options, (file)=>file.writeText(text));
        return this;
    }
    writeTextSync(text, options) {
        this.#withFileForWritingSync(options, (file)=>{
            file.writeTextSync(text);
        });
        return this;
    }
    async writeJson(obj, options) {
        const text = JSON.stringify(obj);
        await this.#writeTextWithEndNewLine(text, options);
        return this;
    }
    writeJsonSync(obj, options) {
        const text = JSON.stringify(obj);
        this.#writeTextWithEndNewLineSync(text, options);
        return this;
    }
    async writeJsonPretty(obj, options) {
        const text = JSON.stringify(obj, undefined, 2);
        await this.#writeTextWithEndNewLine(text, options);
        return this;
    }
    writeJsonPrettySync(obj, options) {
        const text = JSON.stringify(obj, undefined, 2);
        this.#writeTextWithEndNewLineSync(text, options);
        return this;
    }
    #writeTextWithEndNewLine(text, options) {
        return this.#withFileForWriting(options, async (file)=>{
            await file.writeText(text);
            await file.writeText("\n");
        });
    }
    async append(data, options) {
        await this.#withFileForAppending(options, (file)=>file.write(data));
        return this;
    }
    appendSync(data, options) {
        this.#withFileForAppendingSync(options, (file)=>{
            file.writeSync(data);
        });
        return this;
    }
    async appendText(text, options) {
        await this.#withFileForAppending(options, (file)=>file.writeText(text));
        return this;
    }
    appendTextSync(text, options) {
        this.#withFileForAppendingSync(options, (file)=>{
            file.writeTextSync(text);
        });
        return this;
    }
    #withFileForAppending(options, action) {
        return this.#withFileForWriting({
            append: true,
            ...options
        }, action);
    }
    async #withFileForWriting(options, action) {
        const file = await this.#openFileMaybeCreatingDirectory({
            write: true,
            create: true,
            truncate: options?.append !== true,
            ...options
        });
        try {
            return await action(file);
        } finally{
            try {
                file.close();
            } catch  {}
        }
    }
    async #openFileMaybeCreatingDirectory(options) {
        const resolvedPath = this.resolve();
        try {
            return await resolvedPath.open(options);
        } catch (err) {
            if (err instanceof Deno.errors.NotFound) {
                const parent = resolvedPath.parent();
                if (parent != null) {
                    try {
                        await parent.mkdir();
                    } catch  {
                        throw err;
                    }
                }
                return await resolvedPath.open(options);
            } else {
                throw err;
            }
        }
    }
    #writeTextWithEndNewLineSync(text, options) {
        this.#withFileForWritingSync(options, (file)=>{
            file.writeTextSync(text);
            file.writeTextSync("\n");
        });
    }
    #withFileForAppendingSync(options, action) {
        return this.#withFileForWritingSync({
            append: true,
            ...options
        }, action);
    }
    #withFileForWritingSync(options, action) {
        const file = this.#openFileForWritingSync(options);
        try {
            return action(file);
        } finally{
            try {
                file.close();
            } catch  {}
        }
    }
    #openFileForWritingSync(options) {
        return this.#openFileMaybeCreatingDirectorySync({
            write: true,
            create: true,
            truncate: options?.append !== true,
            ...options
        });
    }
    #openFileMaybeCreatingDirectorySync(options) {
        try {
            return this.openSync(options);
        } catch (err) {
            if (err instanceof Deno.errors.NotFound) {
                const parent = this.resolve().parent();
                if (parent != null) {
                    try {
                        parent.mkdirSync();
                    } catch  {
                        throw err;
                    }
                }
                return this.openSync(options);
            } else {
                throw err;
            }
        }
    }
    async chmod(mode) {
        await Deno.chmod(this.#path, mode);
        return this;
    }
    chmodSync(mode) {
        Deno.chmodSync(this.#path, mode);
        return this;
    }
    async chown(uid, gid) {
        await Deno.chown(this.#path, uid, gid);
        return this;
    }
    chownSync(uid, gid) {
        Deno.chownSync(this.#path, uid, gid);
        return this;
    }
    create() {
        return Deno.create(this.#path).then((file)=>createFsFileWrapper(file));
    }
    createSync() {
        return createFsFileWrapper(Deno.createSync(this.#path));
    }
    createNew() {
        return this.open({
            createNew: true,
            read: true,
            write: true
        });
    }
    createNewSync() {
        return this.openSync({
            createNew: true,
            read: true,
            write: true
        });
    }
    open(options) {
        return Deno.open(this.#path, options).then((file)=>createFsFileWrapper(file));
    }
    openSync(options) {
        return createFsFileWrapper(Deno.openSync(this.#path, options));
    }
    async remove(options) {
        await Deno.remove(this.#path, options);
        return this;
    }
    removeSync(options) {
        Deno.removeSync(this.#path, options);
        return this;
    }
    async emptyDir() {
        await emptyDir(this.toString());
        return this;
    }
    emptyDirSync() {
        emptyDirSync(this.toString());
        return this;
    }
    async ensureDir() {
        await ensureDir(this.toString());
        return this;
    }
    ensureDirSync() {
        ensureDirSync(this.toString());
        return this;
    }
    async ensureFile() {
        await ensureFile(this.toString());
        return this;
    }
    ensureFileSync() {
        ensureFileSync(this.toString());
        return this;
    }
    async copy(destinationPath, options) {
        const pathRef = ensurePath(destinationPath);
        await copy1(this.#path, pathRef.#path, options);
        return pathRef;
    }
    copySync(destinationPath, options) {
        const pathRef = ensurePath(destinationPath);
        copySync(this.#path, pathRef.#path, options);
        return pathRef;
    }
    copyToDir(destinationDirPath, options) {
        const destinationPath = ensurePath(destinationDirPath).join(this.basename());
        return this.copy(destinationPath, options);
    }
    copyToDirSync(destinationDirPath, options) {
        const destinationPath = ensurePath(destinationDirPath).join(this.basename());
        return this.copySync(destinationPath, options);
    }
    rename(newPath) {
        const pathRef = ensurePath(newPath);
        return Deno.rename(this.#path, pathRef.#path).then(()=>pathRef);
    }
    renameSync(newPath) {
        const pathRef = ensurePath(newPath);
        Deno.renameSync(this.#path, pathRef.#path);
        return pathRef;
    }
    renameToDir(destinationDirPath) {
        const destinationPath = ensurePath(destinationDirPath).join(this.basename());
        return this.rename(destinationPath);
    }
    renameToDirSync(destinationDirPath) {
        const destinationPath = ensurePath(destinationDirPath).join(this.basename());
        return this.renameSync(destinationPath);
    }
    async pipeTo(dest, options) {
        const file = await Deno.open(this.#path, {
            read: true
        });
        try {
            await file.readable.pipeTo(dest, options);
        } finally{
            try {
                file.close();
            } catch  {}
        }
        return this;
    }
}
function ensurePath(path) {
    return path instanceof Path ? path : new Path(path);
}
async function createSymlink(opts) {
    let kind = opts.type;
    if (kind == null && Deno.build.os === "windows") {
        const info = await opts.targetPath.lstat();
        if (info?.isDirectory) {
            kind = "dir";
        } else if (info?.isFile) {
            kind = "file";
        } else {
            throw new Deno.errors.NotFound(`The target path '${opts.targetPath}' did not exist or path kind could not be determined. ` + `When the path doesn't exist, you need to specify a symlink type on Windows.`);
        }
    }
    await Deno.symlink(opts.text, opts.fromPath.toString(), kind == null ? undefined : {
        type: kind
    });
}
function createSymlinkSync(opts) {
    let kind = opts.type;
    if (kind == null && Deno.build.os === "windows") {
        const info = opts.targetPath.lstatSync();
        if (info?.isDirectory) {
            kind = "dir";
        } else if (info?.isFile) {
            kind = "file";
        } else {
            throw new Deno.errors.NotFound(`The target path '${opts.targetPath}' did not exist or path kind could not be determined. ` + `When the path doesn't exist, you need to specify a symlink type on Windows.`);
        }
    }
    Deno.symlinkSync(opts.text, opts.fromPath.toString(), kind == null ? undefined : {
        type: kind
    });
}
function createFsFileWrapper(file) {
    Object.setPrototypeOf(file, FsFileWrapper.prototype);
    return file;
}
class FsFileWrapper extends Deno.FsFile {
    [symbols.readable]() {
        return this.readable;
    }
    [symbols.writable]() {
        return this.writable;
    }
    writeText(text) {
        return this.writeBytes(new TextEncoder().encode(text));
    }
    writeTextSync(text) {
        return this.writeBytesSync(new TextEncoder().encode(text));
    }
    async writeBytes(bytes) {
        await writeAll(this, bytes);
        return this;
    }
    writeBytesSync(bytes) {
        writeAllSync(this, bytes);
        return this;
    }
}
async function notFoundToUndefined(action) {
    try {
        return await action();
    } catch (err) {
        if (err instanceof Deno.errors.NotFound) {
            return undefined;
        } else {
            throw err;
        }
    }
}
function notFoundToUndefinedSync(action) {
    try {
        return action();
    } catch (err) {
        if (err instanceof Deno.errors.NotFound) {
            return undefined;
        } else {
            throw err;
        }
    }
}
const withProgressBarFactorySymbol = Symbol();
class RequestBuilder {
    #state = undefined;
    #getClonedState() {
        const state = this.#state;
        if (state == null) {
            return this.#getDefaultState();
        }
        return {
            noThrow: typeof state.noThrow === "boolean" ? state.noThrow : [
                ...state.noThrow
            ],
            url: state.url,
            body: state.body,
            cache: state.cache,
            headers: state.headers,
            integrity: state.integrity,
            keepalive: state.keepalive,
            method: state.method,
            mode: state.mode,
            redirect: state.redirect,
            referrer: state.referrer,
            referrerPolicy: state.referrerPolicy,
            progressBarFactory: state.progressBarFactory,
            progressOptions: state.progressOptions == null ? undefined : {
                ...state.progressOptions
            },
            timeout: state.timeout
        };
    }
    #getDefaultState() {
        return {
            noThrow: false,
            url: undefined,
            body: undefined,
            cache: undefined,
            headers: {},
            integrity: undefined,
            keepalive: undefined,
            method: undefined,
            mode: undefined,
            redirect: undefined,
            referrer: undefined,
            referrerPolicy: undefined,
            progressBarFactory: undefined,
            progressOptions: undefined,
            timeout: undefined
        };
    }
    #newWithState(action) {
        const builder = new RequestBuilder();
        const state = this.#getClonedState();
        action(state);
        builder.#state = state;
        return builder;
    }
    [symbols.readable]() {
        const self = this;
        let streamReader;
        let response;
        let wasCancelled = false;
        let cancelledReason;
        return new ReadableStream({
            async start () {
                response = await self.fetch();
                const readable = response.readable;
                if (wasCancelled) {
                    readable.cancel(cancelledReason);
                } else {
                    streamReader = readable.getReader();
                }
            },
            async pull (controller) {
                const { done, value: value1 } = await streamReader.read();
                if (done || value1 == null) {
                    if (response?.signal?.aborted) {
                        controller.error(response?.signal?.reason);
                    } else {
                        controller.close();
                    }
                } else {
                    controller.enqueue(value1);
                }
            },
            cancel (reason) {
                streamReader?.cancel(reason);
                wasCancelled = true;
                cancelledReason = reason;
            }
        });
    }
    then(onfulfilled, onrejected) {
        return this.fetch().then(onfulfilled).catch(onrejected);
    }
    fetch() {
        return makeRequest(this.#getClonedState()).catch((err)=>{
            if (err instanceof TimeoutError) {
                Error.captureStackTrace(err, TimeoutError);
            }
            return Promise.reject(err);
        });
    }
    url(value1) {
        return this.#newWithState((state)=>{
            state.url = value1;
        });
    }
    header(nameOrItems, value1) {
        return this.#newWithState((state)=>{
            if (typeof nameOrItems === "string") {
                setHeader(state, nameOrItems, value1);
            } else {
                for (const [name, value1] of Object.entries(nameOrItems)){
                    setHeader(state, name, value1);
                }
            }
        });
        function setHeader(state, name, value1) {
            name = name.toUpperCase();
            state.headers[name] = value1;
        }
    }
    noThrow(value1, ...additional) {
        return this.#newWithState((state)=>{
            if (typeof value1 === "boolean" || value1 == null) {
                state.noThrow = value1 ?? true;
            } else {
                state.noThrow = [
                    value1,
                    ...additional
                ];
            }
        });
    }
    body(value1) {
        return this.#newWithState((state)=>{
            state.body = value1;
        });
    }
    cache(value1) {
        return this.#newWithState((state)=>{
            state.cache = value1;
        });
    }
    integrity(value1) {
        return this.#newWithState((state)=>{
            state.integrity = value1;
        });
    }
    keepalive(value1) {
        return this.#newWithState((state)=>{
            state.keepalive = value1;
        });
    }
    method(value1) {
        return this.#newWithState((state)=>{
            state.method = value1;
        });
    }
    mode(value1) {
        return this.#newWithState((state)=>{
            state.mode = value1;
        });
    }
    [withProgressBarFactorySymbol](factory) {
        return this.#newWithState((state)=>{
            state.progressBarFactory = factory;
        });
    }
    redirect(value1) {
        return this.#newWithState((state)=>{
            state.redirect = value1;
        });
    }
    referrer(value1) {
        return this.#newWithState((state)=>{
            state.referrer = value1;
        });
    }
    referrerPolicy(value1) {
        return this.#newWithState((state)=>{
            state.referrerPolicy = value1;
        });
    }
    showProgress(value1) {
        return this.#newWithState((state)=>{
            if (value1 === true || value1 == null) {
                state.progressOptions = {
                    noClear: false
                };
            } else if (value1 === false) {
                state.progressOptions = undefined;
            } else {
                state.progressOptions = {
                    noClear: value1.noClear ?? false
                };
            }
        });
    }
    timeout(delay) {
        return this.#newWithState((state)=>{
            state.timeout = delay == null ? undefined : delayToMs(delay);
        });
    }
    async arrayBuffer() {
        const response = await this.fetch();
        return response.arrayBuffer();
    }
    async blob() {
        const response = await this.fetch();
        return response.blob();
    }
    async formData() {
        const response = await this.fetch();
        return response.formData();
    }
    async json() {
        let builder = this;
        const acceptHeaderName = "ACCEPT";
        if (builder.#state == null || !Object.hasOwn(builder.#state.headers, acceptHeaderName)) {
            builder = builder.header(acceptHeaderName, "application/json");
        }
        const response = await builder.fetch();
        return response.json();
    }
    async text() {
        const response = await this.fetch();
        return response.text();
    }
    async pipeTo(dest, options) {
        const response = await this.fetch();
        return await response.pipeTo(dest, options);
    }
    async pipeToPath(filePathOrOptions, maybeOptions) {
        const { filePath, options } = resolvePipeToPathParams(filePathOrOptions, maybeOptions, this.#state?.url);
        const response = await this.fetch();
        return await response.pipeToPath(filePath, options);
    }
    async pipeThrough(transform) {
        const response = await this.fetch();
        return response.pipeThrough(transform);
    }
}
class RequestResponse {
    #response;
    #downloadResponse;
    #originalUrl;
    #abortController;
    constructor(opts){
        this.#originalUrl = opts.originalUrl;
        this.#response = opts.response;
        this.#abortController = opts.abortController;
        if (opts.response.body == null) {
            opts.abortController.clearTimeout();
        }
        if (opts.progressBar != null) {
            const pb = opts.progressBar;
            this.#downloadResponse = new Response(new ReadableStream({
                async start (controller) {
                    const reader = opts.response.body?.getReader();
                    if (reader == null) {
                        return;
                    }
                    try {
                        while(true){
                            const { done, value: value1 } = await reader.read();
                            if (done || value1 == null) {
                                break;
                            }
                            pb.increment(value1.byteLength);
                            controller.enqueue(value1);
                        }
                        const signal = opts.abortController.controller.signal;
                        if (signal.aborted) {
                            controller.error(signal.reason);
                        } else {
                            controller.close();
                        }
                    } finally{
                        reader.releaseLock();
                        pb.finish();
                    }
                }
            }));
        } else {
            this.#downloadResponse = opts.response;
        }
    }
    get response() {
        return this.#response;
    }
    get headers() {
        return this.#response.headers;
    }
    get ok() {
        return this.#response.ok;
    }
    get redirected() {
        return this.#response.redirected;
    }
    get signal() {
        return this.#abortController.controller.signal;
    }
    get status() {
        return this.#response.status;
    }
    get statusText() {
        return this.#response.statusText;
    }
    get url() {
        return this.#response.url;
    }
    abort(reason) {
        this.#abortController?.controller.abort(reason);
    }
    throwIfNotOk() {
        if (!this.ok) {
            this.#response.body?.cancel().catch(()=>{});
            throw new Error(`Error making request to ${this.#originalUrl}: ${this.statusText}`);
        }
    }
    arrayBuffer() {
        return this.#withReturnHandling(async ()=>{
            if (this.#response.status === 404) {
                await this.#response.body?.cancel();
                return undefined;
            }
            return this.#downloadResponse.arrayBuffer();
        });
    }
    blob() {
        return this.#withReturnHandling(async ()=>{
            if (this.#response.status === 404) {
                await this.#response.body?.cancel();
                return undefined;
            }
            return await this.#downloadResponse.blob();
        });
    }
    formData() {
        return this.#withReturnHandling(async ()=>{
            if (this.#response.status === 404) {
                await this.#response.body?.cancel();
                return undefined;
            }
            return await this.#downloadResponse.formData();
        });
    }
    json() {
        return this.#withReturnHandling(async ()=>{
            if (this.#response.status === 404) {
                await this.#response.body?.cancel();
                return undefined;
            }
            return await this.#downloadResponse.json();
        });
    }
    text() {
        return this.#withReturnHandling(async ()=>{
            if (this.#response.status === 404) {
                await this.#response.body?.cancel();
                return undefined;
            }
            return await this.#downloadResponse.text();
        });
    }
    pipeTo(dest, options) {
        return this.#withReturnHandling(()=>this.readable.pipeTo(dest, options));
    }
    async pipeToPath(filePathOrOptions, maybeOptions) {
        const { filePath, options } = resolvePipeToPathParams(filePathOrOptions, maybeOptions, this.#originalUrl);
        const body = this.readable;
        try {
            const file = await filePath.open({
                write: true,
                create: true,
                ...options ?? {}
            });
            try {
                await body.pipeTo(file.writable, {
                    preventClose: true
                });
                await file.writable.close();
            } finally{
                try {
                    file.close();
                } catch  {}
                this.#abortController?.clearTimeout();
            }
        } catch (err) {
            await this.#response.body?.cancel();
            throw err;
        }
        return filePath;
    }
    pipeThrough(transform) {
        return this.readable.pipeThrough(transform);
    }
    get readable() {
        const body = this.#downloadResponse.body;
        if (body == null) {
            throw new Error("Response had no body.");
        }
        return body;
    }
    async #withReturnHandling(action) {
        try {
            return await action();
        } catch (err) {
            if (err instanceof TimeoutError) {
                Error.captureStackTrace(err);
            }
            throw err;
        } finally{
            this.#abortController.clearTimeout();
        }
    }
}
async function makeRequest(state) {
    if (state.url == null) {
        throw new Error("You must specify a URL before fetching.");
    }
    const abortController = getTimeoutAbortController() ?? {
        controller: new AbortController(),
        clearTimeout () {}
    };
    const response = await fetch(state.url, {
        body: state.body,
        cache: state.cache,
        headers: filterEmptyRecordValues(state.headers),
        integrity: state.integrity,
        keepalive: state.keepalive,
        method: state.method,
        mode: state.mode,
        redirect: state.redirect,
        referrer: state.referrer,
        referrerPolicy: state.referrerPolicy,
        signal: abortController.controller.signal
    });
    const result = new RequestResponse({
        response,
        originalUrl: state.url.toString(),
        progressBar: getProgressBar(),
        abortController
    });
    if (!state.noThrow) {
        result.throwIfNotOk();
    } else if (state.noThrow instanceof Array) {
        if (!state.noThrow.includes(response.status)) {
            result.throwIfNotOk();
        }
    }
    return result;
    function getProgressBar() {
        if (state.progressOptions == null || state.progressBarFactory == null) {
            return undefined;
        }
        return state.progressBarFactory(`Download ${state.url}`).noClear(state.progressOptions.noClear).kind("bytes").length(getContentLength());
        function getContentLength() {
            const contentLength = response.headers.get("content-length");
            if (contentLength == null) {
                return undefined;
            }
            const length = parseInt(contentLength, 10);
            return isNaN(length) ? undefined : length;
        }
    }
    function getTimeoutAbortController() {
        if (state.timeout == null) {
            return undefined;
        }
        const timeout = state.timeout;
        const controller = new AbortController();
        const timeoutId = setTimeout(()=>controller.abort(new TimeoutError(`Request timed out after ${formatMillis(timeout)}.`)), timeout);
        return {
            controller,
            clearTimeout () {
                clearTimeout(timeoutId);
            }
        };
    }
}
function resolvePipeToPathParams(pathOrOptions, maybeOptions, originalUrl) {
    let filePath;
    let options;
    if (typeof pathOrOptions === "string" || pathOrOptions instanceof URL) {
        filePath = new Path(pathOrOptions).resolve();
        options = maybeOptions;
    } else if (pathOrOptions instanceof Path) {
        filePath = pathOrOptions.resolve();
        options = maybeOptions;
    } else if (typeof pathOrOptions === "object") {
        options = pathOrOptions;
    } else if (pathOrOptions === undefined) {
        options = maybeOptions;
    }
    if (filePath === undefined) {
        filePath = new Path(getFileNameFromUrlOrThrow(originalUrl));
    } else if (filePath.isDirSync()) {
        filePath = filePath.join(getFileNameFromUrlOrThrow(originalUrl));
    }
    filePath = filePath.resolve();
    return {
        filePath,
        options
    };
    function getFileNameFromUrlOrThrow(url) {
        const fileName = url == null ? undefined : getFileNameFromUrl(url);
        if (fileName == null) {
            throw new Error("Could not derive the path from the request URL. " + "Please explicitly provide a path.");
        }
        return fileName;
    }
}
class Deferred {
    #create;
    constructor(create){
        this.#create = create;
    }
    create() {
        return this.#create();
    }
}
const textDecoder = new TextDecoder();
const builtInCommands = {
    cd: cdCommand,
    printenv: printEnvCommand,
    echo: echoCommand,
    cat: catCommand,
    exit: exitCommand,
    export: exportCommand,
    sleep: sleepCommand,
    test: testCommand,
    rm: rmCommand,
    mkdir: mkdirCommand,
    cp: cpCommand,
    mv: mvCommand,
    pwd: pwdCommand,
    touch: touchCommand,
    unset: unsetCommand,
    which: whichCommand
};
const getRegisteredCommandNamesSymbol = Symbol();
const setCommandTextStateSymbol = Symbol();
class CommandBuilder {
    #state = {
        command: undefined,
        combinedStdoutStderr: false,
        stdin: "inherit",
        stdout: {
            kind: "inherit"
        },
        stderr: {
            kind: "inherit"
        },
        noThrow: false,
        env: {},
        cwd: undefined,
        commands: {
            ...builtInCommands
        },
        clearEnv: false,
        exportEnv: false,
        printCommand: false,
        printCommandLogger: new LoggerTreeBox((cmd)=>console.error(white(">"), blue(cmd))),
        timeout: undefined,
        signal: undefined
    };
    #getClonedState() {
        const state = this.#state;
        return {
            command: state.command,
            combinedStdoutStderr: state.combinedStdoutStderr,
            stdin: state.stdin,
            stdout: {
                kind: state.stdout.kind,
                options: state.stdout.options
            },
            stderr: {
                kind: state.stderr.kind,
                options: state.stderr.options
            },
            noThrow: state.noThrow instanceof Array ? [
                ...state.noThrow
            ] : state.noThrow,
            env: {
                ...state.env
            },
            cwd: state.cwd,
            commands: {
                ...state.commands
            },
            clearEnv: state.clearEnv,
            exportEnv: state.exportEnv,
            printCommand: state.printCommand,
            printCommandLogger: state.printCommandLogger.createChild(),
            timeout: state.timeout,
            signal: state.signal
        };
    }
    #newWithState(action) {
        const builder = new CommandBuilder();
        const state = this.#getClonedState();
        action(state);
        builder.#state = state;
        return builder;
    }
    then(onfulfilled, onrejected) {
        return this.spawn().then(onfulfilled).catch(onrejected);
    }
    spawn() {
        return parseAndSpawnCommand(this.#getClonedState());
    }
    registerCommand(command, handleFn) {
        validateCommandName(command);
        return this.#newWithState((state)=>{
            state.commands[command] = handleFn;
        });
    }
    registerCommands(commands) {
        let command = this;
        for (const [key, value1] of Object.entries(commands)){
            command = command.registerCommand(key, value1);
        }
        return command;
    }
    unregisterCommand(command) {
        return this.#newWithState((state)=>{
            delete state.commands[command];
        });
    }
    command(command) {
        return this.#newWithState((state)=>{
            if (command instanceof Array) {
                command = command.map(escapeArg).join(" ");
            }
            state.command = {
                text: command,
                fds: undefined
            };
        });
    }
    noThrow(value1, ...additional) {
        return this.#newWithState((state)=>{
            if (typeof value1 === "boolean" || value1 == null) {
                state.noThrow = value1 ?? true;
            } else {
                state.noThrow = [
                    value1,
                    ...additional
                ];
            }
        });
    }
    signal(killSignal) {
        return this.#newWithState((state)=>{
            if (state.signal != null) {
                state.signal.linkChild(killSignal);
            }
            state.signal = killSignal;
        });
    }
    captureCombined(value1 = true) {
        return this.#newWithState((state)=>{
            state.combinedStdoutStderr = value1;
            if (value1) {
                if (state.stdout.kind !== "piped" && state.stdout.kind !== "inheritPiped") {
                    state.stdout.kind = "piped";
                }
                if (state.stderr.kind !== "piped" && state.stderr.kind !== "inheritPiped") {
                    state.stderr.kind = "piped";
                }
            }
        });
    }
    stdin(reader) {
        return this.#newWithState((state)=>{
            if (reader === "inherit" || reader === "null") {
                state.stdin = reader;
            } else if (reader instanceof Uint8Array) {
                state.stdin = new Deferred(()=>new Buffer(reader));
            } else if (reader instanceof Path) {
                state.stdin = new Deferred(async ()=>{
                    const file = await reader.open();
                    return file.readable;
                });
            } else if (reader instanceof RequestBuilder) {
                state.stdin = new Deferred(async ()=>{
                    const body = await reader;
                    return body.readable;
                });
            } else if (reader instanceof CommandBuilder) {
                state.stdin = new Deferred(()=>{
                    return reader.stdout("piped").spawn().stdout();
                });
            } else {
                state.stdin = new Box(reader);
            }
        });
    }
    stdinText(text) {
        return this.stdin(new TextEncoder().encode(text));
    }
    stdout(kind, options) {
        return this.#newWithState((state)=>{
            if (state.combinedStdoutStderr && kind !== "piped" && kind !== "inheritPiped") {
                throw new Error("Cannot set stdout's kind to anything but 'piped' or 'inheritPiped' when combined is true.");
            }
            if (options?.signal != null) {
                throw new Error("Setting a signal for a stdout WritableStream is not yet supported.");
            }
            state.stdout = {
                kind,
                options
            };
        });
    }
    stderr(kind, options) {
        return this.#newWithState((state)=>{
            if (state.combinedStdoutStderr && kind !== "piped" && kind !== "inheritPiped") {
                throw new Error("Cannot set stderr's kind to anything but 'piped' or 'inheritPiped' when combined is true.");
            }
            if (options?.signal != null) {
                throw new Error("Setting a signal for a stderr WritableStream is not yet supported.");
            }
            state.stderr = {
                kind,
                options
            };
        });
    }
    pipe(builder) {
        return builder.stdin(this.stdout("piped"));
    }
    env(nameOrItems, value1) {
        return this.#newWithState((state)=>{
            if (typeof nameOrItems === "string") {
                setEnv(state, nameOrItems, value1);
            } else {
                for (const [key, value1] of Object.entries(nameOrItems)){
                    setEnv(state, key, value1);
                }
            }
        });
        function setEnv(state, key, value1) {
            if (Deno.build.os === "windows") {
                key = key.toUpperCase();
            }
            state.env[key] = value1;
        }
    }
    cwd(dirPath) {
        return this.#newWithState((state)=>{
            state.cwd = dirPath instanceof URL ? fromFileUrl2(dirPath) : dirPath instanceof Path ? dirPath.resolve().toString() : resolve2(dirPath);
        });
    }
    exportEnv(value1 = true) {
        return this.#newWithState((state)=>{
            state.exportEnv = value1;
        });
    }
    clearEnv(value1 = true) {
        return this.#newWithState((state)=>{
            state.clearEnv = value1;
        });
    }
    printCommand(value1 = true) {
        return this.#newWithState((state)=>{
            state.printCommand = value1;
        });
    }
    setPrintCommandLogger(logger) {
        this.#state.printCommandLogger.setValue(logger);
    }
    quiet(kind = "combined") {
        kind = kind === "both" ? "combined" : kind;
        return this.#newWithState((state)=>{
            if (kind === "combined" || kind === "stdout") {
                state.stdout.kind = getQuietKind(state.stdout.kind);
            }
            if (kind === "combined" || kind === "stderr") {
                state.stderr.kind = getQuietKind(state.stderr.kind);
            }
        });
        function getQuietKind(kind) {
            if (typeof kind === "object") {
                return kind;
            }
            switch(kind){
                case "inheritPiped":
                case "inherit":
                    return "piped";
                case "null":
                case "piped":
                    return kind;
                default:
                    {
                        throw new Error(`Unhandled kind ${kind}.`);
                    }
            }
        }
    }
    timeout(delay) {
        return this.#newWithState((state)=>{
            state.timeout = delay == null ? undefined : delayToMs(delay);
        });
    }
    async bytes(kind = "stdout") {
        const command = kind === "combined" ? this.quiet(kind).captureCombined() : this.quiet(kind);
        return (await command)[`${kind}Bytes`];
    }
    async text(kind = "stdout") {
        const command = kind === "combined" ? this.quiet(kind).captureCombined() : this.quiet(kind);
        return (await command)[kind].replace(/\r?\n$/, "");
    }
    async lines(kind = "stdout") {
        const text = await this.text(kind);
        return text.split(/\r?\n/g);
    }
    async json(kind = "stdout") {
        return (await this.quiet(kind))[`${kind}Json`];
    }
    [getRegisteredCommandNamesSymbol]() {
        return Object.keys(this.#state.commands);
    }
    [setCommandTextStateSymbol](textState) {
        return this.#newWithState((state)=>{
            state.command = textState;
        });
    }
}
class CommandChild extends Promise {
    #pipedStdoutBuffer;
    #pipedStderrBuffer;
    #killSignalController;
    constructor(executor, options = {
        pipedStderrBuffer: undefined,
        pipedStdoutBuffer: undefined,
        killSignalController: undefined
    }){
        super(executor);
        this.#pipedStdoutBuffer = options.pipedStdoutBuffer;
        this.#pipedStderrBuffer = options.pipedStderrBuffer;
        this.#killSignalController = options.killSignalController;
    }
    kill(signal) {
        this.#killSignalController?.kill(signal);
    }
    stdout() {
        const buffer = this.#pipedStdoutBuffer;
        this.#assertBufferStreamable("stdout", buffer);
        this.#pipedStdoutBuffer = "consumed";
        this.catch(()=>{});
        return this.#bufferToStream(buffer);
    }
    stderr() {
        const buffer = this.#pipedStderrBuffer;
        this.#assertBufferStreamable("stderr", buffer);
        this.#pipedStderrBuffer = "consumed";
        this.catch(()=>{});
        return this.#bufferToStream(buffer);
    }
    #assertBufferStreamable(name, buffer) {
        if (buffer == null) {
            throw new Error(`No pipe available. Ensure ${name} is "piped" (not "inheritPiped") and combinedOutput is not enabled.`);
        }
        if (buffer === "consumed") {
            throw new Error(`Streamable ${name} was already consumed. Use the previously acquired stream instead.`);
        }
    }
    #bufferToStream(buffer) {
        const self = this;
        return new ReadableStream({
            start (controller) {
                buffer.setListener({
                    writeSync (data) {
                        controller.enqueue(data);
                        return data.length;
                    },
                    setError (err) {
                        controller.error(err);
                    },
                    close () {
                        controller.close();
                    }
                });
            },
            cancel (_reason) {
                self.kill();
            }
        });
    }
}
function parseAndSpawnCommand(state) {
    if (state.command == null) {
        throw new Error("A command must be set before it can be spawned.");
    }
    if (state.printCommand) {
        state.printCommandLogger.getValue()(state.command.text);
    }
    const disposables = [];
    const asyncDisposables = [];
    const parentSignal = state.signal;
    const killSignalController = new KillSignalController();
    if (parentSignal != null) {
        const parentSignalListener = (signal)=>{
            killSignalController.kill(signal);
        };
        parentSignal.addListener(parentSignalListener);
        disposables.push({
            [Symbol.dispose] () {
                parentSignal.removeListener(parentSignalListener);
            }
        });
    }
    let timedOut = false;
    if (state.timeout != null) {
        const timeoutId = setTimeout(()=>{
            timedOut = true;
            killSignalController.kill();
        }, state.timeout);
        disposables.push({
            [Symbol.dispose] () {
                clearTimeout(timeoutId);
            }
        });
    }
    const [stdoutBuffer, stderrBuffer, combinedBuffer] = getBuffers();
    const stdout = new ShellPipeWriter(state.stdout.kind, stdoutBuffer === "null" ? new NullPipeWriter() : stdoutBuffer === "inherit" ? Deno.stdout : stdoutBuffer);
    const stderr = new ShellPipeWriter(state.stderr.kind, stderrBuffer === "null" ? new NullPipeWriter() : stderrBuffer === "inherit" ? Deno.stderr : stderrBuffer);
    const { text: commandText, fds } = state.command;
    const signal = killSignalController.signal;
    return new CommandChild(async (resolve, reject)=>{
        try {
            const list = parseCommand(commandText);
            const stdin = await takeStdin();
            let code = await spawn(list, {
                stdin: stdin instanceof ReadableStream ? readerFromStreamReader1(stdin.getReader()) : stdin,
                stdout,
                stderr,
                env: buildEnv(state.env, state.clearEnv),
                commands: state.commands,
                cwd: state.cwd ?? Deno.cwd(),
                exportEnv: state.exportEnv,
                clearedEnv: state.clearEnv,
                signal,
                fds
            });
            if (code !== 0) {
                if (timedOut) {
                    code = 124;
                }
                const noThrow = state.noThrow instanceof Array ? state.noThrow.includes(code) : state.noThrow;
                if (!noThrow) {
                    if (stdin instanceof ReadableStream) {
                        if (!stdin.locked) {
                            stdin.cancel();
                        }
                    }
                    if (timedOut) {
                        throw new Error(`Timed out with exit code: ${code}`);
                    } else if (signal.aborted) {
                        throw new Error(`${timedOut ? "Timed out" : "Aborted"} with exit code: ${code}`);
                    } else {
                        throw new Error(`Exited with code: ${code}`);
                    }
                }
            }
            const result = new CommandResult(code, finalizeCommandResultBuffer(stdoutBuffer), finalizeCommandResultBuffer(stderrBuffer), combinedBuffer instanceof Buffer ? combinedBuffer : undefined);
            const maybeError = await cleanupDisposablesAndMaybeGetError(undefined);
            if (maybeError) {
                reject(maybeError);
            } else {
                resolve(result);
            }
        } catch (err) {
            finalizeCommandResultBufferForError(stdoutBuffer, err);
            finalizeCommandResultBufferForError(stderrBuffer, err);
            reject(await cleanupDisposablesAndMaybeGetError(err));
        }
    }, {
        pipedStdoutBuffer: stdoutBuffer instanceof PipedBuffer ? stdoutBuffer : undefined,
        pipedStderrBuffer: stderrBuffer instanceof PipedBuffer ? stderrBuffer : undefined,
        killSignalController
    });
    async function cleanupDisposablesAndMaybeGetError(maybeError) {
        const errors = [];
        if (maybeError) {
            errors.push(maybeError);
        }
        for (const disposable of disposables){
            try {
                disposable[Symbol.dispose]();
            } catch (err) {
                errors.push(err);
            }
        }
        if (asyncDisposables.length > 0) {
            await Promise.all(asyncDisposables.map(async (d)=>{
                try {
                    await d[Symbol.asyncDispose]();
                } catch (err) {
                    errors.push(err);
                }
            }));
        }
        if (errors.length === 1) {
            return errors[0];
        } else if (errors.length > 1) {
            return new AggregateError(errors);
        } else {
            return undefined;
        }
    }
    async function takeStdin() {
        if (state.stdin instanceof Box) {
            const stdin = state.stdin.value;
            if (stdin === "consumed") {
                throw new Error("Cannot spawn command. Stdin was already consumed when a previous command using " + "the same stdin was spawned. You need to call `.stdin(...)` again with a new " + "value before spawning.");
            }
            state.stdin.value = "consumed";
            return stdin;
        } else if (state.stdin instanceof Deferred) {
            const stdin = await state.stdin.create();
            if (stdin instanceof ReadableStream) {
                asyncDisposables.push({
                    async [Symbol.asyncDispose] () {
                        if (!stdin.locked) {
                            await stdin.cancel();
                        }
                    }
                });
            }
            return stdin;
        } else {
            return state.stdin;
        }
    }
    function getBuffers() {
        const hasProgressBars = isShowingProgressBars();
        const stdoutBuffer = getOutputBuffer(Deno.stdout, state.stdout);
        const stderrBuffer = getOutputBuffer(Deno.stderr, state.stderr);
        if (state.combinedStdoutStderr) {
            if (typeof stdoutBuffer === "string" || typeof stderrBuffer === "string") {
                throw new Error("Internal programming error. Expected writers for stdout and stderr.");
            }
            const combinedBuffer = new Buffer();
            return [
                getCapturingBuffer(stdoutBuffer, combinedBuffer),
                getCapturingBuffer(stderrBuffer, combinedBuffer),
                combinedBuffer
            ];
        }
        return [
            stdoutBuffer,
            stderrBuffer,
            undefined
        ];
        function getCapturingBuffer(buffer, combinedBuffer) {
            if ("write" in buffer) {
                return new CapturingBufferWriter(buffer, combinedBuffer);
            } else {
                return new CapturingBufferWriterSync(buffer, combinedBuffer);
            }
        }
        function getOutputBuffer(inheritWriter, { kind, options }) {
            if (typeof kind === "object") {
                if (kind instanceof Path) {
                    const file = kind.openSync({
                        write: true,
                        truncate: true,
                        create: true
                    });
                    disposables.push(file);
                    return file;
                } else if (kind instanceof WritableStream) {
                    const streamWriter = kind.getWriter();
                    asyncDisposables.push({
                        async [Symbol.asyncDispose] () {
                            streamWriter.releaseLock();
                            if (!options?.preventClose) {
                                try {
                                    await kind.close();
                                } catch  {}
                            }
                        }
                    });
                    return writerFromStreamWriter(streamWriter);
                } else {
                    return kind;
                }
            }
            switch(kind){
                case "inherit":
                    if (hasProgressBars) {
                        return new InheritStaticTextBypassWriter(inheritWriter);
                    } else {
                        return "inherit";
                    }
                case "piped":
                    return new PipedBuffer();
                case "inheritPiped":
                    return new CapturingBufferWriterSync(inheritWriter, new Buffer());
                case "null":
                    return "null";
                default:
                    {
                        throw new Error("Unhandled.");
                    }
            }
        }
    }
    function finalizeCommandResultBuffer(buffer) {
        if (buffer instanceof CapturingBufferWriterSync || buffer instanceof CapturingBufferWriter) {
            return buffer.getBuffer();
        } else if (buffer instanceof InheritStaticTextBypassWriter) {
            buffer.flush();
            return "inherit";
        } else if (buffer instanceof PipedBuffer) {
            buffer.close();
            return buffer.getBuffer() ?? "streamed";
        } else if (typeof buffer === "object") {
            return "streamed";
        } else {
            return buffer;
        }
    }
    function finalizeCommandResultBufferForError(buffer, error) {
        if (buffer instanceof InheritStaticTextBypassWriter) {
            buffer.flush();
        } else if (buffer instanceof PipedBuffer) {
            buffer.setError(error);
        }
    }
}
class CommandResult {
    #stdout;
    #stderr;
    #combined;
    code;
    constructor(code, stdout, stderr, combined){
        this.code = code;
        this.#stdout = stdout;
        this.#stderr = stderr;
        this.#combined = combined;
    }
    #memoizedStdout;
    get stdout() {
        if (!this.#memoizedStdout) {
            this.#memoizedStdout = textDecoder.decode(this.stdoutBytes);
        }
        return this.#memoizedStdout;
    }
    #memoizedStdoutJson;
    get stdoutJson() {
        if (this.#memoizedStdoutJson == null) {
            this.#memoizedStdoutJson = JSON.parse(this.stdout);
        }
        return this.#memoizedStdoutJson;
    }
    get stdoutBytes() {
        if (this.#stdout === "streamed") {
            throw new Error(`Stdout was streamed to another source and is no longer available.`);
        }
        if (typeof this.#stdout === "string") {
            throw new Error(`Stdout was not piped (was ${this.#stdout}). Call .stdout("piped") or .stdout("inheritPiped") when building the command.`);
        }
        return this.#stdout.bytes({
            copy: false
        });
    }
    #memoizedStderr;
    get stderr() {
        if (!this.#memoizedStderr) {
            this.#memoizedStderr = textDecoder.decode(this.stderrBytes);
        }
        return this.#memoizedStderr;
    }
    #memoizedStderrJson;
    get stderrJson() {
        if (this.#memoizedStderrJson == null) {
            this.#memoizedStderrJson = JSON.parse(this.stderr);
        }
        return this.#memoizedStderrJson;
    }
    get stderrBytes() {
        if (this.#stderr === "streamed") {
            throw new Error(`Stderr was streamed to another source and is no longer available.`);
        }
        if (typeof this.#stderr === "string") {
            throw new Error(`Stderr was not piped (was ${this.#stderr}). Call .stderr("piped") or .stderr("inheritPiped") when building the command.`);
        }
        return this.#stderr.bytes({
            copy: false
        });
    }
    #memoizedCombined;
    get combined() {
        if (!this.#memoizedCombined) {
            this.#memoizedCombined = textDecoder.decode(this.combinedBytes);
        }
        return this.#memoizedCombined;
    }
    get combinedBytes() {
        if (this.#combined == null) {
            throw new Error("Stdout and stderr were not combined. Call .captureCombined() when building the command.");
        }
        return this.#combined.bytes({
            copy: false
        });
    }
}
function buildEnv(env, clearEnv) {
    const result = clearEnv ? {} : Deno.env.toObject();
    for (const [key, value1] of Object.entries(env)){
        if (value1 == null) {
            delete result[key];
        } else {
            result[key] = value1;
        }
    }
    return result;
}
function escapeArg(arg) {
    if (/^[A-Za-z0-9]+$/.test(arg)) {
        return arg;
    } else {
        return `'${arg.replaceAll("'", `'"'"'`)}'`;
    }
}
function validateCommandName(command) {
    if (command.match(/^[a-zA-Z0-9-_]+$/) == null) {
        throw new Error("Invalid command name");
    }
}
const SHELL_SIGNAL_CTOR_SYMBOL = Symbol();
class KillSignalController {
    #state;
    #killSignal;
    constructor(){
        this.#state = {
            abortedCode: undefined,
            listeners: []
        };
        this.#killSignal = new KillSignal(SHELL_SIGNAL_CTOR_SYMBOL, this.#state);
    }
    get signal() {
        return this.#killSignal;
    }
    kill(signal = "SIGTERM") {
        sendSignalToState(this.#state, signal);
    }
}
class KillSignal {
    #state;
    constructor(symbol, state){
        if (symbol !== SHELL_SIGNAL_CTOR_SYMBOL) {
            throw new Error("Constructing instances of KillSignal is not permitted.");
        }
        this.#state = state;
    }
    get aborted() {
        return this.#state.abortedCode !== undefined;
    }
    get abortedExitCode() {
        return this.#state.abortedCode;
    }
    linkChild(killSignal) {
        const listener = (signal)=>{
            sendSignalToState(killSignal.#state, signal);
        };
        this.addListener(listener);
        return {
            unsubscribe: ()=>{
                this.removeListener(listener);
            }
        };
    }
    addListener(listener) {
        this.#state.listeners.push(listener);
    }
    removeListener(listener) {
        const index = this.#state.listeners.indexOf(listener);
        if (index >= 0) {
            this.#state.listeners.splice(index, 1);
        }
    }
}
function sendSignalToState(state, signal) {
    const code = getSignalAbortCode(signal);
    if (code !== undefined) {
        state.abortedCode = code;
    }
    for (const listener of state.listeners){
        listener(signal);
    }
}
function getSignalAbortCode(signal) {
    switch(signal){
        case "SIGTERM":
            return 128 + 15;
        case "SIGKILL":
            return 128 + 9;
        case "SIGABRT":
            return 128 + 6;
        case "SIGQUIT":
            return 128 + 3;
        case "SIGINT":
            return 128 + 2;
        case "SIGSTOP":
            return 128 + 19;
        default:
            return undefined;
    }
}
function template(strings, exprs) {
    return templateInner(strings, exprs, escapeArg);
}
function templateRaw(strings, exprs) {
    return templateInner(strings, exprs, undefined);
}
function templateInner(strings, exprs, escape) {
    let nextStreamFd = 3;
    let text = "";
    let streams;
    const exprsCount = exprs.length;
    for(let i = 0; i < Math.max(strings.length, exprs.length); i++){
        if (strings.length > i) {
            text += strings[i];
        }
        if (exprs.length > i) {
            try {
                const expr = exprs[i];
                if (expr == null) {
                    throw "Expression was null or undefined.";
                }
                const inputOrOutputRedirect = detectInputOrOutputRedirect(text);
                if (inputOrOutputRedirect === "<") {
                    if (expr instanceof Path) {
                        text += templateLiteralExprToString(expr, escape);
                    } else if (typeof expr === "string") {
                        handleReadableStream(()=>new ReadableStream({
                                start (controller) {
                                    controller.enqueue(new TextEncoder().encode(expr));
                                    controller.close();
                                }
                            }));
                    } else if (expr instanceof ReadableStream) {
                        handleReadableStream(()=>expr);
                    } else if (expr?.[symbols.readable]) {
                        handleReadableStream(()=>{
                            const stream = expr[symbols.readable]?.();
                            if (!(stream instanceof ReadableStream)) {
                                throw new Error("Expected a ReadableStream or an object with a [$.symbols.readable] method " + `that returns a ReadableStream at expression ${i + 1}/${exprsCount}.`);
                            }
                            return stream;
                        });
                    } else if (expr instanceof Uint8Array) {
                        handleReadableStream(()=>{
                            return new ReadableStream({
                                start (controller) {
                                    controller.enqueue(expr);
                                    controller.close();
                                }
                            });
                        });
                    } else if (expr instanceof Response) {
                        handleReadableStream(()=>{
                            return expr.body ?? new ReadableStream({
                                start (controller) {
                                    controller.close();
                                }
                            });
                        });
                    } else if (expr instanceof Function) {
                        handleReadableStream(()=>{
                            try {
                                const result = expr();
                                if (!(result instanceof ReadableStream)) {
                                    throw new Error("Function did not return a ReadableStream.");
                                }
                                return result;
                            } catch (err) {
                                throw new Error(`Error getting ReadableStream from function at ` + `expression ${i + 1}/${exprsCount}. ${errorToString(err)}`);
                            }
                        });
                    } else {
                        throw new Error("Unsupported object provided to input redirect.");
                    }
                } else if (inputOrOutputRedirect === ">") {
                    if (expr instanceof Path) {
                        text += templateLiteralExprToString(expr, escape);
                    } else if (expr instanceof WritableStream) {
                        handleWritableStream(()=>expr);
                    } else if (expr instanceof Uint8Array) {
                        let pos = 0;
                        handleWritableStream(()=>{
                            return new WritableStream({
                                write (chunk) {
                                    const nextPos = chunk.length + pos;
                                    if (nextPos > expr.length) {
                                        const chunkLength = expr.length - pos;
                                        expr.set(chunk.slice(0, chunkLength), pos);
                                        throw new Error(`Overflow writing ${nextPos} bytes to Uint8Array (length: ${exprsCount}).`);
                                    }
                                    expr.set(chunk, pos);
                                    pos = nextPos;
                                }
                            });
                        });
                    } else if (expr?.[symbols.writable]) {
                        handleWritableStream(()=>{
                            const stream = expr[symbols.writable]?.();
                            if (!(stream instanceof WritableStream)) {
                                throw new Error(`Expected a WritableStream or an object with a [$.symbols.writable] method ` + `that returns a WritableStream at expression ${i + 1}/${exprsCount}.`);
                            }
                            return stream;
                        });
                    } else if (expr instanceof Function) {
                        handleWritableStream(()=>{
                            try {
                                const result = expr();
                                if (!(result instanceof WritableStream)) {
                                    throw new Error("Function did not return a WritableStream.");
                                }
                                return result;
                            } catch (err) {
                                throw new Error(`Error getting WritableStream from function at ` + `expression ${i + 1}/${exprsCount}. ${errorToString(err)}`);
                            }
                        });
                    } else if (typeof expr === "string") {
                        throw new Error("Cannot provide strings to output redirects. Did you mean to provide a path instead via the `$.path(...)` API?");
                    } else {
                        throw new Error("Unsupported object provided to output redirect.");
                    }
                } else {
                    text += templateLiteralExprToString(expr, escape);
                }
            } catch (err) {
                const startMessage = exprsCount === 1 ? "Failed resolving expression in command." : `Failed resolving expression ${i + 1}/${exprsCount} in command.`;
                throw new Error(`${startMessage} ${errorToString(err)}`);
            }
        }
    }
    return {
        text,
        fds: streams
    };
    function handleReadableStream(createStream) {
        streams ??= new StreamFds();
        const fd = nextStreamFd++;
        streams.insertReader(fd, ()=>{
            const reader = createStream().getReader();
            return {
                ...readerFromStreamReader1(reader),
                [Symbol.dispose] () {
                    reader.releaseLock();
                }
            };
        });
        text = text.trimEnd() + "&" + fd;
    }
    function handleWritableStream(createStream) {
        streams ??= new StreamFds();
        const fd = nextStreamFd++;
        streams.insertWriter(fd, ()=>{
            const stream = createStream();
            const writer = stream.getWriter();
            return {
                ...writerFromStreamWriter(writer),
                async [Symbol.asyncDispose] () {
                    writer.releaseLock();
                    try {
                        await stream.close();
                    } catch  {}
                }
            };
        });
        text = text.trimEnd() + "&" + fd;
    }
}
function detectInputOrOutputRedirect(text) {
    text = text.trimEnd();
    if (text.endsWith(">")) {
        return ">";
    } else if (text.endsWith("<")) {
        return "<";
    } else {
        return undefined;
    }
}
function templateLiteralExprToString(expr, escape) {
    let result;
    if (typeof expr === "string") {
        result = expr;
    } else if (expr instanceof Array) {
        return expr.map((e)=>templateLiteralExprToString(e, escape)).join(" ");
    } else if (expr instanceof CommandResult) {
        result = expr.stdout.replace(/\r?\n$/, "");
    } else if (expr instanceof CommandBuilder) {
        throw new Error("Providing a command builder is not yet supported (https://github.com/dsherret/dax/issues/239). " + "Await the command builder's text before using it in an expression (ex. await $`cmd`.text()).");
    } else if (typeof expr === "object" && expr.toString === Object.prototype.toString) {
        throw new Error("Provided object does not override `toString()`.");
    } else {
        result = `${expr}`;
    }
    return escape ? escape(result) : result;
}
function extend(target, source) {
    for(const prop in source){
        if (Object.hasOwn(source, prop)) {
            target[prop] = source[prop];
        }
    }
    return target;
}
const reLeadingNewline = /^[ \t]*(?:\r\n|\r|\n)/;
const reTrailingNewline = /(?:\r\n|\r|\n)[ \t]*$/;
const reStartsWithNewlineOrIsEmpty = /^(?:[\r\n]|$)/;
const reDetectIndentation = /(?:\r\n|\r|\n)([ \t]*)(?:[^ \t\r\n]|$)/;
const reOnlyWhitespaceWithAtLeastOneNewline = /^[ \t]*[\r\n][ \t\r\n]*$/;
function _outdentArray(strings, firstInterpolatedValueSetsIndentationLevel, options) {
    let indentationLevel = 0;
    const match = strings[0].match(reDetectIndentation);
    if (match) {
        indentationLevel = match[1].length;
    }
    const reSource = `(\\r\\n|\\r|\\n).{0,${indentationLevel}}`;
    const reMatchIndent = new RegExp(reSource, "g");
    if (firstInterpolatedValueSetsIndentationLevel) {
        strings = strings.slice(1);
    }
    const { newline, trimLeadingNewline, trimTrailingNewline } = options;
    const normalizeNewlines = typeof newline === "string";
    const l = strings.length;
    const outdentedStrings = strings.map((v, i)=>{
        v = v.replace(reMatchIndent, "$1");
        if (i === 0 && trimLeadingNewline) {
            v = v.replace(reLeadingNewline, "");
        }
        if (i === l - 1 && trimTrailingNewline) {
            v = v.replace(reTrailingNewline, "");
        }
        if (normalizeNewlines) {
            v = v.replace(/\r\n|\n|\r/g, (_)=>newline);
        }
        return v;
    });
    return outdentedStrings;
}
function concatStringsAndValues(strings, values) {
    let ret = "";
    for(let i = 0, l = strings.length; i < l; i++){
        ret += strings[i];
        if (i < l - 1) {
            ret += values[i];
        }
    }
    return ret;
}
function isTemplateStringsArray(v) {
    return Object.hasOwn(v, "raw") && Object.hasOwn(v, "length");
}
function createInstance(options) {
    const arrayAutoIndentCache = new WeakMap();
    const arrayFirstInterpSetsIndentCache = new WeakMap();
    function outdent(stringsOrOptions, ...values) {
        if (isTemplateStringsArray(stringsOrOptions)) {
            const strings = stringsOrOptions;
            const firstInterpolatedValueSetsIndentationLevel = (values[0] === outdent || values[0] === defaultOutdent) && reOnlyWhitespaceWithAtLeastOneNewline.test(strings[0]) && reStartsWithNewlineOrIsEmpty.test(strings[1]);
            const cache = firstInterpolatedValueSetsIndentationLevel ? arrayFirstInterpSetsIndentCache : arrayAutoIndentCache;
            let renderedArray = cache.get(strings);
            if (!renderedArray) {
                renderedArray = _outdentArray(strings, firstInterpolatedValueSetsIndentationLevel, options);
                cache.set(strings, renderedArray);
            }
            if (values.length === 0) {
                return renderedArray[0];
            }
            const rendered = concatStringsAndValues(renderedArray, firstInterpolatedValueSetsIndentationLevel ? values.slice(1) : values);
            return rendered;
        } else {
            return createInstance(extend(extend({}, options), stringsOrOptions || {}));
        }
    }
    const fullOutdent = extend(outdent, {
        string (str) {
            return _outdentArray([
                str
            ], false, options)[0];
        }
    });
    return fullOutdent;
}
const defaultOutdent = createInstance({
    trimLeadingNewline: true,
    trimTrailingNewline: true
});
function sleep(delay) {
    const ms = delayToMs(delay);
    return new Promise((resolve)=>setTimeout(resolve, ms));
}
async function withRetries($local, errorLogger, opts) {
    const delayIterator = delayToIterator(opts.delay);
    for(let i = 0; i < opts.count; i++){
        if (i > 0) {
            const nextDelay = delayIterator.next();
            if (!opts.quiet) {
                $local.logWarn(`Failed. Trying again in ${formatMillis(nextDelay)}...`);
            }
            await sleep(nextDelay);
            if (!opts.quiet) {
                $local.logStep(`Retrying attempt ${i + 1}/${opts.count}...`);
            }
        }
        try {
            return await opts.action();
        } catch (err) {
            errorLogger(err);
        }
    }
    throw new Error(`Failed after ${opts.count} attempts.`);
}
function cd(path) {
    if (typeof path === "string" || path instanceof URL) {
        path = new Path(path);
    } else if (!(path instanceof Path)) {
        path = new Path(path).parentOrThrow();
    }
    Deno.chdir(path.toString());
}
function buildInitial$State(opts) {
    return {
        commandBuilder: new TreeBox(opts.commandBuilder ?? new CommandBuilder()),
        requestBuilder: opts.requestBuilder ?? new RequestBuilder(),
        infoLogger: new LoggerTreeBox(console.error),
        warnLogger: new LoggerTreeBox(console.error),
        errorLogger: new LoggerTreeBox(console.error),
        indentLevel: new Box(0),
        extras: opts.extras
    };
}
const helperObject = {
    path: createPath,
    cd,
    escapeArg,
    stripAnsi (text) {
        return wasmInstance.strip_ansi_codes(text);
    },
    dedent: defaultOutdent,
    sleep,
    which (commandName) {
        if (commandName.toUpperCase() === "DENO") {
            return Promise.resolve(Deno.execPath());
        } else {
            return which(commandName, denoWhichRealEnv);
        }
    },
    whichSync (commandName) {
        if (commandName.toUpperCase() === "DENO") {
            return Deno.execPath();
        } else {
            return whichSync(commandName, denoWhichRealEnv);
        }
    }
};
function build$FromState(state) {
    const logDepthObj = {
        get logDepth () {
            return state.indentLevel.value;
        },
        set logDepth (value){
            if (value < 0 || value % 1 !== 0) {
                throw new Error("Expected a positive integer.");
            }
            state.indentLevel.value = value;
        }
    };
    const result = Object.assign((strings, ...exprs)=>{
        const textState = template(strings, exprs);
        return state.commandBuilder.getValue()[setCommandTextStateSymbol](textState);
    }, helperObject, logDepthObj, {
        build$ (opts = {}) {
            return build$FromState({
                commandBuilder: opts.commandBuilder != null ? new TreeBox(opts.commandBuilder) : state.commandBuilder.createChild(),
                requestBuilder: opts.requestBuilder ?? state.requestBuilder,
                errorLogger: state.errorLogger.createChild(),
                infoLogger: state.infoLogger.createChild(),
                warnLogger: state.warnLogger.createChild(),
                indentLevel: state.indentLevel,
                extras: {
                    ...state.extras,
                    ...opts.extras
                }
            });
        },
        log (...data) {
            state.infoLogger.getValue()(getLogText(data));
        },
        logLight (...data) {
            state.infoLogger.getValue()(gray(getLogText(data)));
        },
        logStep (firstArg, ...data) {
            logStep(firstArg, data, (t)=>bold(green(t)), state.infoLogger.getValue());
        },
        logError (firstArg, ...data) {
            logStep(firstArg, data, (t)=>bold(red(t)), state.errorLogger.getValue());
        },
        logWarn (firstArg, ...data) {
            logStep(firstArg, data, (t)=>bold(yellow(t)), state.warnLogger.getValue());
        },
        logGroup (labelOrAction, maybeAction) {
            const label = typeof labelOrAction === "string" ? labelOrAction : undefined;
            if (label) {
                state.infoLogger.getValue()(getLogText([
                    label
                ]));
            }
            state.indentLevel.value++;
            const action = label != null ? maybeAction : labelOrAction;
            if (action != null) {
                let wasPromise = false;
                try {
                    const result = action();
                    if (result instanceof Promise) {
                        wasPromise = true;
                        return result.finally(()=>{
                            if (state.indentLevel.value > 0) {
                                state.indentLevel.value--;
                            }
                        });
                    } else {
                        return result;
                    }
                } finally{
                    if (!wasPromise) {
                        if (state.indentLevel.value > 0) {
                            state.indentLevel.value--;
                        }
                    }
                }
            }
        },
        logGroupEnd () {
            if (state.indentLevel.value > 0) {
                state.indentLevel.value--;
            }
        },
        commandExists (commandName) {
            if (state.commandBuilder.getValue()[getRegisteredCommandNamesSymbol]().includes(commandName)) {
                return Promise.resolve(true);
            }
            return helperObject.which(commandName).then((c)=>c != null);
        },
        commandExistsSync (commandName) {
            if (state.commandBuilder.getValue()[getRegisteredCommandNamesSymbol]().includes(commandName)) {
                return true;
            }
            return helperObject.whichSync(commandName) != null;
        },
        maybeConfirm,
        confirm,
        maybeSelect,
        select,
        maybeMultiSelect,
        multiSelect,
        maybePrompt,
        prompt,
        progress (messageOrText, options) {
            const opts = typeof messageOrText === "string" ? (()=>{
                const words = messageOrText.split(" ");
                return {
                    prefix: words[0],
                    message: words.length > 1 ? words.slice(1).join(" ") : undefined,
                    ...options
                };
            })() : messageOrText;
            return new ProgressBar((...data)=>{
                state.infoLogger.getValue()(...data);
            }, opts);
        },
        setInfoLogger (logger) {
            state.infoLogger.setValue(logger);
        },
        setWarnLogger (logger) {
            state.warnLogger.setValue(logger);
        },
        setErrorLogger (logger) {
            state.errorLogger.setValue(logger);
            const commandBuilder = state.commandBuilder.getValue();
            commandBuilder.setPrintCommandLogger((cmd)=>logger(white(">"), blue(cmd)));
            state.commandBuilder.setValue(commandBuilder);
        },
        setPrintCommand (value1) {
            const commandBuilder = state.commandBuilder.getValue().printCommand(value1);
            state.commandBuilder.setValue(commandBuilder);
        },
        symbols,
        request (url) {
            return state.requestBuilder.url(url);
        },
        raw (strings, ...exprs) {
            const textState = templateRaw(strings, exprs);
            return state.commandBuilder.getValue()[setCommandTextStateSymbol](textState);
        },
        withRetries (opts) {
            return withRetries(result, state.errorLogger.getValue(), opts);
        }
    }, state.extras);
    const keyName = "logDepth";
    Object.defineProperty(result, keyName, Object.getOwnPropertyDescriptor(logDepthObj, keyName));
    state.requestBuilder = state.requestBuilder[withProgressBarFactorySymbol]((message)=>result.progress(message));
    return result;
    function getLogText(data) {
        const combinedText = data.map((d)=>{
            const typeofD = typeof d;
            if (typeofD !== "object" && typeofD !== "undefined") {
                return d;
            } else {
                return Deno.inspect(d, {
                    colors: true
                });
            }
        }).join(" ");
        if (state.indentLevel.value === 0) {
            return combinedText;
        } else {
            const indentText = "  ".repeat(state.indentLevel.value);
            return combinedText.split(/\n/).map((l)=>`${indentText}${l}`).join("\n");
        }
    }
    function logStep(firstArg, data, colourize, logger) {
        if (data.length === 0) {
            let i = 0;
            while(i < firstArg.length && firstArg[i] === " "){
                i++;
            }
            while(i < firstArg.length && firstArg[i] !== " "){
                i++;
            }
            firstArg = colourize(firstArg.substring(0, i)) + firstArg.substring(i);
        } else {
            firstArg = colourize(firstArg);
        }
        logger(getLogText([
            firstArg,
            ...data
        ]));
    }
}
const $ = build$FromState(buildInitial$State({
    isGlobal: true
}));
const output = await $`echo "hello world"`.text();
console.log(output);
