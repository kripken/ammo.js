/*
CDTestFramework http://codercorner.com
Copyright (c) 2007-2008 Pierre Terdiman,  pierre@codercorner.com

This software is provided 'as-is', without any express or implied warranty.
In no event will the authors be held liable for any damages arising from the use of this software.
Permission is granted to anyone to use this software for any purpose, 
including commercial applications, and to alter it and redistribute it freely, 
subject to the following restrictions:

1. The origin of this software must not be misrepresented; you must not claim that you wrote the original software. If you use this software in a product, an acknowledgment in the product documentation would be appreciated but is not required.
2. Altered source versions must be plainly marked as such, and must not be misrepresented as being the original software.
3. This notice may not be removed or altered from any source distribution.
*/

#ifndef OBBMESHQUERY_H
#define OBBMESHQUERY_H

#include "CollisionTest.h"
#include "Profiling.h"

	class OBBMeshQuery : public CollisionTest
	{
		public:
								OBBMeshQuery();
		virtual					~OBBMeshQuery();

		virtual	void			Init();
		virtual	void			Release();
		virtual	void			PerformTest();
		virtual	void			Select();
		virtual	void			Deselect();
		virtual	void			KeyboardCallback(unsigned char key, int x, int y);
		virtual	void			MouseCallback(int button, int state, int x, int y);
		virtual	void			MotionCallback(int x, int y);

				TwBar*			mBar;		//!< AntTweakBar
				OBB				mBox;

				float			mAngleX;
				float			mAngleY;
				float			mAngleZ;

				OBBCache		mCache;
				OpcodeSettings	mSettings;
				Profiler		mProfiler;

				float			mDist;
				Point			mLocalHit;
				bool			mValidHit;
	};

#endif	// OBBMESHQUERY_H
