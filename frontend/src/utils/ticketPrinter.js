// TeerthSetu Official Ticket & Receipt Generator
// Produces professional, printable, and downloadable E-Tickets (Flights) & Vouchers (Hotels)

export function downloadOrPrintFlightTicket(booking) {
  const printWindow = window.open('', '_blank', 'width=850,height=750');
  if (!printWindow) {
    alert('Please allow popups to download and print your E-Ticket.');
    return;
  }

  const passengersHtml = (booking.passengers || [
    { name: booking.guestName || 'Verified Devotee', age: '32', gender: 'Adult', seat: '12A' }
  ]).map((p, idx) => `
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 10px 12px; font-weight: bold; color: #1e293b;">${idx + 1}. ${p.name || 'Pilgrim Devotee'}</td>
      <td style="padding: 10px 12px; color: #475569;">${p.age || '30'} Yrs / ${p.gender || 'Adult'}</td>
      <td style="padding: 10px 12px; font-family: monospace; font-weight: bold; color: #0284c7;">${p.seat || `1${idx + 2}A`}</td>
      <td style="padding: 10px 12px; color: #16a34a; font-weight: bold;">Confirmed</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>TeerthSetu E-Ticket - ${booking.reference || booking.bookingId}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 24px; }
          .ticket-container { max-width: 780px; margin: 0 auto; background: #ffffff; border-radius: 18px; border: 2px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #0284c7, #0369a1); color: #ffffff; padding: 24px 30px; display: flex; justify-content: space-between; align-items: center; }
          .brand-title { font-size: 24px; font-weight: 900; letter-spacing: -0.5px; }
          .badge { background: #38bdf8; color: #082f49; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; }
          .flight-banner { background: #f1f5f9; padding: 18px 30px; border-bottom: 2px dashed #cbd5e1; display: flex; justify-content: space-between; align-items: center; }
          .airport-code { font-size: 28px; font-weight: 900; color: #0f172a; font-family: monospace; }
          .airport-city { font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; }
          .flight-arrow { display: flex; flex-direction: column; align-items: center; justify-content: center; }
          .details-grid { display: grid; grid-cols: 2; grid-template-columns: 1fr 1fr; gap: 16px; padding: 24px 30px; border-bottom: 1px solid #e2e8f0; }
          .field-label { font-size: 10px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 0.5px; }
          .field-val { font-size: 14px; font-weight: 700; color: #0f172a; margin-top: 2px; }
          .table-section { padding: 20px 30px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { text-align: left; padding: 8px 12px; background: #f8fafc; color: #475569; font-size: 10px; text-transform: uppercase; font-weight: 800; }
          .barcode-box { padding: 20px 30px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
          .barcode { font-family: 'Courier New', monospace; font-size: 20px; letter-spacing: 6px; font-weight: 900; background: #000; color: #fff; padding: 6px 16px; border-radius: 4px; }
          .disclaimer { font-size: 10px; color: #64748b; line-height: 1.4; padding: 16px 30px; background: #fff7ed; border-top: 1px solid #fed7aa; color: #9a3412; }
          @media print {
            body { padding: 0; background: #fff; }
            .ticket-container { border: none; box-shadow: none; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="ticket-container">
          <div class="header">
            <div>
              <div class="brand-title">TeerthSetu • Transit Portal</div>
              <div style="font-size: 12px; opacity: 0.9; margin-top: 2px;">Official Pilgrimage Flight E-Pass & Itinerary</div>
            </div>
            <div style="text-align: right;">
              <span class="badge">Confirmed & Verified</span>
              <div style="font-size: 11px; margin-top: 4px; font-mono; font-weight: bold;">Ref: ${booking.reference || booking.bookingId}</div>
            </div>
          </div>

          <div class="flight-banner">
            <div>
              <div class="airport-code">${booking.fromCode || booking.fromCity?.slice(0,3).toUpperCase() || 'BLR'}</div>
              <div class="airport-city">${booking.fromCity || 'Origin City'}</div>
              <div style="font-size: 13px; font-weight: bold; margin-top: 4px;">${booking.departureTime || '09:20'}</div>
            </div>

            <div class="flight-arrow">
              <span style="font-size: 11px; font-weight: bold; color: #0284c7;">${booking.duration || '0h 55m'} • ${booking.flightType || 'Non-stop'}</span>
              <div style="width: 120px; height: 2px; background: #cbd5e1; position: relative; margin: 6px 0;">
                <div style="position: absolute; right: -4px; top: -5px; font-size: 10px;">✈</div>
              </div>
              <span style="font-size: 11px; font-weight: 800; color: #0f172a;">${booking.airline || 'IndiGo'} ${booking.flightNo || '6E-7127'}</span>
            </div>

            <div style="text-align: right;">
              <div class="airport-code">${booking.toCode || booking.toCity?.slice(0,3).toUpperCase() || 'TIR'}</div>
              <div class="airport-city">${booking.toCity || 'Destination'}</div>
              <div style="font-size: 13px; font-weight: bold; margin-top: 4px;">${booking.arrivalTime || '10:15'}</div>
            </div>
          </div>

          <div class="details-grid">
            <div>
              <div class="field-label">Departure Airport & Terminal</div>
              <div class="field-val">${booking.fromAirport || 'Kempegowda Intl Airport (Terminal 1)'}</div>
            </div>
            <div>
              <div class="field-label">Arrival Airport</div>
              <div class="field-val">${booking.toAirport || 'Tirupati Airport (Renigunta)'}</div>
            </div>
            <div>
              <div class="field-label">Travel Date</div>
              <div class="field-val">${booking.departureDate || booking.date || '2026-06-28'}</div>
            </div>
            <div>
              <div class="field-label">Aircraft & Class</div>
              <div class="field-val">${booking.aircraft || 'Airbus A320neo'} (${booking.classType || 'Saver Economy'})</div>
            </div>
            <div>
              <div class="field-label">Payment Status / Gateway</div>
              <div class="field-val" style="color: #16a34a;">PAID (₹${booking.totalAmount?.toLocaleString() || 2799}) via ${booking.paymentMethod || 'Razorpay Sandbox'}</div>
            </div>
            <div>
              <div class="field-label">Transaction ID</div>
              <div class="field-val" style="font-family: monospace;">${booking.transactionId || 'TXN-98421045'}</div>
            </div>
          </div>

          <div class="table-section">
            <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #475569; margin-bottom: 8px;">Passenger Manifest & Seat Allocations</div>
            <table>
              <thead>
                <tr>
                  <th>Passenger Name</th>
                  <th>Age / Type</th>
                  <th>Seat</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${passengersHtml}
              </tbody>
            </table>
          </div>

          <div class="barcode-box">
            <div>
              <div style="font-size: 11px; font-weight: bold; color: #475569;">Baggage Allowance</div>
              <div style="font-size: 12px; font-weight: 700; color: #0f172a;">15 kg Check-in + 7 kg Cabin per passenger</div>
            </div>
            <div class="barcode">||||| | |||| ||| |||||</div>
          </div>

          <div class="disclaimer">
            <strong>Devotee Transit Guidance:</strong> This document serves as an authentic TeerthSetu Pilgrimage E-Pass Booking Confirmation (GDS Partner Integrated). Boarding passes are issued at the airport terminal check-in counter upon presenting this digital or printed pass along with a valid Government ID.
          </div>
        </div>

        <div style="text-align: center; margin-top: 20px;" class="no-print">
          <button onclick="window.print()" style="background: #0284c7; color: white; border: none; padding: 12px 28px; border-radius: 12px; font-weight: bold; font-size: 14px; cursor: pointer; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3);">
            🖨️ Print / Save as PDF
          </button>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  setTimeout(() => {
    printWindow.print();
  }, 400);
}

export function downloadOrPrintHotelReceipt(stay) {
  const printWindow = window.open('', '_blank', 'width=850,height=750');
  if (!printWindow) {
    alert('Please allow popups to download and print your Stay Voucher.');
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>TeerthSetu Accommodation Receipt - ${stay.reference || stay.id}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 24px; }
          .receipt-container { max-width: 780px; margin: 0 auto; background: #ffffff; border-radius: 18px; border: 2px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #d97706, #b45309); color: #ffffff; padding: 24px 30px; display: flex; justify-content: space-between; align-items: center; }
          .brand-title { font-size: 24px; font-weight: 900; letter-spacing: -0.5px; }
          .badge { background: #fde68a; color: #78350f; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; }
          .details-grid { display: grid; grid-cols: 2; grid-template-columns: 1fr 1fr; gap: 16px; padding: 24px 30px; border-bottom: 1px solid #e2e8f0; }
          .field-label { font-size: 10px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 0.5px; }
          .field-val { font-size: 14px; font-weight: 700; color: #0f172a; margin-top: 2px; }
          .table-section { padding: 20px 30px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { text-align: left; padding: 8px 12px; background: #f8fafc; color: #475569; font-size: 10px; text-transform: uppercase; font-weight: 800; }
          td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
          .barcode-box { padding: 20px 30px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
          .barcode { font-family: 'Courier New', monospace; font-size: 20px; letter-spacing: 6px; font-weight: 900; background: #000; color: #fff; padding: 6px 16px; border-radius: 4px; }
          .disclaimer { font-size: 11px; color: #92400e; line-height: 1.4; padding: 16px 30px; background: #fef3c7; border-top: 1px solid #fde68a; }
          @media print {
            body { padding: 0; background: #fff; }
            .receipt-container { border: none; box-shadow: none; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            <div>
              <div class="brand-title">TeerthSetu • Pilgrim Stays</div>
              <div style="font-size: 12px; opacity: 0.9; margin-top: 2px;">Official Booking Confirmation & Tax Invoice</div>
            </div>
            <div style="text-align: right;">
              <span class="badge">Platform Quota Guaranteed</span>
              <div style="font-size: 11px; margin-top: 4px; font-mono; font-weight: bold;">Booking ID: ${stay.reference || stay.id || stay.bookingId}</div>
            </div>
          </div>

          <div style="padding: 20px 30px; background: #fffbeb; border-bottom: 1px solid #fde68a;">
            <div style="font-size: 20px; font-weight: 900; color: #78350f;">${stay.hotelName || stay.hotel?.name || 'Grand Palace Hotel'}</div>
            <div style="font-size: 12px; color: #92400e; font-weight: 600; margin-top: 3px;">
              📍 ${stay.address || stay.hotel?.address || 'Near Temple Sacred Gate'} • ${stay.proximityToGate || stay.hotel?.proximityToGate || '0.3 km to Sacred Corridor'}
            </div>
          </div>

          <div class="details-grid">
            <div>
              <div class="field-label">Primary Devotee Name & ID</div>
              <div class="field-val">${stay.guestName || stay.form?.guestName || stay.primaryDevotee?.name || 'Devotee'} <span style="font-size: 11px; color: #d97706; font-family: monospace;">(${stay.primaryDevotee?.devoteeId || stay.devoteeId || 'DEV-2026-8941'})</span></div>
            </div>
            <div>
              <div class="field-label">Contact Phone</div>
              <div class="field-val">${stay.phone || stay.form?.phone || '+91 9876543210'}</div>
            </div>
            <div>
              <div class="field-label">Check-in Date</div>
              <div class="field-val">${stay.checkInDate || stay.form?.checkInDate || 'Tomorrow'} (12:00 PM Check-in)</div>
            </div>
            <div>
              <div class="field-label">Duration & Rooms</div>
              <div class="field-val">${stay.nights || stay.form?.nights || 1} Night(s) • ${stay.roomsCount || stay.form?.roomsCount || 1} Room(s)</div>
            </div>
            <div>
              <div class="field-label">Selected Room Type</div>
              <div class="field-val">${stay.roomType || stay.form?.roomType || 'Deluxe Pilgrim AC Room'}</div>
            </div>
            <div>
              <div class="field-label">Total Guests</div>
              <div class="field-val">${stay.guests || stay.form?.guests || 2} Devotee(s)</div>
            </div>
          </div>

          <div class="table-section">
            <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #475569; margin-bottom: 8px;">Billing Breakdown & Payment Status</div>
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Nights</th>
                  <th>Rate</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>${stay.roomType || stay.form?.roomType || 'Deluxe Pilgrim AC Room'}</strong> (Exclusive Platform Quota)</td>
                  <td>${stay.nights || stay.form?.nights || 1}</td>
                  <td>₹${stay.pricing?.perNightPrice || stay.totalAmount || 2400}</td>
                  <td style="text-align: right; font-weight: bold;">₹${stay.totalAmount || 2400}</td>
                </tr>
                <tr>
                  <td colspan="3" style="text-align: right; font-weight: bold; color: #64748b;">Payment Method:</td>
                  <td style="text-align: right; font-weight: 800; color: #0284c7;">${stay.paymentMethod || stay.payment?.method || 'Google Pay (UPI)'}</td>
                </tr>
                <tr>
                  <td colspan="3" style="text-align: right; font-weight: bold; color: #64748b;">Payment Status:</td>
                  <td style="text-align: right; font-weight: 900; color: #16a34a;">${stay.paymentStatus || stay.payment?.status || 'PAID'}</td>
                </tr>
                <tr>
                  <td colspan="3" style="text-align: right; font-weight: bold; color: #64748b;">Transaction Reference:</td>
                  <td style="text-align: right; font-family: monospace; font-weight: bold;">${stay.transactionId || stay.payment?.transactionId || 'TXN-98421045'}</td>
                </tr>
                <tr style="background: #f8fafc; font-size: 15px;">
                  <td colspan="3" style="text-align: right; font-weight: 900;">Total Amount Paid:</td>
                  <td style="text-align: right; font-weight: 900; color: #d97706;">₹${stay.totalAmount?.toLocaleString() || 2400}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="barcode-box">
            <div>
              <div style="font-size: 11px; font-weight: bold; color: #475569;">Front Desk Check-in Voucher</div>
              <div style="font-size: 12px; font-weight: 700; color: #0f172a;">Show this voucher or quote Booking ID at reception for instant room keys</div>
            </div>
            <div class="barcode">||||| | |||| ||| |||||</div>
          </div>

          <div class="disclaimer">
            <strong>Guaranteed Pilgrim Allocation:</strong> This room was booked from the dedicated TeerthSetu platform quota. The property has reserved this room in inventory. Standard check-in time is 12:00 PM; early check-in is subject to availability.
          </div>
        </div>

        <div style="text-align: center; margin-top: 20px;" class="no-print">
          <button onclick="window.print()" style="background: #d97706; color: white; border: none; padding: 12px 28px; border-radius: 12px; font-weight: bold; font-size: 14px; cursor: pointer; box-shadow: 0 4px 12px rgba(217, 119, 6, 0.3);">
            🖨️ Print / Save as PDF
          </button>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  setTimeout(() => {
    printWindow.print();
  }, 400);
}

