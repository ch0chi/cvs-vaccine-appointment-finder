import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import {Notifier} from './notifier.js';
import fs from 'fs';
const notifier = new Notifier();
let intervals = [];
let rawData = fs.readFileSync('./searchAreas.json');
const locations = JSON.parse(rawData);

async function fetchVaccine(ndc,location) {
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
                        "firstDoseDate": location.firstDoseDate,
                        "allocationType": "3"
                    }
                ],
                "searchCriteria":
                    {"addressLine": location.address}
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
            let resMetaData = res.data.responseMetaData;
            let address = location.address;
            let time = new Date();
            let logData = {
                fetchTime: time,
                area: address,
                message: resMetaData.statusDesc
            }
            console.log(JSON.stringify(logData));

            if (resMetaData.statusCode === '0000') {
                const dates = Object.values(res.data.responsePayloadData.availableDates);
                notifier.sendSuccessNotification(location.address,dates).then(() => {
                    wait(location.name); //clear interval because vaccines have been found
                })
            }
        })
        .catch(err => {
            let errMsg = {};
            if(err.response.statusCode){
                errMsg = {
                    "location": location.address,
                    "code":err.response.statusCode,
                    "statusText":err.response.statusText,
                }
            }
            else{
                errMsg = {
                    "location": location.address,
                    "code":"na",
                    "error": err
                }
            }
            console.log(`Error occurred with ${location.name}. Details: ${JSON.stringify(errMsg)}`);
            notifier.sendErrorNotification(location.name,errMsg).then(() => {
                wait(location.name);
            })
        })
}

function getNdcFromVaccine(vaccType) {
    if (vaccType === 'moderna') {
        return ["80777027399"];
    }
    if (vaccType === 'pfizer') {
        return ["59267100002", "59267100003"];
    }
    return "";
}

function start() {
    console.log("Starting...");
    for(let location of locations) {
        let vaccType = getNdcFromVaccine(location.vaccineType);
        intervals[location.name] = setInterval(async () => {
            await fetchVaccine(vaccType,location)
        },parseInt(process.env.REFRESH_TIME)*1000);

    }
}

function stop(intervalName) {
    clearInterval(intervals[intervalName]);
}

async function wait(intervalName,timeout = 900) {
    stop(intervalName);
    let location = locations.find(o => o.name === intervalName);
    let vaccType = getNdcFromVaccine(location.vaccineType);
    intervals[intervalName] = setInterval(async () => {
        await fetchVaccine(vaccType,location);
    },timeout*1000)
}

start();

