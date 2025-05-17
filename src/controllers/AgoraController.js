const { RtcTokenBuilder, RtcRole } = require("agora-access-token");
const Booking = require("../models/Booking");
const { getAgoraToken } = require("../middleware/Helper");
const { send_one_to_one_notification } = require("./NotificationController");
const APP_ID = "379eda36f4594f8497be07fa4eba6a0c";
const APP_CERTIFICATE = "8c65f495efbe4096918873f245541ffc";

exports.start_meet = async (req, res) => {
    const { booking_id, call_type } = req.body;
    if (!request_id) {
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
        agora_token = await getAgoraToken({ booking_id, uid: req.user._id, role: req.user.role });
        await Booking.findOneAndUpdate({ _id: bookng._id }, { agora_token: agora_token });
    }
    // await send_one_to_one_notification(
    //     data?.user?.fcm_token,
    //     "Greetings from consulto",
    //     "Your consultation with " + data.doctor.name + " has started. Join now to begin your session.",
    //     "callringtone",
    //     "CONSULTOCALL",
    //     {
    //         // "reservation_id" : request_id , 
    //         // "doctor" : data.doctor._id.toString(),
    //         // "user" : data.user._id.toString()
    //         "user_image": data?.user?.image?.file ? data?.user?.image?.file : "",
    //         "doctor_image": data?.doctor?.image?.file ? data?.doctor?.image?.file : "",
    //         "doctor_id": data.doctor._id.toString(),
    //         "doctor_name": data?.doctor?.name,
    //         "user_id": data.user._id.toString(),
    //         "user_name": data?.user?.name,
    //         "meet_token": token,
    //         "request_id": request_id.toString(),
    //         "specialization": data?.specialization?.name,
    //         "type": data?.type,
    //         "click_action": "FLUTTER_NOTIFICATION_CLICK",
    //         "sound": "ringtone",
    //         "slot": data?.slot?.name,
    //         "channelId": "Incoming Call",
    //         "action1": "ACCEPT",
    //         "action2": "DECLINE",
    //         "call_type": call_type

    //     }
    // )
    const bodymessage = req.user.role == "User" ? `Your consultation with ${bookng.doctor.name} has started. Join now to begin your session.` : ` "Consultant ${bookng.user.name} has joined the session. Join now to begin.",`
    const not_obj = {
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
    return res.status(200).json({ success: 1, message: "call started", data: bookng, agora_token });

}