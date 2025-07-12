/**
 * AEON Email Alert System
 * Handles automated email notifications for fraud alerts, export notifications,
 * and admin communications via SendGrid/SMTP
 */

// Only import nodemailer on server side
let nodemailer: any = null
if (typeof window === 'undefined') {
  nodemailer = require('nodemailer')
}

export interface EmailConfig {
  service: 'sendgrid' | 'smtp' | 'gmail'
  host?: string
  port?: number
  secure?: boolean
  auth: {
    user: string
    pass: string
  }
}

export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export interface EmailAttachment {
  filename: string
  path?: string
  content?: Buffer | string
  contentType?: string
}

export interface EmailOptions {
  to: string | string[]
  subject: string
  text?: string
  html?: string
  attachments?: EmailAttachment[]
  priority?: 'high' | 'normal' | 'low'
}

export class Emailer {
  private transporter: nodemailer.Transporter
  private fromEmail: string
  private adminEmails: string[]

  constructor() {
    // Only initialize on server side
    if (typeof window === 'undefined' && nodemailer) {
      this.fromEmail = process.env.FROM_EMAIL || 'alerts@aeon.com'
      this.adminEmails = process.env.ADMIN_EMAILS?.split(',') || ['admin@aeon.com']

      try {
        this.transporter = this.createTransporter()
      } catch (error) {
        console.warn('Failed to create email transporter:', error)
        this.transporter = null
      }
    }
  }

