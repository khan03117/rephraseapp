const { firebaseAdmin } = require("../../firebaseAuth");
exports.send_one_to_one_notification = async (ftoken, title, body, sound = "default", channelId = "rephrase", data = null) => {
    try {
        const message = {
            notification: {
                title: title,
                body: body,
            },
            android: {
                notification: {
                    sound: sound,
                    channelId: channelId,
                    clickAction: "ACCEPT"
                },
            },
            apns: {
                payload: {
                    aps: {
                        sound: sound,
                    },
                },
            },
            data: data,
            token: ftoken,
        };
        firebaseAdmin.messaging()
            .send(message)
            .then((response) => {
                console.log('Successfully sent message:', response);
            })
            .catch((error) => {
                // console.log('Error sending message:', error);
            });
    } catch (err) {
        console.log({ err: err.message })
    }
}
exports.send_one_to_many_notification = async (ftoken, title, body, sound = "default", channelId = "Consulto", data = null) => {

    const message = {
        notification: {
            title: title,
            body: body,
        },
        android: {
            notification: {
                sound: sound,
                channelId: channelId,
                clickAction: "FLUTTER_NOTIFICATION_CLICK"
            },
        },
        apns: {
            payload: {
                aps: {
                    sound: sound,
                },
            },
        },
        data: data,
    };
    registrationTokens.map(token => {

        console.log("token----", token)

        const messageWithToken = { ...message, token };
        admin.messaging().send(messageWithToken).then((response) => {

            // console.log('Successfully sent message:', response);
        })
            .catch((error) => {
                // console.log('Error sending message:', error);
            });
        console.log("s")
    })

}