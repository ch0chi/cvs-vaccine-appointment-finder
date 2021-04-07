import axios from 'axios';
import {Notifier} from './notifier.js';
const ndc = getNdcFromVaccine();
const notifier = new Notifier();
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
                notifier.sendSuccessNotification().then(() => {
                    wait(); //clear interval because vaccines have been found
                })
            }
        })
        .catch(err => {
            console.log(err.error);
            notifier.sendErrorNotification().then(() => {
                stop();//todo is this even needed?
                process.exit(0);
            })
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

async function start() {
    interval = setInterval(await fetchVaccine, parseInt(process.env.REFRESH_TIME)*1000);
}

function stop() {
    clearInterval(interval);
}

async function wait() {
    stop();
    interval = setInterval(await fetchVaccine, 600000)
}

start()
    .then(() => {
        console.log("Starting...")
    })

