var unirest = require("unirest");
const sendSMS = ({ message = "", numbers = [] }) => new Promise((resolve, reject) => {
    var req = unirest("POST", "https://www.fast2sms.com/dev/bulkV2");


    req.headers({
        "authorization": process.env.SMS_API_KEY
    });

    req.form({
        "sender_id": message,
        "message": "YOUR_MESSAGE_ID",
        "variables_values": "123456787|asdaswdx",
        "route": "dlt",
        "numbers": numbers,
    });

    req.end(function (res) {
        if (res.error) {
            console.log(res.error)
            reject(res.error)
        }

        console.log(res.body);
        resolve(true)
    });
})


