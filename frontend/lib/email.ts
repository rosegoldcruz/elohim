// EmailJS Configuration (placeholder)
export const EMAIL_CONFIG = {
  serviceId: undefined,
  templateId: undefined,
  publicKey: 'YOUR_EMAILJS_PUBLIC_KEY', // You'll need to add this to your env
}

// Email templates
export const EMAIL_TEMPLATES = {
  WELCOME: 'welcome_template',
  VIDEO_COMPLETE: 'video_complete_template',
  CREDIT_LOW: 'credit_low_template',
  SUBSCRIPTION_REMINDER: 'subscription_reminder_template',
} as const

// Helper function to send email via EmailJS
export async function sendEmail(
  templateParams: Record<string, any>,
  templateId?: string
) {
  try {
    // This would typically use the EmailJS SDK
    // For now, we'll use a fetch request to their API
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: EMAIL_CONFIG.serviceId,
        template_id: templateId,
        user_id: EMAIL_CONFIG.publicKey,
        template_params: templateParams,
      }),
    })

    if (!response.ok) {
      throw new Error(`EmailJS API error: ${response.statusText}`)
    }

    return { success: true, message: 'Email sent successfully' }
  } catch (error) {
    console.error('Email sending failed:', error)
    throw error
  }
}

// Specific email functions
export async function sendWelcomeEmail(userEmail: string, userName: string) {
  return sendEmail(
    {
      to_email: userEmail,
      to_name: userName,
      subject: 'Welcome to AEON - Your AI Video Creation Journey Begins!',
      message: `Hi ${userName}, welcome to AEON! You're now ready to create amazing AI-generated videos.`,
    },
    EMAIL_TEMPLATES.WELCOME
  )
}

export async function sendVideoCompleteEmail(
  userEmail: string,
  userName: string,
  projectTitle: string,
  videoUrl: string
) {
  return sendEmail(
    {
      to_email: userEmail,
      to_name: userName,
      subject: `Your AEON video "${projectTitle}" is ready!`,
      message: `Hi ${userName}, your video "${projectTitle}" has been generated successfully!`,
      video_url: videoUrl,
      project_title: projectTitle,
    },
    EMAIL_TEMPLATES.VIDEO_COMPLETE
  )
}

export async function sendCreditLowEmail(
  userEmail: string,
  userName: string,
  remainingCredits: number
) {
  return sendEmail(
    {
      to_email: userEmail,
      to_name: userName,
      subject: 'AEON Credits Running Low',
      message: `Hi ${userName}, you have ${remainingCredits} credits remaining. Consider upgrading your plan to continue creating videos.`,
      remaining_credits: remainingCredits,
    },
    EMAIL_TEMPLATES.CREDIT_LOW
  )
}

export async function sendSubscriptionReminderEmail(
  userEmail: string,
  userName: string,
  planName: string,
  renewalDate: string
) {
  return sendEmail(
    {
      to_email: userEmail,
      to_name: userName,
      subject: `AEON ${planName} Plan Renewal Reminder`,
      message: `Hi ${userName}, your ${planName} plan will renew on ${renewalDate}.`,
      plan_name: planName,
      renewal_date: renewalDate,
    },
    EMAIL_TEMPLATES.SUBSCRIPTION_REMINDER
  )
}
