import React, { useState } from 'react';
import { Player, Team } from '../../types';
import { CSVImportModal } from './CSVImportModal';
import { Plus, Trash2, Edit2, Upload, X, Check } from 'lucide-react';

interface RosterModalProps {
  teams: Record<string, Team>;
  onSaveTeams: (teams: Record<string, Team>) => void;
  onClose: () => void;
}

export const RosterModal: React.FC<RosterModalProps> = ({ teams, onSaveTeams, onClose }) => {
  const [selectedTeamId, setSelectedTeamId] = useState<string>(Object.keys(teams)[0] || 'spartans');
  const [localTeams, setLocalTeams] = useState<Record<string, Team>>(teams);
  const [showCSVModal, setShowCSVModal] = useState(false);

  // New Player Form State
  const [newJersey, setNewJersey] = useState('');
  const [newName, setNewName] = useState('');
  const [newPhonetic, setNewPhonetic] = useState('');
  const [newPos, setNewPos] = useState('QB');

  const currentTeam = localTeams[selectedTeamId];

  const handleUpdateTeamField = (field: keyof Team, value: any) => {
    const updatedTeam = {
      ...currentTeam,
      [field]: value,
    };
    // Sync shortName when mascot changes if shortName previously matched mascot
    if (field === 'mascot' && (!currentTeam.shortName || currentTeam.shortName === currentTeam.mascot)) {
      updatedTeam.shortName = value;
    }
    setLocalTeams({
      ...localTeams,
      [selectedTeamId]: updatedTeam,
    });
  };

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJersey || !newName) return;

    const newPlayer: Player = {
      id: `p-${Date.now()}`,
      jerseyNumber: newJersey.trim(),
      displayName: newName.trim(),
      phoneticPronunciation: newPhonetic.trim(),
      position: newPos.toUpperCase(),
      unit: 'offense',
      active: true,
    };

    setLocalTeams({
      ...localTeams,
      [selectedTeamId]: {
        ...currentTeam,
        roster: [...currentTeam.roster, newPlayer],
      },
    });

    setNewJersey('');
    setNewName('');
    setNewPhonetic('');
  };

  const handleDeletePlayer = (playerId: string) => {
    setLocalTeams({
      ...localTeams,
      [selectedTeamId]: {
        ...currentTeam,
        roster: currentTeam.roster.filter((p) => p.id !== playerId),
      },
    });
  };

  const handleImportCSVPlayers = (imported: Player[]) => {
    setLocalTeams({
      ...localTeams,
      [selectedTeamId]: {
        ...currentTeam,
        roster: [...currentTeam.roster, ...imported],
      },
    });
  };

  const handleSaveAll = () => {
    onSaveTeams(localTeams);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-panel" style={{ maxWidth: '850px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800 }}>Team &amp; Roster Management</h2>
          <button className="btn btn-secondary" style={{ padding: '6px' }} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Team Switcher Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
          {Object.values(localTeams).map((t) => (
            <button
              key={t.id}
              className={`btn ${selectedTeamId === t.id ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedTeamId(t.id)}
            >
              <span>{t.schoolName} {t.mascot}</span>
            </button>
          ))}
        </div>

        {currentTeam && (
          <div>
            {/* Team Attributes Editor */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', marginBottom: '16px', background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '10px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>School Name</label>
                <input
                  type="text"
                  value={currentTeam.schoolName}
                  onChange={(e) => handleUpdateTeamField('schoolName', e.target.value)}
                  placeholder="e.g. South Paulding"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Mascot</label>
                <input
                  type="text"
                  value={currentTeam.mascot}
                  onChange={(e) => handleUpdateTeamField('mascot', e.target.value)}
                  placeholder="e.g. Spartans"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Short Display Name</label>
                <input
                  type="text"
                  value={currentTeam.shortName || currentTeam.mascot}
                  onChange={(e) => handleUpdateTeamField('shortName', e.target.value)}
                  placeholder="e.g. Spartans"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Abbreviation</label>
                <input
                  type="text"
                  value={currentTeam.abbreviation}
                  onChange={(e) => handleUpdateTeamField('abbreviation', e.target.value)}
                  placeholder="e.g. SP"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Jersey Color</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="color"
                    value={currentTeam.jerseyColor}
                    onChange={(e) => handleUpdateTeamField('jerseyColor', e.target.value)}
                    style={{ width: '40px', height: '36px', padding: '0', cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    value={currentTeam.jerseyColor}
                    onChange={(e) => handleUpdateTeamField('jerseyColor', e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Jersey Text Color</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="color"
                    value={currentTeam.jerseyTextColor || '#ffffff'}
                    onChange={(e) => handleUpdateTeamField('jerseyTextColor', e.target.value)}
                    style={{ width: '40px', height: '36px', padding: '0', cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    value={currentTeam.jerseyTextColor || '#ffffff'}
                    onChange={(e) => handleUpdateTeamField('jerseyTextColor', e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Default Quarterback</label>
                <select
                  value={currentTeam.defaultQuarterbackPlayerId || ''}
                  onChange={(e) => handleUpdateTeamField('defaultQuarterbackPlayerId', e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="">Select Default QB...</option>
                  {currentTeam.roster.map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.jerseyNumber} {p.displayName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* CSV Import Trigger */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>
                Roster Players ({currentTeam.roster.length})
              </h3>
              <button className="btn btn-secondary" onClick={() => setShowCSVModal(true)}>
                <Upload size={14} />
                <span>Import CSV Roster</span>
              </button>
            </div>

            {/* Quick Add Player Form */}
            <form onSubmit={handleAddPlayer} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr 80px auto', gap: '8px', marginBottom: '16px' }}>
              <input
                type="text"
                placeholder="#"
                value={newJersey}
                onChange={(e) => setNewJersey(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Full Player Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Phonetic Pronunciation"
                value={newPhonetic}
                onChange={(e) => setNewPhonetic(e.target.value)}
              />
              <input
                type="text"
                placeholder="Pos"
                value={newPos}
                onChange={(e) => setNewPos(e.target.value)}
              />
              <button className="btn btn-primary" type="submit">
                <Plus size={16} />
                <span>Add</span>
              </button>
            </form>

            {/* Roster Table */}
            <div style={{ maxHeight: '280px', overflowY: 'auto', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
              <table width="100%" style={{ borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '8px 12px' }}>#</th>
                    <th style={{ padding: '8px 12px' }}>Name</th>
                    <th style={{ padding: '8px 12px' }}>Phonetic</th>
                    <th style={{ padding: '8px 12px' }}>Position</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTeam.roster.map((player) => (
                    <tr key={player.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '8px 12px', fontWeight: 800 }}>#{player.jerseyNumber}</td>
                      <td style={{ padding: '8px 12px', fontWeight: 600 }}>{player.displayName}</td>
                      <td style={{ padding: '8px 12px', color: '#93c5fd' }}>{player.phoneticPronunciation || '-'}</td>
                      <td style={{ padding: '8px 12px' }}>{player.position || 'Player'}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                        <button className="btn btn-danger" style={{ padding: '4px 8px' }} onClick={() => handleDeletePlayer(player.id)}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSaveAll}>
            <Check size={16} />
            <span>Save Team Changes</span>
          </button>
        </div>

        {showCSVModal && (
          <CSVImportModal
            onClose={() => setShowCSVModal(false)}
            onImportPlayers={handleImportCSVPlayers}
          />
        )}
      </div>
    </div>
  );
};
