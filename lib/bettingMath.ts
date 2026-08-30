// these small functions keep all of the betting maths in one place
export function americanToDecimal(odds: number): number { 
    // positive odds pay the quoted amount for every 100 staked
    if (odds > 0) { 
        return 1 + odds / 100; 
    } 
    
    return 1 + 100 / Math.abs(odds); 
} 

export function americanToProbability(odds: number): number { 
    // positive and negative american odds use different formulas
    if (odds > 0) { 
        return 100 / (odds + 100); 
    } 
    
    return Math.abs(odds) / 
        (Math.abs(odds) + 100); 
} 
    
// whatever is left outside the win chance is the loss chance
export function calculateLossProbability( winProbability: number ): number { 
    return 1 - winProbability; 
} 

export function classifyRisk( winProbability: number ): string { 
    // start with the smallest win chances and work upwards
    if (winProbability < 0.05) { 
        return "Extreme"; 
    } 
    
    if (winProbability < 0.15) { 
        return "Very High"; 
    } 
    
    if (winProbability < 0.30) { 
        return "High"; 
    } 
    
    if (winProbability < 0.50) { 
        return "Moderate"; 
    } 
    
    return "Lower"; 
}

export function calculateParlayProbability(
    probabilities: number[]
  ): number {
    // multiplying works here because the mvp treats every leg as independent
    return probabilities.reduce(
      (combinedProbability, probability) =>
        combinedProbability * probability,
      1
    );
  }
  
  
// keep the running chance after each new leg is added
export function calculateCumulativeProbabilities(
    probabilities: number[]
  ): number[] {
    // begin at 100% before any legs have been included
    let combinedProbability = 1;
  
    return probabilities.map((probability) => {
      combinedProbability *= probability;
  
      return combinedProbability;
    });
  }

// convert each leg first and then combine all of the decimal prices
export function calculateCombinedDecimalOdds(
    americanOdds: number[]
  ): number {
    return americanOdds
      .map((odds) => {
        if (odds > 0) {
          return 1 + odds / 100;
        }
  
        return 1 + 100 / Math.abs(odds);
      })
      .reduce(
        (combinedOdds, decimalOdds) =>
          combinedOdds * decimalOdds,
        1
      );
  }

// this includes both the profit and the original stake coming back
export function calculatePotentialReturn(
    stake: number,
    decimalOdds: number
  ): number {
    return stake * decimalOdds;
  }

// this leaves the returned original stake out of the total
export function calculatePotentialProfit(
    stake: number,
    decimalOdds: number
  ): number {
    return stake * (decimalOdds - 1);
  }

// this finds how far the market sits above a fair 100%
export function calculateOverround(
    probabilities: number[]
  ): number {
    const totalProbability = probabilities.reduce(
      (total, probability) => total + probability,
      0
    );
  
    return totalProbability - 1;
  }
  
  
// this removes the margin using a simple proportional method
export function removeVig(
    probabilities: number[]
  ): number[] {
    const totalProbability = probabilities.reduce(
      (total, probability) => total + probability,
      0
    );
  
    // scale both sides so they add back up to exactly 100%
    return probabilities.map(
      (probability) =>
        probability / totalProbability
    );
  }
