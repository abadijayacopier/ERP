/**
 * PRO MAX CUSTOM ALERT SYSTEM
 * Custom implementation of SweetAlert-like notifications
 * No external dependencies required.
 */

const createAlertStyles = () => {
  if (typeof document === 'undefined' || document.getElementById('swal-pro-styles')) return;

  const style = document.createElement('style');
  style.id = 'swal-pro-styles';
  style.innerHTML = `
    @keyframes swal-in {
      from { opacity: 0; transform: scale(0.8) translateY(20px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
    @keyframes swal-overlay-in {
      from { opacity: 0; backdrop-filter: blur(0px); }
      to { opacity: 1; backdrop-filter: blur(8px); }
    }
    .swal-pro-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center;
      z-index: 9999; animation: swal-overlay-in 0.3s ease forwards; font-family: 'Inter', sans-serif;
    }
    .swal-pro-modal {
      width: 400px; background: #0f172a; border: 1px solid rgba(255,255,255,0.1);
      border-radius: 24px; padding: 32px; text-align: center; color: white;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); animation: swal-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }
    .swal-pro-icon {
      width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 20px;
      display: flex; align-items: center; justify-content: center; font-size: 30px;
    }
    .swal-pro-icon.success { background: rgba(34,197,94,0.1); color: #22c55e; border: 2px solid rgba(34,197,94,0.2); }
    .swal-pro-icon.error { background: rgba(239,68,68,0.1); color: #ef4444; border: 2px solid rgba(239,68,68,0.2); }
    .swal-pro-icon.warning { background: rgba(245,158,11,0.1); color: #f59e0b; border: 2px solid rgba(245,158,11,0.2); }
    .swal-pro-title { font-size: 20px; font-weight: 900; margin-bottom: 8px; letter-spacing: -0.5px; }
    .swal-pro-text { font-size: 14px; color: #94a3b8; line-height: 1.5; margin-bottom: 24px; }
    .swal-pro-btn {
      width: 100%; padding: 12px; border-radius: 14px; border: none; font-weight: 900;
      font-size: 12px; text-transform: uppercase; letter-spacing: 1px; cursor: pointer;
      transition: all 0.2s;
    }
    .swal-pro-btn.primary { background: #EAB308; color: #000; }
    .swal-pro-btn.primary:hover { transform: scale(1.02); filter: brightness(1.1); }
    .swal-pro-btn.cancel { background: transparent; border: 1px solid rgba(255,255,255,0.1); color: white; margin-top: 8px; }
    .swal-pro-btn.cancel:hover { background: rgba(255,255,255,0.05); }
    .swal-pro-flex { display: flex; flex-direction: column; gap: 8px; }
  `;
  document.head.appendChild(style);
};

export const showAlert = (title: string, text: string, icon: 'success' | 'error' | 'warning' = 'success') => {
  if (typeof document === 'undefined') return;
  createAlertStyles();

  const overlay = document.createElement('div');
  overlay.className = 'swal-pro-overlay';
  
  const iconEmoji = icon === 'success' ? '✓' : icon === 'error' ? '✕' : '!';
  
  overlay.innerHTML = `
    <div class="swal-pro-modal">
      <div class="swal-pro-icon ${icon}"> ${iconEmoji} </div>
      <div class="swal-pro-title">${title}</div>
      <div class="swal-pro-text">${text}</div>
      <button class="swal-pro-btn primary" id="swal-close-btn">OK, UNDERSTOOD</button>
    </div>
  `;

  document.body.appendChild(overlay);

  return new Promise((resolve) => {
    document.getElementById('swal-close-btn')?.addEventListener('click', () => {
      overlay.style.opacity = '0';
      overlay.style.transition = '0.2s';
      setTimeout(() => {
        document.body.removeChild(overlay);
        resolve(true);
      }, 200);
    });
  });
};

export const showConfirm = (title: string, text: string): Promise<{ isConfirmed: boolean }> => {
  if (typeof document === 'undefined') return Promise.resolve({ isConfirmed: false });
  createAlertStyles();

  const overlay = document.createElement('div');
  overlay.className = 'swal-pro-overlay';
  
  overlay.innerHTML = `
    <div class="swal-pro-modal">
      <div class="swal-pro-icon warning">?</div>
      <div class="swal-pro-title">${title}</div>
      <div class="swal-pro-text">${text}</div>
      <div class="swal-pro-flex">
        <button class="swal-pro-btn primary" id="swal-confirm-btn">CONFIRM & PROCEED</button>
        <button class="swal-pro-btn cancel" id="swal-cancel-btn">CANCEL</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  return new Promise((resolve) => {
    document.getElementById('swal-confirm-btn')?.addEventListener('click', () => {
      document.body.removeChild(overlay);
      resolve({ isConfirmed: true });
    });
    document.getElementById('swal-cancel-btn')?.addEventListener('click', () => {
      document.body.removeChild(overlay);
      resolve({ isConfirmed: false });
    });
  });
};
