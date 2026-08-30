export function americanToDecimal(odds: number): number { 
    if (odds > 0) { 
        return 1 + odds / 100; 
    } 
    
    return 1 + 100 / Math.abs(odds); 
} 

export function americanToProbability(odds: number): number { 
    if (odds > 0) { 
        return 100 / (odds + 100); 
    } 
    
    return Math.abs(odds) / 
        (Math.abs(odds) + 100); 
} 
    
export function calculateLossProbability( winProbability: number ): number { 
    return 1 - winProbability; 
} 

export function classifyRisk( winProbability: number ): string { 
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
    return probabilities.reduce(
      (combinedProbability, probability) =>
        combinedProbability * probability,
      1
    );
  }
  
  
export function calculateCumulativeProbabilities(
    probabilities: number[]
  ): number[] {
    let combinedProbability = 1;
  
    return probabilities.map((probability) => {
      combinedProbability *= probability;
  
      return combinedProbability;
    });
  }

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

export function calculatePotentialReturn(
    stake: number,
    decimalOdds: number
  ): number {
    return stake * decimalOdds;
  }

export function calculatePotentialProfit(
    stake: number,
    decimalOdds: number
  ): number {
    return stake * (decimalOdds - 1);
  }

export function calculateOverround(
    probabilities: number[]
  ): number {
    const totalProbability = probabilities.reduce(
      (total, probability) => total + probability,
      0
    );
  
    return totalProbability - 1;
  }
  
  
export function removeVig(
    probabilities: number[]
  ): number[] {
    const totalProbability = probabilities.reduce(
      (total, probability) => total + probability,
      0
    );
  
    return probabilities.map(
      (probability) =>
        probability / totalProbability
    );
  }
