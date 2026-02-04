import { NextRequest, NextResponse } from 'next/server';
import { getCallStatus, endCall, listRecentCalls } from '../../../../lib/voiceCall';

/**
 * GET - List all calls or get specific call status
 */
export async function GET(req: NextRequest) {
  try {
    const callSid = req.nextUrl.searchParams.get('callSid');
    const limit = req.nextUrl.searchParams.get('limit');

    // Get specific call status
    if (callSid) {
      const callDetails = await getCallStatus(callSid);
      return NextResponse.json({
        success: true,
        call: callDetails
      });
    }

    // List recent calls
    const calls = await listRecentCalls(limit ? parseInt(limit) : 20);
    return NextResponse.json({
      success: true,
      count: calls.length,
      calls
    });
  } catch (error: any) {
    console.error('Error fetching calls:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch calls' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - End an ongoing call
 */
export async function DELETE(req: NextRequest) {
  try {
    const { callSid } = await req.json();

    if (!callSid) {
      return NextResponse.json(
        { error: 'Call SID is required' },
        { status: 400 }
      );
    }

    const success = await endCall(callSid);

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Call ended successfully',
        callSid
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to end call' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error ending call:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to end call' },
      { status: 500 }
    );
  }
}

/**
 * POST - Batch operations
 */
export async function POST(req: NextRequest) {
  try {
    const { action, callSids } = await req.json();

    if (!action || !callSids || !Array.isArray(callSids)) {
      return NextResponse.json(
        { error: 'Action and callSids array are required' },
        { status: 400 }
      );
    }

    const results = [];

    switch (action) {
      case 'get_status':
        for (const sid of callSids) {
          try {
            const status = await getCallStatus(sid);
            results.push({ callSid: sid, success: true, data: status });
          } catch (error: any) {
            results.push({ callSid: sid, success: false, error: error.message });
          }
        }
        break;

      case 'end_calls':
        for (const sid of callSids) {
          try {
            const success = await endCall(sid);
            results.push({ callSid: sid, success });
          } catch (error: any) {
            results.push({ callSid: sid, success: false, error: error.message });
          }
        }
        break;

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      results
    });
  } catch (error: any) {
    console.error('Batch operation error:', error);
    return NextResponse.json(
      { error: error.message || 'Batch operation failed' },
      { status: 500 }
    );
  }
}
