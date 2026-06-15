import dotenv from 'dotenv';
dotenv.config();

import pool from './client';

const faqs = [
  { category: 'Shipping', question: 'What are your shipping options?', answer: 'We offer Standard shipping (5–7 business days, free on orders over $50) and Express shipping (2 business days, $9.99). Same-day delivery is available in select cities.', priority: 10 },
  { category: 'Shipping', question: 'Do you ship internationally?', answer: "Yes, we ship to 30+ countries. International orders typically take 7–14 business days. Import duties may apply and are the customer's responsibility.", priority: 9 },
  { category: 'Returns', question: 'What is your return policy?', answer: "We offer hassle-free 30-day returns on all non-personalized items. Items must be unused and in original packaging. We'll email you a prepaid return label.", priority: 10 },
  { category: 'Returns', question: 'What items cannot be returned?', answer: 'Personalized and engraved items are final sale. Gift wrapping fees are non-refundable. Perishable items cannot be returned.', priority: 8 },
  { category: 'Orders', question: 'How do I track my order?', answer: "You'll receive a tracking link via email within 24 hours of shipment. You can also check your order status at bloombasket.com/orders.", priority: 9 },
  { category: 'Orders', question: 'Can I cancel or change my order?', answer: 'Orders can be modified or cancelled within 2 hours of placement. After that, please wait for delivery and initiate a return if needed.', priority: 8 },
  { category: 'Payments', question: 'What payment methods do you accept?', answer: 'We accept Visa, Mastercard, Amex, PayPal, Apple Pay, Google Pay, Shop Pay, UPI, and Razorpay. All transactions are SSL encrypted.', priority: 8 },
  { category: 'Support', question: 'What are your support hours?', answer: 'Our support team is available Monday–Saturday, 9 AM to 6 PM IST. For urgent issues, this live chat provides the fastest response.', priority: 9 },
  { category: 'Support', question: 'How do I contact you?', answer: 'You can reach us via this live chat (fastest), email at support@bloombasket.com, or call +91-80-4567-8901 during business hours.', priority: 9 },
  { category: 'Products', question: 'Do you offer a quality guarantee?', answer: "Yes, all Bloom & Basket products come with a 1-year quality guarantee. If anything arrives damaged or breaks under normal use, we'll replace it free of charge.", priority: 7 },
  { category: 'Products', question: 'Are your products ethically sourced?', answer: 'Yes. We partner exclusively with artisans and manufacturers who meet our ethical sourcing standards — fair wages, safe working conditions, and sustainable materials.', priority: 6 },
  { category: 'Promotions', question: 'Do you have a loyalty program?', answer: 'Yes! Bloom Rewards lets you earn 1 point per $1 spent. Points can be redeemed for discounts. Sign up for free at bloombasket.com/rewards.', priority: 6 },
];

async function seed(): Promise<void> {
  console.log('[seed] Seeding FAQ data...');
  const client = await pool.connect();
  try {
    // Clear existing entries first (idempotent)
    await client.query('DELETE FROM faq_entries');

    for (const faq of faqs) {
      await client.query(
        `INSERT INTO faq_entries (category, question, answer, priority)
         VALUES ($1, $2, $3, $4)`,
        [faq.category, faq.question, faq.answer, faq.priority]
      );
    }
    console.log(`[seed] ✅ Seeded ${faqs.length} FAQ entries`);
  } catch (err) {
    console.error('[seed] ❌ Seed failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
