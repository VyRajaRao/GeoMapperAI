
export interface ApiMetric {
  endpoint: string;
  method: string;
  status: 'success' | 'failure';
  responseTime: number;
  timestamp: number;
  error?: string;
}

class MonitoringService {
  private metrics: ApiMetric[] = [];
  private readonly MAX_METRICS = 100;

  public logMetric(metric: ApiMetric) {
    this.metrics.unshift(metric);
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics.pop();
    }
    
    const color = metric.status === 'success' ? '\x1b[32m' : '\x1b[31m';
    console.log(
      `${color}[API Monitor] ${metric.method} ${metric.endpoint} - ${metric.status.toUpperCase()} (${metric.responseTime}ms)\x1b[0m`
    );
  }

  public getStats() {
    const stats: Record<string, { success: number; failure: number; avgResponseTime: number }> = {};
    
    this.metrics.forEach(m => {
      if (!stats[m.endpoint]) {
        stats[m.endpoint] = { success: 0, failure: 0, avgResponseTime: 0 };
      }
      if (m.status === 'success') stats[m.endpoint].success++;
      else stats[m.endpoint].failure++;
      
      stats[m.endpoint].avgResponseTime = (stats[m.endpoint].avgResponseTime + m.responseTime) / 2;
    });
    
    return stats;
  }

  public clear() {
    this.metrics = [];
  }
}

export const monitoringService = new MonitoringService();
