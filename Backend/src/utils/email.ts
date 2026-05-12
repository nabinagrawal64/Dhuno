import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

const getTransporter = () => {
    if (!transporter) {
        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASS;

        if (!user || !pass) {
            throw new Error("SMTP credentials are not configured");
        }

        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false,
            auth: {
                user,
                pass,
            },
        });
    }
    return transporter;
};

export const sendResetOTP = async ( to: string, otp: string, fullName: string ): Promise<void> => {
    await getTransporter().sendMail({
        from: `"Dhuno 🎧" <${process.env.SMTP_USER}>`,
        to,
        subject: "Your Dhuno Password Reset Code",
        html: `
            <div style="font-family:'Segoe UI',sans-serif;background:#0f131b;color:#fff;padding:40px;border-radius:16px;max-width:480px;margin:0 auto;">
                <h1 style="color:#5affda;margin:0 0 4px;">🎧 Dhuno</h1>
                <p style="color:#64748b;margin:0 0 32px;font-size:13px;">Music for everyone</p>

                <h2 style="margin:0 0 16px;">Password Reset Code</h2>
                <p style="color:#cbd5e1;">Hi <strong>${fullName}</strong>,</p>
                <p style="color:#cbd5e1;">Use the code below to reset your password. It expires in <strong>10 minutes</strong>.</p>

                <div style="background:#1c2027;border:1px solid rgba(90,255,218,0.15);border-radius:12px;padding:28px;text-align:center;margin:28px 0;">
                    <span style="font-size:42px;font-weight:900;letter-spacing:14px;color:#5affda;">${otp}</span>
                </div>

                <p style="color:#64748b;font-size:13px;">If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.</p>

                <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:28px 0;" />
                <p style="color:#475569;font-size:12px;text-align:center;">© ${new Date().getFullYear()} Dhuno · All rights reserved</p>
            </div>
        `,
    });
};
