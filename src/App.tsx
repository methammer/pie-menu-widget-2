import './App.css'
import { RadialMenu } from "@/components/RadialMenu"

function App() {
  return (
    <div className="w-screen h-screen bg-background text-foreground overflow-hidden">
      {/* You can add a container here if you don't want it to be full screen */}
      {/* <div className="relative w-[80vw] h-[80vh] border border-dashed border-muted-foreground mx-auto my-10"> */}
        <RadialMenu />
      {/* </div> */}
      <div className="absolute bottom-4 right-4 text-xs text-muted-foreground p-2 bg-card rounded-md shadow">
        Drag the main button. Click to toggle items. Hover over items.
      </div>
    </div>
  )
}

export default App
