/**
 * Monitoring API Endpoint
 * Agent 5 - Integration & Testing Specialist
 * 
 * Handles monitoring data collection and storage
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Validation schemas
const ErrorReportSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  error: z.string(),
  stack: z.string().optional(),
  url: z.string(),
  userAgent: z.string(),
  userId: z.number().optional(),
  context: z.record(z.any()).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  resolved: z.boolean()
});

const PerformanceMetricSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  type: z.enum(['api_call', 'page_load', 'user_interaction', 'realtime_latency']),
  duration: z.number(),
  endpoint: z.string().optional(),
  success: z.boolean(),
  userId: z.number().optional(),
  context: z.record(z.any()).optional()
});

const UserActivitySchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  userId: z.number(),
  action: z.string(),
  details: z.record(z.any()),
  sessionId: z.string()
});

const MonitoringRequestSchema = z.object({
  type: z.enum(['errors', 'performance', 'user_activity']),
  data: z.array(z.any()),
  sessionId: z.string()
});

// Database storage functions
async function storeErrors(errors: any[]) {
  try {
    const validErrors = errors.map(error => {
      const validated = ErrorReportSchema.parse(error);
      return {
        error_id: validated.id,
        timestamp: validated.timestamp,
        error_message: validated.error,
        stack_trace: validated.stack,
        url: validated.url,
        user_agent: validated.userAgent,
        user_id: validated.userId,
        context: validated.context,
        severity: validated.severity,
        resolved: validated.resolved
      };
    });

    const { error } = await supabase
      .from('error_reports')
      .insert(validErrors);

    if (error) {
      console.error('Error storing error reports:', error);
      return false;
    }

    // Alert for critical errors
    const criticalErrors = validErrors.filter(e => e.severity === 'critical');
    if (criticalErrors.length > 0) {
      await alertCriticalErrors(criticalErrors);
    }

    return true;
  } catch (error) {
    console.error('Error processing error reports:', error);
    return false;
  }
}

async function storePerformanceMetrics(metrics: any[]) {
  try {
    const validMetrics = metrics.map(metric => {
      const validated = PerformanceMetricSchema.parse(metric);
      return {
        metric_id: validated.id,
        timestamp: validated.timestamp,
        metric_type: validated.type,
        duration: validated.duration,
        endpoint: validated.endpoint,
        success: validated.success,
        user_id: validated.userId,
        context: validated.context
      };
    });

    const { error } = await supabase
      .from('performance_metrics')
      .insert(validMetrics);

    if (error) {
      console.error('Error storing performance metrics:', error);
      return false;
    }

    // Alert for slow operations
    const slowMetrics = validMetrics.filter(m => m.duration > 5000);
    if (slowMetrics.length > 0) {
      await alertSlowOperations(slowMetrics);
    }

    return true;
  } catch (error) {
    console.error('Error processing performance metrics:', error);
    return false;
  }
}

async function storeUserActivities(activities: any[]) {
  try {
    const validActivities = activities.map(activity => {
      const validated = UserActivitySchema.parse(activity);
      return {
        activity_id: validated.id,
        timestamp: validated.timestamp,
        user_id: validated.userId,
        action: validated.action,
        details: validated.details,
        session_id: validated.sessionId
      };
    });

    const { error } = await supabase
      .from('user_activities')
      .insert(validActivities);

    if (error) {
      console.error('Error storing user activities:', error);
      return false;
    }

    // Process child safety events
    const safetyEvents = validActivities.filter(a => a.action.startsWith('child_safety:'));
    if (safetyEvents.length > 0) {
      await processChildSafetyEvents(safetyEvents);
    }

    return true;
  } catch (error) {
    console.error('Error processing user activities:', error);
    return false;
  }
}

// Alert functions
async function alertCriticalErrors(errors: any[]) {
  console.error('CRITICAL ERRORS DETECTED:', errors);
  
  // In production, you would send alerts to monitoring services
  // like Slack, email, or external monitoring platforms
  
  // Store alert record
  await supabase
    .from('alerts')
    .insert({
      alert_type: 'critical_error',
      severity: 'critical',
      message: `${errors.length} critical errors detected`,
      data: errors,
      timestamp: new Date().toISOString()
    });
}

async function alertSlowOperations(metrics: any[]) {
  console.warn('SLOW OPERATIONS DETECTED:', metrics);
  
  // Store alert record
  await supabase
    .from('alerts')
    .insert({
      alert_type: 'slow_operation',
      severity: 'medium',
      message: `${metrics.length} slow operations detected`,
      data: metrics,
      timestamp: new Date().toISOString()
    });
}

async function processChildSafetyEvents(events: any[]) {
  console.log('CHILD SAFETY EVENTS:', events);
  
  // Store safety event records
  const safetyRecords = events.map(event => ({
    event_type: event.action.replace('child_safety:', ''),
    user_id: event.user_id,
    details: event.details,
    timestamp: event.timestamp,
    session_id: event.session_id
  }));
  
  await supabase
    .from('child_safety_events')
    .insert(safetyRecords);
  
  // Alert for serious safety violations
  const seriousEvents = events.filter(e => 
    e.action.includes('inappropriate_content') || 
    e.action.includes('unsafe_behavior')
  );
  
  if (seriousEvents.length > 0) {
    await supabase
      .from('alerts')
      .insert({
        alert_type: 'child_safety_violation',
        severity: 'high',
        message: `${seriousEvents.length} child safety violations detected`,
        data: seriousEvents,
        timestamp: new Date().toISOString()
      });
  }
}

// Main API handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const requestData = MonitoringRequestSchema.parse(req.body);
    
    let success = false;
    
    switch (requestData.type) {
      case 'errors':
        success = await storeErrors(requestData.data);
        break;
      case 'performance':
        success = await storePerformanceMetrics(requestData.data);
        break;
      case 'user_activity':
        success = await storeUserActivities(requestData.data);
        break;
      default:
        return res.status(400).json({ message: 'Invalid monitoring type' });
    }
    
    if (success) {
      return res.status(200).json({ 
        success: true, 
        message: 'Monitoring data stored successfully',
        count: requestData.data.length
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to store monitoring data'
      });
    }
  } catch (error) {
    console.error('Monitoring API error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Invalid monitoring data format',
        errors: error.errors
      });
    }
    
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Additional endpoint for fetching monitoring data (for admin dashboard)
export async function getMonitoringData(req: VercelRequest, res: VercelResponse) {
  try {
    const { type, timeRange, userId } = req.query;
    
    // Calculate time range
    const now = new Date();
    const hoursAgo = parseInt(timeRange as string) || 24;
    const startTime = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
    
    let data;
    
    switch (type) {
      case 'errors':
        const { data: errorData } = await supabase
          .from('error_reports')
          .select('*')
          .gte('timestamp', startTime.toISOString())
          .order('timestamp', { ascending: false })
          .limit(100);
        data = errorData;
        break;
        
      case 'performance':
        const { data: perfData } = await supabase
          .from('performance_metrics')
          .select('*')
          .gte('timestamp', startTime.toISOString())
          .order('timestamp', { ascending: false })
          .limit(100);
        data = perfData;
        break;
        
      case 'user_activity':
        const { data: activityData } = await supabase
          .from('user_activities')
          .select('*')
          .gte('timestamp', startTime.toISOString())
          .order('timestamp', { ascending: false })
          .limit(100);
        data = activityData;
        break;
        
      default:
        return res.status(400).json({ message: 'Invalid data type' });
    }
    
    return res.status(200).json({
      success: true,
      data,
      timeRange: hoursAgo,
      count: data?.length || 0
    });
  } catch (error) {
    console.error('Error fetching monitoring data:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch monitoring data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}