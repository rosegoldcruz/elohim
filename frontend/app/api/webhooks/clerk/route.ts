import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { syncClerkUserToSupabase } from '@/lib/auth/clerk-supabase-sync'

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    })
  }

  // Get the ID and type
  const { id } = evt.data;
  const eventType = evt.type;

  console.log(`Webhook with and ID of ${id} and type of ${eventType}`)
  console.log('Webhook body:', body)

  // Handle the webhook
  switch (eventType) {
    case 'user.created':
      try {
        // Convert UserJSON to User-like object for sync function
        const userData = {
          id: evt.data.id,
          emailAddresses: evt.data.email_addresses || [],
          firstName: evt.data.first_name || '',
          lastName: evt.data.last_name || '',
          imageUrl: evt.data.image_url || '',
        }
        await syncClerkUserToSupabase(userData as any)
        console.log('User synced to Supabase:', evt.data.id)
      } catch (error) {
        console.error('Failed to sync user to Supabase:', error)
        return new Response('Failed to sync user', { status: 500 })
      }
      break
    case 'user.updated':
      try {
        // Convert UserJSON to User-like object for sync function
        const userData = {
          id: evt.data.id,
          emailAddresses: evt.data.email_addresses || [],
          firstName: evt.data.first_name || '',
          lastName: evt.data.last_name || '',
          imageUrl: evt.data.image_url || '',
        }
        await syncClerkUserToSupabase(userData as any)
        console.log('User updated in Supabase:', evt.data.id)
      } catch (error) {
        console.error('Failed to update user in Supabase:', error)
        return new Response('Failed to update user', { status: 500 })
      }
      break
    case 'user.deleted':
      // Handle user deletion if needed
      console.log('User deleted:', evt.data.id)
      break
    default:
      console.log(`Unhandled event type: ${eventType}`)
  }

  return NextResponse.json({ success: true })
} 