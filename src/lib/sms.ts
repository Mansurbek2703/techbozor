import { PurchaseRequest, Offer, Seller } from '@/types';
import { getSellers, addSMSLog } from './storage';

export const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://savdo.mcode.uz';

/**
 * Xaridor yangi talab joylashtirganda mos sotuvchilarni topadi va SMS yuboradi:
 * 1. Sotuvchi akkaunti faol va bloklanmagan
 * 2. Kategoriya mos keladi
 * 3. Viloyat sotuvchining xizmat hududiga kiradi
 */
export async function notifySellersAboutNewRequest(request: PurchaseRequest): Promise<{ notifiedCount: number; sellers: string[] }> {
  const allSellers = getSellers();

  const matchingSellers = allSellers.filter((seller) => {
    if (seller.isBlocked) return false;
    // Hudud tekshiruvi
    const matchesRegion = seller.regions.includes(request.region);
    // Kategoriya tekshiruvi
    const matchesCategory = seller.categories.length === 0 || seller.categories.includes(request.category);
    return matchesRegion && matchesCategory;
  });

  const notifiedNames: string[] = [];

  for (const seller of matchingSellers) {
    const budgetFormatted = (request.budget / 1000000).toLocaleString('uz-UZ') + ' mln so‘mgacha';
    const link = `${APP_BASE_URL}/seller/dashboard?req=${request.id}`;
    
    // SMS matni
    const smsText = `Yangi talab: ${budgetFormatted} ${request.description.slice(0, 30)}... Hudud: ${request.region}. Talabni ko‘rish va taklif yuborish: ${link}`;

    // Log & Send
    addSMSLog({
      recipientPhone: seller.phone,
      recipientType: 'seller',
      recipientName: seller.shopName || seller.ownerName,
      message: smsText,
      status: 'delivered',
      costSoM: 65,
      relatedRequestId: request.id,
    });

    notifiedNames.push(seller.shopName || seller.ownerName);
  }

  return {
    notifiedCount: matchingSellers.length,
    sellers: notifiedNames,
  };
}

/**
 * Sotuvchi taklif yuborganda xaridorga SMS yuborish:
 * «Sizning talabingizga yangi taklif: Samsung Smart TV — 4 800 000 so‘m. Batafsil: [havola]»
 */
export async function notifyBuyerAboutNewOffer(offer: Offer, request: PurchaseRequest): Promise<void> {
  const priceFormatted = offer.price.toLocaleString('uz-UZ') + ' so‘m';
  const link = `${APP_BASE_URL}/request/${request.id}`;
  
  const smsText = `Sizning talabingizga yangi taklif: ${offer.productName} — ${priceFormatted}. Sotuvchi: ${offer.sellerShopName}. Batafsil ko‘rish: ${link}`;

  addSMSLog({
    recipientPhone: request.buyerPhone,
    recipientType: 'buyer',
    recipientName: request.buyerName,
    message: smsText,
    status: 'delivered',
    costSoM: 65,
    relatedRequestId: request.id,
    relatedOfferId: offer.id,
  });
}
