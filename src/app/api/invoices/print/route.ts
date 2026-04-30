import { query } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  try {
    const [invoice]: any = await query('SELECT * FROM invoices WHERE id = ?', [id]);
    const [settings]: any = await query('SELECT * FROM company_settings LIMIT 1');

    if (!invoice) return new Response('Invoice not found', { status: 404 });

    const isPaid = invoice.status === 'Paid';

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invoice_${invoice.invoice_number}</title>
          <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
              
              * { box-sizing: border-box; }
              body { 
                font-family: 'Inter', sans-serif; 
                color: #1e293b; 
                margin: 0; 
                padding: 0; 
                line-height: 1.5;
                background: #f8fafc;
              }
              
              .page-container {
                max-width: 800px;
                margin: 40px auto;
                background: white;
                padding: 60px;
                box-shadow: 0 20px 50px rgba(0,0,0,0.05);
                border-radius: 4px;
                position: relative;
                overflow: hidden;
              }

              .status-stamp {
                position: absolute;
                top: 40px;
                right: -40px;
                transform: rotate(45deg);
                padding: 10px 60px;
                font-weight: 900;
                font-size: 14px;
                text-transform: uppercase;
                letter-spacing: 4px;
                border: 2px solid;
                opacity: 0.15;
              }
              .status-paid { color: #10b981; border-color: #10b981; }
              .status-draft { color: #64748b; border-color: #64748b; }

              .header { 
                display: flex; 
                justify-content: space-between; 
                align-items: flex-start;
                margin-bottom: 60px; 
              }
              
              .company-info h1 { 
                margin: 0; 
                font-weight: 900; 
                font-size: 28px; 
                color: #0f172a; 
                letter-spacing: -1px;
              }
              .company-info p { 
                margin: 4px 0 0; 
                font-size: 11px; 
                color: #64748b; 
                font-weight: 600; 
                text-transform: uppercase; 
                letter-spacing: 1px; 
              }
              .company-address {
                margin-top: 15px;
                font-size: 12px;
                color: #475569;
                max-width: 280px;
                line-height: 1.4;
              }

              .invoice-meta { text-align: right; }
              .invoice-meta h2 { 
                margin: 0; 
                font-weight: 900; 
                font-size: 42px; 
                color: #3b82f6;
                line-height: 1;
              }
              .invoice-id { 
                margin-top: 8px;
                font-weight: 800; 
                font-size: 14px; 
                color: #0f172a;
              }

              .billing-grid { 
                display: grid; 
                grid-template-cols: 1fr 1fr; 
                gap: 40px; 
                margin-bottom: 50px; 
                background: #f8fafc;
                padding: 30px;
                border-radius: 16px;
              }
              
              .info-group h3 { 
                font-size: 10px; 
                text-transform: uppercase; 
                letter-spacing: 2px; 
                color: #94a3b8; 
                margin: 0 0 12px; 
                font-weight: 800; 
              }
              .info-group p { 
                margin: 0; 
                font-weight: 700; 
                font-size: 15px; 
                color: #0f172a; 
              }
              .info-group .sub-text { 
                font-weight: 500; 
                color: #64748b; 
                margin-top: 4px; 
                font-size: 13px;
              }

              table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-bottom: 50px; 
              }
              th { 
                text-align: left; 
                padding: 15px 20px; 
                font-size: 10px; 
                text-transform: uppercase; 
                letter-spacing: 1.5px; 
                color: #64748b;
                border-bottom: 2px solid #e2e8f0; 
              }
              td { 
                padding: 25px 20px; 
                border-bottom: 1px solid #f1f5f9; 
                font-size: 14px; 
                vertical-align: top;
              }
              .text-right { text-align: right; }
              
              .amount-summary { 
                display: flex; 
                justify-content: flex-end; 
              }
              .summary-card { 
                width: 320px; 
                padding: 20px;
              }
              .summary-row { 
                display: flex; 
                justify-content: space-between; 
                margin-bottom: 12px; 
                font-size: 13px;
              }
              .summary-row.total { 
                margin-top: 20px; 
                padding-top: 20px; 
                border-top: 2px solid #3b82f6; 
                font-size: 24px; 
                font-weight: 900; 
                color: #0f172a; 
              }
              .summary-row span { color: #64748b; font-weight: 600; }

              .bottom-section { 
                margin-top: 80px; 
                display: grid; 
                grid-template-cols: 1.5fr 1fr; 
                gap: 60px;
              }
              .terms {
                font-size: 12px;
                color: #64748b;
              }
              .terms h4 {
                color: #0f172a;
                font-size: 11px;
                text-transform: uppercase;
                margin: 0 0 10px;
                letter-spacing: 1px;
              }
              
              .signature-box { 
                text-align: center; 
              }
              .sign-line { 
                height: 80px;
                border-bottom: 2px solid #e2e8f0; 
                margin-bottom: 15px;
                background: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iNTAiPjx0ZXh0IHg9IjEwIiB5PSIzMCIgc3R5bGU9ImZvbnQ6IGl0YWxpYyAyMHB4IHNlcmlmOyBmaWxsOiAjZTNlOGZkOyI+QXV0aG9yaXplZDwvdGV4dD48L3N2Zz4=');
              }
              .sign-name { 
                font-weight: 900; 
                color: #0f172a; 
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 1px;
              }
              
              @media print {
                  body { background: white; }
                  .page-container { margin: 0; box-shadow: none; padding: 40px; max-width: 100%; }
                  .no-print { display: none; }
              }
              
              .no-print-bar {
                max-width: 800px;
                margin: 20px auto 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
              }
              .btn-print { 
                background: #3b82f6; 
                color: white; 
                border: none; 
                padding: 14px 28px; 
                border-radius: 12px; 
                font-weight: 800; 
                cursor: pointer;
                font-size: 14px;
                box-shadow: 0 10px 20px rgba(59, 130, 246, 0.2);
                transition: all 0.3s;
              }
              .btn-print:hover { transform: translateY(-2px); box-shadow: 0 15px 30px rgba(59, 130, 246, 0.3); }
          </style>
      </head>
      <body>
          <div class="no-print-bar no-print">
            <div style="color: #64748b; font-size: 12px; font-weight: 600;">PREVIEW MODE</div>
            <button class="btn-print" onclick="window.print()">PRINT INVOICE</button>
          </div>

          <div class="page-container">
              <div class="status-stamp ${isPaid ? 'status-paid' : 'status-draft'}">
                ${invoice.status}
              </div>

              <div class="header">
                  <div class="company-info">
                      <h1>${settings?.company_name || 'MINE-ERP PRO'}</h1>
                      <p>Industrial Energy & Mining Solutions</p>
                      <div class="company-address">
                        ${settings?.address || 'Site Office South Block, Block B-12, South Kalimantan, Indonesia'}
                      </div>
                  </div>
                  <div class="invoice-meta">
                      <h2>INVOICE</h2>
                      <div class="invoice-id">REF: #${invoice.invoice_number}</div>
                  </div>
              </div>

              <div class="billing-grid">
                  <div class="info-group">
                      <h3>Billed To</h3>
                      <p>${invoice.client_name}</p>
                      <div class="sub-text">Project: ${invoice.project_name}</div>
                  </div>
                  <div class="info-group" style="text-align: right;">
                      <h3>Timeline</h3>
                      <p>Issued: ${new Date(invoice.issue_date).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                      <div class="sub-text">Due: ${new Date(invoice.due_date).toLocaleDateString(undefined, { dateStyle: 'long' })}</div>
                  </div>
              </div>

              <table>
                  <thead>
                      <tr>
                          <th style="width: 70%">Service Description</th>
                          <th class="text-right">Total Amount</th>
                      </tr>
                  </thead>
                  <tbody>
                      <tr>
                          <td>
                            <div style="font-weight: 700; color: #0f172a; margin-bottom: 5px;">Operational Logistics & Site Services</div>
                            <div style="color: #64748b; font-size: 12px;">Comprehensive operational support rendered for project ${invoice.project_name} during the current billing cycle. Including fuel distribution and fleet telemetry monitoring.</div>
                          </td>
                          <td class="text-right" style="font-weight: 800; font-size: 16px;">$${parseFloat(invoice.total_amount).toLocaleString()}</td>
                      </tr>
                  </tbody>
              </table>

              <div class="amount-summary">
                  <div class="summary-card">
                      <div class="summary-row">
                          <span>SUBTOTAL</span>
                          <b style="color: #0f172a;">$${parseFloat(invoice.total_amount).toLocaleString()}</b>
                      </div>
                      <div class="summary-row">
                          <span>TAX (0%)</span>
                          <b style="color: #0f172a;">$0.00</b>
                      </div>
                      <div class="summary-row total">
                          <span>TOTAL</span>
                          <b>$${parseFloat(invoice.total_amount).toLocaleString()}</b>
                      </div>
                  </div>
              </div>

              <div class="bottom-section">
                  <div class="terms">
                      <h4>Terms & Conditions</h4>
                      <p>Please process the payment within 30 days of the issuance date. Bank transfers should be directed to the corporate account mentioned in the primary contract.</p>
                      <p style="margin-top: 15px; font-weight: 700; color: #3b82f6;">Thank you for your partnership!</p>
                  </div>
                  <div class="signature-box">
                      <div class="sign-line"></div>
                      <div class="sign-name">Finance Controller</div>
                      <div style="font-size: 10px; color: #94a3b8; font-weight: 700; margin-top: 4px; text-transform: uppercase;">MINE-ERP AUTHORIZED SIGNATORY</div>
                  </div>
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
