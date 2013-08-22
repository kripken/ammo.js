/*
Bullet Continuous Collision Detection and Physics Library
Copyright (c) 2003-2007 Erwin Coumans  http://continuousphysics.com/Bullet/

This software is provided 'as-is', without any express or implied warranty.
In no event will the authors be held liable for any damages arising from the use of this software.
Permission is granted to anyone to use this software for any purpose, 
including commercial applications, and to alter it and redistribute it freely, 
subject to the following restrictions:

1. The origin of this software must not be misrepresented; you must not claim that you wrote the original software. If you use this software in a product, an acknowledgment in the product documentation would be appreciated but is not required.
2. Altered source versions must be plainly marked as such, and must not be misrepresented as being the original software.
3. This notice may not be removed or altered from any source distribution.
*/

#include "VoronoiFractureDemo.h"
#include "GlutStuff.h"
#include "btBulletDynamicsCommon.h"
#include "LinearMath/btHashMap.h"



static bool cmp(const int& p1, const int& p2) {
	return p1<p2;
}

int main(int argc,char** argv)
{

	btAlignedObjectArray<int> bla;

	bla.push_back(8);
	bla.push_back(6);
	bla.push_back(6);
	bla.push_back(4);
	bla.push_back(9);
	bla.quickSort(cmp);

	VoronoiFractureDemo ccdDemo;
	ccdDemo.initPhysics();

#ifdef CHECK_MEMORY_LEAKS
	ccdDemo.exitPhysics();
#else
	return glutmain(argc, argv,1024,600,"Bullet Physics Demo. http://bulletphysics.org",&ccdDemo);
#endif
	
	//default glut doesn't return from mainloop
	return 0;
}

