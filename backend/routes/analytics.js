const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

// Get comprehensive analytics data
router.get('/', authenticate, authorize(['admin']), async (req, res) => {
  try {
    // User statistics
    const userStats = await pool.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(*) FILTER (WHERE role = 'farmer') as total_farmers,
        COUNT(*) FILTER (WHERE role = 'extension_officer') as total_extension_officers,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as new_users_30d,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as new_users_7d
      FROM users
    `);

    // User growth over last 6 months
    const userGrowth = await pool.query(`
      SELECT 
        TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') as month,
        COUNT(*) as count,
        COUNT(*) FILTER (WHERE role = 'farmer') as farmers,
        COUNT(*) FILTER (WHERE role = 'extension_officer') as extension_officers
      FROM users
      WHERE created_at >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at)
    `);

    // Most viewed crops (based on price queries)
    const topCrops = await pool.query(`
      SELECT c.name, c.category, COUNT(p.id) as view_count
      FROM crops c
      LEFT JOIN prices p ON c.id = p.crop_id
      GROUP BY c.id, c.name, c.category
      ORDER BY view_count DESC
      LIMIT 10
    `);

    // Most viewed markets
    const topMarkets = await pool.query(`
      SELECT m.name, m.region, COUNT(p.id) as view_count
      FROM markets m
      LEFT JOIN prices p ON m.id = p.market_id
      GROUP BY m.id, m.name, m.region
      ORDER BY view_count DESC
      LIMIT 10
    `);

    // Platform activity statistics
    const activityStats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM farmer_questions) as total_questions,
        (SELECT COUNT(*) FROM farmer_questions WHERE created_at >= NOW() - INTERVAL '30 days') as questions_30d,
        (SELECT COUNT(*) FROM forum_posts) as total_forum_posts,
        (SELECT COUNT(*) FROM forum_posts WHERE created_at >= NOW() - INTERVAL '30 days') as forum_posts_30d,
        (SELECT COUNT(*) FROM forum_comments) as total_comments,
        (SELECT COUNT(*) FROM advice_articles) as total_advice,
        (SELECT COUNT(*) FROM weather_alerts) as total_alerts,
        (SELECT COUNT(*) FROM sms_logs) as total_sms
    `);

    // Price trends for top 5 crops
    const priceTrends = await pool.query(`
      SELECT 
        c.name as crop_name,
        TO_CHAR(DATE_TRUNC('week', p.date_updated), 'Mon DD') as week,
        AVG(p.price) as avg_price
      FROM prices p
      JOIN crops c ON p.crop_id = c.id
      WHERE p.date_updated >= NOW() - INTERVAL '8 weeks'
      GROUP BY c.name, DATE_TRUNC('week', p.date_updated)
      ORDER BY c.name, DATE_TRUNC('week', p.date_updated)
    `);

    // Activity over time (last 30 days)
    const activityTimeline = await pool.query(`
      SELECT 
        DATE(day) as date,
        COALESCE(q.count, 0) as questions,
        COALESCE(p.count, 0) as posts,
        COALESCE(a.count, 0) as advice
      FROM generate_series(
        NOW() - INTERVAL '30 days',
        NOW(),
        '1 day'::interval
      ) day
      LEFT JOIN (
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM farmer_questions
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at)
      ) q ON DATE(day) = q.date
      LEFT JOIN (
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM forum_posts
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at)
      ) p ON DATE(day) = p.date
      LEFT JOIN (
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM advice_articles
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at)
      ) a ON DATE(day) = a.date
      ORDER BY day
    `);

    res.json({
      userStats: userStats.rows[0],
      userGrowth: userGrowth.rows,
      topCrops: topCrops.rows,
      topMarkets: topMarkets.rows,
      activityStats: activityStats.rows[0],
      priceTrends: priceTrends.rows,
      activityTimeline: activityTimeline.rows
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

// Get officer statistics
router.get('/officer-stats', authenticate, authorize(['admin']), async (req, res) => {
  try {
    // Get all extension officers with their ratings and advice count
    const officersQuery = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.location,
        u.profile_photo,
        u.approval_status,
        u.created_at,
        COALESCE(
          ROUND(
            (SELECT AVG(a.average_rating) 
             FROM advice_articles a 
             WHERE a.extension_officer_id = u.id AND a.average_rating > 0), 
            1
          ), 
          0
        ) as avg_rating,
        COALESCE(
          (SELECT SUM(a.review_count) 
           FROM advice_articles a 
           WHERE a.extension_officer_id = u.id), 
          0
        ) as total_ratings,
        COALESCE(
          (SELECT COUNT(*) 
           FROM advice_articles a 
           WHERE a.extension_officer_id = u.id), 
          0
        ) as total_advice
      FROM users u
      WHERE u.role = 'extension_officer'
      ORDER BY avg_rating DESC, total_ratings DESC, total_advice DESC
    `;

    const officers = await pool.query(officersQuery);

    // Get overall statistics
    const statsQuery = `
      SELECT 
        COUNT(*) as total_officers,
        COUNT(CASE WHEN approval_status = 'approved' THEN 1 END) as approved_officers,
        COUNT(CASE WHEN approval_status = 'pending' THEN 1 END) as pending_officers,
        COUNT(CASE WHEN approval_status = 'banned' THEN 1 END) as banned_officers,
        COALESCE(
          ROUND(
            (SELECT AVG(average_rating) 
             FROM advice_articles 
             WHERE average_rating > 0), 
            1
          ), 
          0
        ) as overall_avg_rating
      FROM users u
      WHERE u.role = 'extension_officer'
    `;

    const stats = await pool.query(statsQuery);

    res.json({
      officers: officers.rows.map(officer => ({
        ...officer,
        avg_rating: parseFloat(officer.avg_rating).toFixed(1),
        total_ratings: parseInt(officer.total_ratings),
        total_advice: parseInt(officer.total_advice)
      })),
      stats: {
        ...stats.rows[0],
        total_officers: parseInt(stats.rows[0].total_officers),
        approved_officers: parseInt(stats.rows[0].approved_officers),
        pending_officers: parseInt(stats.rows[0].pending_officers),
        banned_officers: parseInt(stats.rows[0].banned_officers),
        overall_avg_rating: parseFloat(stats.rows[0].overall_avg_rating).toFixed(1)
      }
    });
  } catch (error) {
    console.error('Error fetching officer stats:', error);
    res.status(500).json({ error: 'Failed to fetch officer statistics' });
  }
});

module.exports = router;