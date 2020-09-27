project (qsplib-wasm)
cmake_minimum_required(VERSION 3.13)

set(CMAKE_BUILD_TYPE Release)

configure_file(CMakeLists-qsp.txt.in qsp-download/CMakeLists.txt)
execute_process(COMMAND "${CMAKE_COMMAND}" -G "${CMAKE_GENERATOR}" . WORKING_DIRECTORY "${CMAKE_BINARY_DIR}/qsp-download")
execute_process(COMMAND "${CMAKE_COMMAND}" --build .
		WORKING_DIRECTORY "${CMAKE_BINARY_DIR}/qsp-download"
)

add_subdirectory("${CMAKE_BINARY_DIR}/qsp-src"
					"${CMAKE_BINARY_DIR}/qsp-build"
)

file(GLOB SOURCES src/*.c)

set(CMAKE_RUNTIME_OUTPUT_DIRECTORY "${CMAKE_SOURCE_DIR}/public")

add_executable(qsp-wasm ${SOURCES})
target_include_directories(qsp-wasm PRIVATE "${CMAKE_BINARY_DIR}/qsp-src" "${CMAKE_BINARY_DIR}/oniguruma-src")
target_link_libraries(qsp-wasm PRIVATE qsp onig)

set_target_properties(qsp-wasm PROPERTIES LINK_FLAGS "-Wno-parentheses \
    -Wno-empty-body \
    -Wno-null-dereference \
    -Wno-unsequenced \
    -O3 \
    -g4 \
    --source-map-base 'http://localhost:4200/' \
    -s WASM=1 \
    -s RESERVED_FUNCTION_POINTERS=20 \
    -s ASYNCIFY \
    -s EXTRA_EXPORTED_RUNTIME_METHODS='[cwrap, getValue, UTF32ToString, stringToUTF32, lengthBytesUTF32, addFunction, Asyncify]' \
    -s TOTAL_MEMORY=128MB \
    -s ENVIRONMENT='web' \
    -s MODULARIZE=1 \
    -s INVOKE_RUN=0 \
    -s STACK_OVERFLOW_CHECK=1 \
    -s ALLOW_MEMORY_GROWTH=1")