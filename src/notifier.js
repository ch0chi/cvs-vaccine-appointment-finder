import {IncomingWebhook} from "@slack/webhook";

export const Notifier = class Notifier {
    slackWebhook;

    //todo implement twilio texting and refactor
    constructor() {
        this.slackWebhook = new IncomingWebhook(process.env.SLACK_WEBHOOK_URL);
    }

    async sendSuccessNotification(location,dates) {

        await this.slackWebhook.send({
            "text": "<!channel> Vaccine Found!",
            "attachments": [
                {
                    "text": `Location: ${location}.\n Available dates: ${dates}`
                }
            ]
        });
    }

    async sendErrorNotification() {
        await this.slackWebhook.send({
            "text": "<!channel> Error Detected!",
            "attachments": [
                {
                    "text": `An error occurred while running the script, and the script has exited. Check the logs for more information`
                }
            ]
        });
    }
}

