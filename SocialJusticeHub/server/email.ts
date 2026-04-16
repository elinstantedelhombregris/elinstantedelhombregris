import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Default sender — Resend free tier uses onboarding@resend.dev
// For production, set RESEND_FROM to your verified domain address
const DEFAULT_FROM = process.env.RESEND_FROM || '¡BASTA! <onboarding@resend.dev>';

export class EmailService {
  async sendVerificationEmail(email: string, token: string, name: string): Promise<void> {
    const verificationUrl = this.getVerificationUrl(token);

    if (!resend) {
      console.log('📧 Resend not configured. Verification link:', verificationUrl);
      return;
    }

    const { error } = await resend.emails.send({
      from: DEFAULT_FROM,
      to: email,
      subject: '¡Bienvenido a ¡BASTA! — Verificá tu email',
      html: this.getVerificationEmailTemplate(name, verificationUrl),
    });

    if (error) {
      console.error('Failed to send verification email:', error);
      throw new Error('Failed to send verification email');
    }

    console.log('📧 Verification email sent to', email);
  }

  async sendPasswordResetEmail(email: string, token: string, name: string): Promise<void> {
    const resetUrl = this.getPasswordResetUrl(token);

    if (!resend) {
      console.log('📧 Resend not configured. Password reset link:', resetUrl);
      return;
    }

    const { error } = await resend.emails.send({
      from: DEFAULT_FROM,
      to: email,
      subject: 'Recuperación de Contraseña — ¡BASTA!',
      html: this.getPasswordResetEmailTemplate(name, resetUrl),
    });

    if (error) {
      console.error('Failed to send password reset email:', error);
      throw new Error('Failed to send password reset email');
    }

    console.log('📧 Password reset email sent to', email);
  }

  async sendPostInteractionNotification(
    receiverEmail: string,
    receiverName: string,
    senderName: string,
    postTitle: string,
    interactionType: string
  ): Promise<void> {
    if (!resend) {
      console.log('📧 Resend not configured. Interaction notification would be sent to:', receiverEmail);
      return;
    }

    const { error } = await resend.emails.send({
      from: DEFAULT_FROM,
      to: receiverEmail,
      subject: `Nueva ${interactionType} en tu publicación — ¡BASTA!`,
      html: this.getPostInteractionNotificationTemplate(receiverName, senderName, postTitle, interactionType),
    });

    if (error) {
      console.error('Failed to send post interaction notification:', error);
      throw new Error('Failed to send post interaction notification');
    }

    console.log('📧 Post interaction notification sent to', receiverEmail);
  }

  async sendNewMessageNotification(
    receiverEmail: string,
    receiverName: string,
    senderName: string,
    messageSubject: string
  ): Promise<void> {
    if (!resend) {
      console.log('📧 Resend not configured. Message notification would be sent to:', receiverEmail);
      return;
    }

    const { error } = await resend.emails.send({
      from: DEFAULT_FROM,
      to: receiverEmail,
      subject: 'Nuevo mensaje en la comunidad — ¡BASTA!',
      html: this.getNewMessageNotificationTemplate(receiverName, senderName, messageSubject),
    });

    if (error) {
      console.error('Failed to send new message notification:', error);
      throw new Error('Failed to send new message notification');
    }

    console.log('📧 New message notification sent to', receiverEmail);
  }

  async sendPostStatusChangeNotification(
    receiverEmail: string,
    receiverName: string,
    postTitle: string,
    newStatus: string
  ): Promise<void> {
    if (!resend) {
      console.log('📧 Resend not configured. Status change notification would be sent to:', receiverEmail);
      return;
    }

    const { error } = await resend.emails.send({
      from: DEFAULT_FROM,
      to: receiverEmail,
      subject: 'Estado de tu publicación actualizado — ¡BASTA!',
      html: this.getPostStatusChangeNotificationTemplate(receiverName, postTitle, newStatus),
    });

    if (error) {
      console.error('Failed to send post status change notification:', error);
      throw new Error('Failed to send post status change notification');
    }

    console.log('📧 Post status change notification sent to', receiverEmail);
  }

  private getVerificationUrl(token: string): string {
    const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
    return `${baseUrl}/verify-email?token=${token}`;
  }

  private getPasswordResetUrl(token: string): string {
    const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
    return `${baseUrl}/reset-password?token=${token}`;
  }

