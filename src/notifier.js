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

    async sendErrorNotification(locationName, error) {
        let formattedError = JSON.stringify(error);
        await this.slackWebhook.send({
            "blocks": [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `<!channel> There was an error with *${locationName}*, and the script has exited`
                    },

                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "`" + formattedError + "`"
                    }
                }
            ]
        });
    }
}

