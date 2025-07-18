/**
 * Monitoring and Error Tracking System
 * Agent 5 - Integration & Testing Specialist
 * 
 * Comprehensive monitoring solution for production deployment
 */

// Error tracking and monitoring types
interface ErrorReport {
  id: string;
  timestamp: string;
  error: string;
  stack?: string;
  url: string;
  userAgent: string;
  userId?: number;
  context?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
}

interface PerformanceMetric {
  id: string;
  timestamp: string;
  type: 'api_call' | 'page_load' | 'user_interaction' | 'realtime_latency';
  duration: number;
  endpoint?: string;
  success: boolean;
  userId?: number;
  context?: Record<string, any>;
}

interface UserActivity {
  id: string;
  timestamp: string;
  userId: number;
  action: string;
  details: Record<string, any>;
  sessionId: string;
}

// Main monitoring class
class MonitoringService {
  private isEnabled: boolean = true;
  private apiEndpoint: string = '/api/monitoring';
  private sessionId: string = this.generateSessionId();
  private errorBuffer: ErrorReport[] = [];
  private performanceBuffer: PerformanceMetric[] = [];
  private userActivityBuffer: UserActivity[] = [];
  
  constructor() {
    this.setupErrorHandlers();
    this.setupPerformanceMonitoring();
    this.startPeriodicReporting();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Error handling setup
  private setupErrorHandlers() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.reportError({
        error: event.error?.message || 'Unknown error',
        stack: event.error?.stack,
        url: event.filename || window.location.href,
        line: event.lineno,
        column: event.colno,
        severity: 'high'
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError({
        error: `Unhandled promise rejection: ${event.reason}`,
        stack: event.reason?.stack,
        url: window.location.href,
        severity: 'high'
      });
    });

    // React error boundary integration
    if (typeof window !== 'undefined') {
      (window as any).reportReactError = (error: Error, errorInfo: any) => {
        this.reportError({
          error: error.message,
          stack: error.stack,
          url: window.location.href,
          severity: 'critical',
          context: {
            reactError: true,
            componentStack: errorInfo.componentStack
          }
        });
      };
    }
  }

  // Performance monitoring setup
  private setupPerformanceMonitoring() {
    // Monitor page load times
    if (typeof window !== 'undefined' && window.performance) {
      window.addEventListener('load', () => {
        const loadTime = window.performance.now();
        this.reportPerformance({
          type: 'page_load',
          duration: loadTime,
          success: true,
          context: {
            url: window.location.href,
            navigationType: window.performance.navigation?.type
          }
        });
      });
    }

    // Monitor fetch requests
    if (typeof window !== 'undefined' && window.fetch) {
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        const startTime = performance.now();
        const url = args[0] as string;
        
        try {
          const response = await originalFetch(...args);
          const duration = performance.now() - startTime;
          
          this.reportPerformance({
            type: 'api_call',
            duration,
            endpoint: url,
            success: response.ok,
            context: {
              status: response.status,
              method: args[1]?.method || 'GET'
            }
          });
          
          return response;
        } catch (error) {
          const duration = performance.now() - startTime;
          
          this.reportPerformance({
            type: 'api_call',
            duration,
            endpoint: url,
            success: false,
            context: {
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          });
          
          throw error;
        }
      };
    }
  }

  // Report error
  public reportError(errorData: Partial<ErrorReport>) {
    if (!this.isEnabled) return;

    const error: ErrorReport = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      error: errorData.error || 'Unknown error',
      stack: errorData.stack,
      url: errorData.url || window.location.href,
      userAgent: navigator.userAgent,
      userId: errorData.userId,
      context: errorData.context,
      severity: errorData.severity || 'medium',
      resolved: false
    };

    this.errorBuffer.push(error);
    
