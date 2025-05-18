import { RadialMenu } from '@/components/RadialMenu';

function App() {
  return (
    <div className="w-screen h-screen flex items-center justify-center relative overflow-hidden">
      <RadialMenu />
      <div className="absolute bottom-4 right-4 text-xs text-muted-foreground p-2 bg-card rounded-md shadow">
        Radial Menu - Fresh Start
      </div>
    </div>
  );
}

export default App;
