const prisma = require('../db');

// Get all audit logs (with filters and user context)
const getAuditLogs = async (req, res) => {
  try {
    const { action, entity, limit = 50 } = req.query;

    const filter = {};
    if (action) filter.action = action;
    if (entity) filter.entity = entity;

    const logs = await prisma.auditLog.findMany({
      where: filter,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit)
    });

    res.status(200).json(logs);
  } catch (error) {
    console.error('Fetch Audit Logs Error:', error);
    res.status(500).json({ error: 'Failed to retrieve audit trail logs' });
  }
};

module.exports = {
  getAuditLogs
};
