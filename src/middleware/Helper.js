const { RtcTokenBuilder, RtcRole } = require("agora-access-token");
const Booking = require("../models/Booking");
const APP_ID = "379eda36f4594f8497be07fa4eba6a0c";
const APP_CERTIFICATE = "8c65f495efbe4096918873f245541ffc";
exports.getAgoraToken = async (booking_id, uid, role) => {
    try {
        const channelName = `appointment_${booking_id}`;
        const booking = await Booking.findOne({ _id: booking_id });
        const duration = booking.duration * 60;
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const privilegeExpiredTs = currentTimestamp + duration;
        const rtcRole = role == "Doctor" ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
        const token = RtcTokenBuilder.buildTokenWithUid(
            APP_ID,
            APP_CERTIFICATE,
            channelName,
            uid,
            rtcRole,
            privilegeExpiredTs
        );
        const data = { token, uid, channelName, appId: APP_ID };

        return data;
    } catch (err) {
        console.log({ message: err.message })
    }

}