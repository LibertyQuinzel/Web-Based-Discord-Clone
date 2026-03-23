const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { SummaryService } = require('../services/summaryService');
const Channel = require('../models/Channel');
const { pool } = require('../config/database');

const router = express.Router();

// POST /api/summaries/manual
// Generate a full manual summary for a channel or DM.
router.post('/manual', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { channelId, dmId, hours, maxMessages } = req.body;

    if ((!channelId && !dmId) || (channelId && dmId)) {
      return res.status(400).json({
        success: false,
        message: 'Provide exactly one of `channelId` or `dmId`',
      });
    }

    if (channelId) {
      const access = await Channel.hasAccess(channelId, userId);
      if (!access) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: No permission to view this channel',
        });
      }
    }

    if (dmId) {
      const dmAccess = await pool.query(
        'SELECT 1 FROM direct_messages WHERE id = $1 AND $2 = ANY(participants) LIMIT 1',
        [dmId, userId]
      );
      if (dmAccess.rowCount === 0) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: No permission to view this DM',
        });
      }
    }

    const summaryData = await SummaryService.generateManualSummary({
      channelId: channelId || null,
      dmId: dmId || null,
      hours: Number(hours) || 3,
      maxMessages: Number(maxMessages) || 200,
    });

    res.status(200).json({
      success: true,
      data: { summary: summaryData },
    });
  } catch (error) {
    console.error('Error generating manual summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate summary',
    });
  }
});

// GET /api/summaries/preview
// Generate a lightweight "What You Missed" preview.
// Query params: channelId OR dmId, and optionally `since` (ISO timestamp).
router.get('/preview', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { channelId, dmId, since } = req.query;

    if ((!channelId && !dmId) || (channelId && dmId)) {
      return res.status(400).json({
        success: false,
        message: 'Provide exactly one of `channelId` or `dmId` as a query parameter',
      });
    }

    if (channelId) {
      const access = await Channel.hasAccess(channelId, userId);
      if (!access) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: No permission to view this channel',
        });
      }
    }

    if (dmId) {
      const dmAccess = await pool.query(
        'SELECT 1 FROM direct_messages WHERE id = $1 AND $2 = ANY(participants) LIMIT 1',
        [dmId, userId]
      );
      if (dmAccess.rowCount === 0) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: No permission to view this DM',
        });
      }
    }

    const previewData = await SummaryService.generatePreview({
      channelId: channelId || null,
      dmId: dmId || null,
      since: since || null,
    });

    res.status(200).json({
      success: true,
      data: { preview: previewData },
    });
  } catch (error) {
    console.error('Error generating preview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate preview',
    });
  }
});

module.exports = router;
