/*
 * bullet benchmarks for ammo!
 */
#include "BenchmarkDemo.h"
#include <benchmark/benchmark.h>

extern bool gDisableDeactivation; // TODO retain from legacy benchmarks?

const int FRAMES = 200;
const int KEYFRAME_INTERVAL = 25;
const float TIMESTEP = 1.f / 60.f;
const std::map<int, const char*> BENCHMARKS {
  // Benchmark a stack of 3000 boxes. It will stress the collision detection,
  // a specialized box-box implementation based on the separating axis test,
  // and the constraint solver.
  { 1, "3000 Boxes" },

  // Benchmark a stack of 3000 boxes. It will stress the collision detection,
  // a specialized box-box implementation based on the separating axis test,
  // and the constraint solver.
  // TODO fix duplicated description from bullet
  { 2, "1000 Stack" },

  // Benchmark the performance of the ragdoll constraints, btHingeConstraint
  // and btConeTwistConstraint, in addition to capsule collision detection.
  { 3, "Ragdolls" },

  // Benchmark the performance and stability of rigid bodies using btConvexHullShape.
  { 4, "Convex Stack" },

  // Benchmark the performance and stability of rigid bodies using primitive
  // collision shapes (btSphereShape, btBoxShape), resting on a triangle mesh,
  // btBvhTriangleMeshShape.
  { 5, "Prim vs Mesh" },

  // Benchmark the performance and stability of rigid bodies using convex hull
  // collision shapes (btConvexHullShape), resting on a triangle mesh,
  // btBvhTriangleMeshShape.
  { 6, "Convex vs Mesh" },

  // Benchmark the performance of the btCollisionWorld::rayTest.
  // Note that currently the rays are not rendered.
  { 7, "Raycast" },

};

void run(benchmark::State& state, int id, int start, int frames, float timestep) {
  BenchmarkDemo* demo;
  int benchmarkedFrames = 0;

  gDisableDeactivation = true; // TODO retain from legacy benchmarks?

  for (auto _ : state) {
    state.PauseTiming();
    demo = new BenchmarkDemo(id);
    demo->initPhysics();
    for (int f = 0; f < start - 1; f++) {
			demo->clientMoveAndDisplay();
    }
    state.ResumeTiming();

    for (int f = 0; f < frames; f++) {
			demo->clientMoveAndDisplay();
      benchmarkedFrames++;
    }

    state.PauseTiming();
    demo->exitPhysics();
    delete demo;
    state.ResumeTiming();
  }

  state.counters["fps"] = benchmark::Counter(benchmarkedFrames, benchmark::Counter::kIsRate);
  state.counters["start"] = start;
  state.counters["frames"] = frames;
}


int main(int argc, char** argv) {
  for (auto& b : BENCHMARKS) {
    int id = b.first;
    const char* name = b.second;

    // Measure performance of individual keyframes:
    // This mimics the legacy bullet benchmark behavior, but also causes google
    // benchmark to grind hard for statistically stable results.
    // To keep the suite fast, limit each benchmark to a single iteration.
    for (int start = 0; start < FRAMES; start += KEYFRAME_INTERVAL) {
      benchmark::RegisterBenchmark(name, run, id, start, 1, TIMESTEP)
        ->Iterations(1)
        ->Unit(benchmark::kMillisecond);
    }

    // Measure performance over all frames:
    benchmark::RegisterBenchmark(name, run, id, 0, FRAMES, TIMESTEP)
      ->Unit(benchmark::kMillisecond);
  }
  benchmark::Initialize(&argc, argv);
  benchmark::RunSpecifiedBenchmarks();
}
