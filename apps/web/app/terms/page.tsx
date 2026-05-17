import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — Table Zone',
  description: 'Terms of Service for Table Zone.',
};

const termsHtml = `<style>
  [data-custom-class='body'], [data-custom-class='body'] * {
    background: transparent !important;
  }
  [data-custom-class='title'], [data-custom-class='title'] * {
    font-family: Arial !important;
    font-size: 26px !important;
    color: #000000 !important;
  }
  [data-custom-class='subtitle'], [data-custom-class='subtitle'] * {
    font-family: Arial !important;
    color: #595959 !important;
    font-size: 14px !important;
  }
  [data-custom-class='heading_1'], [data-custom-class='heading_1'] * {
    font-family: Arial !important;
    font-size: 19px !important;
    color: #000000 !important;
  }
  [data-custom-class='heading_2'], [data-custom-class='heading_2'] * {
    font-family: Arial !important;
    font-size: 17px !important;
    color: #000000 !important;
  }
  [data-custom-class='body_text'], [data-custom-class='body_text'] * {
    font-family: Arial !important;
    font-size: 14px !important;
    color: #595959 !important;
  }
  [data-custom-class='link'], [data-custom-class='link'] * {
    color: #3030F1 !important;
    font-size: 14px !important;
    font-family: Arial !important;
    word-break: break-word !important;
  }
</style>

<div data-custom-class="body">
  <div><strong><span data-custom-class="title">TERMS OF SERVICE</span></strong></div>
  <div><span data-custom-class="subtitle">Last updated: May 18, 2025</span></div>
  <br/>

  <div data-custom-class="body_text">
    Welcome to Table Zone. By accessing or using our platform — including our website at
    <a href="https://www.tablezone.net" data-custom-class="link">www.tablezone.net</a> and our mobile application
    (collectively, the "Service") — you agree to be bound by these Terms of Service ("Terms").
    Please read them carefully before using the Service.
  </div>
  <br/>

  <div data-custom-class="heading_1"><strong>1. ACCEPTANCE OF TERMS</strong></div>
  <div data-custom-class="body_text">
    By creating an account or using the Service in any way, you confirm that you are at least 18 years old,
    have the authority to agree to these Terms on behalf of yourself or your organisation, and agree to
    comply with all applicable laws and regulations, including those of the Kingdom of Saudi Arabia.
  </div>
  <br/>

  <div data-custom-class="heading_1"><strong>2. DESCRIPTION OF SERVICE</strong></div>
  <div data-custom-class="body_text">
    Table Zone is a SaaS platform that helps restaurant and café staff manage table occupancy and timing
    in real time. The Service is available via web browser and iOS mobile application. Features include
    live table timers, team management, and workspace configuration.
  </div>
  <br/>

  <div data-custom-class="heading_1"><strong>3. ACCOUNTS AND WORKSPACES</strong></div>
  <div data-custom-class="body_text">
    You must register for an account to use the Service. You are responsible for maintaining the
    confidentiality of your login credentials and for all activity that occurs under your account.
    Each account belongs to a workspace. The workspace owner is responsible for managing team members
    and their access. You must notify us immediately of any unauthorised use of your account.
  </div>
  <br/>

  <div data-custom-class="heading_1"><strong>4. SUBSCRIPTIONS AND BILLING</strong></div>
  <div data-custom-class="body_text">
    Access to certain features requires an active paid subscription. Subscriptions are managed exclusively
    through our website. We offer monthly and quarterly plans. All fees are stated at the time of purchase
    and are non-refundable unless required by applicable law. We reserve the right to change pricing with
    reasonable notice. Your subscription will remain active until cancelled or expired.
  </div>
  <br/>

  <div data-custom-class="heading_1"><strong>5. ACCEPTABLE USE</strong></div>
  <div data-custom-class="body_text">
    You agree not to:
    <ul>
      <li>Use the Service for any unlawful purpose or in violation of these Terms</li>
      <li>Attempt to gain unauthorised access to any part of the Service or its infrastructure</li>
      <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
      <li>Transmit any harmful, offensive, or disruptive content through the Service</li>
      <li>Use automated scripts or bots to access the Service without our written permission</li>
      <li>Resell or sublicense the Service to third parties without our prior written consent</li>
    </ul>
  </div>
  <br/>

  <div data-custom-class="heading_1"><strong>6. INTELLECTUAL PROPERTY</strong></div>
  <div data-custom-class="body_text">
    All content, trademarks, logos, software, and materials associated with Table Zone are the exclusive
    property of Table Zone or its licensors. Nothing in these Terms grants you any right to use our
    intellectual property without prior written permission. You retain ownership of any data you input
    into the Service.
  </div>
  <br/>

  <div data-custom-class="heading_1"><strong>7. DATA AND PRIVACY</strong></div>
  <div data-custom-class="body_text">
    Your use of the Service is also governed by our
    <a href="/privacy" data-custom-class="link">Privacy Policy</a>, which is incorporated into these Terms
    by reference. We collect and process personal data (such as your name and email address) solely to
    provide and improve the Service. We use authentication cookies and local storage for session management.
    We do not sell your data to third parties.
  </div>
  <br/>

  <div data-custom-class="heading_1"><strong>8. AVAILABILITY AND MODIFICATIONS</strong></div>
  <div data-custom-class="body_text">
    We strive to keep the Service available at all times but do not guarantee uninterrupted access.
    We may modify, suspend, or discontinue any part of the Service at any time with or without notice.
    We may also update these Terms from time to time. Continued use of the Service after changes are
    posted constitutes your acceptance of the updated Terms.
  </div>
  <br/>

  <div data-custom-class="heading_1"><strong>9. DISCLAIMER OF WARRANTIES</strong></div>
  <div data-custom-class="body_text">
    The Service is provided "as is" and "as available" without warranties of any kind, either express or
    implied. To the fullest extent permitted by law, Table Zone disclaims all warranties including
    merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that the
    Service will be error-free or that defects will be corrected.
  </div>
  <br/>

  <div data-custom-class="heading_1"><strong>10. LIMITATION OF LIABILITY</strong></div>
  <div data-custom-class="body_text">
    To the maximum extent permitted by applicable law, Table Zone shall not be liable for any indirect,
    incidental, special, consequential, or punitive damages arising out of or related to your use of the
    Service, even if we have been advised of the possibility of such damages. Our total liability to you
    for any claim shall not exceed the amount you paid us in the three months preceding the claim.
  </div>
  <br/>

  <div data-custom-class="heading_1"><strong>11. TERMINATION</strong></div>
  <div data-custom-class="body_text">
    We reserve the right to suspend or terminate your account at any time if you violate these Terms or
    engage in conduct we deem harmful to the Service or other users. You may close your account at any
    time from your profile settings. Upon termination, your data will be deleted in accordance with our
    Privacy Policy.
  </div>
  <br/>

  <div data-custom-class="heading_1"><strong>12. GOVERNING LAW</strong></div>
  <div data-custom-class="body_text">
    These Terms are governed by and construed in accordance with the laws of the Kingdom of Saudi Arabia.
    Any disputes arising from or relating to these Terms or the Service shall be subject to the exclusive
    jurisdiction of the competent courts of the Kingdom of Saudi Arabia.
  </div>
  <br/>

  <div data-custom-class="heading_1"><strong>13. CONTACT US</strong></div>
  <div data-custom-class="body_text">
    If you have any questions about these Terms, please contact us at:
    <br/><br/>
    <strong>Table Zone</strong><br/>
    Kingdom of Saudi Arabia<br/>
    Email: <a href="mailto:support@tablezone.net" data-custom-class="link">support@tablezone.net</a><br/>
    Website: <a href="https://www.tablezone.net" data-custom-class="link">www.tablezone.net</a>
  </div>
</div>`;

export default function TermsPage() {
  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px' }}>
      <div dangerouslySetInnerHTML={{ __html: termsHtml }} />
    </main>
  );
}
