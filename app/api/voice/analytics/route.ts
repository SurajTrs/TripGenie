import { NextRequest, NextResponse } from 'next/server';
import { listRecentCalls, getCallStatus } from '../../../../lib/voiceCall';

/**
 * Voice Call Analytics API
 * Provides real-time analytics and monitoring for voice calls
 */

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const action = searchParams.get('action') || 'summary';
    const limit = parseInt(searchParams.get('limit') || '50');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    switch (action) {
      case 'summary':
        return await getCallSummary(limit);

      case 'metrics':
        return await getCallMetrics(startDate, endDate);

      case 'recent':
        return await getRecentCallsAnalytics(limit);

      case 'performance':
        return await getPerformanceMetrics();

      default:
        return NextResponse.json({
          error: 'Invalid action. Supported: summary, metrics, recent, performance'
        }, { status: 400 });
    }

  } catch (error: any) {
    console.error('❌ Analytics error:', error);
    return NextResponse.json({
      error: error.message || 'Failed to fetch analytics'
    }, { status: 500 });
  }
}

/**
 * Get call summary statistics
 */
async function getCallSummary(limit: number) {
  try {
    const calls = await listRecentCalls(limit);

    const summary = {
      totalCalls: calls.length,
      byStatus: {
        completed: 0,
        'in-progress': 0,
        busy: 0,
        'no-answer': 0,
        failed: 0,
        canceled: 0
      },
      byDirection: {
        inbound: 0,
        outbound: 0
      },
      totalDuration: 0,
      averageDuration: 0,
      successRate: 0
    };

    calls.forEach(call => {
      // Count by status
      const status = call.status as keyof typeof summary.byStatus;
      if (summary.byStatus[status] !== undefined) {
        summary.byStatus[status]++;
      }

      // Count by direction
      const direction = call.direction as keyof typeof summary.byDirection;
      if (summary.byDirection[direction] !== undefined) {
        summary.byDirection[direction]++;
      }

      // Calculate duration
      if (call.duration) {
        summary.totalDuration += parseInt(call.duration);
      }
    });

    // Calculate average duration
    const completedCalls = summary.byStatus.completed;
    if (completedCalls > 0) {
      summary.averageDuration = Math.round(summary.totalDuration / completedCalls);
    }

    // Calculate success rate
    summary.successRate = summary.totalCalls > 0
      ? Math.round((completedCalls / summary.totalCalls) * 100)
      : 0;

    return NextResponse.json({
      success: true,
      summary,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    throw error;
  }
}

/**
 * Get detailed call metrics
 */
async function getCallMetrics(startDate: string | null, endDate: string | null) {
  try {
    const calls = await listRecentCalls(100);

    // Filter by date range if provided
    let filteredCalls = calls;
    if (startDate || endDate) {
      filteredCalls = calls.filter(call => {
        if (!call.startTime) return false;
        const callDate = new Date(call.startTime);
        if (startDate && callDate < new Date(startDate)) return false;
        if (endDate && callDate > new Date(endDate)) return false;
        return true;
      });
    }

    // Calculate metrics
    const metrics = {
      totalCalls: filteredCalls.length,
      totalDuration: 0,
      averageDuration: 0,
      longestCall: 0,
      shortestCall: Infinity,
      callsByHour: {} as Record<number, number>,
      callsByDay: {} as Record<string, number>,
      answerRate: 0,
      completionRate: 0
    };

    let answeredCalls = 0;
    let completedCalls = 0;

    filteredCalls.forEach(call => {
      // Duration calculations
      if (call.duration) {
        const duration = parseInt(call.duration);
        metrics.totalDuration += duration;
        metrics.longestCall = Math.max(metrics.longestCall, duration);
        metrics.shortestCall = Math.min(metrics.shortestCall, duration);
      }

      // Status tracking
      if (call.status === 'completed') {
        completedCalls++;
        answeredCalls++;
      } else if (['in-progress', 'ringing'].includes(call.status)) {
        answeredCalls++;
      }

      // Time-based analytics
      if (call.startTime) {
        const date = new Date(call.startTime);
        const hour = date.getHours();
        const day = date.toISOString().split('T')[0];

        metrics.callsByHour[hour] = (metrics.callsByHour[hour] || 0) + 1;
        metrics.callsByDay[day] = (metrics.callsByDay[day] || 0) + 1;
      }
    });

    // Calculate averages and rates
    if (completedCalls > 0) {
      metrics.averageDuration = Math.round(metrics.totalDuration / completedCalls);
    }

    if (metrics.shortestCall === Infinity) {
      metrics.shortestCall = 0;
    }

    metrics.answerRate = metrics.totalCalls > 0
      ? Math.round((answeredCalls / metrics.totalCalls) * 100)
      : 0;

    metrics.completionRate = metrics.totalCalls > 0
      ? Math.round((completedCalls / metrics.totalCalls) * 100)
      : 0;

    return NextResponse.json({
      success: true,
      metrics,
      dateRange: {
        start: startDate || 'N/A',
        end: endDate || 'N/A'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    throw error;
  }
}

/**
 * Get recent calls with analytics
 */
async function getRecentCallsAnalytics(limit: number) {
  try {
    const calls = await listRecentCalls(limit);

    const analytics = calls.map(call => ({
      callSid: call.sid,
      to: call.to,
      from: call.from,
      status: call.status,
      direction: call.direction,
      duration: call.duration ? `${call.duration}s` : 'N/A',
      startTime: call.startTime,
      endTime: call.endTime,
      quality: assessCallQuality(call),
      cost: estimateCallCost(call.duration)
    }));

    return NextResponse.json({
      success: true,
      count: analytics.length,
      calls: analytics,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    throw error;
  }
}

/**
 * Get performance metrics
 */
async function getPerformanceMetrics() {
  try {
    const calls = await listRecentCalls(100);

    const performance = {
      callQuality: {
        excellent: 0,
        good: 0,
        fair: 0,
        poor: 0
      },
      responseTime: {
        under5s: 0,
        '5to10s': 0,
        '10to30s': 0,
        over30s: 0
      },
      customerSatisfaction: {
        score: 0,
        totalRatings: 0
      }
    };

    calls.forEach(call => {
      // Assess call quality
      const quality = assessCallQuality(call);
      if (performance.callQuality[quality] !== undefined) {
        performance.callQuality[quality]++;
      }

      // Calculate response time (time to answer)
      if (call.startTime && call.duration) {
        const responseTime = 5; // Placeholder - would need actual ring duration
        if (responseTime < 5) {
          performance.responseTime.under5s++;
        } else if (responseTime < 10) {
          performance.responseTime['5to10s']++;
        } else if (responseTime < 30) {
          performance.responseTime['10to30s']++;
        } else {
          performance.responseTime.over30s++;
        }
      }
    });

    // Calculate overall quality score
    const totalQualityCalls = Object.values(performance.callQuality).reduce((a, b) => a + b, 0);
    const qualityScore = totalQualityCalls > 0
      ? Math.round(
          ((performance.callQuality.excellent * 100) +
           (performance.callQuality.good * 75) +
           (performance.callQuality.fair * 50) +
           (performance.callQuality.poor * 25)) / totalQualityCalls
        )
      : 0;

    return NextResponse.json({
      success: true,
      performance,
      overallQualityScore: qualityScore,
      recommendations: generateRecommendations(performance),
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    throw error;
  }
}

/**
 * Assess call quality based on duration and status
 */
function assessCallQuality(call: any): 'excellent' | 'good' | 'fair' | 'poor' {
  if (call.status !== 'completed') return 'poor';

  const duration = parseInt(call.duration || '0');

  if (duration > 120) return 'excellent'; // >2 minutes = engaged conversation
  if (duration > 60) return 'good';       // >1 minute = decent interaction
  if (duration > 30) return 'fair';       // >30s = brief interaction
  return 'poor';                           // <30s = very short/issue
}

/**
 * Estimate call cost (approximate based on Twilio pricing)
 */
function estimateCallCost(duration: string | null): string {
  if (!duration) return '$0.00';

  const minutes = Math.ceil(parseInt(duration) / 60);
  const costPerMinute = 0.013; // Approximate Twilio rate for India
  const cost = minutes * costPerMinute;

  return `$${cost.toFixed(3)}`;
}

/**
 * Generate performance recommendations
 */
function generateRecommendations(performance: any): string[] {
  const recommendations: string[] = [];

  const totalCalls = Object.values(performance.callQuality).reduce((a: any, b: any) => a + b, 0) as number;

  if (performance.callQuality.poor / totalCalls > 0.2) {
    recommendations.push('Consider reviewing IVR flow - high percentage of poor quality calls');
  }

  if (performance.responseTime.over30s / totalCalls > 0.3) {
    recommendations.push('Response time is slow - consider adding more support agents or optimizing queue');
  }

  if (performance.callQuality.excellent / totalCalls > 0.5) {
    recommendations.push('Excellent call quality! Keep up the good work');
  }

  if (recommendations.length === 0) {
    recommendations.push('Performance is within normal range');
  }

  return recommendations;
}

/**
 * POST endpoint for custom analytics queries
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { callSids, analysisType } = body;

    if (!callSids || !Array.isArray(callSids)) {
      return NextResponse.json({
        error: 'callSids array is required'
      }, { status: 400 });
    }

    const results = [];

    for (const sid of callSids) {
      try {
        const callDetails = await getCallStatus(sid);
        results.push({
          callSid: sid,
          success: true,
          data: callDetails,
          quality: assessCallQuality(callDetails)
        });
      } catch (error: any) {
        results.push({
          callSid: sid,
          success: false,
          error: error.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      analysisType: analysisType || 'custom',
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Analytics POST error:', error);
    return NextResponse.json({
      error: error.message || 'Failed to process analytics request'
    }, { status: 500 });
  }
}
