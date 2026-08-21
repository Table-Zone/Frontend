/**
 * Bank transfer details shown on the subscription payment screens.
 *
 * Held on the frontend rather than fetched from the API so updating them only
 * needs a frontend deploy.
 */
export const BANK_DETAILS = {
  bankName: 'Al Rajhi Bank',
  accountName: 'OSAMA ALYOUSEF',
  accountNumber: '663000010006086011759',
  iban: 'SA48 8000 0663 6080 1601 1759',
  swift: 'RJHISARI',
  qrImage: '/bank-qr.png',
};
