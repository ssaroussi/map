import { Canvas } from './components/Canvas/Canvas';
import { NotesPanel } from './components/Panels/NotesPanel';
import { LabelEditor } from './components/Panels/LabelEditor';
import { Toolbar } from './components/Panels/Toolbar';

export default function App() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Toolbar />
      <Canvas />
      <NotesPanel />
      <LabelEditor />
    </div>
  );
}
