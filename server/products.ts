/**
 * Stripe Products and Pricing Configuration
 * 
 * Define all subscription plans and pricing tiers here.
 * These will be used for creating checkout sessions and displaying pricing.
 */

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  priceId: string;
  price: number; // in cents
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  recommended?: boolean;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Básico',
    description: 'Ideal para pequenas propriedades',
    priceId: process.env.STRIPE_PRICE_BASIC || 'price_basic',
    price: 4900, // R$ 49,00
    currency: 'brl',
    interval: 'month',
    features: [
      'Gestão financeira básica',
      'Controle de estoque',
      'Dashboard com KPIs',
      'Até 100 animais',
      'Suporte por email',
    ],
  },
  {
    id: 'professional',
    name: 'Profissional',
    description: 'Para fazendas em crescimento',
    priceId: process.env.STRIPE_PRICE_PROFESSIONAL || 'price_professional',
    price: 9900, // R$ 99,00
    currency: 'brl',
    interval: 'month',
    recommended: true,
    features: [
      'Tudo do plano Básico',
      'Métricas ESG completas',
      'Sistema de gamificação',
      'Ranking regional',
      'Até 500 animais',
      'Recomendações IA (5/mês)',
      'Suporte prioritário',
    ],
  },
  {
    id: 'enterprise',
    name: 'Empresarial',
    description: 'Para grandes operações',
    priceId: process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise',
    price: 19900, // R$ 199,00
    currency: 'brl',
    interval: 'month',
    features: [
      'Tudo do plano Profissional',
      'Animais ilimitados',
      'Recomendações IA ilimitadas',
      'Relatórios personalizados',
      'API de integração',
      'Múltiplas fazendas',
      'Suporte 24/7',
      'Gerente de conta dedicado',
    ],
  },
];

export function getPlanById(planId: string): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find(plan => plan.id === planId);
}

export function getPlanByPriceId(priceId: string): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find(plan => plan.priceId === priceId);
}

export function formatPrice(cents: number, currency: string = 'brl'): string {
  const amount = cents / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount);
}
