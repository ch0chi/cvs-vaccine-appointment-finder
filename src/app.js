const axios = require('axios');
const {IncomingWebhook} = require('@slack/webhook');
const ndc = getNdcFromVaccine();
const webhook = new IncomingWebhook(process.env.SLACK_WEBHOOK_URL);
let interval = null;

async function fetchVaccine() {
    let payload = {
        "requestMetaData":
            {
                "appName": "CVS_WEB",
                "lineOfBusiness": "RETAIL",
                "channelName": "WEB",
                "deviceType": "DESKTOP",
                "deviceToken": "7777",
                "apiKey": "a2ff75c6-2da7-4299-929d-d670d827ab4a",
                "source": "ICE_WEB",
                "securityType": "apiKey",
                "responseFormat": "JSON",
                "type": "cn-dep"
            },
        "requestPayloadData":
            {
                "selectedImmunization": ["CVD"],
                "distanceInMiles": 100,
                "imzData": [
                    {
                        "imzType": "CVD",
                        "ndc": ndc,
                        "firstDoseDate": process.env.FIRST_DOSE_DATE,
                        "allocationType": "3"
                    }
                ],
                "searchCriteria":
                    {"addressLine": process.env.ADDRESS}
            }
    };
    let headers = {
        headers: {
            "User-Agent": 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:85.0) Gecko/20100101 Firefox/85.0',
            "Accept": "application/json",
            "Accept-Language": "en-US,en;q=0.5",
            "Origin": "http://www.cvs.com"
        }
    }
    await axios.post('https://www.cvs.com/Services/ICEAGPV1/immunization/1.0.0/getIMZStores', payload, headers)
        .then(res => {
            console.log(res.data);
            let resMetaData = res.data.responseMetaData;
            if (resMetaData.statusCode === '0000') {
                sendSlackNotification();
                stop(); //clear interval because vaccines have been found
            }
        })
        .catch(err => {
            console.log(err.error);
            stop();
        })
}

function getNdcFromVaccine() {
    const vaccType = process.env.VACCINE_TYPE;

    if (vaccType === 'moderna') {
        return ["80777027399"];
    }
    if (vaccType === 'pfizer') {
        return ["59267100002", "59267100003"];
    }
    return "";
}

async function sendSlackNotification() {
    await webhook.send({
        "text": "Vaccine Found!",
        "attachments": [
            {
                "text": `<!channel> Appointments have been found within 35 miles of ${process.env.ADDRESS}`
            }
        ]
    });
}

async function start() {
    interval = setInterval(await fetchVaccine, parseInt(process.env.REFRESH_TIME));
}

function stop() {
    clearInterval(interval);
}

start()
    .then(() => {
        console.log("Starting...")
    })

