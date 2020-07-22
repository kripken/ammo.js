cmake_minimum_required(VERSION 3.5 FATAL_ERROR)

set(CMAKE_TOOLCHAIN_FILE $ENV{EMSCRIPTEN}/cmake/Modules/Platform/Emscripten.cmake)
set(WEBIDL_BINDER_SCRIPT $ENV{EMSCRIPTEN}/tools/webidl_binder.py)
set(BUNDLE_SCRIPT ${CMAKE_CURRENT_SOURCE_DIR}/bundle.py)
set(WRAP_SCRIPT ${CMAKE_CURRENT_SOURCE_DIR}/wrap.py)
set(AMMO_HEADER_FILE ${CMAKE_CURRENT_SOURCE_DIR}/ammo.h)
set(AMMO_IDL_FILE ${CMAKE_CURRENT_SOURCE_DIR}/ammo.idl)
set(BULLET_SRC_DIR ${CMAKE_CURRENT_SOURCE_DIR}/bullet/src/)

set(BULLET_TARGETS BulletCollision BulletDynamics BulletSoftBody LinearMath)
foreach(_TARGET ${BULLET_TARGETS})
  list(APPEND BULLET_LIBS $<TARGET_FILE:${_TARGET}>)
endforeach()

# Disable bullet graphical benchmarks
set(USE_GRAPHICAL_BENCHMARK OFF)

# Default is 64*1024*1024 = 64MB
set(TOTAL_MEMORY 67108864 CACHE STRING "Total Memory")

# Enable for resizable heap, with some amount of slowness
set(ALLOW_MEMORY_GROWTH 0 CACHE STRING "Allow Memory Growth")

set(EMCC_ARGS
  --js-transform "python ${BUNDLE_SCRIPT}"
  --llvm-lto 1
  -O3
  -s ALLOW_MEMORY_GROWTH=${ALLOW_MEMORY_GROWTH}
  -s EXPORTED_RUNTIME_METHODS=["UTF8ToString"]
  -s EXPORT_NAME="Ammo"
  -s MODULARIZE=1
  -s NO_EXIT_RUNTIME=1
  -s NO_FILESYSTEM=1
  -s TOTAL_MEMORY=${TOTAL_MEMORY})

if(${CLOSURE})
  # Ignore closure errors about the bullet Node class
  # (Node is a DOM thing too)
  LIST(APPEND EMCC_ARGS
    --closure 1
    -s IGNORE_CLOSURE_COMPILER_ERRORS=1)
else()
  LIST(APPEND EMCC_ARGS
    -s NO_DYNAMIC_EXECUTION=1)
endif()

if(${ADD_FUNCTION_SUPPORT})
  LIST(APPEND EMCC_ARGS
    -s RESERVED_FUNCTION_POINTERS=20
    -s EXTRA_EXPORTED_RUNTIME_METHODS=["addFunction"])
endif()

set(EMCC_JS_ARGS ${EMCC_ARGS}
  -s AGGRESSIVE_VARIABLE_ELIMINATION=1
  -s ELIMINATE_DUPLICATE_FUNCTIONS=1
  -s LEGACY_VM_SUPPORT=1
  -s SINGLE_FILE=1
  -s WASM=0)

set(EMCC_WASM_ARGS ${EMCC_ARGS}
  -s BINARYEN_IGNORE_IMPLICIT_TRAPS=1
  -s WASM=1)

set(EMCC_GLUE_ARGS
  -c
  -I${BULLET_SRC_DIR}
  -include${AMMO_HEADER_FILE})


#######################################
project("ammo")
add_subdirectory(bullet EXCLUDE_FROM_ALL)


#######################################
add_custom_command(
  OUTPUT glue.cpp
  BYPRODUCTS glue.js parser.out WebIDLGrammar.pkl
  COMMAND python ${WEBIDL_BINDER_SCRIPT} ${AMMO_IDL_FILE} glue
  DEPENDS ${AMMO_IDL_FILE}
  COMMENT "Generating ammo bindings"
  VERBATIM)
add_custom_command(
  OUTPUT glue.o
  COMMAND emcc glue.cpp ${EMCC_GLUE_ARGS} -o glue.o
  DEPENDS glue.cpp ${AMMO_HEADER_FILE}
  COMMENT "Building ammo bindings"
  VERBATIM)
add_custom_target(ammo-bindings ALL DEPENDS glue.o)


#######################################
add_custom_command(
  OUTPUT ammo.js
  COMMAND emcc glue.o ${BULLET_LIBS} ${EMCC_JS_ARGS} -o ammo.js
  COMMAND python ${WRAP_SCRIPT} ammo.js
  DEPENDS ammo-bindings ${BULLET_TARGETS}
  COMMENT "Building ammo javascript"
  VERBATIM)
add_custom_target(ammo-javascript ALL DEPENDS ammo.js)


#######################################
add_custom_command(
  OUTPUT ammo.wasm.js ammo.wasm.wasm
  COMMAND emcc glue.o ${BULLET_LIBS} ${EMCC_WASM_ARGS} -o ammo.wasm.js
  COMMAND python ${WRAP_SCRIPT} ammo.wasm.js
  DEPENDS ammo-bindings ${BULLET_TARGETS}
  COMMENT "Building ammo webassembly"
  VERBATIM)
add_custom_target(ammo-wasm ALL DEPENDS ammo.wasm.js ammo.wasm.wasm)
