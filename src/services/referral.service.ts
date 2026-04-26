import { apiClient } from './api.service';
import type {
  ReferralInvite,
  ReferralStats,
  ReferralResponse,
  ShareTemplate,
  ReferralInvitePayload,
} from '../types/referral.types';

class ReferralService {
  private baseUrl = '/auth/referral';

  // Get referral data: link, stats, and history
  async getReferralData(): Promise<ReferralResponse> {
    try {
      const response = await apiClient.get(`${this.baseUrl}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching referral data:', error);
      throw error;
    }
  }

  // Get referral stats only
  async getReferralStats(): Promise<ReferralStats> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching referral stats:', error);
      throw error;
    }
  }

  // Get referral history
  async getReferralHistory(
    limit: number = 10,
    offset: number = 0
  ): Promise<ReferralInvite[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/history`, {
        params: { limit, offset },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching referral history:', error);
      throw error;
    }
  }

  // Send invite to specific email
  async sendInvite(email: string, referralCode: string): Promise<void> {
    try {
      const payload: ReferralInvitePayload = {
        referralCode,
        inviteeEmail: email,
      };
      await apiClient.post(`${this.baseUrl}/invite`, payload);
    } catch (error) {
      console.error('Error sending invite:', error);
      throw error;
    }
  }

  // Get social share templates
  getShareTemplates(
    referralLink: string,
    userName: string
  ): Record<string, ShareTemplate> {
    return {
      whatsapp: {
        platform: 'whatsapp',
        message: `Hey! 👋 I'm using MentorsMind to connect with amazing mentors. Join me and get exclusive rewards! Check it out: ${referralLink}`,
        url: `https://wa.me/?text=${encodeURIComponent(
          `Hey! 👋 I'm using MentorsMind to connect with amazing mentors. Join me and get exclusive rewards! Check it out: ${referralLink}`
        )}`,
      },
      twitter: {
        platform: 'twitter',
        message: `🚀 Just joined MentorsMind - connecting with amazing mentors has never been easier! Use my referral link and get rewards: ${referralLink} #MentorsMind`,
        url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          `🚀 Just joined MentorsMind - connecting with amazing mentors has never been easier! Use my referral link and get rewards: ${referralLink} #MentorsMind`
        )}`,
      },
      email: {
        platform: 'email',
        subject: `${userName} invited you to join MentorsMind`,
        message: `Hey!

I'm using MentorsMind to connect with amazing mentors and thought you'd love it too!

MentorsMind is the perfect place to find experienced mentors for career guidance, skill development, and personal growth.

Join using my referral link and we both get exclusive rewards:
${referralLink}

Looking forward to seeing you there!

Best regards,
${userName}`,
        url: `mailto:?subject=${encodeURIComponent(
          `${userName} invited you to join MentorsMind`
        )}&body=${encodeURIComponent(
          `Hey!\n\nI'm using MentorsMind to connect with amazing mentors and thought you'd love it too!\n\nMentorsMind is the perfect place to find experienced mentors for career guidance, skill development, and personal growth.\n\nJoin using my referral link and we both get exclusive rewards:\n${referralLink}\n\nLooking forward to seeing you there!\n\nBest regards,\n${userName}`
        )}`,
      },
    };
  }

  // Copy to clipboard utility
  async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      return false;
    }
  }

  // Generate shortened referral link for display
  formatReferralLink(link: string): string {
    try {
      const url = new URL(link);
      return `${url.hostname}/ref/${url.searchParams.get('ref') || 'link'}`;
    } catch {
      return link;
    }
  }

  // Mask email for privacy
  maskEmail(email: string): string {
    const [localPart, domain] = email.split('@');
    if (!localPart || !domain) return email;

    const visibleChars = Math.max(1, Math.floor(localPart.length / 3));
    const masked =
      localPart.substring(0, visibleChars) +
      '*'.repeat(localPart.length - visibleChars);

    return `${masked}@${domain}`;
  }
}

export const referralService = new ReferralService();
