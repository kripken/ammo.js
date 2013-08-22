/*
Bullet Continuous Collision Detection and Physics Library, http://bulletphysics.org
Copyright (C) 2006 - 2009 Sony Computer Entertainment Inc. 

This software is provided 'as-is', without any express or implied warranty.
In no event will the authors be held liable for any damages arising from the use of this software.
Permission is granted to anyone to use this software for any purpose, 
including commercial applications, and to alter it and redistribute it freely, 
subject to the following restrictions:

1. The origin of this software must not be misrepresented; you must not claim that you wrote the original software. If you use this software in a product, an acknowledgment in the product documentation would be appreciated but is not required.
2. Altered source versions must be plainly marked as such, and must not be misrepresented as being the original software.
3. This notice may not be removed or altered from any source distribution.
*/

#include "ParticlesDemo.h"
#include "GlutStuff.h"
#include "GLDebugDrawer.h"

#include "btBulletDynamicsCommon.h"
#include "LinearMath/btHashMap.h"


// standard utility and system includes
//#include <oclUtils.h>
// Extra CL/GL include
//#include <CL/cl_gl.h>


GLDebugDrawer	gDebugDrawer;

int main(int argc,char** argv)
{
    // start logs
//    oclSetLogFileName ("appSpheresGrid.txt");
//    oclLog(LOGBOTH, 0.0, "appSpheresGrid.exe Starting...\n\n"); 
	
	
	ParticlesDemo ccdDemo(argc, argv);
	ccdDemo.initPhysics();
	ccdDemo.getDynamicsWorld()->setDebugDrawer(&gDebugDrawer);

#ifdef CHECK_MEMORY_LEAKS
	ccdDemo.exitPhysics();
#else
	return glutmain(argc, argv,640,480,"Bullet Physics Demo. http://bulletphysics.com",&ccdDemo);
#endif
	
	//default glut doesn't return from mainloop
	return 0;
}