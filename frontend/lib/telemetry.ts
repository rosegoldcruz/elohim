import { env } from '@/env.mjs'

// Dash0 Telemetry Configuration
export class TelemetryLogger {
  private authToken: string
  private endpoint: string
  private dataset: string

  constructor() {
    this.authToken = env.DASH0_AUTH_TOKEN
    this.endpoint = env.OTEL_EXPORTER_OTLP_ENDPOINT
    this.dataset = env.DASH0_DATASET
  }

  async logEvent(event: {
    level: 'info' | 'warn' | 'error' | 'debug'
    message: string
    metadata?: Record<string, any>
    userId?: string
    projectId?: string
  }) {
    try {
      const logData = {
        timestamp: new Date().toISOString(),
        level: event.level,
        message: event.message,
        metadata: event.metadata || {},
        userId: event.userId,
        projectId: event.projectId,
        service: 'aeon-platform',
        environment: env.APP_ENV,
      }

      // Send to Dash0
      const response = await fetch(`${env.DASH0_LOG_DRAIN_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`,
          'Dash0-Dataset': this.dataset,
        },
        body: JSON.stringify(logData),
      })

      if (!response.ok) {
        console.error('Failed to send telemetry:', response.statusText)
      }
    } catch (error) {
      console.error('Telemetry logging error:', error)
    }
  }

  async logVideoGeneration(data: {
    userId: string
    projectId: string
    model: string
    prompt: string
    status: 'started' | 'completed' | 'failed'
    duration?: number
    creditsUsed?: number
    error?: string
  }) {
    await this.logEvent({
      level: data.status === 'failed' ? 'error' : 'info',
      message: `Video generation ${data.status}`,
      metadata: {
        model: data.model,
        prompt: data.prompt,
        duration: data.duration,
        creditsUsed: data.creditsUsed,
        error: data.error,
      },
      userId: data.userId,
      projectId: data.projectId,
    })
  }

  async logUserAction(data: {
    userId: string
    action: string
    metadata?: Record<string, any>
  }) {
    await this.logEvent({
      level: 'info',
      message: `User action: ${data.action}`,
      metadata: data.metadata,
      userId: data.userId,
    })
  }

  async logError(error: Error, context?: {
    userId?: string
    projectId?: string
    metadata?: Record<string, any>
  }) {
    await this.logEvent({
      level: 'error',
      message: error.message,
      metadata: {
        stack: error.stack,
        name: error.name,
        ...context?.metadata,
      },
      userId: context?.userId,
      projectId: context?.projectId,
    })
  }
}

// Elohim-specific telemetry logger
export class ElohimTelemetryLogger extends TelemetryLogger {
  private elohimAuthToken: string
  private elohimEndpoint: string
  private elohimDataset: string

  constructor() {
    super()
    this.elohimAuthToken = env.elohim_DASH0_AUTH_TOKEN
    this.elohimEndpoint = env.elohim_OTEL_EXPORTER_OTLP_ENDPOINT
    this.elohimDataset = env.elohim_DASH0_DATASET
  }

  async logElohimEvent(event: {
    level: 'info' | 'warn' | 'error' | 'debug'
    message: string
    metadata?: Record<string, any>
    userId?: string
    projectId?: string
  }) {
    try {
      const logData = {
        timestamp: new Date().toISOString(),
        level: event.level,
        message: event.message,
        metadata: event.metadata || {},
        userId: event.userId,
        projectId: event.projectId,
        service: 'elohim-aeon',
        environment: env.APP_ENV,
      }

      // Send to Elohim-specific Dash0 endpoint
      const response = await fetch(`${env.elohim_DASH0_LOG_DRAIN_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.elohimAuthToken}`,
          'Dash0-Dataset': this.elohimDataset,
        },
        body: JSON.stringify(logData),
      })

      if (!response.ok) {
        console.error('Failed to send Elohim telemetry:', response.statusText)
      }
    } catch (error) {
      console.error('Elohim telemetry logging error:', error)
    }
  }
}

// Global telemetry instances
export const telemetry = new TelemetryLogger()
export const elohimTelemetry = new ElohimTelemetryLogger()

// Helper functions for common logging patterns
export const logInfo = (message: string, metadata?: Record<string, any>) =>
  telemetry.logEvent({ level: 'info', message, metadata })

export const logError = (error: Error, context?: { userId?: string; projectId?: string; metadata?: Record<string, any> }) =>
  telemetry.logError(error, context)

export const logUserAction = (userId: string, action: string, metadata?: Record<string, any>) =>
  telemetry.logUserAction({ userId, action, metadata })

export const logVideoGeneration = (data: Parameters<TelemetryLogger['logVideoGeneration']>[0]) =>
  telemetry.logVideoGeneration(data)
