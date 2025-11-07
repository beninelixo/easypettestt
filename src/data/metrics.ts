/**
 * Centralized System Metrics
 * 
 * All visual data displayed across the site should use these constants
 * to ensure consistency. Update monthly based on actual database counts.
 */

export const siteMetrics = {
  // Company info
  foundedYear: 2023,
  yearsInMarket: new Date().getFullYear() - 2023,
  
  // Business metrics (update monthly)
  petShopsServed: 520,
  activePetShops: 487,
  totalAppointments: 285000,
  registeredPets: 165000,
  activeUsers: 5200,
  citiesInBrazil: 32,
  
  // Performance metrics
  satisfactionRate: 98,
  averageResponseTime: "< 2 horas",
  systemUptime: 99.9,
  npsScore: 87,
  
  // Growth metrics
  monthlyGrowthRate: 15, // percentage
  customerRetention: 94, // percentage
  averageTicket: 4200, // R$
  
  // Feature usage
  whatsappIntegrationActive: 420,
  multiUnitClients: 45,
  loyaltyProgramActive: 312,
  
  // Support metrics
  avgSupportResponseMinutes: 45,
  firstContactResolutionRate: 82, // percentage
} as const;

/**
 * Calculate dynamic metrics based on current data
 */
export const getDynamicMetrics = () => {
  const now = new Date();
  const yearsSinceFoundation = now.getFullYear() - siteMetrics.foundedYear;
  
  return {
    ...siteMetrics,
    yearsInMarket: yearsSinceFoundation,
    formattedSatisfaction: `${siteMetrics.satisfactionRate}%`,
    formattedUptime: `${siteMetrics.systemUptime}%`,
    formattedGrowth: `+${siteMetrics.monthlyGrowthRate}%`,
  };
};

/**
 * For future: Fetch real-time metrics from database
 * 
 * Usage:
 * const realMetrics = await fetchRealTimeMetrics();
 */
export const fetchRealTimeMetrics = async () => {
  // TODO: Implement when needed
  // const { count: petShopsCount } = await supabase
  //   .from('pet_shops')
  //   .select('*', { count: 'exact', head: true });
  
  return getDynamicMetrics();
};
