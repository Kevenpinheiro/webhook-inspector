import { faker } from '@faker-js/faker'
import { webhooks } from './schema'
import { db } from '.'

const stripeWebhookSecret = 'whsec_' + faker.string.alphanumeric(32)

function generateStripeSignature() {
  const timestamp = Math.floor(Date.now() / 1000)
  const signature = faker.string.hexadecimal({ length: 64, prefix: '' })
  return `t=${timestamp},v1=${signature},v0=${signature}`
}

function generateStripeHeaders() {
  return {
    'content-type': 'application/json',
    'stripe-signature': generateStripeSignature(),
    'user-agent': 'Stripe/1.0 (+https://stripe.com/docs/webhooks)',
    'accept': '*/*',
    'cache-control': 'no-cache',
    'connection': 'close',
    'host': 'localhost:3333',
    'accept-encoding': 'gzip, deflate',
  }
}

function generateStripeEventBase(type: string) {
  return {
    id: 'evt_' + faker.string.alphanumeric(24),
    object: 'event',
    api_version: '2024-12-18.acacia',
    created: Math.floor(Date.now() / 1000) - faker.number.int({ min: 0, max: 86400 }),
    type,
    livemode: false,
    pending_webhooks: faker.number.int({ min: 1, max: 5 }),
    request: {
      id: 'req_' + faker.string.alphanumeric(14),
      idempotency_key: faker.string.uuid(),
    },
  }
}

function generateCustomer() {
  return {
    id: 'cus_' + faker.string.alphanumeric(14),
    object: 'customer',
    email: faker.internet.email(),
    name: faker.person.fullName(),
    phone: faker.phone.number(),
    created: Math.floor(Date.now() / 1000) - faker.number.int({ min: 86400, max: 2592000 }),
    livemode: false,
    metadata: {},
  }
}

function generatePaymentIntent(status: string) {
  const amount = faker.number.int({ min: 1000, max: 500000 })
  return {
    id: 'pi_' + faker.string.alphanumeric(24),
    object: 'payment_intent',
    amount,
    amount_received: status === 'succeeded' ? amount : 0,
    currency: faker.helpers.arrayElement(['usd', 'eur', 'brl', 'gbp']),
    status,
    customer: 'cus_' + faker.string.alphanumeric(14),
    description: faker.commerce.productName(),
    payment_method: 'pm_' + faker.string.alphanumeric(24),
    payment_method_types: ['card'],
    created: Math.floor(Date.now() / 1000) - faker.number.int({ min: 0, max: 3600 }),
    livemode: false,
    metadata: {},
  }
}

function generateCharge(status: string) {
  const amount = faker.number.int({ min: 1000, max: 500000 })
  return {
    id: 'ch_' + faker.string.alphanumeric(24),
    object: 'charge',
    amount,
    amount_captured: status === 'succeeded' ? amount : 0,
    amount_refunded: 0,
    currency: faker.helpers.arrayElement(['usd', 'eur', 'brl', 'gbp']),
    status,
    paid: status === 'succeeded',
    customer: 'cus_' + faker.string.alphanumeric(14),
    description: faker.commerce.productName(),
    payment_intent: 'pi_' + faker.string.alphanumeric(24),
    payment_method: 'pm_' + faker.string.alphanumeric(24),
    receipt_email: faker.internet.email(),
    receipt_url: 'https://pay.stripe.com/receipts/' + faker.string.alphanumeric(32),
    created: Math.floor(Date.now() / 1000) - faker.number.int({ min: 0, max: 3600 }),
    livemode: false,
    metadata: {},
  }
}

function generateInvoice(status: string) {
  const amount = faker.number.int({ min: 2000, max: 100000 })
  return {
    id: 'in_' + faker.string.alphanumeric(24),
    object: 'invoice',
    account_country: 'US',
    amount_due: amount,
    amount_paid: status === 'paid' ? amount : 0,
    amount_remaining: status === 'paid' ? 0 : amount,
    currency: faker.helpers.arrayElement(['usd', 'eur', 'brl', 'gbp']),
    status,
    customer: 'cus_' + faker.string.alphanumeric(14),
    customer_email: faker.internet.email(),
    customer_name: faker.person.fullName(),
    description: faker.commerce.productName() + ' subscription',
    hosted_invoice_url: 'https://invoice.stripe.com/i/' + faker.string.alphanumeric(32),
    invoice_pdf: 'https://pay.stripe.com/invoice/' + faker.string.alphanumeric(32) + '/pdf',
    number: 'INV-' + faker.string.numeric(6),
    subscription: 'sub_' + faker.string.alphanumeric(14),
    created: Math.floor(Date.now() / 1000) - faker.number.int({ min: 0, max: 86400 }),
    livemode: false,
    metadata: {},
  }
}

