cmake_minimum_required(VERSION 3.17)
set(CMAKE_POLICY_DEFAULT_CMP0077 NEW)

set(CMAKE_BUILD_TYPE Release CACHE STRING "bammo build type")

########################################
# bullet
########################################
set(BULLET_DIR ${CMAKE_CURRENT_SOURCE_DIR}/../bullet)
if(NOT TARGET BulletCollision)
  set(BUILD_EXTRAS OFF)
  set(BUILD_MULTITHREADING OFF)
  set(BUILD_UNIT_TESTS OFF)
  set(USE_GRAPHICAL_BENCHMARK OFF)
  set(USE_GLUT OFF)
  add_subdirectory(${BULLET_DIR} bullet EXCLUDE_FROM_ALL)
endif()


########################################
# google benchmark
#######################################
set(BENCHMARK_ENABLE_GTEST_TESTS OFF)
add_subdirectory(benchmark EXCLUDE_FROM_ALL)


########################################
# bammo
#######################################
project(bammo)

set(BAMMO_DIR
  ${CMAKE_CURRENT_SOURCE_DIR})
set(BAMMO_SOURCES
  ${BAMMO_DIR}/main.cpp
  ${BULLET_DIR}/Demos/Benchmarks/BenchmarkDemo.cpp)
set(BAMMO_CFLAGS
  -std=c++11
  -I${BULLET_DIR}/src
  -I${BULLET_DIR}/Demos/Benchmarks)

add_executable(bammo ${BAMMO_SOURCES})
target_compile_options(bammo PUBLIC ${BAMMO_CFLAGS})
target_link_libraries(bammo BulletCollision)
target_link_libraries(bammo BulletDynamics)
target_link_libraries(bammo LinearMath)
target_link_libraries(bammo benchmark::benchmark)


#######################################
# legacy bullet benchmarks
#######################################
set(BENCHMARK_SOURCES
  ${BULLET_DIR}/Demos/Benchmarks/main.cpp
  ${BULLET_DIR}/Demos/Benchmarks/BenchmarkDemo.cpp)
set(BENCHMARK_CFLAGS
  -I${BULLET_DIR}/src)

add_executable(benchmarks ${BENCHMARK_SOURCES})
target_compile_options(benchmarks PUBLIC ${BENCHMARK_CFLAGS})
target_link_libraries(benchmarks BulletCollision)
target_link_libraries(benchmarks BulletDynamics)
target_link_libraries(benchmarks LinearMath)
