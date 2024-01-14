import nconf from 'nconf'
import mailer from 'nodemailer'
import smtpTransport from 'nodemailer-smtp-transport'
import Mail from 'nodemailer/lib/mailer'

// eslint-disable-next-line import/prefer-default-export
export async function sendEmail({
  to,
  text,
  subject,
}: Pick<Mail.Options, 'to' | 'text' | 'subject'>) {
  const transport = mailer.createTransport(
    smtpTransport({
      service: nconf.get('MAILER_SERVICE'),
      auth: {
        user: nconf.get('MAILER_EMAIL_ADDRESS'),
        pass: nconf.get('secrets').MAILER_EMAIL_APP_PASSWORD,
      },
    })
  )
  const mailOptions: Mail.Options = {
    from: nconf.get('MAILER_EMAIL_ADDRESS'),
    to,
    subject, // 이메일 제목
    text, // 이메일 내용
  }
  const sendEmailPromise = () =>
    new Promise((resolve, reject) => {
      transport.sendMail(mailOptions, (err, info) => {
        if (err) {
          reject(err)
        }
        resolve(info)
      })
    })

  const res = await sendEmailPromise()
  return res
}
