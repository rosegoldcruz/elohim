"""
ReplicateClient - Simple wrapper around Replicate API with polling
"""
from __future__ import annotations

import os
import time
import logging
from typing import Any, Dict, Optional

import replicate

logger = logging.getLogger(__name__)


class ReplicateClient:
    def __init__(self, api_token: Optional[str] = None) -> None:
        self.token = api_token or os.getenv("REPLICATE_API_TOKEN")
        if not self.token:
            raise RuntimeError("REPLICATE_API_TOKEN not configured")
        os.environ["REPLICATE_API_TOKEN"] = self.token
        self._client = replicate.Client(api_token=self.token)

    def run(self, version: str, inputs: Dict[str, Any], timeout_s: int = 600) -> Dict[str, Any]:
        """Run a prediction and wait for completion.
        Returns dict with status, output, logs, id.
        """
        logger.info(f"Replicate run: version={version}")
        prediction = self._client.predictions.create(version=version, input=inputs)
        start = time.time()
        while prediction.status in ("starting", "processing"):
            if time.time() - start > timeout_s:
                raise TimeoutError("Replicate prediction timeout")
            time.sleep(2)
            prediction = self._client.predictions.get(prediction.id)
        logger.info(f"Replicate status={prediction.status}")
        return {
            "id": prediction.id,
            "status": prediction.status,
            "output": prediction.output,
            "logs": prediction.logs,
            "error": getattr(prediction, "error", None),
        }