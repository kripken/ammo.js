#!/bin/bash

apt install -y automake libtool m4

pushd ../emsdk
git pull
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh
popd

pushd bullet
# Run in separate process otherwise it hijacks the current bash session
bash -c ./autogen.sh 
popd
python make.py
python test.py
