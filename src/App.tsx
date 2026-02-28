import { Canvas } from './components/Canvas/Canvas';
import { NotesPanel } from './components/Panels/NotesPanel';
import { LabelEditor } from './components/Panels/LabelEditor';
import { useNativeMenu } from './hooks/useNativeMenu';

export default function App() {
  useNativeMenu();

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas />
      <NotesPanel />
      <LabelEditor />
    </div>
  );
}
