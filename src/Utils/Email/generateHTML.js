export const template = (code, firstName, lastName ,subject) => `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border: 1px solid #dddddd;
      border-radius: 8px;
      overflow: hidden;
    }
    .email-header {
      background-color: #007BFF;
      color: #ffffff;
      text-align: center;
      padding: 20px;
    }
    .email-header h1 {
      margin: 0;
      font-size: 24px;
    }
    .email-body {
      padding: 20px;
      color: #333333;
      line-height: 1.6;
    }
    .email-body h2 {
      margin-top: 0;
      color: #007BFF;
    }
    .activation-button {
      display: inline-block;
      background-color: #007BFF;
      color: #ffffff !important;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 5px;
      font-size: 16px;
      margin: 20px 0;
    }
    .activation-button:hover {
      background-color: #0056b3;
    }
    .email-footer {
      text-align: center;
      padding: 15px;
      background-color: #f4f4f4;
      font-size: 14px;
      color: #777777;
    }
    .email-footer a {
      color: #007BFF;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>${subject}</h1>
    </div>
    <div class="email-body">
      <h2>Hello ${firstName} ${lastName},</h2>
      <p>Thank you for signing up with Route Academy. To complete your registration and start using your account, please get code to activate your account:</p>
      <h2 class="activation-button">${code}</h2>
      <p>If you did not sign up for this account, please ignore this email.</p>
      <p>Best regards,<br>Sara7a Application Team</p>
    </div>
    <div class="email-footer">
      <p>&copy; 2025 @ Route Academy. All rights reserved.</p>
      <p><a href="[SupportLink]">Contact Support</a> | <a href="[UnsubscribeLink]">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`;

export const loginVerificationTemplate = (otp, firstName, lastName, subject) => `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border: 1px solid #dddddd;
      border-radius: 8px;
      overflow: hidden;
    }
    .email-header {
      background-color: #FF5733;
      color: #ffffff;
      text-align: center;
      padding: 20px;
    }
    .email-header h1 {
      margin: 0;
      font-size: 24px;
    }
    .email-body {
      padding: 20px;
      color: #333333;
      line-height: 1.6;
    }
    .email-body h2 {
      margin-top: 0;
      color: #FF5733;
    }
    .otp-box {
      display: inline-block;
      background-color: #FF5733;
      color: #ffffff !important;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 5px;
      font-size: 22px;
      margin: 20px 0;
      font-weight: bold;
      letter-spacing: 3px;
    }
    .email-footer {
      text-align: center;
      padding: 15px;
      background-color: #f4f4f4;
      font-size: 14px;
      color: #777777;
    }
    .email-footer a {
      color: #FF5733;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>${subject}</h1>
    </div>

    <div class="email-body">
      <h2>Hello ${firstName} ${lastName},</h2>

      <p>We detected a <strong>login attempt from a new or unrecognized device/IP address</strong>.</p>

      <p>If this was you, please confirm your login using the verification code below:</p>

      <div class="otp-box">${otp}</div>

      <p>If this wasn’t you, someone may be trying to access your account.  
      For your safety, we recommend changing your password immediately.</p>

      <p>Best regards,<br>Sara7a Application Team</p>
    </div>

    <div class="email-footer">
      <p>&copy; 2024 Sara7a Application. All rights reserved.</p>
      <p><a href="[SupportLink]">Contact Support</a> | <a href="[UnsubscribeLink]">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`;

export const suspiciousAttemptTemplate = (firstName, lastName, subject) => `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
    .email-container {
      max-width: 600px; margin: 20px auto; background: #fff;
      border-radius: 8px; border: 1px solid #ddd; overflow: hidden;
    }
    .email-header { background: #C70039; color: #fff; text-align: center; padding: 20px; }
    .email-header h1 { margin: 0; font-size: 24px; }
    .email-body { padding: 20px; color: #333; line-height: 1.6; }
    .email-body h2 { color: #C70039; margin-top: 0; }
    .email-footer {
      background: #f4f4f4; text-align: center; padding: 15px;
      font-size: 14px; color: #777;
    }
    a { color: #C70039; text-decoration: none; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header"><h1>${subject}</h1></div>

    <div class="email-body">
      <h2>Hello ${firstName} ${lastName},</h2>

      <p>There was an <strong>invalid login attempt</strong> from an unrecognized device.</p>

      <p>If this wasn’t you, someone may be trying to access your account.</p>

      <p><strong>We strongly recommend changing your password immediately</strong>
      to keep your account secure.</p>

      <p>Best regards,<br>Sara7a Application Team</p>
    </div>

    <div class="email-footer">
      &copy; 2024 Sara7a App — All rights reserved.
      <br><a href="[SupportLink]">Contact Support</a>
    </div>
  </div>
</body>
</html>`;
