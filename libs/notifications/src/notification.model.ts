enum NotificationType {
  Email, // 0
  Push, // 1
  Sms,
  All,
}
export class Attachment {
  filename: string;
  content: any;
}

export class AppNotification {
  type: [NotificationType] = [NotificationType.All];
  destinations: [string];
  subject: string;
  htmlBody: string;
  pushBody: string;
  pushData: any;
  smsBody: string;
  files?: Attachment[];
  /**
   * Constructor
   *
   * @param notification
   */
  constructor(notification?) {
    notification = notification || {};
    this.type = notification.type || [NotificationType.All];
    this.destinations = notification.destinations || null;
    this.subject = notification.subject || null;
    this.htmlBody = notification.htmlBody || null;
    this.pushBody = notification.pushBody || null;
    this.smsBody = notification.smsBody || null;
    this.pushData = notification.pushData || null;
  }

  public toString = (): string => {
    return `AppNotification (type: ${this.type},destinations:${this.destinations},subject:${this.subject})`;
  };
}
