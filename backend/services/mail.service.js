import nodemailer from "nodemailer";

// =====================================================
// GMAIL SMTP TRANSPORTER
// =====================================================

const transporter = nodemailer.createTransport({

    // Do NOT use service: "gmail" here.
    // We are explicitly using port 587 + STARTTLS.

    host: "smtp.gmail.com",

    port: 587,

    secure: false,

    requireTLS: true,

    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },

    // =================================================
    // IMPORTANT FOR PRODUCTION
    // Prevent SMTP request from hanging forever
    // =================================================

    connectionTimeout: 10000,

    greetingTimeout: 10000,

    socketTimeout: 15000

});


// =====================================================
// VERIFY SMTP CONNECTION
// =====================================================

export const verifyMailConnection = async () => {

    try {

        await transporter.verify();

        console.log(
            "EMAIL SERVICE: SMTP connection successful"
        );

    } catch (error) {

        console.error(
            "EMAIL SERVICE ERROR:",
            error.message
        );

    }

};


// =====================================================
// SEND OTP EMAIL
//
// PURPOSE:
// "password-reset"
// "registration"
// =====================================================

export const sendOTPEmail = async (
    email,
    otp,
    purpose = "password-reset"
) => {

    try {

        // =============================================
        // DETERMINE EMAIL PURPOSE
        // =============================================

        const isRegistration =
            purpose === "registration";


        // =============================================
        // SUBJECT
        // =============================================

        const subject =
            isRegistration
                ? "Verify your Our Memo account"
                : "Your Our Memo Password Reset OTP";


        // =============================================
        // HEADING
        // =============================================

        const heading =
            isRegistration
                ? "Verify your email"
                : "Reset your password";


        // =============================================
        // DESCRIPTION
        // =============================================

        const description =
            isRegistration
                ? "Use the verification code below to verify your email and complete your Our Memo account registration."
                : "We received a request to reset your Our Memo account password.";


        // =============================================
        // FOOTER
        // =============================================

        const footer =
            isRegistration
                ? "If you did not create an Our Memo account, you can safely ignore this email."
                : "If you did not request a password reset, you can safely ignore this email.";


        // =============================================
        // MAIL OPTIONS
        // =============================================

        const mailOptions = {

            from:
                `"Our Memo" <${process.env.SMTP_USER}>`,

            to:
                email,

            subject:
                subject,

            html: `

                <div style="
                    font-family: Arial, sans-serif;
                    max-width: 520px;
                    margin: 0 auto;
                    padding: 30px;
                    background: #ffffff;
                    color: #111111;
                ">

                    <h2 style="
                        margin: 0 0 10px;
                    ">
                        ${heading}
                    </h2>


                    <p style="
                        color: #666666;
                        line-height: 1.6;
                    ">
                        ${description}
                    </p>


                    <div style="
                        margin: 25px 0;
                        padding: 22px;
                        text-align: center;
                        background: #f5f5f5;
                        border-radius: 12px;
                    ">

                        <p style="
                            margin: 0 0 10px;
                            color: #777777;
                            font-size: 12px;
                        ">
                            YOUR VERIFICATION CODE
                        </p>


                        <strong style="
                            font-size: 32px;
                            letter-spacing: 8px;
                        ">
                            ${otp}
                        </strong>

                    </div>


                    <p style="
                        color: #666666;
                        line-height: 1.6;
                    ">
                        This OTP is valid for
                        <strong>10 minutes</strong>.
                    </p>


                    <p style="
                        color: #999999;
                        font-size: 12px;
                        line-height: 1.5;
                    ">
                        ${footer}
                    </p>

                </div>

            `

        };


        // =============================================
        // SEND EMAIL
        // =============================================

        console.log(
            "OTP EMAIL: Sending email to:",
            email
        );


        const info =
            await transporter.sendMail(
                mailOptions
            );


        // =============================================
        // SUCCESS
        // =============================================

        console.log(
            "OTP EMAIL SENT:",
            info.messageId
        );


        return info;


    } catch (error) {

        // =============================================
        // EMAIL ERROR
        // =============================================

        console.error(
            "SEND OTP EMAIL ERROR:",
            error
        );


        throw error;

    }

};


// =====================================================
// EXPORT TRANSPORTER
// =====================================================

export default transporter;