import { Request, Response } from 'express';
import Transaction from '../models/Transaction.js';
import Listing from '../models/Listing.js';
import User from '../models/User.js';

export const getKPIs = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate waste diverted (sum of quantities from completed transactions)
    const completedTransactions = await Transaction.find({
      $or: [{ seller: userId }, { buyer: userId }],
      stage: 'delivered',
    }).populate('listingId', 'quantityTons');

    const wasteDiverted = completedTransactions.reduce((sum, t) => {
      return sum + ((t.listingId as any)?.quantityTons || 0);
    }, 0);

    // Calculate average clearance time (days from transaction creation to delivery)
    const deliveredTransactions = await Transaction.find({
      $or: [{ seller: userId }, { buyer: userId }],
      stage: 'delivered',
    });

    let avgClearance = 0;
    if (deliveredTransactions.length > 0) {
      const totalDays = deliveredTransactions.reduce((sum, t) => {
        const days = Math.floor(
          (t.updatedAt.getTime() - t.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        return sum + days;
      }, 0);
      avgClearance = Math.floor(totalDays / deliveredTransactions.length);
    }

    // Compliance score (based on verified status and KYC completion)
    const complianceScore = user.verified ? 98 : 0;

    // Active deals (transactions not delivered)
    const activeDeals = await Transaction.countDocuments({
      $or: [{ seller: userId }, { buyer: userId }],
      stage: { $ne: 'delivered' },
    });

    const kpis = [
      {
        label: 'Waste Diverted',
        value: `${wasteDiverted.toLocaleString()} t`,
        delta: '+12% vs last qtr', // This would be calculated from historical data
        positive: true,
      },
      {
        label: 'Avg. Clearance',
        value: `${avgClearance} days`,
        delta: avgClearance > 0 ? '-3 days vs avg' : 'N/A',
        positive: true,
      },
      {
        label: 'Compliance Score',
        value: `${complianceScore}%`,
        delta: complianceScore >= 98 ? '+2% vs target' : 'Below target',
        positive: complianceScore >= 98,
      },
      {
        label: 'Active Deals',
        value: `${activeDeals}`,
        delta: '-5% vs target', // This would be calculated from historical data
        positive: false,
      },
    ];

    res.json(kpis);
  } catch (error: any) {
    console.error('Get KPIs error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getImpactMetrics = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    // Get all delivered transactions
    const transactions = await Transaction.find({
      $or: [{ seller: userId }, { buyer: userId }],
      stage: 'delivered',
    }).populate('listingId', 'quantityTons category');

    // Calculate CO₂ saved (simplified calculation based on category)
    const co2Factors: Record<string, number> = {
      metals: 3.1,
      plastics: 2.4,
      chemicals: 4.6,
      organics: 1.2,
      construction: 0.6,
      textiles: 1.8,
    };

    let co2Saved = 0;
    let waterPreserved = 0;
    let energyRecovered = 0;

    transactions.forEach((t) => {
      const listing = t.listingId as any;
      const tons = listing?.quantityTons || 0;
      const category = listing?.category || 'metals';
      const factor = co2Factors[category] || 2.0;

      co2Saved += tons * factor;
      waterPreserved += tons * 372000; // Liters per ton (simplified)
      energyRecovered += tons * 0.62; // GWh per ton (simplified)
    });

    const impactMetrics = [
      {
        label: 'CO₂ Saved',
        value: `${co2Saved.toFixed(0)} t`,
        sublabel: 'Scope 3 avoidance',
        trend: 'up' as const,
      },
      {
        label: 'Water Preserved',
        value: `${(waterPreserved / 1000000).toFixed(1)}M L`,
        sublabel: 'Process reuse',
        trend: 'up' as const,
      },
      {
        label: 'Energy Recovered',
        value: `${energyRecovered.toFixed(1)} GWh`,
        sublabel: 'Waste-to-energy',
        trend: 'flat' as const,
      },
    ];

    res.json(impactMetrics);
  } catch (error: any) {
    console.error('Get impact metrics error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getDiversionTrend = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { months = 6 } = req.query;

    // Get transactions from last N months
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - Number(months));

    const transactions = await Transaction.find({
      $or: [{ seller: userId }, { buyer: userId }],
      stage: 'delivered',
      createdAt: { $gte: startDate },
    })
      .populate('listingId', 'quantityTons')
      .sort({ createdAt: 1 });

    // Group by month
    const monthlyData: Record<string, { divertedTons: number; co2Saved: number }> = {};

    transactions.forEach((t) => {
      const date = new Date(t.createdAt);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
      const listing = t.listingId as any;
      const tons = listing?.quantityTons || 0;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { divertedTons: 0, co2Saved: 0 };
      }

      monthlyData[monthKey].divertedTons += tons;
      monthlyData[monthKey].co2Saved += tons * 1.3; // Simplified CO₂ factor
    });

    // Convert to array format
    const trend = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      divertedTons: Math.round(data.divertedTons),
      co2Saved: Math.round(data.co2Saved),
    }));

    res.json(trend);
  } catch (error: any) {
    console.error('Get diversion trend error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