    // Immediately report critical errors
    if (error.severity === 'critical') {
      this.flushErrorBuffer();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Monitoring: Error reported', error);
    }
  }

  // Report performance metric
  public reportPerformance(metricData: Partial<PerformanceMetric>) {
    if (!this.isEnabled) return;

    const metric: PerformanceMetric = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      type: metricData.type || 'user_interaction',
      duration: metricData.duration || 0,
      endpoint: metricData.endpoint,
      success: metricData.success !== undefined ? metricData.success : true,
      userId: metricData.userId,
      context: metricData.context
    };

    this.performanceBuffer.push(metric);

    // Log slow operations
    if (metric.duration > 2000) {
      console.warn('Monitoring: Slow operation detected', metric);
    }
  }

  // Report user activity
  public reportUserActivity(activityData: Partial<UserActivity>) {
    if (!this.isEnabled) return;

    const activity: UserActivity = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      userId: activityData.userId || 0,
      action: activityData.action || 'unknown',
      details: activityData.details || {},
      sessionId: this.sessionId
    };

    this.userActivityBuffer.push(activity);
  }

  // Flush error buffer
  private async flushErrorBuffer() {
    if (this.errorBuffer.length === 0) return;

    const errors = [...this.errorBuffer];
    this.errorBuffer = [];

    try {
      await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'errors',
          data: errors,
          sessionId: this.sessionId
        })
      });
    } catch (error) {
      // Re-add errors to buffer if reporting fails
      this.errorBuffer.unshift(...errors);
      console.error('Failed to report errors:', error);
    }
  }

  // Flush performance buffer
  private async flushPerformanceBuffer() {
    if (this.performanceBuffer.length === 0) return;

    const metrics = [...this.performanceBuffer];
    this.performanceBuffer = [];

    try {
      await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'performance',
          data: metrics,
          sessionId: this.sessionId
        })
      });
    } catch (error) {
      // Re-add metrics to buffer if reporting fails
      this.performanceBuffer.unshift(...metrics);
      console.error('Failed to report performance metrics:', error);
    }
  }

  // Flush user activity buffer
  private async flushUserActivityBuffer() {
    if (this.userActivityBuffer.length === 0) return;

    const activities = [...this.userActivityBuffer];
    this.userActivityBuffer = [];

    try {
      await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'user_activity',
          data: activities,
          sessionId: this.sessionId
        })
      });
    } catch (error) {
      // Re-add activities to buffer if reporting fails
      this.userActivityBuffer.unshift(...activities);
      console.error('Failed to report user activities:', error);
    }
  }

  // Start periodic reporting
  private startPeriodicReporting() {
    // Flush buffers every 30 seconds
    setInterval(() => {
      this.flushErrorBuffer();
      this.flushPerformanceBuffer();
      this.flushUserActivityBuffer();
    }, 30000);

    // Flush on page unload
    window.addEventListener('beforeunload', () => {
      this.flushErrorBuffer();
      this.flushPerformanceBuffer();
      this.flushUserActivityBuffer();
    });
  }

  // Generate unique ID
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Enable/disable monitoring
  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  // Get current status
  public getStatus() {
    return {
      enabled: this.isEnabled,
      sessionId: this.sessionId,
      errorCount: this.errorBuffer.length,
      performanceCount: this.performanceBuffer.length,
      userActivityCount: this.userActivityBuffer.length
    };
  }
}

// Create singleton instance
export const monitoring = new MonitoringService();

// Utility functions for common monitoring tasks
export const monitoringUtils = {
  // Monitor API calls
  monitorApiCall: async <T>(
    apiCall: () => Promise<T>,
    endpoint: string,
    userId?: number
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await apiCall();
      const duration = performance.now() - startTime;
      
      monitoring.reportPerformance({
        type: 'api_call',
        duration,
        endpoint,
        success: true,
        userId
      });
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      monitoring.reportPerformance({
        type: 'api_call',
        duration,
        endpoint,
        success: false,
        userId,
        context: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
      
      monitoring.reportError({
        error: `API call failed: ${endpoint}`,
        stack: error instanceof Error ? error.stack : undefined,
        severity: 'medium',
        userId,
        context: {
          endpoint,
          duration
        }
      });
      
      throw error;
    }
  },

  // Monitor user interactions
  monitorUserInteraction: (action: string, details: Record<string, any> = {}, userId?: number) => {
    const startTime = performance.now();
    
    monitoring.reportUserActivity({
      userId,
      action,
      details: {
        ...details,
        timestamp: Date.now()
      }
    });
    
    return {
      end: () => {
        const duration = performance.now() - startTime;
        monitoring.reportPerformance({
          type: 'user_interaction',
          duration,
          success: true,
          userId,
          context: {
            action,
            details
          }
        });
      }
    };
  },

  // Monitor real-time latency
  monitorRealtimeLatency: (messageId: string, userId?: number) => {
    const startTime = performance.now();
    
    return {
      end: () => {
        const duration = performance.now() - startTime;
        monitoring.reportPerformance({
          type: 'realtime_latency',
          duration,
          success: true,
          userId,
          context: {
            messageId
          }
        });
      }
    };
  },

  // Report feature usage
  reportFeatureUsage: (feature: string, userId?: number, context?: Record<string, any>) => {
    monitoring.reportUserActivity({
      userId,
      action: `feature_used:${feature}`,
      details: {
        feature,
        ...context
      }
    });
  },

  // Report child safety events
  reportChildSafetyEvent: (event: string, userId?: number, context?: Record<string, any>) => {
    monitoring.reportUserActivity({
      userId,
      action: `child_safety:${event}`,
      details: {
        event,
        ...context
      }
    });
    
    // Also report as error if it's a safety violation
    if (event === 'inappropriate_content' || event === 'unsafe_behavior') {
      monitoring.reportError({
        error: `Child safety event: ${event}`,
        severity: 'high',
        userId,
        context: {
          event,
          ...context
        }
      });
    }
  }
};

// Export monitoring service
export default monitoring;