function generateSubscription(status: string) {
  const currentPeriodStart = Math.floor(Date.now() / 1000) - faker.number.int({ min: 0, max: 2592000 })
  return {
    id: 'sub_' + faker.string.alphanumeric(14),
    object: 'subscription',
    status,
    customer: 'cus_' + faker.string.alphanumeric(14),
    currency: faker.helpers.arrayElement(['usd', 'eur', 'brl', 'gbp']),
    current_period_start: currentPeriodStart,
    current_period_end: currentPeriodStart + 2592000,
    cancel_at_period_end: status === 'canceled',
    canceled_at: status === 'canceled' ? Math.floor(Date.now() / 1000) : null,
    items: {
      object: 'list',
      data: [{
        id: 'si_' + faker.string.alphanumeric(14),
        object: 'subscription_item',
        price: {
          id: 'price_' + faker.string.alphanumeric(14),
          object: 'price',
          unit_amount: faker.number.int({ min: 500, max: 50000 }),
          currency: 'usd',
          recurring: { interval: 'month', interval_count: 1 },
        },
        quantity: 1,
      }],
    },
    created: Math.floor(Date.now() / 1000) - faker.number.int({ min: 86400, max: 31536000 }),
    livemode: false,
    metadata: {},
  }
}

function generateCheckoutSession(status: string) {
  const amount = faker.number.int({ min: 1000, max: 200000 })
  return {
    id: 'cs_' + faker.string.alphanumeric(58),
    object: 'checkout.session',
    status,
    payment_status: status === 'complete' ? 'paid' : 'unpaid',
    mode: faker.helpers.arrayElement(['payment', 'subscription']),
    amount_total: amount,
    currency: faker.helpers.arrayElement(['usd', 'eur', 'brl', 'gbp']),
    customer: 'cus_' + faker.string.alphanumeric(14),
    customer_email: faker.internet.email(),
    payment_intent: 'pi_' + faker.string.alphanumeric(24),
    success_url: 'https://example.com/success',
    cancel_url: 'https://example.com/cancel',
    url: status === 'open' ? 'https://checkout.stripe.com/c/pay/' + faker.string.alphanumeric(32) : null,
    created: Math.floor(Date.now() / 1000) - faker.number.int({ min: 0, max: 3600 }),
    expires_at: Math.floor(Date.now() / 1000) + 86400,
    livemode: false,
    metadata: {},
  }
}

function generateRefund() {
  const amount = faker.number.int({ min: 500, max: 100000 })
  return {
    id: 're_' + faker.string.alphanumeric(24),
    object: 'refund',
    amount,
    currency: faker.helpers.arrayElement(['usd', 'eur', 'brl', 'gbp']),
    status: 'succeeded',
    charge: 'ch_' + faker.string.alphanumeric(24),
    payment_intent: 'pi_' + faker.string.alphanumeric(24),
    reason: faker.helpers.arrayElement(['requested_by_customer', 'duplicate', 'fraudulent', null]),
    receipt_number: faker.string.numeric(10),
    created: Math.floor(Date.now() / 1000) - faker.number.int({ min: 0, max: 3600 }),
    metadata: {},
  }
}

function generateDispute() {
  const amount = faker.number.int({ min: 1000, max: 50000 })
  return {
    id: 'dp_' + faker.string.alphanumeric(24),
    object: 'dispute',
    amount,
    currency: faker.helpers.arrayElement(['usd', 'eur', 'brl', 'gbp']),
    status: faker.helpers.arrayElement(['warning_needs_response', 'needs_response', 'under_review', 'won', 'lost']),
    charge: 'ch_' + faker.string.alphanumeric(24),
    payment_intent: 'pi_' + faker.string.alphanumeric(24),
    reason: faker.helpers.arrayElement(['fraudulent', 'duplicate', 'product_not_received', 'product_unacceptable', 'subscription_canceled', 'unrecognized']),
    created: Math.floor(Date.now() / 1000) - faker.number.int({ min: 0, max: 86400 }),
    evidence_details: {
      due_by: Math.floor(Date.now() / 1000) + 604800,
      has_evidence: false,
      submission_count: 0,
    },
    livemode: false,
    metadata: {},
  }
}

function generatePaymentMethod() {
  return {
    id: 'pm_' + faker.string.alphanumeric(24),
    object: 'payment_method',
    type: 'card',
    customer: 'cus_' + faker.string.alphanumeric(14),
    card: {
      brand: faker.helpers.arrayElement(['visa', 'mastercard', 'amex', 'discover']),
      last4: faker.string.numeric(4),
      exp_month: faker.number.int({ min: 1, max: 12 }),
      exp_year: faker.number.int({ min: 2025, max: 2030 }),
      country: 'US',
      funding: 'credit',
    },
    billing_details: {
      email: faker.internet.email(),
      name: faker.person.fullName(),
      phone: faker.phone.number(),
      address: {
        city: faker.location.city(),
        country: 'US',
        line1: faker.location.streetAddress(),
        postal_code: faker.location.zipCode(),
        state: faker.location.state({ abbreviated: true }),
      },
    },
    created: Math.floor(Date.now() / 1000) - faker.number.int({ min: 0, max: 86400 }),
    livemode: false,
    metadata: {},
  }
}

