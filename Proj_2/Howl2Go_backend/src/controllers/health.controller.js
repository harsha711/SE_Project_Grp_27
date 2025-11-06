export const getHealthStatus = (req, res) => {
  res.json({
    status: 'ok',
    service: 'food-delivery-backend',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
};
