import { NextApiRequest, NextApiResponse } from 'next'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'
import path from 'path'
import { SchedulerAgentRequest, SchedulerAgentResponse } from '../../../types/aeon'

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs')
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
}

const sentLogPath = path.join(logsDir, 'sent.json')

interface SentLog {
  delivery_id: string
  final_video_url: string
  metadata: any
  sent_at: string
  delivery_method: string
  recipient: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SchedulerAgentResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { final_video_url, metadata }: SchedulerAgentRequest = req.body

    if (!final_video_url || typeof final_video_url !== 'string') {
      return res.status(400).json({ error: 'final_video_url is required and must be a string' })
    }

    if (!metadata) {
      return res.status(400).json({ error: 'metadata is required' })
    }

    console.log(`Scheduler agent: Processing delivery for video ${final_video_url}`)

    // Generate delivery ID
    const deliveryId = uuidv4()
    const sentAt = new Date().toISOString()

    // Simulate delivery process
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1500))

    // Create delivery log entry
    const logEntry: SentLog = {
      delivery_id: deliveryId,
      final_video_url: final_video_url,
      metadata: metadata,
      sent_at: sentAt,
      delivery_method: 'dashboard', // Could be 'email', 'webhook', etc.
      recipient: metadata.user_email || 'dashboard@aeon.ai'
    }

    // Read existing logs
    let existingLogs: SentLog[] = []
    try {
      if (fs.existsSync(sentLogPath)) {
        const logData = fs.readFileSync(sentLogPath, 'utf8')
        existingLogs = JSON.parse(logData)
      }
    } catch (readError) {
      console.warn('Could not read existing sent logs:', readError)
      existingLogs = []
    }

    // Add new log entry
    existingLogs.push(logEntry)

    // Keep only last 1000 entries to prevent file from growing too large
    if (existingLogs.length > 1000) {
      existingLogs = existingLogs.slice(-1000)
    }

    // Write updated logs
    try {
      fs.writeFileSync(sentLogPath, JSON.stringify(existingLogs, null, 2))
    } catch (writeError) {
      console.error('Could not write sent logs:', writeError)
      // Continue anyway - logging failure shouldn't break delivery
    }

    /* REAL DELIVERY IMPLEMENTATIONS - Uncomment as needed:
    
    // Email delivery
    if (metadata.delivery_method === 'email') {
      const nodemailer = require('nodemailer')
      
      const transporter = nodemailer.createTransporter({
        // Configure your email service
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      })
      
      await transporter.sendMail({
        from: 'noreply@aeon.ai',
        to: metadata.user_email,
        subject: 'Your AEON video is ready! 🎬',
        html: `
          <h2>Your video is ready!</h2>
          <p>Your AEON-generated video has been processed and is ready for download.</p>
          <p><a href="${final_video_url}" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Download Video</a></p>
          <p>Video details:</p>
          <ul>
            <li>Topic: ${metadata.topic || 'N/A'}</li>
            <li>Duration: ${metadata.duration || 'N/A'} seconds</li>
            <li>Generated: ${sentAt}</li>
          </ul>
        `
      })
    }
    
    // Webhook delivery
    if (metadata.delivery_method === 'webhook' && metadata.webhook_url) {
      await axios.post(metadata.webhook_url, {
        event: 'video_ready',
        delivery_id: deliveryId,
        final_video_url: final_video_url,
        metadata: metadata,
        sent_at: sentAt
      }, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'AEON-Scheduler/1.0'
        },
        timeout: 10000
      })
    }
    
    // Slack notification
    if (metadata.delivery_method === 'slack' && metadata.slack_webhook) {
      await axios.post(metadata.slack_webhook, {
        text: `🎬 Your AEON video is ready!`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Your video is ready for download!*\n\n*Topic:* ${metadata.topic || 'N/A'}\n*Duration:* ${metadata.duration || 'N/A'} seconds`
            }
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'Download Video'
                },
                url: final_video_url,
                style: 'primary'
              }
            ]
          }
        ]
      })
    }
    
    */

    const response: SchedulerAgentResponse = {
      status: 'sent',
      sent_at: sentAt,
      delivery_id: deliveryId
    }

    console.log(`Scheduler agent: Delivery completed with ID ${deliveryId}`)

    return res.status(200).json(response)

  } catch (error) {
    console.error('Scheduler agent error:', error)
    
    if (error instanceof Error) {
      return res.status(500).json({ error: `Video delivery failed: ${error.message}` })
    }
    
    return res.status(500).json({ error: 'Video delivery failed due to an unknown error' })
  }
}

export const config = {
  api: {
    responseLimit: '1mb',
  },
}
