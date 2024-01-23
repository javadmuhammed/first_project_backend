let axios = require("axios").default
const { urlencoded } = require("express");

function sendOTPSMS(username, numbers, OTP) {


    let api_id = "NzkwNzg4NzI1MQ";
    let senderid = "CNTSMS";	//Your sender id
    let mess = `Dear ${username}, you OTP is ${OTP}. Thank you for using our service - CNTSMS`;
    let tempid="1707162253174837192"
    let dltid=""

    let message = encodeURI(mess);


    // return Promise.resolve("suc")

    return axios.get(`https://app.smsbits.in/api/web?id=${api_id}&senderid=${senderid}&to=${numbers}&msg=${message}&port=TA&dltid=${dltid}&tempid=${tempid}`)
}


module.exports = {
    sendOTPSMS
}