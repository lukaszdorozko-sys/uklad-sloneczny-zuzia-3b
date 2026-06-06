import { BookOpen, Info, List, X } from 'lucide-react';
import { useSolarStore } from '../../stores/useSolarStore';
import type { MobileDrawer } from '../../types/celestial';

const drawerItems: Array<{ id: Exclude<MobileDrawer, 'none'>; label: string; icon: typeof List }> = [
  { id: 'objects', label: 'Obiekty', icon: List },
  { id: 'info', label: 'Panel', icon: Info },
  { id: 'learn', label: 'Nauka', icon: BookOpen },
];

export function MobileDrawerControls() {
  const mobileDrawer = useSolarStore((state) => state.mobileDrawer);
  const selectedBodyId = useSolarStore((state) => state.selectedBodyId);
  const setMobileDrawer = useSolarStore((state) => state.setMobileDrawer);

  const toggleDrawer = (drawer: MobileDrawer) => {
    setMobileDrawer(mobileDrawer === drawer ? 'none' : drawer);
  };

  return (
    <nav className="mobile-drawer-controls" aria-label="Panele mobilne">
      {drawerItems.map((item) => {
        const Icon = item.icon;
        const disabled = item.id === 'info' && !selectedBodyId;
        return (
          <button
            type="button"
            key={item.id}
            className={mobileDrawer === item.id ? 'is-active' : ''}
            onClick={() => toggleDrawer(item.id)}
            aria-pressed={mobileDrawer === item.id}
            disabled={disabled}
          >
            <Icon aria-hidden="true" size={17} />
            {item.label}
          </button>
        );
      })}
      <button type="button" onClick={() => setMobileDrawer('none')} aria-label="Zamknij panel mobilny">
        <X aria-hidden="true" size={17} />
      </button>
    </nav>
  );
}
