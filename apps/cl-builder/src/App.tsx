import { useAtom } from '@xoid/react';
import { Layer } from './Layer';
import { Sidebar } from './Sidebar';
import { maxLayerIndex$ } from './store';

export const App: React.FC = () => {
  const maxLayerIndex = useAtom(maxLayerIndex$);
  return (
    <main className="grid grid-cols-[200px_1fr] w-screen h-screen">
      <Sidebar />
      <section>
        <Layer index={maxLayerIndex} />
      </section>
    </main>
  );
};
