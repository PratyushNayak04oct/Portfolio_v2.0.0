'use client';

import dynamic from 'next/dynamic';
import BackgroundEnvironment from '@/components/environment/BackgroundEnvironment';
import Grain from '@/components/environment/Grain';
import TechMicro from '@/components/environment/TechMicro';
import Navigation from '@/components/layout/Navigation';
import LoadingScreen from '@/components/layout/LoadingScreen';
import CustomCursor from '@/components/layout/CustomCursor';
import Footer from '@/components/layout/Footer';
import SceneErrorBoundary from '@/components/layout/SceneErrorBoundary';
import { useSectionProgress } from '@/hooks/useSectionProgress';
import { useLenis } from '@/hooks/useLenis';
import { useScrollReset } from '@/hooks/useScrollReset';
import { useLabStore } from '@/lib/labStore';
import ReactorFallback from '@/components/reactor/ReactorFallback';

const ReactorScene = dynamic(
  () => import('@/components/reactor/ReactorScene'),
  { ssr: false },
);

function ScrollRuntime() {
  useScrollReset();
  useLenis();
  useSectionProgress();
  return null;
}

export default function ClientShell({ children }) {
  const loaded = useLabStore((s) => s.loaded);
  const warmBoot = useLabStore((s) => s.warmBoot);
  // Boot WebGL only when the loader signals warmBoot (late charge) — keeps aura smooth
  const bootScenes = warmBoot || loaded;

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:bg-surface focus:px-4 focus:py-2 focus:text-ink"
      >
        Skip to content
      </a>
      <LoadingScreen />
      <BackgroundEnvironment />
      <Grain />
      <TechMicro />
      <CustomCursor />
      <Navigation />
      {bootScenes ? (
        <div
          className={`transition-opacity duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <SceneErrorBoundary
            fallback={
              <div className="pointer-events-none fixed inset-0 z-[3]">
                <ReactorFallback />
              </div>
            }
          >
            <ReactorScene />
          </SceneErrorBoundary>
        </div>
      ) : null}
      <ScrollRuntime />
      <main
        id="main-content"
        className={`relative z-20 flex-1 transition-opacity duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {children}
      </main>
      <Footer />
    </>
  );
}
