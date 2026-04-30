import { query } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  try {
    const [log]: any = await query('SELECT * FROM inventory_transactions WHERE id = ?', [id]);
    const [settings]: any = await query('SELECT * FROM company_settings LIMIT 1');

    if (!log) return new Response('Log not found', { status: 404 });

    const [tank]: any = await query('SELECT * FROM general_inventory WHERE id = ?', [log.item_id]);

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Fuel_Slip_${log.reference_id}</title>
          <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
              
              * { box-sizing: border-box; }
              body { 
                font-family: 'Inter', sans-serif; 
                color: #1e293b; 
                margin: 0; 
                padding: 0; 
                line-height: 1.5;
                background: #f1f5f9;
              }
              
              .slip-wrapper {
                max-width: 500px;
                margin: 40px auto;
                background: white;
                padding: 40px;
                border-radius: 2px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.05);
                border-top: 8px solid #0f172a;
                position: relative;
              }

              .header { 
                text-align: center; 
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 1px dashed #e2e8f0;
              }
              .header h1 { 
                margin: 0; 
                font-weight: 900; 
                font-size: 20px; 
                color: #0f172a;
                letter-spacing: -0.5px;
              }
              .header p { 
                margin: 4px 0 0; 
                font-size: 10px; 
                color: #444; 
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                max-width: 400px;
                margin-left: auto;
                margin-right: auto;
              }
              .header .contact-info {
                margin-top: 8px;
                font-size: 9px;
                color: #64748b;
                font-weight: 700;
              }

              .doc-title {
                text-align: center;
                margin-bottom: 30px;
              }
              .doc-title h2 {
                margin: 0;
                font-size: 14px;
                font-weight: 900;
                color: #3b82f6;
                text-transform: uppercase;
                letter-spacing: 2px;
              }
              .ref-id {
                font-size: 11px;
                font-weight: 700;
                color: #94a3b8;
                margin-top: 5px;
              }

              .data-grid {
                display: grid;
                gap: 15px;
                margin-bottom: 40px;
              }
              .data-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 0;
                border-bottom: 1px solid #f8fafc;
              }
              .label {
                font-size: 10px;
                font-weight: 800;
                color: #94a3b8;
                text-transform: uppercase;
                letter-spacing: 1px;
              }
              .value {
                font-size: 13px;
                font-weight: 700;
                color: #1e293b;
              }
              
              .volume-highlight {
                background: #f8fafc;
                padding: 20px;
                border-radius: 12px;
                text-align: center;
                margin-bottom: 40px;
                border: 1px solid #e2e8f0;
              }
              .volume-label {
                font-size: 9px;
                font-weight: 900;
                color: #64748b;
                text-transform: uppercase;
                letter-spacing: 2px;
                margin-bottom: 5px;
              }
              .volume-value {
                font-size: 32px;
                font-weight: 900;
                color: #0f172a;
              }
              .volume-unit {
                font-size: 14px;
                color: #94a3b8;
                margin-left: 5px;
              }

              .footer-signs {
                display: grid;
                grid-template-cols: 1fr 1fr;
                gap: 30px;
                margin-top: 40px;
              }
              .sign-box {
                text-align: center;
              }
              .sign-label {
                font-size: 9px;
                font-weight: 800;
                color: #94a3b8;
                text-transform: uppercase;
                margin-bottom: 50px;
              }
              .sign-line {
                border-bottom: 1.5px solid #0f172a;
                margin-bottom: 8px;
              }
              .sign-name {
                font-size: 11px;
                font-weight: 800;
                color: #0f172a;
                text-transform: uppercase;
              }

              @media print {
                  body { background: white; }
                  .slip-wrapper { margin: 0; box-shadow: none; border: none; max-width: 100%; padding: 20px; }
                  .no-print { display: none; }
              }
              
              .no-print-bar {
                max-width: 500px;
                margin: 20px auto 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
              }
              .btn-print { 
                background: #0f172a; 
                color: white; 
                border: none; 
                padding: 12px 24px; 
                border-radius: 8px; 
                font-weight: 800; 
                cursor: pointer;
                font-size: 12px;
                transition: all 0.3s;
              }
              .btn-print:hover { transform: translateY(-1px); background: #1e293b; }
          </style>
      </head>
      <body>
          <div class="no-print-bar no-print">
            <div style="color: #64748b; font-size: 11px; font-weight: 700;">FUEL SLIP PREVIEW</div>
            <button class="btn-print" onclick="window.print()">PRINT SLIP</button>
          </div>

          <div class="slip-wrapper">
               <div class="header">
                  <h1>${settings?.company_name || 'MINE-ERP PRO'}</h1>
                  <p>${settings?.address || 'Site Office South Block, South Kalimantan'}</p>
                  <div class="contact-info">
                    ${settings?.email || ''} &bull; ${settings?.website || ''} &bull; ${settings?.phone || ''}
                  </div>
              </div>

              <div class="doc-title">
                  <h2>Fuel Transaction Slip</h2>
                  <div class="ref-id">NO: ${log.reference_id}</div>
              </div>

              <div class="data-grid">
                  <div class="data-row">
                      <div class="label">Date & Time</div>
                      <div class="value">${new Date(log.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</div>
                  </div>
                  <div class="data-row">
                      <div class="label">Type</div>
                      <div class="value" style="color: ${log.transaction_type === 'Out' ? '#e11d48' : '#10b981'}">
                        ${log.transaction_type === 'Out' ? 'CONSUMPTION / ISSUE' : 'REPLENISHMENT / REFILL'}
                      </div>
                  </div>
                  <div class="data-row">
                      <div class="label">Inventory Source</div>
                      <div class="value">${tank?.item_name || 'Main Fuel Storage'}</div>
                  </div>
                  <div class="data-row">
                      <div class="label">Unit Reference</div>
                      <div class="value">${log.reference_id}</div>
                  </div>
              </div>

              <div class="volume-highlight">
                  <div class="volume-label">Total Transferred</div>
                  <div class="volume-value">${parseFloat(log.quantity).toLocaleString()}<span class="volume-unit">LTR</span></div>
              </div>

              <div class="data-grid">
                  <div class="data-row">
                      <div class="label">Dispensed By</div>
                      <div class="value">${log.user_name}</div>
                  </div>
              </div>

              <div class="footer-signs">
                  <div class="sign-box">
                      <div class="sign-label">Site Supervisor</div>
                      <div class="sign-line"></div>
                      <div class="sign-name">Authorized</div>
                  </div>
                  <div class="sign-box">
                      <div class="sign-label">Receiver / Operator</div>
                      <div class="sign-line"></div>
                      <div class="sign-name">${log.user_name}</div>
                  </div>
              </div>
              
              <div style="margin-top: 40px; text-align: center; font-size: 8px; color: #cbd5e1; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                Generated by MINE-ERP Pro Max Systems
              </div>
          </div>
      </body>
      </html>
    `;

    return new Response(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
}
