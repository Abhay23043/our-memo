import { Resend } from "resend";

// =====================================================
// RESEND EMAIL SERVICE
// =====================================================

const resend = new Resend(
    process.env.RESEND_API_KEY
);


// =====================================================
// VERIFY EMAIL SERVICE
// =====================================================

export const verifyMailConnection = async () => {

    try {

        if (!process.env.RESEND_API_KEY) {

            console.error(
                "EMAIL SERVICE ERROR: RESEND_API_KEY is missing"
            );

            return;

        }

        console.log(
            "EMAIL SERVICE: Resend API configured successfully"
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
        // CHECK API KEY
        // =============================================

        if (!process.env.RESEND_API_KEY) {

            throw new Error(
                "RESEND_API_KEY is not configured"
            );

        }


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
        // FROM EMAIL
        // =============================================

        /*
            RESEND_FROM_EMAIL should be configured
            in Render Environment Variables.

            Example:

            Our Memo <onboarding@resend.dev>

            OR, after verifying your own domain:

            Our Memo <noreply@yourdomain.com>
        */

        const fromEmail =
            process.env.RESEND_FROM_EMAIL ||
            "Our Memo <onboarding@resend.dev>";

        const mailOptions = {

            from: fromEmail,

            to: email,

            subject: subject,

            html: html

        };
        // =============================================
        // EMAIL HTML
        // =============================================

        const html = `

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


                <hr style="
                    border: none;
                    border-top: 1px solid #eeeeee;
                    margin: 30px 0;
                ">


                <p style="
                    color: #999999;
                    font-size: 11px;
                    text-align: center;
                ">
                    Our Memo
                </p>

            </div>

        `;


        // =============================================
        // LOG
        // =============================================

        console.log(
            "OTP EMAIL: Sending email to:",
            email
        );


        console.log(
            "OTP EMAIL: Purpose:",
            purpose
        );


        // =============================================
        // SEND EMAIL USING RESEND API
        // =============================================

        const { data, error } =
            await resend.emails.send({

                from:
                    fromEmail,

                to:
                    [email],

                subject:
                    subject,

                html:
                    html

            });


        // =============================================
        // HANDLE RESEND ERROR
        // =============================================

        if (error) {

            console.error(
                "RESEND EMAIL ERROR:",
                error
            );

            throw new Error(
                error.message ||
                "Failed to send email"
            );

        }


        // =============================================
        // SUCCESS
        // =============================================

        console.log(
            "OTP EMAIL SENT:",
            data?.id
        );


        return data;


    } catch (error) {

        // =============================================
        // FINAL ERROR
        // =============================================

        console.error(
            "SEND OTP EMAIL ERROR:",
            error
        );


        throw error;

    }

};


// =====================================================
// DEFAULT EXPORT
// =====================================================

export default resend;