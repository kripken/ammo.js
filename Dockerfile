FROM emscripten/emsdk

WORKDIR /src

COPY . .

RUN cmake -B builds -DCLOSURE=1 -DTOTAL_MEMORY=134217728

RUN cmake --build builds

# Prevent docker run from immediately exiting
CMD ["tail", "-f", "/dev/null"]

# Build image by running: docker build -t ammo .

# Run container by running: docker run -d --name ammo-container ammo

# Retrieve build files by running: docker cp ammo-container:/src/builds <host-path>

# Example: docker cp ammo-container:/src/builds /c/dev/fork

# docker stop ammo-container

# docker rm ammo-container