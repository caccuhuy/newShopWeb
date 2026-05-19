const AnalyticsDAO = require('../dao/AnalyticsDAO');

class AnalyticsModule {
    static async getDashboardStats(days) {
        const parsedDays = parseInt(days) || 30;
        
        const [kpis, revenueData, lowStockProducts] = await Promise.all([
            AnalyticsDAO.getKPIs(),
            AnalyticsDAO.getRevenueChart(parsedDays),
            AnalyticsDAO.getTopLowStock()
        ]);

        return {
            kpis,
            revenueData,
            lowStockProducts
        };
    }

    static async getAllLowStock() {
        return await AnalyticsDAO.getAllLowStock();
    }
}

module.exports = AnalyticsModule;