  /**
   * Create email transporter based on configuration
   */
  private createTransporter(): any {
    if (!nodemailer) {
      throw new Error('Nodemailer not available')
    }

    const emailService = process.env.EMAIL_SERVICE || 'sendgrid'

    switch (emailService) {
      case 'sendgrid':
        return nodemailer.createTransport({
          service: 'SendGrid',
          auth: {
            user: 'apikey',
            pass: process.env.SENDGRID_API_KEY || ''
          }
        })

      case 'gmail':
        return nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.GMAIL_USER || '',
            pass: process.env.GMAIL_APP_PASSWORD || ''
          }
        })

      case 'smtp':
      default:
        return nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'localhost',
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER || '',
            pass: process.env.SMTP_PASS || ''
          }
        })
    }
  }

  /**
   * Send fraud alert email to administrators
   */
  async sendAlert(subject: string, text: string, attachments?: EmailAttachment[]): Promise<boolean> {
    if (typeof window !== 'undefined' || !nodemailer || !this.transporter) {
      console.warn('Email sending is server-side only')
      return false
    }

    try {
      const emailOptions: EmailOptions = {
        to: this.adminEmails,
        subject: `🚨 AEON Alert: ${subject}`,
        text,
        html: this.generateAlertHTML(subject, text),
        attachments,
        priority: 'high'
      }

      await this.sendEmail(emailOptions)
      console.log(`📧 Alert email sent: ${subject}`)
      return true

    } catch (error) {
      console.error('Failed to send alert email:', error)
      return false
    }
  }

  /**
   * Send export notification email
   */
  async sendExportNotification(
    exportType: string, 
    filePath: string, 
    fileSize: number,
    recordCount: number
  ): Promise<boolean> {
    try {
      const subject = `📊 AEON Export Complete: ${exportType}`
      const text = `
Export completed successfully:

Type: ${exportType}
File: ${filePath}
Size: ${this.formatFileSize(fileSize)}
Records: ${recordCount.toLocaleString()}
Generated: ${new Date().toISOString()}

Download link: ${process.env.NEXT_PUBLIC_APP_URL}/admin/exports/${filePath.split('/').pop()}
      `.trim()

      const emailOptions: EmailOptions = {
        to: this.adminEmails,
        subject,
        text,
        html: this.generateExportHTML(exportType, filePath, fileSize, recordCount),
        priority: 'normal'
      }

      await this.sendEmail(emailOptions)
      console.log(`📧 Export notification sent: ${exportType}`)
      return true

    } catch (error) {
      console.error('Failed to send export notification:', error)
      return false
    }
  }

  /**
   * Send daily summary email
   */
  async sendDailySummary(
    revenue: number,
    transactions: number,
    alerts: number,
    exports: string[]
  ): Promise<boolean> {
    try {
      const subject = `📈 AEON Daily Summary - ${new Date().toLocaleDateString()}`
      const text = `
AEON Platform Daily Summary

Revenue: $${(revenue * 0.01).toFixed(2)} (${revenue} credits)
Transactions: ${transactions.toLocaleString()}
Fraud Alerts: ${alerts}
Exports Generated: ${exports.length}

${exports.length > 0 ? `Generated Exports:\n${exports.map(e => `• ${e}`).join('\n')}` : ''}

Dashboard: ${process.env.NEXT_PUBLIC_APP_URL}/admin/dashboard
      `.trim()

      const emailOptions: EmailOptions = {
        to: this.adminEmails,
        subject,
        text,
        html: this.generateDailySummaryHTML(revenue, transactions, alerts, exports),
        priority: 'normal'
      }

      await this.sendEmail(emailOptions)
      console.log('📧 Daily summary email sent')
      return true

    } catch (error) {
      console.error('Failed to send daily summary:', error)
      return false
    }
  }

  /**
   * Send critical system alert
   */
  async sendSystemAlert(
    alertType: 'database_error' | 'payment_failure' | 'security_breach' | 'system_down',
    message: string,
    details?: any
  ): Promise<boolean> {
    try {
      const subject = `🚨 CRITICAL: AEON System Alert - ${alertType.replace('_', ' ').toUpperCase()}`
      const text = `
CRITICAL SYSTEM ALERT

Type: ${alertType}
Message: ${message}
Time: ${new Date().toISOString()}

${details ? `Details:\n${JSON.stringify(details, null, 2)}` : ''}

Immediate action required!
Admin Dashboard: ${process.env.NEXT_PUBLIC_APP_URL}/admin/dashboard
      `.trim()

      const emailOptions: EmailOptions = {
        to: this.adminEmails,
        subject,
        text,
        html: this.generateSystemAlertHTML(alertType, message, details),
        priority: 'high'
      }

      await this.sendEmail(emailOptions)
      console.log(`📧 System alert sent: ${alertType}`)
      return true

    } catch (error) {
      console.error('Failed to send system alert:', error)
      return false
    }
  }

  /**
   * Send custom email
   */
  async sendCustomEmail(options: EmailOptions): Promise<boolean> {
    try {
      await this.sendEmail(options)
      console.log(`📧 Custom email sent to ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`)
      return true

    } catch (error) {
      console.error('Failed to send custom email:', error)
      return false
    }
  }

  /**
   * Core email sending function
   */
  private async sendEmail(options: EmailOptions): Promise<void> {
    const mailOptions = {
      from: this.fromEmail,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments,
      priority: options.priority || 'normal'
    }

    await this.transporter.sendMail(mailOptions)
  }

  /**
   * Generate HTML for fraud alert emails
   */
  private generateAlertHTML(subject: string, text: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>AEON Alert</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; }
        .footer { background: #374151; color: white; padding: 10px; text-align: center; }
        .alert-icon { font-size: 48px; margin-bottom: 10px; }
        .button { background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="alert-icon">🚨</div>
            <h1>AEON Security Alert</h1>
            <h2>${subject}</h2>
        </div>
        <div class="content">
            <pre style="white-space: pre-wrap; font-family: Arial, sans-serif;">${text}</pre>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/dashboard" class="button">View Admin Dashboard</a>
        </div>
        <div class="footer">
            <p>AEON Platform Security System | ${new Date().toISOString()}</p>
        </div>
    </div>
</body>
</html>
    `.trim()
  }

  /**
   * Generate HTML for export notification emails
   */
  private generateExportHTML(
    exportType: string, 
    filePath: string, 
    fileSize: number, 
    recordCount: number
  ): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>AEON Export Complete</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #059669; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; }
        .footer { background: #374151; color: white; padding: 10px; text-align: center; }
        .stats { display: flex; justify-content: space-around; margin: 20px 0; }
        .stat { text-align: center; }
        .stat-value { font-size: 24px; font-weight: bold; color: #059669; }
        .button { background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Export Complete</h1>
            <h2>${exportType}</h2>
        </div>
        <div class="content">
            <div class="stats">
                <div class="stat">
                    <div class="stat-value">${recordCount.toLocaleString()}</div>
                    <div>Records</div>
                </div>
                <div class="stat">
                    <div class="stat-value">${this.formatFileSize(fileSize)}</div>
                    <div>File Size</div>
                </div>
            </div>
            <p><strong>File:</strong> ${filePath.split('/').pop()}</p>
            <p><strong>Generated:</strong> ${new Date().toISOString()}</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/exports" class="button">Download Export</a>
        </div>
        <div class="footer">
            <p>AEON Platform Export System</p>
        </div>
    </div>
</body>
</html>
    `.trim()
  }

  /**
   * Generate HTML for daily summary emails
   */
  private generateDailySummaryHTML(
    revenue: number,
    transactions: number,
    alerts: number,
    exports: string[]
  ): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>AEON Daily Summary</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; }
        .footer { background: #374151; color: white; padding: 10px; text-align: center; }
        .metrics { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0; }
        .metric { background: white; padding: 15px; border-radius: 8px; text-align: center; }
        .metric-value { font-size: 24px; font-weight: bold; color: #3b82f6; }
        .exports-list { background: white; padding: 15px; border-radius: 8px; margin: 10px 0; }
        .button { background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📈 Daily Summary</h1>
            <h2>${new Date().toLocaleDateString()}</h2>
        </div>
        <div class="content">
            <div class="metrics">
                <div class="metric">
                    <div class="metric-value">$${(revenue * 0.01).toFixed(2)}</div>
                    <div>Revenue</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${transactions.toLocaleString()}</div>
                    <div>Transactions</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${alerts}</div>
                    <div>Fraud Alerts</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${exports.length}</div>
                    <div>Exports</div>
                </div>
            </div>
            ${exports.length > 0 ? `
            <div class="exports-list">
                <h3>Generated Exports:</h3>
                <ul>
                    ${exports.map(e => `<li>${e}</li>`).join('')}
                </ul>
            </div>
            ` : ''}
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/dashboard" class="button">View Dashboard</a>
        </div>
        <div class="footer">
            <p>AEON Platform Daily Report</p>
        </div>
    </div>
</body>
</html>
    `.trim()
  }

  /**
   * Generate HTML for system alert emails
   */
  private generateSystemAlertHTML(alertType: string, message: string, details?: any): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>AEON System Alert</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
        .content { background: #fef2f2; padding: 20px; border: 2px solid #dc2626; }
        .footer { background: #374151; color: white; padding: 10px; text-align: center; }
        .alert-icon { font-size: 48px; margin-bottom: 10px; }
        .details { background: #f3f4f6; padding: 15px; border-radius: 4px; margin: 15px 0; }
        .button { background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="alert-icon">🚨</div>
            <h1>CRITICAL SYSTEM ALERT</h1>
            <h2>${alertType.replace('_', ' ').toUpperCase()}</h2>
        </div>
        <div class="content">
            <p><strong>Message:</strong> ${message}</p>
            <p><strong>Time:</strong> ${new Date().toISOString()}</p>
            ${details ? `
            <div class="details">
                <h3>Details:</h3>
                <pre>${JSON.stringify(details, null, 2)}</pre>
            </div>
            ` : ''}
            <p style="color: #dc2626; font-weight: bold;">⚠️ IMMEDIATE ACTION REQUIRED ⚠️</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/dashboard" class="button">Emergency Dashboard</a>
        </div>
        <div class="footer">
            <p>AEON Platform Emergency Alert System</p>
        </div>
    </div>
</body>
</html>
    `.trim()
  }

  /**
   * Format file size for display
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * Test email configuration
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify()
      console.log('✅ Email configuration is valid')
      return true
    } catch (error) {
      console.error('❌ Email configuration failed:', error)
      return false
    }
  }
}

// Export singleton instance (server-side only)
export const emailer = typeof window === 'undefined' ? new Emailer() : null as any
