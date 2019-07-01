//Web IDL doesn't seem to support C++ templates so this is the best we can do
//https://stackoverflow.com/questions/42517010/is-there-a-way-to-create-webidl-bindings-for-c-templated-types#comment82966925_42517010
typedef btAlignedObjectArray<btVector3> btVector3Array;
typedef btAlignedObjectArray<btFace> btFaceArray;
typedef btAlignedObjectArray<int> btIntArray;
