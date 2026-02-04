import { NextRequest, NextResponse } from 'next/server';
import { sendReschedulingConfirmation } from '../../../../lib/whatsapp';

interface RescheduleRequest {
  bookingId: string;
  newDate: string;
  phoneNumber?: string;
  customerName?: string;
}

/**
 * API endpoint to handle booking rescheduling
 * Called from WhatsApp webhook or frontend
 */
export async function POST(req: NextRequest) {
  try {
    const { bookingId, newDate, phoneNumber, customerName }: RescheduleRequest = await req.json();

    if (!bookingId || !newDate) {
      return NextResponse.json(
        { error: 'Booking ID and new date are required' },
        { status: 400 }
      );
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const ddmmyyyyRegex = /^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}$/;

    let formattedDate = newDate;
    if (ddmmyyyyRegex.test(newDate)) {
      // Convert DD/MM/YYYY to YYYY-MM-DD
      const parts = newDate.split(/[/-]/);
      if (parts[2].length === 2) {
        parts[2] = '20' + parts[2]; // Convert YY to YYYY
      }
      formattedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }

    if (!dateRegex.test(formattedDate)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD or DD/MM/YYYY' },
        { status: 400 }
      );
    }

    // Check if new date is in the future
    const newDateObj = new Date(formattedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (newDateObj < today) {
      return NextResponse.json(
        { error: 'New date must be in the future' },
        { status: 400 }
      );
    }

    // TODO: Implement actual booking lookup from database
    // For now, we'll simulate the lookup
    const booking = await getBookingById(bookingId);

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if rescheduling is allowed (e.g., not within 24 hours of departure)
    const originalDate = new Date(booking.date);
    const hoursUntilDeparture = (originalDate.getTime() - Date.now()) / (1000 * 60 * 60);

    if (hoursUntilDeparture < 24) {
      return NextResponse.json(
        { error: 'Rescheduling not allowed within 24 hours of departure' },
        { status: 400 }
      );
    }

    // TODO: Call real API to reschedule booking
    // This would involve:
    // 1. Checking availability for new date
    // 2. Calling transport provider API (flight/train/bus)
    // 3. Updating hotel reservation
    // 4. Calculating any price difference
    // 5. Processing refund/additional payment if needed

    const rescheduledBooking = await performReschedule(booking, formattedDate);

    if (!rescheduledBooking.success) {
      return NextResponse.json(
        { error: rescheduledBooking.message },
        { status: 400 }
      );
    }

    // Update booking in database
    await updateBookingDate(bookingId, formattedDate);

    // Send WhatsApp confirmation if phone number is provided
    if (phoneNumber) {
      try {
        await sendReschedulingConfirmation(phoneNumber, {
          bookingId,
          customerName: customerName || booking.customerName || 'Customer',
          originalDate: booking.date,
          newDate: formattedDate,
          transportType: booking.transportType || 'Transport'
        });
      } catch (whatsappError) {
        console.error('Failed to send WhatsApp confirmation:', whatsappError);
        // Don't fail the rescheduling if WhatsApp fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Booking rescheduled successfully',
      booking: {
        bookingId,
        originalDate: booking.date,
        newDate: formattedDate,
        priceDifference: rescheduledBooking.priceDifference || 0
      }
    });

  } catch (error: any) {
    console.error('Reschedule API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get booking by ID from database
 * TODO: Replace with actual database query
 */
async function getBookingById(bookingId: string) {
  // Simulate database lookup
  // In production, replace with actual database query:
  // return await prisma.booking.findUnique({ where: { id: bookingId } });

  // Mock data for testing
  if (bookingId.startsWith('TRIP-') || bookingId.startsWith('BOOK-')) {
    return {
      bookingId,
      customerName: 'Test Customer',
      date: '2024-12-25',
      transportType: 'Flight',
      status: 'confirmed'
    };
  }

  return null;
}

/**
 * Perform the actual rescheduling with transport providers
 * TODO: Implement real API calls to transport providers
 */
async function performReschedule(booking: any, newDate: string) {
  // Simulate rescheduling logic
  // In production, this would:
  // 1. Call the transport provider's API (flight/train/bus)
  // 2. Check availability for the new date
  // 3. Calculate price difference
  // 4. Process payment if needed

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simulate 90% success rate
  const success = Math.random() > 0.1;

  if (!success) {
    return {
      success: false,
      message: 'No availability on the requested date'
    };
  }

  return {
    success: true,
    message: 'Rescheduling successful',
    priceDifference: Math.floor(Math.random() * 1000) - 500 // Random price difference
  };
}

/**
 * Update booking date in database
 * TODO: Replace with actual database update
 */
async function updateBookingDate(bookingId: string, newDate: string) {
  // Simulate database update
  // In production, replace with actual database update:
  // return await prisma.booking.update({
  //   where: { id: bookingId },
  //   data: { date: newDate, updatedAt: new Date() }
  // });

  console.log(`Updated booking ${bookingId} to new date: ${newDate}`);
  return true;
}

/**
 * GET endpoint to check rescheduling eligibility
 */
export async function GET(req: NextRequest) {
  const bookingId = req.nextUrl.searchParams.get('bookingId');

  if (!bookingId) {
    return NextResponse.json(
      { error: 'Booking ID is required' },
      { status: 400 }
    );
  }

  const booking = await getBookingById(bookingId);

  if (!booking) {
    return NextResponse.json(
      { error: 'Booking not found' },
      { status: 404 }
    );
  }

  const originalDate = new Date(booking.date);
  const hoursUntilDeparture = (originalDate.getTime() - Date.now()) / (1000 * 60 * 60);
  const canReschedule = hoursUntilDeparture >= 24;

  return NextResponse.json({
    bookingId,
    canReschedule,
    currentDate: booking.date,
    hoursUntilDeparture: Math.floor(hoursUntilDeparture),
    reason: canReschedule
      ? 'Rescheduling is allowed'
      : 'Rescheduling not allowed within 24 hours of departure'
  });
}
