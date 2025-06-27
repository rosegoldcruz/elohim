from fastapi import APIRouter, Request, HTTPException
import stripe
import os

router = APIRouter()
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

@router.post("/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    try:
        event = stripe.Webhook.construct_event(payload, sig_header, os.getenv("STRIPE_WEBHOOK_SECRET"))
        if event["type"] == "checkout.session.completed":
            session = event["data"]["object"]
            # Handle logic: grant credits, mark job, notify, etc.
        return {"status": "received"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))