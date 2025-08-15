// Utility functions for validating hiring data and calculations

export const validateHiringData = (route, bus, calculatedCost) => {
  console.log('🔍 Validating hiring data...');
  
  if (!route) {
    console.error('❌ Route data is missing');
    return false;
  }
  
  if (!bus) {
    console.error('❌ Bus data is missing');
    return false;
  }
  
  // Expected cost calculation
const expectedCost = 
    route.baseFare * bus.capacity * (calculatedCost.isRoundTrip ? 2 : 1);
  
  console.log('📊 Validation details:');
  console.log(`Route: ${route.source} → ${route.destination}`);
  console.log(`Base fare: ₦${route.baseFare}`);
  console.log(`Bus: ${bus.busNumber} (${bus.capacity} seats)`);
  console.log(`Expected cost: ₦${expectedCost}`);
  console.log(`Calculated cost: ₦${calculatedCost}`);
  
  // Check if calculation matches expected result
  if (Math.abs(calculatedCost - expectedCost) <= 1) { // Allow 1 naira difference for rounding
    console.log('✅ Calculation is correct');
    return true;
  } else {
    console.error('❌ Calculation mismatch!');
    console.error(`Difference: ₦${calculatedCost - expectedCost}`);
    return false;
  }
};

export const getExpectedHiringCost = (route, bus, options = {}) => {
  if (!route || !bus) {
    throw new Error('Route and bus data are required');
  }
  
  const {
    multiplier = 1,
    durationDays = 1,
    isRoundTrip = false,
    additionalCharges = 0,
    driverAllowance = 0
  } = options;
  
  let totalCost = route.baseFare * bus.capacity * multiplier;
  
  // Apply duration multiplier
  if (durationDays > 1) {
    totalCost *= durationDays;
  }
  
  // Apply round trip pricing
  if (isRoundTrip) {
    totalCost *= 2;
    totalCost *= 0.95; // 5% discount
  }
  
  // Add additional costs
  totalCost += additionalCharges + driverAllowance;
  
  return Math.round(totalCost * 100) / 100;
};

export const debugHiringCalculation = (route, bus, hiringData) => {
  console.group('🐛 Debug Hiring Calculation');
  
  console.log('Input data:');
  console.table({
    'Route ID': route?._id || 'N/A',
    'Route Name': route?.name || 'N/A',
    'Base Fare': route?.baseFare || 'N/A',
    'Bus ID': bus?._id || 'N/A',
    'Bus Number': bus?.busNumber || 'N/A',
    'Bus Capacity': bus?.capacity || 'N/A',
    'Rate Type': hiringData?.rateType || 'N/A',
    'Multiplier': hiringData?.routePriceMultiplier || 'N/A'
  });
  
  if (route && bus) {
    const expectedCost = getExpectedHiringCost(route, bus, {
      multiplier: hiringData?.routePriceMultiplier || 1,
      isRoundTrip: hiringData?.tripType === 'Round-Trip'
    });
    
    console.log(`✅ Expected cost: ₦${expectedCost}`);
    
    // Check for common issues
    if (bus.capacity === 25 && expectedCost === 300000) {
      console.warn('⚠️  This matches the 25-seat bus × ₦12,000 = ₦300,000 scenario');
    }
    
    if (bus.capacity === 5 && expectedCost === 75000) {
      console.warn('⚠️  This matches the 5-seat bus × ₦15,000 = ₦75,000 scenario');
    }
  }
  
  console.groupEnd();
  
  return route && bus ? getExpectedHiringCost(route, bus, {
    multiplier: hiringData?.routePriceMultiplier || 1,
    isRoundTrip: hiringData?.tripType === 'Round-Trip'
  }) : null;
};
