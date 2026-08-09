import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Experience from '@/components/sections/Experience';
import Skills from '@/components/sections/Skills';
import Projects from '@/components/sections/Projects';
import Lab from '@/components/sections/Lab';
import Contact from '@/components/sections/Contact';
import ClientShell from '@/components/layout/ClientShell';

export default function HomePage() {
  return (
    <ClientShell>
      <Hero />
      <About />
      <Experience />
      <Skills />
      <Projects />
      <Lab />
      <Contact />
    </ClientShell>
  );
}
