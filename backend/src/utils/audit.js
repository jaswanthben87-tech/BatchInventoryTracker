const prisma = require('../db');

/**
 * Creates an immutable audit trail entry in the database.
 * @param {string} userId - ID of the user performing the action.
 * @param {string} action - Action description (e.g. 'CREATE_BATCH').
 * @param {string} entity - Model/Table being updated.
 * @param {string} entityId - Primary key ID of the entity.
 * @param {object} previousValue - Object representation of old state (optional).
 * @param {object} newValue - Object representation of new state (optional).
 */
const logAction = async (userId, action, entity, entityId, previousValue = null, newValue = null) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        previousValue: previousValue ? JSON.stringify(previousValue) : null,
        newValue: newValue ? JSON.stringify(newValue) : null
      }
    });
  } catch (error) {
    console.error('Audit Logging Failed:', error);
  }
};

module.exports = {
  logAction
};
