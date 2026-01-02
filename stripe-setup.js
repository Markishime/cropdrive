#!/usr/bin/env node

/**
 * CropDrive OP Advisor™ Stripe Setup Script
 *
 * This script helps you set up Stripe products and prices for the subscription plans.
 *
 * Prerequisites:
 * - Stripe CLI installed: https://stripe.com/docs/stripe-cli
 * - Stripe account with API access
 *
 * Usage: node stripe-setup.js
 */

const Stripe = require('stripe');
require('dotenv').config({ path: '.env.local' });

console.log('💳 CropDrive OP Advisor™ Stripe Setup');
console.log('=====================================');
console.log('');

async function setupStripe() {
  try {
    // Check if Stripe secret key is available
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set in environment variables.');
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
    });

    console.log('✅ Connected to Stripe');
    console.log('');

    // Create products
    console.log('📦 Creating products...');

    const products = [
      {
        name: 'CropDrive Start',
        description: 'Perfect for getting started with AI analysis',
        metadata: { plan_id: 'start' }
      },
      {
        name: 'CropDrive Smart',
        description: 'Most popular for active farmers',
        metadata: { plan_id: 'smart' }
      },
      {
        name: 'CropDrive Precision',
        description: 'Complete solution for serious farmers',
        metadata: { plan_id: 'precision' }
      }
    ];

    const createdProducts = [];

    for (const productData of products) {
      try {
        const product = await stripe.products.create(productData);
        createdProducts.push(product);
        console.log(`✅ Created product: ${product.name} (${product.id})`);
      } catch (error) {
        if (error.code === 'resource_already_exists') {
          console.log(`ℹ️  Product already exists: ${productData.name}`);
          const existingProducts = await stripe.products.list({
            type: 'service',
            limit: 100
          });
          const existingProduct = existingProducts.data.find(p =>
            p.metadata.plan_id === productData.metadata.plan_id
          );
          if (existingProduct) {
            createdProducts.push(existingProduct);
          }
        } else {
          console.error(`❌ Error creating product ${productData.name}:`, error.message);
        }
      }
    }

    console.log('');
    console.log('💰 Creating prices...');

    const priceData = {
      start: {
        monthly: { amount: 2400, interval: 'month', display: 'RM24/month' },
        yearly: { amount: 19200, interval: 'year', display: 'RM192/year' }
      },
      smart: {
        monthly: { amount: 3900, interval: 'month', display: 'RM39/month' },
        yearly: { amount: 33600, interval: 'year', display: 'RM336/year' }
      },
      precision: {
        monthly: { amount: 4900, interval: 'month', display: 'RM49/month' },
        yearly: { amount: 48000, interval: 'year', display: 'RM480/year' }
      }
    };

    const createdPrices = [];

    for (const product of createdProducts) {
      const planId = product.metadata.plan_id;

      for (const [period, data] of Object.entries(priceData[planId])) {
        try {
          const price = await stripe.prices.create({
            product: product.id,
            unit_amount: data.amount,
            currency: 'eur',
            recurring: {
              interval: data.interval,
            },
            metadata: {
              plan_id: planId,
              period: period,
              display_amount: data.display,
            },
          });

          createdPrices.push(price);
          console.log(`✅ Created ${period}ly price for ${planId}: ${price.id} (${data.display})`);
        } catch (error) {
          if (error.code === 'resource_already_exists') {
            console.log(`ℹ️  Price already exists for ${planId} ${period}ly`);
          } else {
            console.error(`❌ Error creating ${period}ly price for ${planId}:`, error.message);
          }
        }
      }
    }

    console.log('');
    console.log('🌐 Setting up webhook endpoint...');
    console.log('💡 Configure webhook in Stripe Dashboard:');
    console.log('   URL: https://yourdomain.com/api/stripe/webhook');
    console.log('   Events: checkout.session.completed, customer.subscription.*, invoice.*');
    console.log('');

    console.log('📝 Price IDs to add to .env.local:');
    console.log('');

    for (const price of createdPrices) {
      const planId = price.metadata.plan_id;
      const period = price.metadata.period;

      if (planId === 'start') {
        if (period === 'monthly') {
          console.log(`NEXT_PUBLIC_STRIPE_PRICE_START_MONTHLY=${price.id}`);
        } else {
          console.log(`NEXT_PUBLIC_STRIPE_PRICE_START_YEARLY=${price.id}`);
        }
      } else if (planId === 'smart') {
        if (period === 'monthly') {
          console.log(`NEXT_PUBLIC_STRIPE_PRICE_SMART_MONTHLY=${price.id}`);
        } else {
          console.log(`NEXT_PUBLIC_STRIPE_PRICE_SMART_YEARLY=${price.id}`);
        }
      } else if (planId === 'precision') {
        if (period === 'monthly') {
          console.log(`NEXT_PUBLIC_STRIPE_PRICE_PRECISION_MONTHLY=${price.id}`);
        } else {
          console.log(`NEXT_PUBLIC_STRIPE_PRICE_PRECISION_YEARLY=${price.id}`);
        }
      }
    }

    console.log('');
    console.log('🎉 Stripe setup completed!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Copy the price IDs above to your .env.local file');
    console.log('2. Set up webhook endpoint in Stripe Dashboard');
    console.log('3. Test the checkout flow');
    console.log('');
    console.log('💡 Note: All prices are in EUR cents, but displayed as RM to users');
    console.log('   Stripe will handle the currency conversion automatically');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setupStripe();
