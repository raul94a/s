const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const nodemailer = require('nodemailer')
const fs = require('fs/promises');

/**
 * 
 * @returns {nodemailer.Transporter<SMTPTransport.SentMessageInfo>}
 */
function getTransport() {
    // Credenciales de la clave de API
    const credentials = {
        client_id: process.env.EMAIL_CLIENT_ID,
        client_secret: process.env.EMAIL_CLIENT_SECRET,
        // redirect_uris: ['TU_URI_DE_REDIRECCION'],
    };
    const myOAuth2Client = new OAuth2(
        credentials.client_id, credentials.client_secret, 'https://developers.google.com/oauthplayground');

    // Generate an authentication URL and print it to the console
    // const authUrl = myOAuth2Client.generateAuthUrl({
    //     access_type: 'offline',
    //     scope: SCOPES,
    // });
    //    console.log('Authorize this app by visiting this URL:', authUrl);
    myOAuth2Client.setCredentials({ access_token: process.env.EMAIL_ACCESS_TOKEN })

    myOAuth2Client.setCredentials({
        refresh_token: process.env.EMAIL_REFRESH_TOKEN

    })
    // const myAccessToken =  myOAuth2Client.getAccessToken()
    const transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
            type: "OAuth2",

            user: "raul.albin.alba@gmail.com", //your gmail account you used to set the project up in google cloud console"
            clientId: credentials.client_id,
            clientSecret: credentials.client_secret,
            refreshToken: process.env.EMAIL_REFRESH_TOKEN,
            accessToken: process.env.EMAIL_ACCESS_TOKEN //access token variable we defined earlier
        }
    });
    return transport;
}

/**
 * 
 * @param {string} email 
 * @param {string} username,
 * @param {string} eventName
 * @param {string} verificationCode
 */
async function sendValidationEmail(email, verificationCode,userId) {
    // Credenciales de la clave de API
    const url = `http://192.168.1.114:3000/auth/user/${userId}/validate/${verificationCode}`;
    const credentials = {
        client_id: process.env.EMAIL_CLIENT_ID,
        client_secret: process.env.EMAIL_CLIENT_SECRET,
        // redirect_uris: ['TU_URI_DE_REDIRECCION'],
    };
    const myOAuth2Client = new OAuth2(
        credentials.client_id, credentials.client_secret, 'https://developers.google.com/oauthplayground/');

    // Generate an authentication URL and print it to the console
    // const authUrl = myOAuth2Client.generateAuthUrl({
    //     access_type: 'offline',
    //     scope: SCOPES,
    // });
    //    console.log('Authorize this app by visiting this URL:', authUrl);
    

    myOAuth2Client.setCredentials({
        refresh_token: process.env.EMAIL_REFRESH_TOKEN

    })
    // const myAccessToken =  myOAuth2Client.getAccessToken()
    const transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
            type: "OAuth2",

            user: "raul.albin.alba@gmail.com", //your gmail account you used to set the project up in google cloud console"
            clientId: credentials.client_id,
            clientSecret: credentials.client_secret,
            refreshToken: process.env.EMAIL_REFRESH_TOKEN,
            accessToken: process.env.EMAIL_ACCESS_TOKEN //access token variable we defined earlier
        }
    });

    const html = await parseHTML(
        './src/views/email/invitation_email.html', {
        '${title}': 'Te has registrado correctamente en la App',
        '${body}': 'Para validar tu cuenta, introduce el siguiente código de verificación en la App.',
        '${code}': url
    }
    );

    const mailOptions = {
        from:
            'Validación de cuenta <raul.albin.alba@gmail.com>',


        to: email, // receiver
        subject: 'Completa tu registro', // Subject
        html: html// html body
    }
    transport.sendMail(mailOptions, (err, result) => {
        if (err) {
            console.log(err)
        } else {
            transport.close();
            // res.send({
            //     message: 'Email has been sent: check your inbox!'
            // })
        }

    })
}


/**
 * 
 * @param {string} email 
 * @param {string} username,
 * @param {string} eventName
 * @param {string} verificationCode
 */
async function sendInvitationEmail(email, username, eventName, verificationCode) {

    const transport = getTransport();

    const html = await parseHTML(
        './src/views/email/invitation_email.html', {
        '${title}': 'Has sido invitado a un evento',
        '${body}': 'Para aceptar la invitación, introduce el siguiente código de verificación en la App.',
        '${code}': verificationCode
    }
    );



    const mailOptions = {
        from:
            'Evento <raul.albin.alba@gmail.com>',


        to: email, // receiver
        subject: 'Has sido invitado a un evento', // Subject
        html: html// html body
    }
    transport.sendMail(mailOptions, (err, result) => {
        if (err) {
            console.log(err)
        } else {
            transport.close();
            // res.send({
            //     message: 'Email has been sent: check your inbox!'
            // })
        }

    })
}

/**
 * @param {string} path
 * @param {{}} replacer 
 * @returns {Promise<string>}
 */
async function parseHTML(path, replacer) {
    const keys = Object.keys(replacer)
    console.log(keys)
    let html = await fs.readFile(path, { encoding: 'utf-8' })
    for (let key of keys) {

        html = html.replace(key, replacer[key])
    }
    return html;

}

module.exports = {
    sendValidationEmail: sendValidationEmail,
    sendInvitationEmail: sendInvitationEmail
}