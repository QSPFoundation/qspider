var Module = (function () {
  var _scriptDir =
    typeof document !== 'undefined' && document.currentScript
      ? document.currentScript.src
      : undefined;

  return function (Module) {
    Module = Module || {};

    var Module = typeof Module !== 'undefined' ? Module : {};
    var moduleOverrides = {};
    var key;
    for (key in Module) {
      if (Module.hasOwnProperty(key)) {
        moduleOverrides[key] = Module[key];
      }
    }
    var arguments_ = [];
    var thisProgram = './this.program';
    var quit_ = function (status, toThrow) {
      throw toThrow;
    };
    var ENVIRONMENT_IS_WEB = true;
    var ENVIRONMENT_IS_WORKER = false;
    var scriptDirectory = '';
    function locateFile(path) {
      if (Module['locateFile']) {
        return Module['locateFile'](path, scriptDirectory);
      }
      return scriptDirectory + path;
    }
    var read_, readAsync, readBinary, setWindowTitle;
    if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
      if (ENVIRONMENT_IS_WORKER) {
        scriptDirectory = self.location.href;
      } else if (document.currentScript) {
        scriptDirectory = document.currentScript.src;
      }
      if (_scriptDir) {
        scriptDirectory = _scriptDir;
      }
      if (scriptDirectory.indexOf('blob:') !== 0) {
        scriptDirectory = scriptDirectory.substr(
          0,
          scriptDirectory.lastIndexOf('/') + 1
        );
      } else {
        scriptDirectory = '';
      }
      {
        read_ = function shell_read(url) {
          var xhr = new XMLHttpRequest();
          xhr.open('GET', url, false);
          xhr.send(null);
          return xhr.responseText;
        };
        if (ENVIRONMENT_IS_WORKER) {
          readBinary = function readBinary(url) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, false);
            xhr.responseType = 'arraybuffer';
            xhr.send(null);
            return new Uint8Array(xhr.response);
          };
        }
        readAsync = function readAsync(url, onload, onerror) {
          var xhr = new XMLHttpRequest();
          xhr.open('GET', url, true);
          xhr.responseType = 'arraybuffer';
          xhr.onload = function xhr_onload() {
            if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) {
              onload(xhr.response);
              return;
            }
            onerror();
          };
          xhr.onerror = onerror;
          xhr.send(null);
        };
      }
      setWindowTitle = function (title) {
        document.title = title;
      };
    } else {
    }
    var out = Module['print'] || console.log.bind(console);
    var err = Module['printErr'] || console.warn.bind(console);
    for (key in moduleOverrides) {
      if (moduleOverrides.hasOwnProperty(key)) {
        Module[key] = moduleOverrides[key];
      }
    }
    moduleOverrides = null;
    if (Module['arguments']) arguments_ = Module['arguments'];
    if (Module['thisProgram']) thisProgram = Module['thisProgram'];
    if (Module['quit']) quit_ = Module['quit'];
    function warnOnce(text) {
      if (!warnOnce.shown) warnOnce.shown = {};
      if (!warnOnce.shown[text]) {
        warnOnce.shown[text] = 1;
        err(text);
      }
    }
    function convertJsFunctionToWasm(func, sig) {
      if (typeof WebAssembly.Function === 'function') {
        var typeNames = { i: 'i32', j: 'i64', f: 'f32', d: 'f64' };
        var type = {
          parameters: [],
          results: sig[0] == 'v' ? [] : [typeNames[sig[0]]],
        };
        for (var i = 1; i < sig.length; ++i) {
          type.parameters.push(typeNames[sig[i]]);
        }
        return new WebAssembly.Function(type, func);
      }
      var typeSection = [1, 0, 1, 96];
      var sigRet = sig.slice(0, 1);
      var sigParam = sig.slice(1);
      var typeCodes = { i: 127, j: 126, f: 125, d: 124 };
      typeSection.push(sigParam.length);
      for (var i = 0; i < sigParam.length; ++i) {
        typeSection.push(typeCodes[sigParam[i]]);
      }
      if (sigRet == 'v') {
        typeSection.push(0);
      } else {
        typeSection = typeSection.concat([1, typeCodes[sigRet]]);
      }
      typeSection[1] = typeSection.length - 2;
      var bytes = new Uint8Array(
        [0, 97, 115, 109, 1, 0, 0, 0].concat(typeSection, [
          2,
          7,
          1,
          1,
          101,
          1,
          102,
          0,
          0,
          7,
          5,
          1,
          1,
          102,
          0,
          0,
        ])
      );
      var module = new WebAssembly.Module(bytes);
      var instance = new WebAssembly.Instance(module, { e: { f: func } });
      var wrappedFunc = instance.exports['f'];
      return wrappedFunc;
    }
    var freeTableIndexes = [];
    function addFunctionWasm(func, sig) {
      var table = wasmTable;
      var ret;
      if (freeTableIndexes.length) {
        ret = freeTableIndexes.pop();
      } else {
        ret = table.length;
        try {
          table.grow(1);
        } catch (err) {
          if (!(err instanceof RangeError)) {
            throw err;
          }
          throw 'Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.';
        }
      }
      try {
        table.set(ret, func);
      } catch (err) {
        if (!(err instanceof TypeError)) {
          throw err;
        }
        assert(
          typeof sig !== 'undefined',
          'Missing signature argument to addFunction'
        );
        var wrapped = convertJsFunctionToWasm(func, sig);
        table.set(ret, wrapped);
      }
      return ret;
    }
    function addFunction(func, sig) {
      return addFunctionWasm(func, sig);
    }
    var wasmBinary;
    if (Module['wasmBinary']) wasmBinary = Module['wasmBinary'];
    var noExitRuntime;
    if (Module['noExitRuntime']) noExitRuntime = Module['noExitRuntime'];
    if (typeof WebAssembly !== 'object') {
      err('no native wasm support detected');
    }
    function getValue(ptr, type, noSafe) {
      type = type || 'i8';
      if (type.charAt(type.length - 1) === '*') type = 'i32';
      switch (type) {
        case 'i1':
          return HEAP8[ptr >> 0];
        case 'i8':
          return HEAP8[ptr >> 0];
        case 'i16':
          return HEAP16[ptr >> 1];
        case 'i32':
          return HEAP32[ptr >> 2];
        case 'i64':
          return HEAP32[ptr >> 2];
        case 'float':
          return HEAPF32[ptr >> 2];
        case 'double':
          return HEAPF64[ptr >> 3];
        default:
          abort('invalid type for getValue: ' + type);
      }
      return null;
    }
    var wasmMemory;
    var wasmTable = new WebAssembly.Table({
      initial: 1,
      maximum: 1 + 20,
      element: 'anyfunc',
    });
    var ABORT = false;
    var EXITSTATUS = 0;
    function assert(condition, text) {
      if (!condition) {
        abort('Assertion failed: ' + text);
      }
    }
    function getCFunc(ident) {
      var func = Module['_' + ident];
      assert(
        func,
        'Cannot call unknown function ' + ident + ', make sure it is exported'
      );
      return func;
    }
    function ccall(ident, returnType, argTypes, args, opts) {
      var toC = {
        string: function (str) {
          var ret = 0;
          if (str !== null && str !== undefined && str !== 0) {
            var len = (str.length << 2) + 1;
            ret = stackAlloc(len);
            stringToUTF8(str, ret, len);
          }
          return ret;
        },
        array: function (arr) {
          var ret = stackAlloc(arr.length);
          writeArrayToMemory(arr, ret);
          return ret;
        },
      };
      function convertReturnValue(ret) {
        if (returnType === 'string') return UTF8ToString(ret);
        if (returnType === 'boolean') return Boolean(ret);
        return ret;
      }
      var func = getCFunc(ident);
      var cArgs = [];
      var stack = 0;
      if (args) {
        for (var i = 0; i < args.length; i++) {
          var converter = toC[argTypes[i]];
          if (converter) {
            if (stack === 0) stack = stackSave();
            cArgs[i] = converter(args[i]);
          } else {
            cArgs[i] = args[i];
          }
        }
      }
      var ret = func.apply(null, cArgs);
      var asyncMode = opts && opts.async;
      var runningAsync = typeof Asyncify === 'object' && Asyncify.currData;
      var prevRunningAsync =
        typeof Asyncify === 'object' && Asyncify.asyncFinalizers.length > 0;
      if (runningAsync && !prevRunningAsync) {
        return new Promise(function (resolve) {
          Asyncify.asyncFinalizers.push(function (ret) {
            if (stack !== 0) stackRestore(stack);
            resolve(convertReturnValue(ret));
          });
        });
      }
      ret = convertReturnValue(ret);
      if (stack !== 0) stackRestore(stack);
      if (opts && opts.async) return Promise.resolve(ret);
      return ret;
    }
    function cwrap(ident, returnType, argTypes, opts) {
      argTypes = argTypes || [];
      var numericArgs = argTypes.every(function (type) {
        return type === 'number';
      });
      var numericRet = returnType !== 'string';
      if (numericRet && numericArgs && !opts) {
        return getCFunc(ident);
      }
      return function () {
        return ccall(ident, returnType, argTypes, arguments, opts);
      };
    }
    var UTF8Decoder =
      typeof TextDecoder !== 'undefined' ? new TextDecoder('utf8') : undefined;
    function UTF8ArrayToString(u8Array, idx, maxBytesToRead) {
      var endIdx = idx + maxBytesToRead;
      var endPtr = idx;
      while (u8Array[endPtr] && !(endPtr >= endIdx)) ++endPtr;
      if (endPtr - idx > 16 && u8Array.subarray && UTF8Decoder) {
        return UTF8Decoder.decode(u8Array.subarray(idx, endPtr));
      } else {
        var str = '';
        while (idx < endPtr) {
          var u0 = u8Array[idx++];
          if (!(u0 & 128)) {
            str += String.fromCharCode(u0);
            continue;
          }
          var u1 = u8Array[idx++] & 63;
          if ((u0 & 224) == 192) {
            str += String.fromCharCode(((u0 & 31) << 6) | u1);
            continue;
          }
          var u2 = u8Array[idx++] & 63;
          if ((u0 & 240) == 224) {
            u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
          } else {
            u0 =
              ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (u8Array[idx++] & 63);
          }
          if (u0 < 65536) {
            str += String.fromCharCode(u0);
          } else {
            var ch = u0 - 65536;
            str += String.fromCharCode(55296 | (ch >> 10), 56320 | (ch & 1023));
          }
        }
      }
      return str;
    }
    function UTF8ToString(ptr, maxBytesToRead) {
      return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : '';
    }
    function stringToUTF8Array(str, outU8Array, outIdx, maxBytesToWrite) {
      if (!(maxBytesToWrite > 0)) return 0;
      var startIdx = outIdx;
      var endIdx = outIdx + maxBytesToWrite - 1;
      for (var i = 0; i < str.length; ++i) {
        var u = str.charCodeAt(i);
        if (u >= 55296 && u <= 57343) {
          var u1 = str.charCodeAt(++i);
          u = (65536 + ((u & 1023) << 10)) | (u1 & 1023);
        }
        if (u <= 127) {
          if (outIdx >= endIdx) break;
          outU8Array[outIdx++] = u;
        } else if (u <= 2047) {
          if (outIdx + 1 >= endIdx) break;
          outU8Array[outIdx++] = 192 | (u >> 6);
          outU8Array[outIdx++] = 128 | (u & 63);
        } else if (u <= 65535) {
          if (outIdx + 2 >= endIdx) break;
          outU8Array[outIdx++] = 224 | (u >> 12);
          outU8Array[outIdx++] = 128 | ((u >> 6) & 63);
          outU8Array[outIdx++] = 128 | (u & 63);
        } else {
          if (outIdx + 3 >= endIdx) break;
          outU8Array[outIdx++] = 240 | (u >> 18);
          outU8Array[outIdx++] = 128 | ((u >> 12) & 63);
          outU8Array[outIdx++] = 128 | ((u >> 6) & 63);
          outU8Array[outIdx++] = 128 | (u & 63);
        }
      }
      outU8Array[outIdx] = 0;
      return outIdx - startIdx;
    }
    function stringToUTF8(str, outPtr, maxBytesToWrite) {
      return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
    }
    var UTF16Decoder =
      typeof TextDecoder !== 'undefined'
        ? new TextDecoder('utf-16le')
        : undefined;
    function UTF32ToString(ptr) {
      var i = 0;
      var str = '';
      while (1) {
        var utf32 = HEAP32[(ptr + i * 4) >> 2];
        if (utf32 == 0) return str;
        ++i;
        if (utf32 >= 65536) {
          var ch = utf32 - 65536;
          str += String.fromCharCode(55296 | (ch >> 10), 56320 | (ch & 1023));
        } else {
          str += String.fromCharCode(utf32);
        }
      }
    }
    function stringToUTF32(str, outPtr, maxBytesToWrite) {
      if (maxBytesToWrite === undefined) {
        maxBytesToWrite = 2147483647;
      }
      if (maxBytesToWrite < 4) return 0;
      var startPtr = outPtr;
      var endPtr = startPtr + maxBytesToWrite - 4;
      for (var i = 0; i < str.length; ++i) {
        var codeUnit = str.charCodeAt(i);
        if (codeUnit >= 55296 && codeUnit <= 57343) {
          var trailSurrogate = str.charCodeAt(++i);
          codeUnit =
            (65536 + ((codeUnit & 1023) << 10)) | (trailSurrogate & 1023);
        }
        HEAP32[outPtr >> 2] = codeUnit;
        outPtr += 4;
        if (outPtr + 4 > endPtr) break;
      }
      HEAP32[outPtr >> 2] = 0;
      return outPtr - startPtr;
    }
    function lengthBytesUTF32(str) {
      var len = 0;
      for (var i = 0; i < str.length; ++i) {
        var codeUnit = str.charCodeAt(i);
        if (codeUnit >= 55296 && codeUnit <= 57343) ++i;
        len += 4;
      }
      return len;
    }
    function writeArrayToMemory(array, buffer) {
      HEAP8.set(array, buffer);
    }
    var WASM_PAGE_SIZE = 65536;
    function alignUp(x, multiple) {
      if (x % multiple > 0) {
        x += multiple - (x % multiple);
      }
      return x;
    }
    var buffer,
      HEAP8,
      HEAPU8,
      HEAP16,
      HEAPU16,
      HEAP32,
      HEAPU32,
      HEAPF32,
      HEAPF64;
    function updateGlobalBufferAndViews(buf) {
      buffer = buf;
      Module['HEAP8'] = HEAP8 = new Int8Array(buf);
      Module['HEAP16'] = HEAP16 = new Int16Array(buf);
      Module['HEAP32'] = HEAP32 = new Int32Array(buf);
      Module['HEAPU8'] = HEAPU8 = new Uint8Array(buf);
      Module['HEAPU16'] = HEAPU16 = new Uint16Array(buf);
      Module['HEAPU32'] = HEAPU32 = new Uint32Array(buf);
      Module['HEAPF32'] = HEAPF32 = new Float32Array(buf);
      Module['HEAPF64'] = HEAPF64 = new Float64Array(buf);
    }
    var DYNAMIC_BASE = 5244624,
      DYNAMICTOP_PTR = 1584;
    var INITIAL_INITIAL_MEMORY = Module['INITIAL_MEMORY'] || 33554432;
    if (Module['wasmMemory']) {
      wasmMemory = Module['wasmMemory'];
    } else {
      wasmMemory = new WebAssembly.Memory({
        initial: INITIAL_INITIAL_MEMORY / WASM_PAGE_SIZE,
      });
    }
    if (wasmMemory) {
      buffer = wasmMemory.buffer;
    }
    INITIAL_INITIAL_MEMORY = buffer.byteLength;
    updateGlobalBufferAndViews(buffer);
    HEAP32[DYNAMICTOP_PTR >> 2] = DYNAMIC_BASE;
    function callRuntimeCallbacks(callbacks) {
      while (callbacks.length > 0) {
        var callback = callbacks.shift();
        if (typeof callback == 'function') {
          callback();
          continue;
        }
        var func = callback.func;
        if (typeof func === 'number') {
          if (callback.arg === undefined) {
            Module['dynCall_v'](func);
          } else {
            Module['dynCall_vi'](func, callback.arg);
          }
        } else {
          func(callback.arg === undefined ? null : callback.arg);
        }
      }
    }
    var __ATPRERUN__ = [];
    var __ATINIT__ = [];
    var __ATMAIN__ = [];
    var __ATPOSTRUN__ = [];
    var runtimeInitialized = false;
    function preRun() {
      if (Module['preRun']) {
        if (typeof Module['preRun'] == 'function')
          Module['preRun'] = [Module['preRun']];
        while (Module['preRun'].length) {
          addOnPreRun(Module['preRun'].shift());
        }
      }
      callRuntimeCallbacks(__ATPRERUN__);
    }
    function initRuntime() {
      runtimeInitialized = true;
      callRuntimeCallbacks(__ATINIT__);
    }
    function preMain() {
      callRuntimeCallbacks(__ATMAIN__);
    }
    function postRun() {
      if (Module['postRun']) {
        if (typeof Module['postRun'] == 'function')
          Module['postRun'] = [Module['postRun']];
        while (Module['postRun'].length) {
          addOnPostRun(Module['postRun'].shift());
        }
      }
      callRuntimeCallbacks(__ATPOSTRUN__);
    }
    function addOnPreRun(cb) {
      __ATPRERUN__.unshift(cb);
    }
    function addOnPostRun(cb) {
      __ATPOSTRUN__.unshift(cb);
    }
    var runDependencies = 0;
    var runDependencyWatcher = null;
    var dependenciesFulfilled = null;
    function getUniqueRunDependency(id) {
      return id;
    }
    function addRunDependency(id) {
      runDependencies++;
      if (Module['monitorRunDependencies']) {
        Module['monitorRunDependencies'](runDependencies);
      }
    }
    function removeRunDependency(id) {
      runDependencies--;
      if (Module['monitorRunDependencies']) {
        Module['monitorRunDependencies'](runDependencies);
      }
      if (runDependencies == 0) {
        if (runDependencyWatcher !== null) {
          clearInterval(runDependencyWatcher);
          runDependencyWatcher = null;
        }
        if (dependenciesFulfilled) {
          var callback = dependenciesFulfilled;
          dependenciesFulfilled = null;
          callback();
        }
      }
    }
    Module['preloadedImages'] = {};
    Module['preloadedAudios'] = {};
    function abort(what) {
      if (Module['onAbort']) {
        Module['onAbort'](what);
      }
      what += '';
      out(what);
      err(what);
      ABORT = true;
      EXITSTATUS = 1;
      what = 'abort(' + what + '). Build with -s ASSERTIONS=1 for more info.';
      throw new WebAssembly.RuntimeError(what);
    }
    var dataURIPrefix = 'data:application/octet-stream;base64,';
    function isDataURI(filename) {
      return String.prototype.startsWith
        ? filename.startsWith(dataURIPrefix)
        : filename.indexOf(dataURIPrefix) === 0;
    }
    var wasmBinaryFile = 'qsp.wasm';
    if (!isDataURI(wasmBinaryFile)) {
      wasmBinaryFile = locateFile(wasmBinaryFile);
    }
    function getBinary() {
      try {
        if (wasmBinary) {
          return new Uint8Array(wasmBinary);
        }
        if (readBinary) {
          return readBinary(wasmBinaryFile);
        } else {
          throw 'both async and sync fetching of the wasm failed';
        }
      } catch (err) {
        abort(err);
      }
    }
    function getBinaryPromise() {
      if (
        !wasmBinary &&
        (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) &&
        typeof fetch === 'function'
      ) {
        return fetch(wasmBinaryFile, { credentials: 'same-origin' })
          .then(function (response) {
            if (!response['ok']) {
              throw (
                "failed to load wasm binary file at '" + wasmBinaryFile + "'"
              );
            }
            return response['arrayBuffer']();
          })
          .catch(function () {
            return getBinary();
          });
      }
      return new Promise(function (resolve, reject) {
        resolve(getBinary());
      });
    }
    function createWasm() {
      var info = { a: asmLibraryArg };
      function receiveInstance(instance, module) {
        var exports = instance.exports;
        exports = Asyncify.instrumentWasmExports(exports);
        Module['asm'] = exports;
        removeRunDependency('wasm-instantiate');
      }
      addRunDependency('wasm-instantiate');
      function receiveInstantiatedSource(output) {
        receiveInstance(output['instance']);
      }
      function instantiateArrayBuffer(receiver) {
        return getBinaryPromise()
          .then(function (binary) {
            return WebAssembly.instantiate(binary, info);
          })
          .then(receiver, function (reason) {
            err('failed to asynchronously prepare wasm: ' + reason);
            abort(reason);
          });
      }
      function instantiateAsync() {
        if (
          !wasmBinary &&
          typeof WebAssembly.instantiateStreaming === 'function' &&
          !isDataURI(wasmBinaryFile) &&
          typeof fetch === 'function'
        ) {
          fetch(wasmBinaryFile, { credentials: 'same-origin' }).then(function (
            response
          ) {
            var result = WebAssembly.instantiateStreaming(response, info);
            return result.then(receiveInstantiatedSource, function (reason) {
              err('wasm streaming compile failed: ' + reason);
              err('falling back to ArrayBuffer instantiation');
              instantiateArrayBuffer(receiveInstantiatedSource);
            });
          });
        } else {
          return instantiateArrayBuffer(receiveInstantiatedSource);
        }
      }
      if (Module['instantiateWasm']) {
        try {
          var exports = Module['instantiateWasm'](info, receiveInstance);
          exports = Asyncify.instrumentWasmExports(exports);
          return exports;
        } catch (e) {
          err('Module.instantiateWasm callback failed with error: ' + e);
          return false;
        }
      }
      instantiateAsync();
      return {};
    }
    __ATINIT__.push({
      func: function () {
        ___wasm_call_ctors();
      },
    });
    function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.copyWithin(dest, src, src + num);
    }
    function _emscripten_get_heap_size() {
      return HEAPU8.length;
    }
    function emscripten_realloc_buffer(size) {
      try {
        wasmMemory.grow((size - buffer.byteLength + 65535) >> 16);
        updateGlobalBufferAndViews(wasmMemory.buffer);
        return 1;
      } catch (e) {}
    }
    function _emscripten_resize_heap(requestedSize) {
      var oldSize = _emscripten_get_heap_size();
      var PAGE_MULTIPLE = 65536;
      var maxHeapSize = 2147483648 - PAGE_MULTIPLE;
      if (requestedSize > maxHeapSize) {
        return false;
      }
      var minHeapSize = 16777216;
      for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
        var overGrownHeapSize = oldSize * (1 + 0.2 / cutDown);
        overGrownHeapSize = Math.min(
          overGrownHeapSize,
          requestedSize + 100663296
        );
        var newSize = Math.min(
          maxHeapSize,
          alignUp(
            Math.max(minHeapSize, requestedSize, overGrownHeapSize),
            PAGE_MULTIPLE
          )
        );
        var replacement = emscripten_realloc_buffer(newSize);
        if (replacement) {
          return true;
        }
      }
      return false;
    }
    function _emscripten_set_main_loop_timing(mode, value) {
      Browser.mainLoop.timingMode = mode;
      Browser.mainLoop.timingValue = value;
      if (!Browser.mainLoop.func) {
        return 1;
      }
      if (mode == 0) {
        Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_setTimeout() {
          var timeUntilNextTick =
            Math.max(
              0,
              Browser.mainLoop.tickStartTime + value - _emscripten_get_now()
            ) | 0;
          setTimeout(Browser.mainLoop.runner, timeUntilNextTick);
        };
        Browser.mainLoop.method = 'timeout';
      } else if (mode == 1) {
        Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_rAF() {
          Browser.requestAnimationFrame(Browser.mainLoop.runner);
        };
        Browser.mainLoop.method = 'rAF';
      } else if (mode == 2) {
        if (typeof setImmediate === 'undefined') {
          var setImmediates = [];
          var emscriptenMainLoopMessageId = 'setimmediate';
          var Browser_setImmediate_messageHandler = function (event) {
            if (
              event.data === emscriptenMainLoopMessageId ||
              event.data.target === emscriptenMainLoopMessageId
            ) {
              event.stopPropagation();
              setImmediates.shift()();
            }
          };
          addEventListener(
            'message',
            Browser_setImmediate_messageHandler,
            true
          );
          setImmediate = function Browser_emulated_setImmediate(func) {
            setImmediates.push(func);
            if (ENVIRONMENT_IS_WORKER) {
              if (Module['setImmediates'] === undefined)
                Module['setImmediates'] = [];
              Module['setImmediates'].push(func);
              postMessage({ target: emscriptenMainLoopMessageId });
            } else postMessage(emscriptenMainLoopMessageId, '*');
          };
        }
        Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_setImmediate() {
          setImmediate(Browser.mainLoop.runner);
        };
        Browser.mainLoop.method = 'immediate';
      }
      return 0;
    }
    var _emscripten_get_now;
    _emscripten_get_now = function () {
      return performance.now();
    };
    function _emscripten_set_main_loop(
      func,
      fps,
      simulateInfiniteLoop,
      arg,
      noSetTiming
    ) {
      noExitRuntime = true;
      assert(
        !Browser.mainLoop.func,
        'emscripten_set_main_loop: there can only be one main loop function at once: call emscripten_cancel_main_loop to cancel the previous one before setting a new one with different parameters.'
      );
      Browser.mainLoop.func = func;
      Browser.mainLoop.arg = arg;
      var browserIterationFunc;
      if (typeof arg !== 'undefined') {
        browserIterationFunc = function () {
          Module['dynCall_vi'](func, arg);
        };
      } else {
        browserIterationFunc = function () {
          Module['dynCall_v'](func);
        };
      }
      var thisMainLoopId = Browser.mainLoop.currentlyRunningMainloop;
      Browser.mainLoop.runner = function Browser_mainLoop_runner() {
        if (ABORT) return;
        if (Browser.mainLoop.queue.length > 0) {
          var start = Date.now();
          var blocker = Browser.mainLoop.queue.shift();
          blocker.func(blocker.arg);
          if (Browser.mainLoop.remainingBlockers) {
            var remaining = Browser.mainLoop.remainingBlockers;
            var next =
              remaining % 1 == 0 ? remaining - 1 : Math.floor(remaining);
            if (blocker.counted) {
              Browser.mainLoop.remainingBlockers = next;
            } else {
              next = next + 0.5;
              Browser.mainLoop.remainingBlockers = (8 * remaining + next) / 9;
            }
          }
          console.log(
            'main loop blocker "' +
              blocker.name +
              '" took ' +
              (Date.now() - start) +
              ' ms'
          );
          Browser.mainLoop.updateStatus();
          if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop)
            return;
          setTimeout(Browser.mainLoop.runner, 0);
          return;
        }
        if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) return;
        Browser.mainLoop.currentFrameNumber =
          (Browser.mainLoop.currentFrameNumber + 1) | 0;
        if (
          Browser.mainLoop.timingMode == 1 &&
          Browser.mainLoop.timingValue > 1 &&
          Browser.mainLoop.currentFrameNumber % Browser.mainLoop.timingValue !=
            0
        ) {
          Browser.mainLoop.scheduler();
          return;
        } else if (Browser.mainLoop.timingMode == 0) {
          Browser.mainLoop.tickStartTime = _emscripten_get_now();
        }
        Browser.mainLoop.runIter(browserIterationFunc);
        if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) return;
        if (typeof SDL === 'object' && SDL.audio && SDL.audio.queueNewAudioData)
          SDL.audio.queueNewAudioData();
        Browser.mainLoop.scheduler();
      };
      if (!noSetTiming) {
        if (fps && fps > 0) _emscripten_set_main_loop_timing(0, 1e3 / fps);
        else _emscripten_set_main_loop_timing(1, 1);
        Browser.mainLoop.scheduler();
      }
      if (simulateInfiniteLoop) {
        throw 'unwind';
      }
    }
    var Browser = {
      mainLoop: {
        scheduler: null,
        method: '',
        currentlyRunningMainloop: 0,
        func: null,
        arg: 0,
        timingMode: 0,
        timingValue: 0,
        currentFrameNumber: 0,
        queue: [],
        pause: function () {
          Browser.mainLoop.scheduler = null;
          Browser.mainLoop.currentlyRunningMainloop++;
        },
        resume: function () {
          Browser.mainLoop.currentlyRunningMainloop++;
          var timingMode = Browser.mainLoop.timingMode;
          var timingValue = Browser.mainLoop.timingValue;
          var func = Browser.mainLoop.func;
          Browser.mainLoop.func = null;
          _emscripten_set_main_loop(func, 0, false, Browser.mainLoop.arg, true);
          _emscripten_set_main_loop_timing(timingMode, timingValue);
          Browser.mainLoop.scheduler();
        },
        updateStatus: function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](
                  message + ' (' + (expected - remaining) + '/' + expected + ')'
                );
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        },
        runIter: function (func) {
          if (ABORT) return;
          if (Module['preMainLoop']) {
            var preRet = Module['preMainLoop']();
            if (preRet === false) {
              return;
            }
          }
          try {
            func();
          } catch (e) {
            if (e instanceof ExitStatus) {
              return;
            } else {
              if (e && typeof e === 'object' && e.stack)
                err('exception thrown: ' + [e, e.stack]);
              throw e;
            }
          }
          if (Module['postMainLoop']) Module['postMainLoop']();
        },
      },
      isFullscreen: false,
      pointerLock: false,
      moduleContextCreatedCallbacks: [],
      workers: [],
      init: function () {
        if (!Module['preloadPlugins']) Module['preloadPlugins'] = [];
        if (Browser.initted) return;
        Browser.initted = true;
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch (e) {
          Browser.hasBlobConstructor = false;
          console.log(
            'warning: no blob constructor, cannot create blobs with mimetypes'
          );
        }
        Browser.BlobBuilder =
          typeof MozBlobBuilder != 'undefined'
            ? MozBlobBuilder
            : typeof WebKitBlobBuilder != 'undefined'
            ? WebKitBlobBuilder
            : !Browser.hasBlobConstructor
            ? console.log('warning: no BlobBuilder')
            : null;
        Browser.URLObject =
          typeof window != 'undefined'
            ? window.URL
              ? window.URL
              : window.webkitURL
            : undefined;
        if (
          !Module.noImageDecoding &&
          typeof Browser.URLObject === 'undefined'
        ) {
          console.log(
            'warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.'
          );
          Module.noImageDecoding = true;
        }
        var imagePlugin = {};
        imagePlugin['canHandle'] = function imagePlugin_canHandle(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin['handle'] = function imagePlugin_handle(
          byteArray,
          name,
          onload,
          onerror
        ) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: Browser.getMimetype(name) });
              if (b.size !== byteArray.length) {
                b = new Blob([new Uint8Array(byteArray).buffer], {
                  type: Browser.getMimetype(name),
                });
              }
            } catch (e) {
              warnOnce(
                'Blob constructor present but fails: ' +
                  e +
                  '; falling back to blob builder'
              );
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append(new Uint8Array(byteArray).buffer);
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          var img = new Image();
          img.onload = function img_onload() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module['preloadedImages'][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function img_onerror(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
        var audioPlugin = {};
        audioPlugin['canHandle'] = function audioPlugin_canHandle(name) {
          return (
            !Module.noAudioDecoding &&
            name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 }
          );
        };
        audioPlugin['handle'] = function audioPlugin_handle(
          byteArray,
          name,
          onload,
          onerror
        ) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module['preloadedAudios'][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module['preloadedAudios'][name] = new Audio();
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], {
                type: Browser.getMimetype(name),
              });
            } catch (e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b);
            var audio = new Audio();
            audio.addEventListener(
              'canplaythrough',
              function () {
                finish(audio);
              },
              false
            );
            audio.onerror = function audio_onerror(event) {
              if (done) return;
              console.log(
                'warning: browser could not fully decode audio ' +
                  name +
                  ', trying slower base64 approach'
              );
              function encode64(data) {
                var BASE =
                  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits - 6)) & 63;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar & 3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar & 15) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src =
                'data:audio/x-' +
                name.substr(-3) +
                ';base64,' +
                encode64(byteArray);
              finish(audio);
            };
            audio.src = url;
            Browser.safeSetTimeout(function () {
              finish(audio);
            }, 1e4);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
        function pointerLockChange() {
          Browser.pointerLock =
            document['pointerLockElement'] === Module['canvas'] ||
            document['mozPointerLockElement'] === Module['canvas'] ||
            document['webkitPointerLockElement'] === Module['canvas'] ||
            document['msPointerLockElement'] === Module['canvas'];
        }
        var canvas = Module['canvas'];
        if (canvas) {
          canvas.requestPointerLock =
            canvas['requestPointerLock'] ||
            canvas['mozRequestPointerLock'] ||
            canvas['webkitRequestPointerLock'] ||
            canvas['msRequestPointerLock'] ||
            function () {};
          canvas.exitPointerLock =
            document['exitPointerLock'] ||
            document['mozExitPointerLock'] ||
            document['webkitExitPointerLock'] ||
            document['msExitPointerLock'] ||
            function () {};
          canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
          document.addEventListener(
            'pointerlockchange',
            pointerLockChange,
            false
          );
          document.addEventListener(
            'mozpointerlockchange',
            pointerLockChange,
            false
          );
          document.addEventListener(
            'webkitpointerlockchange',
            pointerLockChange,
            false
          );
          document.addEventListener(
            'mspointerlockchange',
            pointerLockChange,
            false
          );
          if (Module['elementPointerLock']) {
            canvas.addEventListener(
              'click',
              function (ev) {
                if (
                  !Browser.pointerLock &&
                  Module['canvas'].requestPointerLock
                ) {
                  Module['canvas'].requestPointerLock();
                  ev.preventDefault();
                }
              },
              false
            );
          }
        }
      },
      createContext: function (
        canvas,
        useWebGL,
        setInModule,
        webGLContextAttributes
      ) {
        if (useWebGL && Module.ctx && canvas == Module.canvas)
          return Module.ctx;
        var ctx;
        var contextHandle;
        if (useWebGL) {
          var contextAttributes = {
            antialias: false,
            alpha: false,
            majorVersion: 1,
          };
          if (webGLContextAttributes) {
            for (var attribute in webGLContextAttributes) {
              contextAttributes[attribute] = webGLContextAttributes[attribute];
            }
          }
          if (typeof GL !== 'undefined') {
            contextHandle = GL.createContext(canvas, contextAttributes);
            if (contextHandle) {
              ctx = GL.getContext(contextHandle).GLctx;
            }
          }
        } else {
          ctx = canvas.getContext('2d');
        }
        if (!ctx) return null;
        if (setInModule) {
          if (!useWebGL)
            assert(
              typeof GLctx === 'undefined',
              'cannot set in module if GLctx is used, but we are a non-GL context that would replace it'
            );
          Module.ctx = ctx;
          if (useWebGL) GL.makeContextCurrent(contextHandle);
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function (callback) {
            callback();
          });
          Browser.init();
        }
        return ctx;
      },
      destroyContext: function (canvas, useWebGL, setInModule) {},
      fullscreenHandlersInstalled: false,
      lockPointer: undefined,
      resizeCanvas: undefined,
      requestFullscreen: function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined')
          Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined')
          Browser.resizeCanvas = false;
        var canvas = Module['canvas'];
        function fullscreenChange() {
          Browser.isFullscreen = false;
          var canvasContainer = canvas.parentNode;
          if (
            (document['fullscreenElement'] ||
              document['mozFullScreenElement'] ||
              document['msFullscreenElement'] ||
              document['webkitFullscreenElement'] ||
              document['webkitCurrentFullScreenElement']) === canvasContainer
          ) {
            canvas.exitFullscreen = Browser.exitFullscreen;
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullscreen = true;
            if (Browser.resizeCanvas) {
              Browser.setFullscreenCanvasSize();
            } else {
              Browser.updateCanvasDimensions(canvas);
            }
          } else {
            canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
            canvasContainer.parentNode.removeChild(canvasContainer);
            if (Browser.resizeCanvas) {
              Browser.setWindowedCanvasSize();
            } else {
              Browser.updateCanvasDimensions(canvas);
            }
          }
          if (Module['onFullScreen'])
            Module['onFullScreen'](Browser.isFullscreen);
          if (Module['onFullscreen'])
            Module['onFullscreen'](Browser.isFullscreen);
        }
        if (!Browser.fullscreenHandlersInstalled) {
          Browser.fullscreenHandlersInstalled = true;
          document.addEventListener(
            'fullscreenchange',
            fullscreenChange,
            false
          );
          document.addEventListener(
            'mozfullscreenchange',
            fullscreenChange,
            false
          );
          document.addEventListener(
            'webkitfullscreenchange',
            fullscreenChange,
            false
          );
          document.addEventListener(
            'MSFullscreenChange',
            fullscreenChange,
            false
          );
        }
        var canvasContainer = document.createElement('div');
        canvas.parentNode.insertBefore(canvasContainer, canvas);
        canvasContainer.appendChild(canvas);
        canvasContainer.requestFullscreen =
          canvasContainer['requestFullscreen'] ||
          canvasContainer['mozRequestFullScreen'] ||
          canvasContainer['msRequestFullscreen'] ||
          (canvasContainer['webkitRequestFullscreen']
            ? function () {
                canvasContainer['webkitRequestFullscreen'](
                  Element['ALLOW_KEYBOARD_INPUT']
                );
              }
            : null) ||
          (canvasContainer['webkitRequestFullScreen']
            ? function () {
                canvasContainer['webkitRequestFullScreen'](
                  Element['ALLOW_KEYBOARD_INPUT']
                );
              }
            : null);
        canvasContainer.requestFullscreen();
      },
      exitFullscreen: function () {
        if (!Browser.isFullscreen) {
          return false;
        }
        var CFS =
          document['exitFullscreen'] ||
          document['cancelFullScreen'] ||
          document['mozCancelFullScreen'] ||
          document['msExitFullscreen'] ||
          document['webkitCancelFullScreen'] ||
          function () {};
        CFS.apply(document, []);
        return true;
      },
      nextRAF: 0,
      fakeRequestAnimationFrame: function (func) {
        var now = Date.now();
        if (Browser.nextRAF === 0) {
          Browser.nextRAF = now + 1e3 / 60;
        } else {
          while (now + 2 >= Browser.nextRAF) {
            Browser.nextRAF += 1e3 / 60;
          }
        }
        var delay = Math.max(Browser.nextRAF - now, 0);
        setTimeout(func, delay);
      },
      requestAnimationFrame: function (func) {
        if (typeof requestAnimationFrame === 'function') {
          requestAnimationFrame(func);
          return;
        }
        var RAF = Browser.fakeRequestAnimationFrame;
        RAF(func);
      },
      safeCallback: function (func) {
        return function () {
          if (!ABORT) return func.apply(null, arguments);
        };
      },
      allowAsyncCallbacks: true,
      queuedAsyncCallbacks: [],
      pauseAsyncCallbacks: function () {
        Browser.allowAsyncCallbacks = false;
      },
      resumeAsyncCallbacks: function () {
        Browser.allowAsyncCallbacks = true;
        if (Browser.queuedAsyncCallbacks.length > 0) {
          var callbacks = Browser.queuedAsyncCallbacks;
          Browser.queuedAsyncCallbacks = [];
          callbacks.forEach(function (func) {
            func();
          });
        }
      },
      safeRequestAnimationFrame: function (func) {
        return Browser.requestAnimationFrame(function () {
          if (ABORT) return;
          if (Browser.allowAsyncCallbacks) {
            func();
          } else {
            Browser.queuedAsyncCallbacks.push(func);
          }
        });
      },
      safeSetTimeout: function (func, timeout) {
        noExitRuntime = true;
        return setTimeout(function () {
          if (ABORT) return;
          if (Browser.allowAsyncCallbacks) {
            func();
          } else {
            Browser.queuedAsyncCallbacks.push(func);
          }
        }, timeout);
      },
      safeSetInterval: function (func, timeout) {
        noExitRuntime = true;
        return setInterval(function () {
          if (ABORT) return;
          if (Browser.allowAsyncCallbacks) {
            func();
          }
        }, timeout);
      },
      getMimetype: function (name) {
        return {
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
          png: 'image/png',
          bmp: 'image/bmp',
          ogg: 'audio/ogg',
          wav: 'audio/wav',
          mp3: 'audio/mpeg',
        }[name.substr(name.lastIndexOf('.') + 1)];
      },
      getUserMedia: function (func) {
        if (!window.getUserMedia) {
          window.getUserMedia =
            navigator['getUserMedia'] || navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },
      getMovementX: function (event) {
        return (
          event['movementX'] ||
          event['mozMovementX'] ||
          event['webkitMovementX'] ||
          0
        );
      },
      getMovementY: function (event) {
        return (
          event['movementY'] ||
          event['mozMovementY'] ||
          event['webkitMovementY'] ||
          0
        );
      },
      getMouseWheelDelta: function (event) {
        var delta = 0;
        switch (event.type) {
          case 'DOMMouseScroll':
            delta = event.detail / 3;
            break;
          case 'mousewheel':
            delta = event.wheelDelta / 120;
            break;
          case 'wheel':
            delta = event.deltaY;
            switch (event.deltaMode) {
              case 0:
                delta /= 100;
                break;
              case 1:
                delta /= 3;
                break;
              case 2:
                delta *= 80;
                break;
              default:
                throw 'unrecognized mouse wheel delta mode: ' + event.deltaMode;
            }
            break;
          default:
            throw 'unrecognized mouse wheel event: ' + event.type;
        }
        return delta;
      },
      mouseX: 0,
      mouseY: 0,
      mouseMovementX: 0,
      mouseMovementY: 0,
      touches: {},
      lastTouches: {},
      calculateMouseEvent: function (event) {
        if (Browser.pointerLock) {
          if (event.type != 'mousemove' && 'mozMovementX' in event) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          if (typeof SDL != 'undefined') {
            Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
            Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
            Browser.mouseX += Browser.mouseMovementX;
            Browser.mouseY += Browser.mouseMovementY;
          }
        } else {
          var rect = Module['canvas'].getBoundingClientRect();
          var cw = Module['canvas'].width;
          var ch = Module['canvas'].height;
          var scrollX =
            typeof window.scrollX !== 'undefined'
              ? window.scrollX
              : window.pageXOffset;
          var scrollY =
            typeof window.scrollY !== 'undefined'
              ? window.scrollY
              : window.pageYOffset;
          if (
            event.type === 'touchstart' ||
            event.type === 'touchend' ||
            event.type === 'touchmove'
          ) {
            var touch = event.touch;
            if (touch === undefined) {
              return;
            }
            var adjustedX = touch.pageX - (scrollX + rect.left);
            var adjustedY = touch.pageY - (scrollY + rect.top);
            adjustedX = adjustedX * (cw / rect.width);
            adjustedY = adjustedY * (ch / rect.height);
            var coords = { x: adjustedX, y: adjustedY };
            if (event.type === 'touchstart') {
              Browser.lastTouches[touch.identifier] = coords;
              Browser.touches[touch.identifier] = coords;
            } else if (
              event.type === 'touchend' ||
              event.type === 'touchmove'
            ) {
              var last = Browser.touches[touch.identifier];
              if (!last) last = coords;
              Browser.lastTouches[touch.identifier] = last;
              Browser.touches[touch.identifier] = coords;
            }
            return;
          }
          var x = event.pageX - (scrollX + rect.left);
          var y = event.pageY - (scrollY + rect.top);
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },
      asyncLoad: function (url, onload, onerror, noRunDep) {
        var dep = !noRunDep ? getUniqueRunDependency('al ' + url) : '';
        readAsync(
          url,
          function (arrayBuffer) {
            assert(
              arrayBuffer,
              'Loading data file "' + url + '" failed (no arrayBuffer).'
            );
            onload(new Uint8Array(arrayBuffer));
            if (dep) removeRunDependency(dep);
          },
          function (event) {
            if (onerror) {
              onerror();
            } else {
              throw 'Loading data file "' + url + '" failed.';
            }
          }
        );
        if (dep) addRunDependency(dep);
      },
      resizeListeners: [],
      updateResizeListeners: function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function (listener) {
          listener(canvas.width, canvas.height);
        });
      },
      setCanvasSize: function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        Browser.updateCanvasDimensions(canvas, width, height);
        if (!noUpdates) Browser.updateResizeListeners();
      },
      windowedWidth: 0,
      windowedHeight: 0,
      setFullscreenCanvasSize: function () {
        if (typeof SDL != 'undefined') {
          var flags = HEAPU32[SDL.screen >> 2];
          flags = flags | 8388608;
          HEAP32[SDL.screen >> 2] = flags;
        }
        Browser.updateCanvasDimensions(Module['canvas']);
        Browser.updateResizeListeners();
      },
      setWindowedCanvasSize: function () {
        if (typeof SDL != 'undefined') {
          var flags = HEAPU32[SDL.screen >> 2];
          flags = flags & ~8388608;
          HEAP32[SDL.screen >> 2] = flags;
        }
        Browser.updateCanvasDimensions(Module['canvas']);
        Browser.updateResizeListeners();
      },
      updateCanvasDimensions: function (canvas, wNative, hNative) {
        if (wNative && hNative) {
          canvas.widthNative = wNative;
          canvas.heightNative = hNative;
        } else {
          wNative = canvas.widthNative;
          hNative = canvas.heightNative;
        }
        var w = wNative;
        var h = hNative;
        if (Module['forcedAspectRatio'] && Module['forcedAspectRatio'] > 0) {
          if (w / h < Module['forcedAspectRatio']) {
            w = Math.round(h * Module['forcedAspectRatio']);
          } else {
            h = Math.round(w / Module['forcedAspectRatio']);
          }
        }
        if (
          (document['fullscreenElement'] ||
            document['mozFullScreenElement'] ||
            document['msFullscreenElement'] ||
            document['webkitFullscreenElement'] ||
            document['webkitCurrentFullScreenElement']) === canvas.parentNode &&
          typeof screen != 'undefined'
        ) {
          var factor = Math.min(screen.width / w, screen.height / h);
          w = Math.round(w * factor);
          h = Math.round(h * factor);
        }
        if (Browser.resizeCanvas) {
          if (canvas.width != w) canvas.width = w;
          if (canvas.height != h) canvas.height = h;
          if (typeof canvas.style != 'undefined') {
            canvas.style.removeProperty('width');
            canvas.style.removeProperty('height');
          }
        } else {
          if (canvas.width != wNative) canvas.width = wNative;
          if (canvas.height != hNative) canvas.height = hNative;
          if (typeof canvas.style != 'undefined') {
            if (w != wNative || h != hNative) {
              canvas.style.setProperty('width', w + 'px', 'important');
              canvas.style.setProperty('height', h + 'px', 'important');
            } else {
              canvas.style.removeProperty('width');
              canvas.style.removeProperty('height');
            }
          }
        }
      },
      wgetRequests: {},
      nextWgetRequestHandle: 0,
      getNextWgetRequestHandle: function () {
        var handle = Browser.nextWgetRequestHandle;
        Browser.nextWgetRequestHandle++;
        return handle;
      },
    };
    function runAndAbortIfError(func) {
      try {
        return func();
      } catch (e) {
        abort(e);
      }
    }
    var Asyncify = {
      State: { Normal: 0, Unwinding: 1, Rewinding: 2 },
      state: 0,
      StackSize: 4096,
      currData: null,
      handleSleepReturnValue: 0,
      exportCallStack: [],
      callStackNameToId: {},
      callStackIdToFunc: {},
      callStackId: 0,
      afterUnwind: null,
      asyncFinalizers: [],
      sleepCallbacks: [],
      getCallStackId: function (funcName) {
        var id = Asyncify.callStackNameToId[funcName];
        if (id === undefined) {
          id = Asyncify.callStackId++;
          Asyncify.callStackNameToId[funcName] = id;
          Asyncify.callStackIdToFunc[id] = Module['asm'][funcName];
        }
        return id;
      },
      instrumentWasmExports: function (exports) {
        var ret = {};
        for (var x in exports) {
          (function (x) {
            var original = exports[x];
            if (typeof original === 'function') {
              ret[x] = function () {
                Asyncify.exportCallStack.push(x);
                try {
                  return original.apply(null, arguments);
                } finally {
                  if (ABORT) return;
                  var y = Asyncify.exportCallStack.pop(x);
                  assert(y === x);
                  if (
                    Asyncify.currData &&
                    Asyncify.state === Asyncify.State.Unwinding &&
                    Asyncify.exportCallStack.length === 0
                  ) {
                    Asyncify.state = Asyncify.State.Normal;
                    runAndAbortIfError(Module['_asyncify_stop_unwind']);
                    if (typeof Fibers !== 'undefined') {
                      Fibers.trampoline();
                    }
                    if (Asyncify.afterUnwind) {
                      Asyncify.afterUnwind();
                      Asyncify.afterUnwind = null;
                    }
                  }
                }
              };
            } else {
              ret[x] = original;
            }
          })(x);
        }
        return ret;
      },
      allocateData: function () {
        var ptr = _malloc(12 + Asyncify.StackSize);
        Asyncify.setDataHeader(ptr, ptr + 12, Asyncify.StackSize);
        Asyncify.setDataRewindFunc(ptr);
        return ptr;
      },
      setDataHeader: function (ptr, stack, stackSize) {
        HEAP32[ptr >> 2] = stack;
        HEAP32[(ptr + 4) >> 2] = stack + stackSize;
      },
      setDataRewindFunc: function (ptr) {
        var bottomOfCallStack = Asyncify.exportCallStack[0];
        var rewindId = Asyncify.getCallStackId(bottomOfCallStack);
        HEAP32[(ptr + 8) >> 2] = rewindId;
      },
      getDataRewindFunc: function (ptr) {
        var id = HEAP32[(ptr + 8) >> 2];
        var func = Asyncify.callStackIdToFunc[id];
        return func;
      },
      handleSleep: function (startAsync) {
        if (ABORT) return;
        noExitRuntime = true;
        if (Asyncify.state === Asyncify.State.Normal) {
          var reachedCallback = false;
          var reachedAfterCallback = false;
          startAsync(function (handleSleepReturnValue) {
            if (ABORT) return;
            Asyncify.handleSleepReturnValue = handleSleepReturnValue || 0;
            reachedCallback = true;
            if (!reachedAfterCallback) {
              return;
            }
            Asyncify.state = Asyncify.State.Rewinding;
            runAndAbortIfError(function () {
              Module['_asyncify_start_rewind'](Asyncify.currData);
            });
            if (Browser.mainLoop.func) {
              Browser.mainLoop.resume();
            }
            var start = Asyncify.getDataRewindFunc(Asyncify.currData);
            var asyncWasmReturnValue = start();
            if (!Asyncify.currData) {
              var asyncFinalizers = Asyncify.asyncFinalizers;
              Asyncify.asyncFinalizers = [];
              asyncFinalizers.forEach(function (func) {
                func(asyncWasmReturnValue);
              });
            }
          });
          reachedAfterCallback = true;
          if (!reachedCallback) {
            Asyncify.state = Asyncify.State.Unwinding;
            Asyncify.currData = Asyncify.allocateData();
            runAndAbortIfError(function () {
              Module['_asyncify_start_unwind'](Asyncify.currData);
            });
            if (Browser.mainLoop.func) {
              Browser.mainLoop.pause();
            }
          }
        } else if (Asyncify.state === Asyncify.State.Rewinding) {
          Asyncify.state = Asyncify.State.Normal;
          runAndAbortIfError(Module['_asyncify_stop_rewind']);
          _free(Asyncify.currData);
          Asyncify.currData = null;
          Asyncify.sleepCallbacks.forEach(function (func) {
            func();
          });
        } else {
          abort('invalid state: ' + Asyncify.state);
        }
        return Asyncify.handleSleepReturnValue;
      },
    };
    Module['requestFullscreen'] = function Module_requestFullscreen(
      lockPointer,
      resizeCanvas
    ) {
      Browser.requestFullscreen(lockPointer, resizeCanvas);
    };
    Module['requestAnimationFrame'] = function Module_requestAnimationFrame(
      func
    ) {
      Browser.requestAnimationFrame(func);
    };
    Module['setCanvasSize'] = function Module_setCanvasSize(
      width,
      height,
      noUpdates
    ) {
      Browser.setCanvasSize(width, height, noUpdates);
    };
    Module['pauseMainLoop'] = function Module_pauseMainLoop() {
      Browser.mainLoop.pause();
    };
    Module['resumeMainLoop'] = function Module_resumeMainLoop() {
      Browser.mainLoop.resume();
    };
    Module['getUserMedia'] = function Module_getUserMedia() {
      Browser.getUserMedia();
    };
    Module['createContext'] = function Module_createContext(
      canvas,
      useWebGL,
      setInModule,
      webGLContextAttributes
    ) {
      return Browser.createContext(
        canvas,
        useWebGL,
        setInModule,
        webGLContextAttributes
      );
    };
    var asmLibraryArg = {
      a: _emscripten_memcpy_big,
      b: _emscripten_resize_heap,
      memory: wasmMemory,
      table: wasmTable,
    };
    var asm = createWasm();
    Module['asm'] = asm;
    var ___wasm_call_ctors = (Module['___wasm_call_ctors'] = function () {
      return (___wasm_call_ctors = Module['___wasm_call_ctors'] =
        Module['asm']['c']).apply(null, arguments);
    });
    var _malloc = (Module['_malloc'] = function () {
      return (_malloc = Module['_malloc'] = Module['asm']['d']).apply(
        null,
        arguments
      );
    });
    var _free = (Module['_free'] = function () {
      return (_free = Module['_free'] = Module['asm']['e']).apply(
        null,
        arguments
      );
    });
    var _QSPGetVersion = (Module['_QSPGetVersion'] = function () {
      return (_QSPGetVersion = Module['_QSPGetVersion'] =
        Module['asm']['f']).apply(null, arguments);
    });
    var stackSave = (Module['stackSave'] = function () {
      return (stackSave = Module['stackSave'] = Module['asm']['g']).apply(
        null,
        arguments
      );
    });
    var stackAlloc = (Module['stackAlloc'] = function () {
      return (stackAlloc = Module['stackAlloc'] = Module['asm']['h']).apply(
        null,
        arguments
      );
    });
    var stackRestore = (Module['stackRestore'] = function () {
      return (stackRestore = Module['stackRestore'] = Module['asm']['i']).apply(
        null,
        arguments
      );
    });
    var _asyncify_start_unwind = (Module[
      '_asyncify_start_unwind'
    ] = function () {
      return (_asyncify_start_unwind = Module['_asyncify_start_unwind'] =
        Module['asm']['j']).apply(null, arguments);
    });
    var _asyncify_stop_unwind = (Module['_asyncify_stop_unwind'] = function () {
      return (_asyncify_stop_unwind = Module['_asyncify_stop_unwind'] =
        Module['asm']['k']).apply(null, arguments);
    });
    var _asyncify_start_rewind = (Module[
      '_asyncify_start_rewind'
    ] = function () {
      return (_asyncify_start_rewind = Module['_asyncify_start_rewind'] =
        Module['asm']['l']).apply(null, arguments);
    });
    var _asyncify_stop_rewind = (Module['_asyncify_stop_rewind'] = function () {
      return (_asyncify_stop_rewind = Module['_asyncify_stop_rewind'] =
        Module['asm']['m']).apply(null, arguments);
    });
    Module['asm'] = asm;
    Module['cwrap'] = cwrap;
    Module['getValue'] = getValue;
    Module['addFunction'] = addFunction;
    Module['UTF32ToString'] = UTF32ToString;
    Module['stringToUTF32'] = stringToUTF32;
    Module['lengthBytesUTF32'] = lengthBytesUTF32;
    var calledRun;
    Module['then'] = function (func) {
      if (calledRun) {
        func(Module);
      } else {
        var old = Module['onRuntimeInitialized'];
        Module['onRuntimeInitialized'] = function () {
          if (old) old();
          func(Module);
        };
      }
      return Module;
    };
    function ExitStatus(status) {
      this.name = 'ExitStatus';
      this.message = 'Program terminated with exit(' + status + ')';
      this.status = status;
    }
    dependenciesFulfilled = function runCaller() {
      if (!calledRun) run();
      if (!calledRun) dependenciesFulfilled = runCaller;
    };
    function run(args) {
      args = args || arguments_;
      if (runDependencies > 0) {
        return;
      }
      preRun();
      if (runDependencies > 0) return;
      function doRun() {
        if (calledRun) return;
        calledRun = true;
        Module['calledRun'] = true;
        if (ABORT) return;
        initRuntime();
        preMain();
        if (Module['onRuntimeInitialized']) Module['onRuntimeInitialized']();
        postRun();
      }
      if (Module['setStatus']) {
        Module['setStatus']('Running...');
        setTimeout(function () {
          setTimeout(function () {
            Module['setStatus']('');
          }, 1);
          doRun();
        }, 1);
      } else {
        doRun();
      }
    }
    Module['run'] = run;
    if (Module['preInit']) {
      if (typeof Module['preInit'] == 'function')
        Module['preInit'] = [Module['preInit']];
      while (Module['preInit'].length > 0) {
        Module['preInit'].pop()();
      }
    }
    noExitRuntime = true;
    run();

    return Module;
  };
})();
if (typeof exports === 'object' && typeof module === 'object')
  module.exports = Module;
else if (typeof define === 'function' && define['amd'])
  define([], function () {
    return Module;
  });
else if (typeof exports === 'object') exports['Module'] = Module;
