const { RtcTokenBuilder, RtcRole } = require("agora-access-token");
const Booking = require("../models/Booking");
const APP_ID = "379eda36f4594f8497be07fa4eba6a0c";
const APP_CERTIFICATE = "8c65f495efbe4096918873f245541ffc";
exports.getAgoraToken = async (booking_id, uid, role) => {
    try {
        const { booking_id, uid, role } = req.body;

        if (!booking_id || !uid || !role) {
            return res.status(400).json({ error: 'Missing parameters' });
        }


        const MAX_EXPIRATION = 1 * 60 * 60;
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const privilegeExpiredTs = currentTimestamp + MAX_EXPIRATION;

        const rtcRole = role == 'Doctor' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
        const channelName = `appointment_${booking_id}`;

        const token = RtcTokenBuilder.buildTokenWithAccount(
            APP_ID,
            APP_CERTIFICATE,
            channelName,
            0,
            rtcRole,
            privilegeExpiredTs
        );

        res.json({
            token,
            channelName,
            uid: 0,
            appId: APP_ID,
            expiresAt: privilegeExpiredTs,
        });
    } catch (err) {
        console.error('Token generation error:', err);
        res.status(500).json({ error: 'Failed to generate token' });
    }
};