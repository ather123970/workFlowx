// Simple logger service for browser environment
export interface LogLevel {
  ERROR: 0;
  WARN: 1;
  INFO: 2;
  DEBUG: 3;
}

export class Logger {
  private static instance: Logger;
  private logLevel: number = 2; // INFO level by default

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  setLogLevel(level: number): void {
    this.logLevel = level;
  }

  error(message: string, data?: any): void {
    if (this.logLevel >= 0) {
      console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, data || '');
      this.logToSupabase('ERROR', message, data);
    }
  }

  warn(message: string, data?: any): void {
    if (this.logLevel >= 1) {
      console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data || '');
      this.logToSupabase('WARN', message, data);
    }
  }

  info(message: string, data?: any): void {
    if (this.logLevel >= 2) {
      console.info(`[INFO] ${new Date().toISOString()} - ${message}`, data || '');
      this.logToSupabase('INFO', message, data);
    }
  }

  debug(message: string, data?: any): void {
    if (this.logLevel >= 3) {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, data || '');
    }
  }

  private async logToSupabase(level: string, message: string, data?: any): Promise<void> {
    try {
      // Only log errors and warnings to database to avoid spam
      if (level === 'ERROR' || level === 'WARN') {
        const { supabase } = await import('@/integrations/supabase/client');
        await supabase
          .from('system_logs')
          .insert({
            level,
            message,
            data: data ? JSON.stringify(data) : null,
            timestamp: new Date().toISOString(),
          });
      }
    } catch (error) {
      // Fail silently to avoid infinite loops
      console.error('Failed to log to Supabase:', error);
    }
  }
}

export const logger = Logger.getInstance();
