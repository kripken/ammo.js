FROM emscripten/emsdk

WORKDIR /src

COPY . .

RUN cmake -B builds -DCLOSURE=1 -DTOTAL_MEMORY=268435456

RUN cmake --build builds

# Build image by running: docker build -t ammo .

# Run container by running: docker run -t ammo:latest

# Retrieve build files by running: docker cp <container-id>:/src/builds <host-path>