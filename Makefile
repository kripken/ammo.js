#
# Makefile for ammo.js
#
# Enable closure with CLOSURE=1
# Enable add function support with ADD_FUNCTION_SUPPORT=1
#
INCLUDES := \
	ammo.h

BULLET_LIBS := \
	bullet/build/src/.libs/libBulletCollision.a \
	bullet/build/src/.libs/libBulletDynamics.a \
	bullet/build/src/.libs/libBulletSoftBody.a \
	bullet/build/src/.libs/libLinearMath.a

# Default is 64*1024*1024 = 64MB
TOTAL_MEMORY := 67108864

# Enable for resizable heap, with some amount of slowness
ALLOW_MEMORY_GROWTH := 0

EMCC_ARGS := \
	-DNOTHING_WAKA_WAKA \
	-O3  \
	--llvm-lto 1 \
	-s TOTAL_MEMORY=$(TOTAL_MEMORY) \
	-s ALLOW_MEMORY_GROWTH=$(ALLOW_MEMORY_GROWTH) \
	-s NO_EXIT_RUNTIME=1 \
	-s NO_FILESYSTEM=1 \
	-s EXPORTED_RUNTIME_METHODS=["UTF8ToString"] \
  -s EXPORT_NAME="Ammo" \
	-s MODULARIZE=1 \
	--js-transform 'python ./bundle.py'

ifeq ($(CLOSURE), 1)
	# Ignore closure errors about the bullet Node class
	# (Node is a DOM thing too)
	EMCC_ARGS := $(EMCC_ARGS) \
		--closure 1 \
		-s IGNORE_CLOSURE_COMPILER_ERRORS=1
else
	EMCC_ARGS := $(EMCC_ARGS) \
		-s NO_DYNAMIC_EXECUTION=1
endif

ifeq ($(ADD_FUNCTION_SUPPORT), 1)
	EMCC_ARGS := $(EMCC_ARGS) \
		-s RESERVED_FUNCTION_POINTERS=20 \
		-s EXTRA_EXPORTED_RUNTIME_METHODS=["addFunction"]
endif

EMCC_ARGS_JS := $(EMCC_ARGS) \
	-s WASM=0 \
	-s AGGRESSIVE_VARIABLE_ELIMINATION=1 \
	-s ELIMINATE_DUPLICATE_FUNCTIONS=1 \
	-s SINGLE_FILE=1 \
	-s LEGACY_VM_SUPPORT=1

EMCC_ARGS_WASM := $(EMCC_ARGS) \
	-s WASM=1 \
	-s BINARYEN_IGNORE_IMPLICIT_TRAPS=1


all : javascript webassembly
javascript : builds/ammo.js
webassembly : builds/ammo.wasm.js builds/ammo.wasm.wasm

builds/ammo.js : glue.o bullet
	$(info 🎯 Building ammo javascript...)
	emcc glue.o $(BULLET_LIBS) $(EMCC_ARGS_JS) -o builds/ammo.js
	python ./wrap.py builds/ammo.js

builds/ammo.wasm.wasm : glue.o bullet
	$(info 🎯 Building ammo webassembly...)
	emcc glue.o $(BULLET_LIBS) $(EMCC_ARGS_WASM) -o builds/ammo.wasm.js
	python ./wrap.py builds/ammo.wasm.js
builds/ammo.wasm.js : builds/ammo.wasm.wasm ;

bullet : bullet/build/Makefile
	$(info 🎯 Building bullet...)
	$(MAKE) -C bullet/build

bullet/build :
	$(info 🎯 Creating build folder...)
	mkdir -p bullet/build

bullet/build/Makefile : bullet/configure | bullet/build
	$(info 🎯 Configuring bullet...)
	cd bullet/build && emconfigure ../configure --disable-demos --disable-dependency-tracking

bullet/clean :
	$(info 🎯 Cleaning bullet...)
	$(MAKE) -C bullet/build clean
	rm -rf bullet/build

bullet/configure :
	$(info 🎯 Generating bullet build scripts...)
	cd bullet && ./autogen.sh

clean :
	$(info 🎯 Cleaning ammo...)
	rm -f glue.o glue.cpp glue.js WebIDLGrammar.pkl parser.out

glue.cpp : ammo.idl
	$(info 🎯 Generating ammo bindings...)
	python $(EMSCRIPTEN_ROOT)/tools/webidl_binder.py ammo.idl glue
glue.js : glue.cpp ;

glue.o : glue.cpp
	$(info 🎯 Building ammo bindings...)
	emcc -c glue.cpp -Ibullet/src $(foreach d, $(INCLUDES),-include $d) -o glue.o

.PHONY : all bullet bullet/clean clean javascript webassembly
