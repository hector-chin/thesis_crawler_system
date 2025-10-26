import os
import json
import logging
import boto3

logger = logging.getLogger()
logger.setLevel(logging.INFO)

SES_REGION = os.environ.get("AWS_REGION", "us-northeast-1")
ses = boto3.client("ses", region_name=SES_REGION)


def handler(event, context):
    try:
        alarm_message = json.dumps(event, indent=2, default=str)
        to_email = os.environ["TO_EMAIL"]
        source_email = os.environ["SOURCE_EMAIL"]
        subject = os.environ.get(
            "SUBJECT", "ThesisPipeline Alarm Notification")

        resp = ses.send_email(
            Source=source_email,
            Destination={"ToAddresses": [to_email]},
            Message={
                "Subject": {"Data": subject},
                "Body": {"Text": {"Data": "CloudWatch Alarm triggered:\n\n" + alarm_message}}
            }
        )

        logger.info("SES send_email response: %s", resp)
        return {"status": "sent", "response": resp}
    except Exception:
        logger.exception("SES send error")
        raise
