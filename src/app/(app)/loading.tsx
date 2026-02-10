import { NeuralLoader } from '@/components/loaders';

export default function AppLoading() {
  return (
    <div className="flex h-full min-h-screen items-center justify-center bg-background">
      <NeuralLoader size={120} label="Loading..." />
    </div>
  );
}
