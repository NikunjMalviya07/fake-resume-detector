import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export async function sendExperienceVerificationEmail({ to, candidateName, company, role, duration, confirmUrl, denyUrl }) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
      <h2>Work Experience Verification Request</h2>
      <p>This is an automated request from the <strong>Fake Resume Detector</strong> system to verify a candidate's work experience claim.</p>
      <table style="border-collapse: collapse; margin: 16px 0;">
        <tr><td style="padding:4px 8px;"><strong>Candidate</strong></td><td style="padding:4px 8px;">${candidateName}</td></tr>
        <tr><td style="padding:4px 8px;"><strong>Company</strong></td><td style="padding:4px 8px;">${company}</td></tr>
        <tr><td style="padding:4px 8px;"><strong>Role</strong></td><td style="padding:4px 8px;">${role || 'Not specified'}</td></tr>
        <tr><td style="padding:4px 8px;"><strong>Duration</strong></td><td style="padding:4px 8px;">${duration || 'Not specified'}</td></tr>
      </table>
      <p>Please confirm whether this candidate worked at your organization for the stated role/duration:</p>
      <div style="margin: 24px 0;">
        <a href="${confirmUrl}" style="background:#16a34a;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;margin-right:12px;">Yes, Verified</a>
        <a href="${denyUrl}" style="background:#dc2626;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">Not Verified</a>
      </div>
      <p style="color:#6b7280;font-size:12px;">This is a one-time verification link generated for a college mini-project demo.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Fake Resume Detector" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Work Experience Verification Request — ${candidateName}`,
    html
  });
}