type StripeEventGenerator = {
  type: string
  generate: () => object
}

const stripeEventGenerators: StripeEventGenerator[] = [
  // Payment Intent events
  { type: 'payment_intent.created', generate: () => generatePaymentIntent('requires_payment_method') },
  { type: 'payment_intent.succeeded', generate: () => generatePaymentIntent('succeeded') },
  { type: 'payment_intent.payment_failed', generate: () => generatePaymentIntent('requires_payment_method') },
  { type: 'payment_intent.canceled', generate: () => generatePaymentIntent('canceled') },
  { type: 'payment_intent.processing', generate: () => generatePaymentIntent('processing') },
  { type: 'payment_intent.requires_action', generate: () => generatePaymentIntent('requires_action') },

  // Charge events
  { type: 'charge.succeeded', generate: () => generateCharge('succeeded') },
  { type: 'charge.failed', generate: () => generateCharge('failed') },
  { type: 'charge.refunded', generate: () => ({ ...generateCharge('succeeded'), refunded: true }) },
  { type: 'charge.captured', generate: () => generateCharge('succeeded') },
  { type: 'charge.pending', generate: () => generateCharge('pending') },

  // Invoice events
  { type: 'invoice.created', generate: () => generateInvoice('draft') },
  { type: 'invoice.finalized', generate: () => generateInvoice('open') },
  { type: 'invoice.paid', generate: () => generateInvoice('paid') },
  { type: 'invoice.payment_failed', generate: () => generateInvoice('open') },
  { type: 'invoice.payment_succeeded', generate: () => generateInvoice('paid') },
  { type: 'invoice.upcoming', generate: () => generateInvoice('draft') },
  { type: 'invoice.voided', generate: () => generateInvoice('void') },

  // Subscription events
  { type: 'customer.subscription.created', generate: () => generateSubscription('active') },
  { type: 'customer.subscription.updated', generate: () => generateSubscription('active') },
  { type: 'customer.subscription.deleted', generate: () => generateSubscription('canceled') },
  { type: 'customer.subscription.paused', generate: () => generateSubscription('paused') },
  { type: 'customer.subscription.resumed', generate: () => generateSubscription('active') },
  { type: 'customer.subscription.trial_will_end', generate: () => generateSubscription('trialing') },

  // Customer events
  { type: 'customer.created', generate: generateCustomer },
  { type: 'customer.updated', generate: generateCustomer },
  { type: 'customer.deleted', generate: generateCustomer },

  // Checkout Session events
  { type: 'checkout.session.completed', generate: () => generateCheckoutSession('complete') },
  { type: 'checkout.session.expired', generate: () => generateCheckoutSession('expired') },
  { type: 'checkout.session.async_payment_succeeded', generate: () => generateCheckoutSession('complete') },
  { type: 'checkout.session.async_payment_failed', generate: () => generateCheckoutSession('open') },

  // Refund events
  { type: 'refund.created', generate: generateRefund },
  { type: 'refund.updated', generate: generateRefund },

  // Dispute events
  { type: 'charge.dispute.created', generate: generateDispute },
  { type: 'charge.dispute.updated', generate: generateDispute },
  { type: 'charge.dispute.closed', generate: generateDispute },

  // Payment Method events
  { type: 'payment_method.attached', generate: generatePaymentMethod },
  { type: 'payment_method.detached', generate: generatePaymentMethod },
  { type: 'payment_method.updated', generate: generatePaymentMethod },
]

function generateStripeWebhook() {
  const eventGenerator = faker.helpers.arrayElement(stripeEventGenerators)
  const eventData = eventGenerator.generate()

  const event = {
    ...generateStripeEventBase(eventGenerator.type),
    data: {
      object: eventData,
    },
  }

  const body = JSON.stringify(event, null, 2)

  return {
    method: 'POST',
    pathname: '/capture/stripe/webhook',
    ip: faker.internet.ipv4(),
    statusCode: 200,
    contentType: 'application/json',
    contentLength: String(Buffer.byteLength(body)),
    queryParams: {},
    headers: generateStripeHeaders(),
    body,
    createdAt: faker.date.recent({ days: 7 }),
  }
}

async function seed() {
  console.log('🌱 Seeding database...')

  await db.delete(webhooks)

  const webhookData = Array.from({ length: 60 }, () => generateStripeWebhook())

  await db.insert(webhooks).values(webhookData)

  console.log('Successfully seeded 60 Stripe webhook events!')
  process.exit(0)
}

seed().catch((error) => {
  console.error('Error seeding database:', error)
  process.exit(1)
})
