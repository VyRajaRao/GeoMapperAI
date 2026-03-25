
import { monitoringService } from './monitoringService';

export interface ApiOptions {
  timeout?: number;
  retries?: number;
  backoff?: boolean;
  validate?: (data: any) => boolean;
}

export class ApiClient {
  private static readonly DEFAULT_TIMEOUT = 10000; // 10s
  private static readonly DEFAULT_RETRIES = 2;

  public static async get<T>(url: string, options: ApiOptions = {}): Promise<T> {
    const {
      timeout = this.DEFAULT_TIMEOUT,
      retries = this.DEFAULT_RETRIES,
      backoff = true,
      validate = (data) => data !== null && data !== undefined,
    } = options;

    let lastError: any;
    const startTime = Date.now();

    for (let attempt = 0; attempt <= retries; attempt++) {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(id);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!validate(data)) {
          throw new Error('Response validation failed: Invalid data structure');
        }

        const responseTime = Date.now() - startTime;
        const endpoint = url.startsWith('http') ? new URL(url).hostname : 'local-api';
        monitoringService.logMetric({
          endpoint,
          method: 'GET',
          status: 'success',
          responseTime,
          timestamp: Date.now(),
        });

        return data as T;
      } catch (error: any) {
        clearTimeout(id);
        lastError = error;

        const responseTime = Date.now() - startTime;
        const endpoint = url.startsWith('http') ? new URL(url).hostname : 'local-api';
        monitoringService.logMetric({
          endpoint,
          method: 'GET',
          status: 'failure',
          responseTime,
          timestamp: Date.now(),
          error: error.message,
        });

        if (attempt < retries) {
          const delay = backoff ? Math.pow(2, attempt) * 1000 : 1000;
          console.warn(`[ApiClient] Retrying ${url} (Attempt ${attempt + 1}/${retries}) in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }
}
