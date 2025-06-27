"""
AEON AI Video Generation SaaS Platform - Payments Agent
Based on MIT-licensed ai-video-generator, restructured for 7-agent architecture
License: MIT (see LICENSE file)

Agent 5/7: Payments
- Manages Stripe webhooks and payment processing
- Processes one-time purchases and subscription orders
- Updates user credit balance and subscription status
- Handles refunds and payment failures
"""

import os
import stripe
import logging
from datetime import datetime
from typing import Dict, Any
from models import PaymentRequest, PaymentResponse
from database import db

logger = logging.getLogger(__name__)

class PaymentsAgent:
    def __init__(self):
        self.stripe_secret_key = os.getenv("STRIPE_SECRET_KEY")
        self.stripe_webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")
        
        if not self.stripe_secret_key:
            raise ValueError("STRIPE_SECRET_KEY must be set")
        
        stripe.api_key = self.stripe_secret_key
        self.agent_name = "payments"
        
        # Pricing configuration
        self.pricing = {
            "instant_video": {
                "amount": 29.95,
                "credits": 150,
                "description": "Instant Video Generation (120s)"
            },
            "starter_monthly": {
                "amount": 19.00,
                "credits": 1000,
                "description": "Starter Plan - Monthly"
            },
            "pro_monthly": {
                "amount": 49.00,
                "credits": 3000,
                "description": "Pro Plan - Monthly"
            },
            "business_monthly": {
                "amount": 99.00,
                "credits": 8000,
                "description": "Business Plan - Monthly"
            }
        }
    
    async def create_checkout_session(self, request: PaymentRequest) -> Dict[str, Any]:
        """Create Stripe checkout session for payment"""
        try:
            # Get or create user
            user = await db.get_user_by_email(request.email)
            if not user:
                user = await db.create_user(request.email)
                if not user:
                    raise Exception("Failed to create user")
            
            # Get or create Stripe customer
            stripe_customer_id = await self._get_or_create_stripe_customer(user)
            
            # Create order record
            order = await db.create_order(
                user_id=user["id"],
                product_type=request.product_type,
                amount=request.amount,
                credits_purchased=request.credits or 0,
                video_prompt=request.video_prompt,
                video_duration=request.video_duration
            )
            
            if not order:
                raise Exception("Failed to create order")
            
            # Create Stripe checkout session
            session = await self._create_stripe_session(
                stripe_customer_id,
                request,
                order["id"]
            )
            
            return PaymentResponse(
                success=True,
                checkout_url=session.url,
                order_id=order["id"],
                message="Checkout session created successfully"
            ).model_dump()
            
        except Exception as e:
            logger.error(f"Checkout creation failed: {str(e)}")
            return {
                "success": False,
                "checkout_url": None,
                "order_id": None,
                "message": f"Checkout failed: {str(e)}"
            }
    
    async def handle_webhook(self, webhook_data: Dict[str, Any]) -> bool:
        """Handle Stripe webhook events"""
        try:
            # Verify webhook signature (in production)
            # event = stripe.Webhook.construct_event(
            #     payload, signature, self.stripe_webhook_secret
            # )
            
            event_type = webhook_data.get("type")
            event_data = webhook_data.get("data", {}).get("object", {})
            
            logger.info(f"Processing webhook: {event_type}")
            
            if event_type == "checkout.session.completed":
                await self._handle_checkout_completed(event_data)
            elif event_type == "invoice.payment_succeeded":
                await self._handle_subscription_payment(event_data)
            elif event_type == "customer.subscription.created":
                await self._handle_subscription_created(event_data)
            elif event_type == "customer.subscription.updated":
                await self._handle_subscription_updated(event_data)
            elif event_type == "customer.subscription.deleted":
                await self._handle_subscription_canceled(event_data)
            elif event_type == "payment_intent.payment_failed":
                await self._handle_payment_failed(event_data)
            else:
                logger.info(f"Unhandled webhook event: {event_type}")
            
            return True
            
        except Exception as e:
            logger.error(f"Webhook handling failed: {str(e)}")
            return False
    
    async def _get_or_create_stripe_customer(self, user: Dict[str, Any]) -> str:
        """Get existing or create new Stripe customer"""
        if user.get("stripe_customer_id"):
            return user["stripe_customer_id"]
        
        try:
            customer = stripe.Customer.create(
                email=user["email"],
                name=user.get("full_name", user["email"].split("@")[0]),
                metadata={"user_id": user["id"]}
            )
            
            # Update user with Stripe customer ID
            await db.client.table("users").update({
                "stripe_customer_id": customer.id
            }).eq("id", user["id"]).execute()
            
            return customer.id
            
        except Exception as e:
            logger.error(f"Stripe customer creation failed: {str(e)}")
            raise e
    
    async def _create_stripe_session(self, customer_id: str, request: PaymentRequest, order_id: str) -> stripe.checkout.Session:
        """Create Stripe checkout session"""
        try:
            # Get pricing info
            pricing_key = f"{request.product_type}_monthly" if request.product_type != "video" else "instant_video"
            pricing = self.pricing.get(pricing_key, {
                "amount": request.amount,
                "description": f"{request.product_type.title()} Purchase"
            })
            
            line_items = [{
                "price_data": {
                    "currency": "usd",
                    "product_data": {
                        "name": pricing["description"],
                        "description": f"AEON AI Video Generation - {pricing['description']}"
                    },
                    "unit_amount": int(request.amount * 100)  # Convert to cents
                },
                "quantity": 1
            }]
            
            # Determine mode
            mode = "subscription" if request.product_type in ["starter", "pro", "business"] else "payment"
            
            session = stripe.checkout.Session.create(
                customer=customer_id,
                payment_method_types=["card"],
                line_items=line_items,
                mode=mode,
                success_url=f"{os.getenv('NEXT_PUBLIC_APP_URL')}/success?session_id={{CHECKOUT_SESSION_ID}}",
                cancel_url=f"{os.getenv('NEXT_PUBLIC_APP_URL')}/checkout?canceled=true",
                metadata={
                    "order_id": order_id,
                    "product_type": request.product_type,
                    "credits": str(request.credits or 0)
                }
            )
            
            return session
            
        except Exception as e:
            logger.error(f"Stripe session creation failed: {str(e)}")
            raise e
    
    async def _handle_checkout_completed(self, session_data: Dict[str, Any]):
        """Handle completed checkout session"""
        try:
            order_id = session_data.get("metadata", {}).get("order_id")
            if not order_id:
                logger.error("No order_id in session metadata")
                return
            
            # Update order status
            await db.update_order_status(
                order_id,
                "completed",
                stripe_payment_intent_id=session_data.get("payment_intent"),
                stripe_session_id=session_data.get("id")
            )
            
            # Get order details
            order = await db.client.table("orders").select("*").eq("id", order_id).single().execute()
            if not order.data:
                logger.error(f"Order not found: {order_id}")
                return
            
            order_data = order.data
            
            # Add credits to user account
            if order_data.get("credits_purchased", 0) > 0:
                await db.add_credits(
                    user_id=order_data["user_id"],
                    amount=order_data["credits_purchased"],
                    credit_type="purchase",
                    description=f"Purchase: {order_data['product_type']}",
                    p_order_id=order_id
                )
            
            # If it's a video order, create video record and queue generation
            if order_data.get("video_prompt"):
                video = await db.create_video(
                    user_id=order_data["user_id"],
                    title=f"Video: {order_data['video_prompt'][:50]}...",
                    prompt=order_data["video_prompt"],
                    duration=order_data.get("video_duration", 60)
                )
                
                if video:
                    # Queue video generation (would integrate with scheduler)
                    logger.info(f"Video generation queued: {video['id']}")
            
            logger.info(f"Checkout completed successfully: {order_id}")
            
        except Exception as e:
            logger.error(f"Checkout completion handling failed: {str(e)}")
    
    async def _handle_subscription_payment(self, invoice_data: Dict[str, Any]):
        """Handle successful subscription payment"""
        try:
            customer_id = invoice_data.get("customer")
            subscription_id = invoice_data.get("subscription")
            
            # Get user by Stripe customer ID
            user_result = await db.client.table("users").select("*").eq("stripe_customer_id", customer_id).single().execute()
            if not user_result.data:
                logger.error(f"User not found for customer: {customer_id}")
                return
            
            user = user_result.data
            
            # Get subscription details from Stripe
            subscription = stripe.Subscription.retrieve(subscription_id)
            price_id = subscription["items"]["data"][0]["price"]["id"]
            
            # Determine plan and credits based on price_id
            plan_credits = self._get_plan_credits_by_price_id(price_id)
            
            if plan_credits:
                # Add monthly credits
                await db.add_credits(
                    user_id=user["id"],
                    amount=plan_credits,
                    credit_type="subscription",
                    description=f"Monthly subscription credits"
                )
                
                logger.info(f"Subscription payment processed: {user['id']} - {plan_credits} credits")
            
        except Exception as e:
            logger.error(f"Subscription payment handling failed: {str(e)}")
    
    async def _handle_subscription_created(self, subscription_data: Dict[str, Any]):
        """Handle new subscription creation"""
        try:
            customer_id = subscription_data.get("customer")
            
            # Update user subscription status
            await db.client.table("users").update({
                "subscription_status": "active",
                "subscription_tier": self._get_tier_from_subscription(subscription_data)
            }).eq("stripe_customer_id", customer_id).execute()
            
            logger.info(f"Subscription created for customer: {customer_id}")
            
        except Exception as e:
            logger.error(f"Subscription creation handling failed: {str(e)}")
    
    async def _handle_subscription_updated(self, subscription_data: Dict[str, Any]):
        """Handle subscription updates"""
        try:
            customer_id = subscription_data.get("customer")
            status = subscription_data.get("status")
            
            # Update user subscription status
            await db.client.table("users").update({
                "subscription_status": status,
                "subscription_tier": self._get_tier_from_subscription(subscription_data)
            }).eq("stripe_customer_id", customer_id).execute()
            
            logger.info(f"Subscription updated for customer: {customer_id} - {status}")
            
        except Exception as e:
            logger.error(f"Subscription update handling failed: {str(e)}")
    
    async def _handle_subscription_canceled(self, subscription_data: Dict[str, Any]):
        """Handle subscription cancellation"""
        try:
            customer_id = subscription_data.get("customer")
            
            # Update user subscription status
            await db.client.table("users").update({
                "subscription_status": "canceled",
                "subscription_tier": "free"
            }).eq("stripe_customer_id", customer_id).execute()
            
            logger.info(f"Subscription canceled for customer: {customer_id}")
            
        except Exception as e:
            logger.error(f"Subscription cancellation handling failed: {str(e)}")
    
    async def _handle_payment_failed(self, payment_intent_data: Dict[str, Any]):
        """Handle failed payment"""
        try:
            payment_intent_id = payment_intent_data.get("id")
            
            # Find and update order
            order_result = await db.client.table("orders").select("*").eq("stripe_payment_intent_id", payment_intent_id).single().execute()
            if order_result.data:
                await db.update_order_status(order_result.data["id"], "failed")
                logger.info(f"Payment failed for order: {order_result.data['id']}")
            
        except Exception as e:
            logger.error(f"Payment failure handling failed: {str(e)}")
    
    def _get_plan_credits_by_price_id(self, price_id: str) -> int:
        """Get credits amount based on Stripe price ID"""
        # This would map Stripe price IDs to credit amounts
        # For now, return default amounts
        price_credit_map = {
            "starter": 1000,
            "pro": 3000,
            "business": 8000
        }
        
        # Extract plan from price_id (simplified)
        for plan, credits in price_credit_map.items():
            if plan in price_id.lower():
                return credits
        
        return 0
    
    def _get_tier_from_subscription(self, subscription_data: Dict[str, Any]) -> str:
        """Extract subscription tier from subscription data"""
        try:
            price_id = subscription_data["items"]["data"][0]["price"]["id"]
            
            if "starter" in price_id.lower():
                return "starter"
            elif "pro" in price_id.lower():
                return "pro"
            elif "business" in price_id.lower():
                return "business"
            else:
                return "free"
                
        except Exception:
            return "free"
