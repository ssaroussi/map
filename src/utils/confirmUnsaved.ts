import { useMapStore } from '../store/mapStore';

// ---------------------------------------------------------------------------
// Generic modal primitive
// ---------------------------------------------------------------------------

interface ModalButton {
  id: string;
  label: string;
  accent?: boolean;
  onClick: () => void;
}

interface ModalOptions {
  id: string;
  title: string;
  message: string;
  buttons: ModalButton[];   // last button = default Enter action
  onEscape: () => void;
}

function showModal({ id, title, message, buttons, onEscape }: ModalOptions) {
  if (document.getElementById(id)) return;

  const overlay = document.createElement('div');
  overlay.id = id;
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 9999;
    display: flex; align-items: center; justify-content: center;
    background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
  `;

  const btnHtml = buttons.map(b => `
    <button id="${b.id}" style="
      background: ${b.accent ? 'var(--t-accent-border)' : 'var(--t-surface)'};
      border: ${b.accent ? 'none' : '1px solid var(--t-border)'};
      color: var(--t-text); border-radius: 8px; padding: 8px 20px;
      font-size: 14px; cursor: pointer; font-weight: ${b.accent ? 600 : 400};
      font-family: system-ui, sans-serif;
    ">${b.label}</button>
  `).join('');

  overlay.innerHTML = `
    <div style="
      background: var(--t-popup-bg); border: 1px solid var(--t-border);
      border-radius: 14px; padding: 28px 32px; text-align: center;
      color: var(--t-text); font-family: system-ui, sans-serif; min-width: 300px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.7);
    ">
      <h2 style="margin: 0 0 8px; font-size: 17px; font-weight: 600;">${title}</h2>
      <p style="margin: 0 0 24px; font-size: 14px; color: var(--t-text-muted);">${message}</p>
      <div style="display: flex; gap: 10px; justify-content: center;">${btnHtml}</div>
    </div>
  `;

  document.body.appendChild(overlay);

  const dismiss = () => {
    overlay.remove();
    document.removeEventListener('keydown', keyHandler);
  };

  buttons.forEach(b => {
    overlay.querySelector(`#${b.id}`)!.addEventListener('click', () => {
      dismiss();
      b.onClick();
    });
  });

  const defaultButton = buttons[buttons.length - 1];

  const keyHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      dismiss();
      onEscape();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      dismiss();
      defaultButton.onClick();
    }
  };

  document.addEventListener('keydown', keyHandler);
}

// ---------------------------------------------------------------------------
// Unsaved-changes guard
// ---------------------------------------------------------------------------

export function confirmIfUnsaved(onContinue: () => void): void {
  const { isDirty, currentFilePath } = useMapStore.getState();
  if (!isDirty && currentFilePath) {
    onContinue();
    return;
  }

  showModal({
    id: 'save-confirm-modal',
    title: 'Unsaved Changes',
    message: 'Do you want to save your changes before continuing?',
    buttons: [
      { id: 'save-confirm-cancel',  label: 'Cancel',     onClick: () => {} },
      { id: 'save-confirm-discard', label: "Don't Save", onClick: onContinue },
      { id: 'save-confirm-save',    label: 'Save', accent: true, onClick: () => doSaveAndContinue(onContinue) },
    ],
    onEscape: () => {},   // Escape = cancel, same as Cancel button
  });
}

async function doSaveAndContinue(onContinue: () => void) {
  await useMapStore.getState().saveMap();
  // If the save-picker was cancelled isDirty stays true — abort
  if (useMapStore.getState().isDirty) return;
  onContinue();
}

// ---------------------------------------------------------------------------
// Delete-subtree confirmation
// ---------------------------------------------------------------------------

export function confirmDelete(
  nodeTitle: string,
  childCount: number,
  onConfirm: () => void,
): void {
  // Leaf nodes: delete without asking
  if (childCount === 0) {
    onConfirm();
    return;
  }

  const noun = childCount === 1 ? '1 child node' : `${childCount} child nodes`;

  showModal({
    id: 'delete-confirm-modal',
    title: 'Delete Subtree',
    message: `"${nodeTitle}" has ${noun}. This cannot be undone.`,
    buttons: [
      { id: 'delete-confirm-cancel', label: 'Cancel',  onClick: () => {} },
      { id: 'delete-confirm-ok',     label: 'Delete', accent: true, onClick: onConfirm },
    ],
    onEscape: () => {},   // Escape = cancel
  });
}
