/**
 * SPICE GARDEN POS & DIGITAL ORDERING SYSTEM
 * Centralized Tax, Billing & Invoice Engine
 */

const BillingEngine = {
  calculate({
    items = [],
    couponCode = null,
    overrideGst = null,
    overrideSc = null
  }) {
    const rest = (typeof appState !== 'undefined' && appState.getCurrentRestaurant) ? appState.getCurrentRestaurant() : {};
    const taxConfig = rest.tax || (typeof appState !== 'undefined' && appState.config && appState.config.tax) || { gstRate: 5, serviceChargeRate: 5, enableGst: true, enableServiceCharge: true };
    const gstRate = overrideGst !== null ? overrideGst : (taxConfig.enableGst ? taxConfig.gstRate : 0);
    const scRate = overrideSc !== null ? overrideSc : (taxConfig.enableServiceCharge ? taxConfig.serviceChargeRate : 0);

    // 1. Calculate item subtotal
    let subtotal = 0;
    const itemDetails = items.map(entry => {
      const price = Number(entry.unit_price !== undefined ? entry.unit_price : (entry.price || 0));
      const qty = Number(entry.quantity !== undefined ? entry.quantity : (entry.qty || 1));
      const lineTotal = price * qty;
      subtotal += lineTotal;
      return {
        ...entry,
        price,
        qty,
        lineTotal,
        note: entry.special_instructions || entry.note || ''
      };
    });

    // 2. Process Coupon Discount
    let discount = 0;
    let appliedCoupon = null;
    let couponError = null;

    if (couponCode) {
      const foundCoupon = appState.coupons.find(c => c.code.toUpperCase() === String(couponCode).trim().toUpperCase());
      if (!foundCoupon) {
        couponError = 'Invalid coupon code';
      } else if (!foundCoupon.active) {
        couponError = 'This coupon is no longer active';
      } else if (new Date(foundCoupon.expiresAt) < new Date()) {
        couponError = 'This coupon has expired';
      } else if (subtotal < (foundCoupon.minOrder || 0)) {
        couponError = `Minimum order value of ₹${foundCoupon.minOrder} required for this coupon`;
      } else {
        // Calculate discount amount
        if (foundCoupon.type === 'percent') {
          const rawDiscount = (subtotal * foundCoupon.value) / 100;
          discount = Math.min(rawDiscount, foundCoupon.maxDiscount || rawDiscount);
        } else {
          // Flat discount
          discount = Math.min(foundCoupon.value, subtotal);
        }
        discount = Math.round(discount * 100) / 100;
        appliedCoupon = foundCoupon;
      }
    }

    // 3. Taxable Amount (Post Discount)
    const taxableAmount = Math.max(0, subtotal - discount);

    // 4. Indian GST Breakdown (CGST 2.5% + SGST 2.5% for 5% composite)
    const cgstRate = gstRate / 2;
    const sgstRate = gstRate / 2;
    const cgstAmount = Math.round((taxableAmount * (cgstRate / 100)) * 100) / 100;
    const sgstAmount = Math.round((taxableAmount * (sgstRate / 100)) * 100) / 100;
    const totalGst = Math.round((cgstAmount + sgstAmount) * 100) / 100;

    // 5. Service Charge
    const serviceCharge = Math.round((taxableAmount * (scRate / 100)) * 100) / 100;

    // 6. Packaging / Other charges
    const packagingCharge = taxConfig.packagingCharge || 0;

    // 7. Grand Total & Round Off
    const unroundedTotal = taxableAmount + totalGst + serviceCharge + packagingCharge;
    const grandTotal = Math.round(unroundedTotal);
    const roundOff = Math.round((grandTotal - unroundedTotal) * 100) / 100;

    return {
      items: itemDetails,
      itemCount: items.reduce((acc, i) => acc + (Number(i.qty) || 0), 0),
      subtotal,
      discount,
      appliedCoupon,
      couponError,
      taxableAmount,
      gstRate,
      cgstRate,
      cgstAmount,
      sgstRate,
      sgstAmount,
      totalGst,
      scRate,
      serviceCharge,
      packagingCharge,
      roundOff,
      grandTotal
    };
  },

  renderBreakdownHTML(billData) {
    const { subtotal, discount, appliedCoupon, taxableAmount, gstRate, cgstAmount, sgstAmount, totalGst, scRate, serviceCharge, roundOff, grandTotal } = billData;

    return `
      <div class="breakdown-row">
        <span>Item Subtotal</span>
        <span>₹${subtotal.toFixed(2)}</span>
      </div>
      ${discount > 0 ? `
        <div class="breakdown-row discount-row">
          <span>Coupon Discount (${appliedCoupon ? appliedCoupon.code : 'PROMO'})</span>
          <span>-₹${discount.toFixed(2)}</span>
        </div>
        <div class="breakdown-row" style="font-size: 0.8rem; color: var(--text-subtle);">
          <span>Taxable Amount</span>
          <span>₹${taxableAmount.toFixed(2)}</span>
        </div>
      ` : ''}
      ${gstRate > 0 ? `
        <div class="breakdown-row">
          <span>GST (${gstRate}%) <small style="color:var(--text-subtle)">[CGST ${gstRate/2}% + SGST ${gstRate/2}%]</small></span>
          <span>₹${totalGst.toFixed(2)}</span>
        </div>
      ` : ''}
      ${scRate > 0 ? `
        <div class="breakdown-row">
          <span>Restaurant Service Charge (${scRate}%)</span>
          <span>₹${serviceCharge.toFixed(2)}</span>
        </div>
      ` : ''}
      ${roundOff !== 0 ? `
        <div class="breakdown-row" style="font-size: 0.78rem;">
          <span>Round Off</span>
          <span>${roundOff > 0 ? '+' : ''}₹${roundOff.toFixed(2)}</span>
        </div>
      ` : ''}
      <div class="breakdown-row total-row">
        <span>Total Payable</span>
        <span>₹${grandTotal.toFixed(2)}</span>
      </div>
    `;
  },

  renderInvoice(order) {
    const rest = (typeof appState !== 'undefined' && appState.getCurrentRestaurant) ? appState.getCurrentRestaurant() : ((appState && appState.config && appState.config.restaurant) || {});
    const dateFormatted = new Date(order.created_at || order.createdAt || Date.now()).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    const bill = this.calculate({
      items: order.items || [],
      couponCode: order.coupon_code || order.couponCode,
      overrideGst: order.gstRate !== undefined ? order.gstRate : null,
      overrideSc: order.scRate !== undefined ? order.scRate : null
    });

    // Simulated UPI payment string for Indian restaurants
    const upiLink = `upi://pay?pa=spicegarden@okhdfcbank&pn=${encodeURIComponent(rest.name)}&am=${bill.grandTotal}&cu=INR&tn=Bill-${order.id}`;

    return `
      <div class="invoice-container" id="printableInvoice">
        <!-- HEADER -->
        <div class="invoice-header">
          <div style="font-size: 2rem; margin-bottom: 4px;">${rest.logoEmoji || '🌿'}</div>
          <div class="invoice-rest-name">${rest.name}</div>
          <div class="invoice-rest-address">${rest.address}</div>
          <div style="font-size: 0.8rem; color: #4b5563; margin-top: 4px;">
            Phone: ${rest.phone} &bull; Email: ${rest.email}
          </div>
          <div style="font-size: 0.78rem; font-weight: 700; color: #15803d; margin-top: 6px; letter-spacing: 0.05em;">
            GSTIN: ${rest.gstNumber || rest.gst_number || '27AABCS1429B1Z5'} &bull; FSSAI Lic: ${rest.fssaiNumber || rest.fssai_number || '11521019000342'}
          </div>
        </div>

        <!-- META DETAILS -->
        <div class="invoice-meta-grid">
          <div><strong>Order ID:</strong> #${order.id}</div>
          <div style="text-align: right;"><strong>Table:</strong> ${order.table_number || order.tableNo || '12'}</div>
          <div><strong>Date:</strong> ${dateFormatted}</div>
          <div style="text-align: right;"><strong>Payment:</strong> <span style="text-transform: uppercase;">${order.payment_status || order.paymentStatus || 'Pending'} (${order.payment_method || 'UPI'})</span></div>
          ${(order.customer_name || order.customerName) ? `<div><strong>Customer:</strong> ${order.customer_name || order.customerName}</div>` : ''}
          ${(order.customer_phone || order.customerPhone) ? `<div style="text-align: right;"><strong>Phone:</strong> ${order.customer_phone || order.customerPhone}</div>` : ''}
        </div>

        <!-- ITEMS TABLE -->
        <table class="invoice-items-table">
          <thead>
            <tr>
              <th style="width: 50%;">Item</th>
              <th style="width: 15%; text-align: center;">Qty</th>
              <th style="width: 15%; text-align: right;">Rate</th>
              <th style="width: 20%; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${bill.items.map(item => `
              <tr>
                <td>
                  <div style="font-weight: 600;">${item.name}</div>
                  ${item.note ? `<div style="font-size: 0.72rem; color: #b45309;">Note: ${item.note}</div>` : ''}
                </td>
                <td style="text-align: center;">${item.qty}</td>
                <td style="text-align: right;">₹${item.price}</td>
                <td style="text-align: right; font-weight: 600;">₹${item.lineTotal}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- SUMMARY CALCULATION -->
        <div class="invoice-summary-block">
          <div class="breakdown-row">
            <span>Item Subtotal (${bill.itemCount} items)</span>
            <span>₹${bill.subtotal.toFixed(2)}</span>
          </div>

          ${bill.discount > 0 ? `
            <div class="breakdown-row" style="color: #16a34a; font-weight: 600;">
              <span>Promo Discount (${order.couponCode || 'APPLIED'})</span>
              <span>-₹${bill.discount.toFixed(2)}</span>
            </div>
            <div class="breakdown-row" style="font-size: 0.78rem; color: #6b7280;">
              <span>Net Taxable Value</span>
              <span>₹${bill.taxableAmount.toFixed(2)}</span>
            </div>
          ` : ''}

          ${bill.gstRate > 0 ? `
            <div class="breakdown-row">
              <span>CGST (${bill.cgstRate}%)</span>
              <span>₹${bill.cgstAmount.toFixed(2)}</span>
            </div>
            <div class="breakdown-row">
              <span>SGST (${bill.sgstRate}%)</span>
              <span>₹${bill.sgstAmount.toFixed(2)}</span>
            </div>
          ` : ''}

          ${bill.scRate > 0 ? `
            <div class="breakdown-row">
              <span>Service Charge (${bill.scRate}%)</span>
              <span>₹${bill.serviceCharge.toFixed(2)}</span>
            </div>
          ` : ''}

          ${bill.roundOff !== 0 ? `
            <div class="breakdown-row" style="font-size: 0.78rem;">
              <span>Round Off</span>
              <span>${bill.roundOff > 0 ? '+' : ''}₹${bill.roundOff.toFixed(2)}</span>
            </div>
          ` : ''}

          <div class="invoice-total-row">
            <span>GRAND TOTAL PAYABLE</span>
            <span>₹${bill.grandTotal.toFixed(2)}</span>
          </div>
        </div>

        <!-- UPI QR SCANNER -->
        <div class="invoice-qr-section no-print-compact">
          <div style="font-size: 0.8rem; font-weight: 700; color: #374151; margin-bottom: 6px;">
            Scan & Pay via UPI (GPay, PhonePe, Paytm, BHIM)
          </div>
          <!-- Clean SVG simulated UPI QR Code representation -->
          <div style="display: inline-block; padding: 8px; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px;">
            <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="100" height="100" fill="white"/>
              <!-- QR Corners -->
              <rect x="10" y="10" width="24" height="24" stroke="black" stroke-width="4" fill="white"/>
              <rect x="16" y="16" width="12" height="12" fill="black"/>
              <rect x="66" y="10" width="24" height="24" stroke="black" stroke-width="4" fill="white"/>
              <rect x="72" y="16" width="12" height="12" fill="black"/>
              <rect x="10" y="66" width="24" height="24" stroke="black" stroke-width="4" fill="white"/>
              <rect x="16" y="72" width="12" height="12" fill="black"/>
              <!-- Data dots -->
              <rect x="42" y="12" width="6" height="6" fill="black"/>
              <rect x="52" y="20" width="6" height="6" fill="black"/>
              <rect x="42" y="30" width="16" height="6" fill="black"/>
              <rect x="12" y="44" width="8" height="6" fill="black"/>
              <rect x="28" y="44" width="14" height="6" fill="black"/>
              <rect x="50" y="44" width="10" height="12" fill="black"/>
              <rect x="70" y="44" width="18" height="6" fill="black"/>
              <rect x="42" y="66" width="8" height="12" fill="black"/>
              <rect x="60" y="66" width="12" height="6" fill="black"/>
              <rect x="80" y="66" width="8" height="18" fill="black"/>
              <rect x="54" y="80" width="14" height="8" fill="black"/>
            </svg>
          </div>
          <div style="font-size: 0.72rem; color: #6b7280; margin-top: 4px;">UPI ID: spicegarden@okhdfcbank</div>
        </div>

        <!-- FOOTER -->
        <div class="invoice-footer-message">
          <p style="font-weight: 700; color: #15803d; font-size: 0.9rem;">Thank you for dining with us!</p>
          <p>Please visit again &bull; Feedback: support@spicegarden.in</p>
        </div>
      </div>
    `;
  }
};
