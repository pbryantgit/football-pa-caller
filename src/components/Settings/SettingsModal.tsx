import React from 'react';
import { AnnouncementSettings } from '../../types';
import { X, Check } from 'lucide-react';

interface SettingsModalProps {
  settings: AnnouncementSettings;
  onSaveSettings: (settings: AnnouncementSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onSaveSettings, onClose }) => {
  const [localSettings, setLocalSettings] = React.useState<AnnouncementSettings>(settings);

  const toggleField = (field: keyof AnnouncementSettings) => {
    setLocalSettings({
      ...localSettings,
      [field]: !localSettings[field],
    });
  };

  const handleSave = () => {
    onSaveSettings(localSettings);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-panel" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800 }}>Announcement Settings</h2>
          <button className="btn btn-secondary" style={{ padding: '6px' }} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={localSettings.includePlayerNames}
              onChange={() => toggleField('includePlayerNames')}
              style={{ width: '18px', height: '18px' }}
            />
            <div>
              <div style={{ fontWeight: 700 }}>Include Player Names</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Say player names alongside jersey numbers</div>
            </div>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={localSettings.includeTacklers}
              onChange={() => toggleField('includeTacklers')}
              style={{ width: '18px', height: '18px' }}
            />
            <div>
              <div style={{ fontWeight: 700 }}>Include Defensive Tacklers</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Include primary and assist tacklers in announcements</div>
            </div>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={localSettings.sayJerseyPrefix}
              onChange={() => toggleField('sayJerseyPrefix')}
              style={{ width: '18px', height: '18px' }}
            />
            <div>
              <div style={{ fontWeight: 700 }}>Say "Number" Prefix</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>e.g. "Number 33 Nathan Bryant" vs "#33 Nathan Bryant"</div>
            </div>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={localSettings.useOrdinalDowns}
              onChange={() => toggleField('useOrdinalDowns')}
              style={{ width: '18px', height: '18px' }}
            />
            <div>
              <div style={{ fontWeight: 700 }}>Use Ordinal Down Words</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>e.g. "third down and four" vs "3rd &amp; 4"</div>
            </div>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={localSettings.useMascotName}
              onChange={() => toggleField('useMascotName')}
              style={{ width: '18px', height: '18px' }}
            />
            <div>
              <div style={{ fontWeight: 700 }}>Use Team Mascot Name</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>e.g. "Spartans" vs "South Paulding"</div>
            </div>
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>
            <Check size={16} />
            <span>Save Preferences</span>
          </button>
        </div>
      </div>
    </div>
  );
};
