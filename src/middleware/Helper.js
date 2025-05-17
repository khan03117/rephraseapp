const { RtcTokenBuilder, RtcRole } = require("agora-access-token");
const Booking = require("../models/Booking");
const APP_ID = "379eda36f4594f8497be07fa4eba6a0c";
const APP_CERTIFICATE = "8c65f495efbe4096918873f245541ffc";
exports.getAgoraToken = async (booking_id, uid, role) => {
    try {
        console.log({ booking_id });

        const channelName = `appointment_${booking_id}`;

        const booking = await Booking.findById(booking_id);
        if (!booking) {
            throw new Error("Booking not found");
        }

        const durationInSeconds = (booking.duration || 30) * 60; // default to 30 mins
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const privilegeExpiredTs = currentTimestamp + durationInSeconds;

        const rtcRole = role === "Doctor" ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

        // Debug log to verify expiration values
        console.log({
            currentTimestamp,
            privilegeExpiredTs,
            expiresInSeconds: privilegeExpiredTs - currentTimestamp,
        });

        // Use buildTokenWithAccount for string UIDs like MongoDB ObjectId
        const token = RtcTokenBuilder.buildTokenWithAccount(
            APP_ID,
            APP_CERTIFICATE,
            channelName,
            0,
            rtcRole,
            privilegeExpiredTs
        );

        return {
            token,
            uid: uid.toString(),
            channelName,
            appId: APP_ID
        };
    } catch (err) {
        console.error("Error generating Agora token:", err.message);
        throw new Error("Could not generate Agora token.");
    }
};