  private getVerificationEmailTemplate(name: string, verificationUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Bienvenido a ¡BASTA!, ${name}!</h1>
          </div>
          <div class="content">
            <p>Gracias por registrarte en nuestra plataforma de cambio social.</p>
            <p>Para completar tu registro y activar tu cuenta, por favor verificá tu dirección de email haciendo clic en el siguiente botón:</p>
            <p style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verificar mi Email</a>
            </p>
            <p>O copiá y pegá este enlace en tu navegador:</p>
            <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
            <p><strong>Este enlace expirará en 24 horas.</strong></p>
            <p>Si no creaste esta cuenta, podés ignorar este email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 ¡BASTA! — Movimiento de Cambio Social</p>
            <p>Este es un email automático, por favor no respondas.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getPasswordResetEmailTemplate(name: string, resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #f5576c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Recuperación de Contraseña</h1>
          </div>
          <div class="content">
            <p>Hola ${name},</p>
            <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en ¡BASTA!.</p>
            <p>Para crear una nueva contraseña, hacé clic en el siguiente botón:</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
            </p>
            <p>O copiá y pegá este enlace en tu navegador:</p>
            <p style="word-break: break-all; color: #f5576c;">${resetUrl}</p>
            <div class="warning">
              <strong>Importante:</strong>
              <ul>
                <li>Este enlace expirará en 1 hora</li>
                <li>Solo podés usar este enlace una vez</li>
                <li>Si no solicitaste este cambio, ignorá este email</li>
              </ul>
            </div>
            <p>Si no solicitaste restablecer tu contraseña, tu cuenta está segura y podés ignorar este mensaje.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 ¡BASTA! — Movimiento de Cambio Social</p>
            <p>Este es un email automático, por favor no respondas.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getPostInteractionNotificationTemplate(
    receiverName: string,
    senderName: string,
    postTitle: string,
    interactionType: string
  ): string {
    const interactionText = {
      'apply': 'postulación',
      'interest': 'interés',
      'volunteer': 'voluntariado',
      'save': 'guardado'
    }[interactionType] || interactionType;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .highlight { background: #e8f4f8; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Nueva ${interactionText} en tu publicación</h1>
          </div>
          <div class="content">
            <p>Hola ${receiverName},</p>
            <p>Alguien ha mostrado ${interactionText} en tu publicación.</p>

            <div class="highlight">
              <strong>Publicación:</strong> ${postTitle}<br>
              <strong>Usuario:</strong> ${senderName}<br>
              <strong>Acción:</strong> ${interactionText}
            </div>

            <p>Esto significa que tu publicación está generando interés en la comunidad.</p>

            <p style="text-align: center;">
              <a href="${process.env.BASE_URL || 'http://localhost:5173'}/community" class="button">Ver en la Comunidad</a>
            </p>

            <p>Podés gestionar todas las interacciones desde tu panel de control.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 ¡BASTA! — Movimiento de Cambio Social</p>
            <p>Este es un email automático, por favor no respondas.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getNewMessageNotificationTemplate(
    receiverName: string,
    senderName: string,
    messageSubject: string
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #f5576c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .highlight { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Tenés un nuevo mensaje</h1>
          </div>
          <div class="content">
            <p>Hola ${receiverName},</p>
            <p>Alguien de la comunidad te ha enviado un mensaje.</p>

            <div class="highlight">
              <strong>Asunto:</strong> ${messageSubject}<br>
              <strong>De:</strong> ${senderName}
            </div>

            <p>No te olvides de responder para mantener la comunicación activa.</p>

            <p style="text-align: center;">
              <a href="${process.env.BASE_URL || 'http://localhost:5173'}/community/messages" class="button">Ver Mensaje</a>
            </p>
          </div>
          <div class="footer">
            <p>&copy; 2025 ¡BASTA! — Movimiento de Cambio Social</p>
            <p>Este es un email automático, por favor no respondas.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getPostStatusChangeNotificationTemplate(
    receiverName: string,
    postTitle: string,
    newStatus: string
  ): string {
    const statusText = {
      'badge': 'pausado',
      'closed': 'cerrado',
      'active': 'activo'
    }[newStatus] || newStatus;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #4facfe; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .highlight { background: #e3f2fd; padding: 15px; border-left: 4px solid #2196f3; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Estado de tu publicación actualizado</h1>
          </div>
          <div class="content">
            <p>Hola ${receiverName},</p>
            <p>El estado de tu publicación ha sido actualizado.</p>

            <div class="highlight">
              <strong>Publicación:</strong> ${postTitle}<br>
              <strong>Nuevo Estado:</strong> ${statusText}
            </div>

            <p>Podés revisar y gestionar tu publicación desde tu panel de control.</p>

            <p style="text-align: center;">
              <a href="${process.env.BASE_URL || 'http://localhost:5173'}/community/my-posts" class="button">Ver Mis Publicaciones</a>
            </p>
          </div>
          <div class="footer">
            <p>&copy; 2025 ¡BASTA! — Movimiento de Cambio Social</p>
            <p>Este es un email automático, por favor no respondas.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export const emailService = new EmailService();
