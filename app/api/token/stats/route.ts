import { NextResponse } from 'next/server';

/**
 * GET /api/token/stats
 * 
 * Fetch token statistics from BscScan API
 * Returns token supply, holder count, and distribution
 */
export async function GET() {
  try {
    const apiKey = process.env.BSCSCAN_API_KEY;
    const tokenAddress = process.env.TOKEN_CONTRACT_ADDRESS;

    // Current token stats (updated manually until API is fully configured)
    const currentStats = {
      totalSupply: '1000000000000000000000000000', // 1B with 18 decimals
      holderCount: 7,
      distribution: {
        circulating: 500000000000000000000000000, // 50% - 500M
        locked: 300000000000000000000000000, // 30% - 300M
        team: 200000000000000000000000000, // 20% - 200M
        donation: 0,
        fee: 0,
        burn: 0,
      },
      lastUpdated: new Date().toISOString(),
    };

    // If API not configured, return current stats
    if (!apiKey || !tokenAddress) {
      console.log('[Token Stats] Using current token stats');
      return NextResponse.json(currentStats);
    }

    // Fetch top 100 holders using V2 API
    const holdersResponse = await fetch(
      `https://api.bscscan.com/v2/api?chainid=56&module=token&action=tokenholderlist&contractaddress=${tokenAddress}&page=1&offset=100&apikey=${apiKey}`,
      { next: { revalidate: 600 } } // Cache for 10 minutes
    );
    const holdersData = await holdersResponse.json();

    if (holdersData.status !== '1') {
      console.error('[Token Stats] BscScan API error:', holdersData.message);
      throw new Error(holdersData.message || 'API error');
    }

    const holders = holdersData.result || [];
    
    // Calculate total supply from holders (approximation)
    let totalSupply = '0';
    if (holders.length > 0) {
      totalSupply = holders.reduce((sum: bigint, holder: any) => {
        return sum + BigInt(holder.TokenHolderQuantity || '0');
      }, BigInt(0)).toString();
    }
    
    const holderCount = holders.length;

    // Calculate distribution
    const teamAddresses = [
      process.env.TOKEN_OWNER_ADDRESS,
      process.env.TOKEN_MAD_ADDRESS,
      process.env.TOKEN_LEB_ADDRESS,
      process.env.TOKEN_CNK_ADDRESS,
      process.env.TOKEN_KDR_ADDRESS,
    ].filter(Boolean).map(addr => addr?.toLowerCase());

    const specialAddresses = {
      locked: process.env.TOKEN_LOCKED_ADDRESS?.toLowerCase(),
      donation: process.env.TOKEN_DONATION_ADDRESS?.toLowerCase(),
      fee: process.env.TOKEN_FEE_ADDRESS?.toLowerCase(),
      burn: process.env.TOKEN_BURN_ADDRESS?.toLowerCase(),
    };

    let teamBalance = 0;
    let lockedBalance = 0;
    let donationBalance = 0;
    let feeBalance = 0;
    let burnBalance = 0;
    let circulatingBalance = 0;

    holders.forEach((holder: any) => {
      const address = holder.TokenHolderAddress.toLowerCase();
      const balance = parseFloat(holder.TokenHolderQuantity);

      if (teamAddresses.includes(address)) {
        teamBalance += balance;
      } else if (address === specialAddresses.locked) {
        lockedBalance += balance;
      } else if (address === specialAddresses.donation) {
        donationBalance += balance;
      } else if (address === specialAddresses.fee) {
        feeBalance += balance;
      } else if (address === specialAddresses.burn) {
        burnBalance += balance;
      } else {
        circulatingBalance += balance;
      }
    });

    const distribution = {
      team: teamBalance,
      locked: lockedBalance,
      donation: donationBalance,
      fee: feeBalance,
      burn: burnBalance,
      circulating: circulatingBalance,
    };

    return NextResponse.json({
      totalSupply,
      holderCount,
      distribution,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Token Stats] Error fetching token stats:', error);
    
    // Return current stats on error
    return NextResponse.json({
      totalSupply: '1000000000000000000000000000', // 1B
      holderCount: 7,
      distribution: {
        circulating: 500000000000000000000000000, // 50%
        locked: 300000000000000000000000000, // 30%
        team: 200000000000000000000000000, // 20%
        donation: 0,
        fee: 0,
        burn: 0,
      },
      lastUpdated: new Date().toISOString(),
    });
  }
}

/**
 * Cache configuration
 * Revalidate every 10 minutes
 */
export const revalidate = 600;
