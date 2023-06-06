#!/bin/bash
rm -rf builds/*
cmake -B builds -DALLOW_MEMORY_GROWTH=1 -DCLOSURE=1 -DENVIRONMENT='web,webview'
cmake --build builds -j12
