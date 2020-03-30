#!/bin/sh

emcc -Wno-parentheses \
    -Wno-empty-body \
    -Wno-null-dereference \
    -Wno-unsequenced \
    -O3 \
    -s WASM=1 \
    -s RESERVED_FUNCTION_POINTERS=20 \
    -s ASYNCIFY \
    -s EXTRA_EXPORTED_RUNTIME_METHODS='["cwrap", "getValue", "UTF32ToString", "stringToUTF32", "lengthBytesUTF32", "addFunction"]' \
    -s TOTAL_MEMORY=32MB \
    -s ENVIRONMENT='web' \
    -s MODULARIZE=1 \
    -s INVOKE_RUN=0 \
    -s ALLOW_MEMORY_GROWTH=1 \
    qsp/qsp/onig/enc/*.c \
    qsp/qsp/onig/*.c \
    qsp/qsp/**.c \
    src/wasm/qsp_wasm_callbacks.c \
    src/wasm/qsp_wasm.c \
    -o src/wasm/qsp.js
