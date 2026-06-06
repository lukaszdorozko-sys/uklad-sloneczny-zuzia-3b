import { EducationPanel } from '../components/ui/EducationPanel';
import { LearningDock } from '../components/ui/LearningDock';
import { Minimap } from '../components/minimap/Minimap';
import { MobileDrawerControls } from '../components/ui/MobileDrawerControls';
import { ObjectList } from '../components/ui/ObjectList';
import { StudentWatermark } from '../components/ui/StudentWatermark';
import { TopToolbar } from '../components/ui/TopToolbar';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { SolarSystemScene } from '../scenes/SolarSystemScene';
import { useSolarStore } from '../stores/useSolarStore';

export function SimulatorPage() {
  useKeyboardShortcuts();
  const selectedBodyId = useSolarStore((state) => state.selectedBodyId);
  const mobileDrawer = useSolarStore((state) => state.mobileDrawer);

  return (
    <main className="app-shell">
      <SolarSystemScene />
      <div className={`ui-layer ${selectedBodyId ? 'ui-layer--with-panel' : ''} ui-layer--drawer-${mobileDrawer}`}>
        <TopToolbar />
        <ObjectList />
        <Minimap />
        <EducationPanel />
        <LearningDock />
        <StudentWatermark />
        <MobileDrawerControls />
      </div>
    </main>
  );
}
