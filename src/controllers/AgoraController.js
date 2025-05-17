const { RtcTokenBuilder, RtcRole } = require("agora-access-token");
const Booking = require("../models/Booking");
const { getAgoraToken } = require("../middleware/Helper");
const { send_one_to_one_notification } = require("./NotificationController");
const APP_ID = "379eda36f4594f8497be07fa4eba6a0c";
const APP_CERTIFICATE = "8c65f495efbe4096918873f245541ffc";

exports.start_meet = async (req, res) => {
    const { booking_id, call_type } = req.body;
    if (!booking_id) {
        return res.status(403).json({ success: 0, message: "Booking id is invalid" });
    }
    const fdata = {
        _id: booking_id
    }
    const bookng = await Booking.findOne(fdata).populate('doctor', "name email mobile profile_image fcm_token").populate('user', "name email mobile profile_image fcm_token");
    if (!bookng) {
        return res.json({ success: 0, message: "Invalid booking request id" });
    }
    let agora_token = bookng?.agora_token;
    if (!bookng?.agora_token) {
        const uid = req.user._id.toString()
        const urole = req.user.role;
        agora_token = await getAgoraToken(booking_id, uid, urole);
        console.log(agora_token)
        await Booking.findOneAndUpdate({ _id: bookng._id }, { agora_token: agora_token });
    }

    const bodymessage = req.user.role == "User" ? `Your consultation with ${bookng.doctor.name} has started. Join now to begin your session.` : ` "Consultant ${bookng.user.name} has joined the session. Join now to begin.",`
    if (bookng.doctor.fcm_token && bookng.user.fcm_token) {


        const not_obj = {
            ftoken: req.user.role == "User" ? bookng.doctor.fcm_token : bookng.user.fcm_token,
            title: "Greetings from consulto",
            body: bodymessage,
            sound: "callringtone",
            channelId: "AGORACALL",
            data: {
                booking: bookng,
                agora_token: agora_token,
                "channelId": "Incoming Call",
                "action1": "ACCEPT",
                "action2": "DECLINE",
                "call_type": call_type
            }
        }

        await send_one_to_one_notification(not_obj);
    }
    return res.status(200).json({ success: 1, message: "call started", data: bookng, agora_token, APP_CERTIFICATE, APP_ID });

}