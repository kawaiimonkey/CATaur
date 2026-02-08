const express = require('express');
const { query } = require('../db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

// GET /api/candidates - List candidates (public or recruiter only)
router.get('/', async (req, res) => {
  try {
    const candidates = await query(`
      SELECT c.*, u.email, u.first_name, u.last_name, u.phone as u_phone
      FROM candidates c
      JOIN users u ON c.user_id = u.user_id
      ORDER BY c.created_at DESC
    `);
     // Parse JSON fields if they are stored as strings
    const processed = candidates.map(c => ({
      ...c,
      full_name: `${c.first_name} ${c.last_name}`.trim(),
      email: c.email,
      phone: c.phone || c.u_phone, // use profile phone or user phone
      skills: typeof c.skills === 'string' ? JSON.parse(c.skills) : c.skills,
      education: typeof c.education === 'string' ? JSON.parse(c.education) : c.education,
    }));
    
    res.json({ candidates: processed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch candidates' });
  }
});

// GET /api/candidates/me - Get current user's profile
router.get('/me', authRequired, async (req, res) => {
  try {
    const profiles = await query(`
        SELECT c.*, u.email, u.first_name, u.last_name, u.phone as u_phone
        FROM candidates c
        JOIN users u ON c.user_id = u.user_id
        WHERE c.user_id = ?
    `, [req.user.id]);

    if (!profiles.length) {
      return res.json({ profile: null });
    }
    const profile = profiles[0];
    profile.full_name = `${profile.first_name} ${profile.last_name}`.trim();
    profile.email = profile.email; // Already in row
    if (typeof profile.skills === 'string') profile.skills = JSON.parse(profile.skills);
    if (typeof profile.education === 'string') profile.education = JSON.parse(profile.education);

    res.json({ profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch your profile' });
  }
});

// GET /api/candidates/:id - Get specific candidate by User ID or Candidate ID? 
// The route says /:id, usually this is the resource ID (candidate_id) but frontends often link via user_id.
// I will support checking by candidate_id primarily, or I can check if it matches a user_id.
// Given previous implementation used `WHERE u.id = ?`, let's assume valid ID is passed.
// I will query by `candidate_id` now as it is the proper REST resource ID.
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const profiles = await query(`
      SELECT c.*, u.email, u.first_name, u.last_name, u.phone as u_phone
      FROM candidates c
      JOIN users u ON c.user_id = u.user_id
      WHERE c.candidate_id = ?
    `, [id]);
    
    if (!profiles.length) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    
    const profile = profiles[0];
    profile.full_name = `${profile.first_name} ${profile.last_name}`.trim();
    if (typeof profile.skills === 'string') profile.skills = JSON.parse(profile.skills);
    if (typeof profile.education === 'string') profile.education = JSON.parse(profile.education);

    res.json({ candidate: profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch candidate' });
  }
});

// PUT /api/candidates/me - Update or Create current user's profile
router.put('/me', authRequired, async (req, res) => {
  const {
    headline, summary, resume_url, skills, experience_years,
    education, linkedin_url, portfolio_url, phone,
    // New fields
    current_salary, expected_salary, notice_period, available_date,
    current_location, willing_to_relocate, profile_status
  } = req.body;

  try {
    const existing = await query('SELECT candidate_id FROM candidates WHERE user_id = ?', [req.user.id]);
    
    const skilsJson = JSON.stringify(skills || []);
    const educationJson = JSON.stringify(education || []);

    if (existing.length) {
      // Update
      await query(
        `UPDATE candidates SET
         headline = ?, summary = ?, resume_url = ?, skills = ?, experience_years = ?,
         education = ?, linkedin_url = ?, portfolio_url = ?, phone = ?,
         current_salary = ?, expected_salary = ?, notice_period = ?, available_date = ?,
         current_location = ?, willing_to_relocate = ?, profile_status = ?
         WHERE user_id = ?`,
        [
          headline, summary, resume_url, skilsJson, experience_years,
          educationJson, linkedin_url, portfolio_url, phone,
          current_salary || null, expected_salary || null, notice_period || null, available_date || null,
          current_location || null, willing_to_relocate || 0, profile_status || 'active',
          req.user.id
        ]
      );
    } else {
      // Insert
      await query(
        `INSERT INTO candidates 
         (user_id, headline, summary, resume_url, skills, experience_years, education, linkedin_url, portfolio_url, phone,
          current_salary, expected_salary, notice_period, available_date,
          current_location, willing_to_relocate, profile_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.user.id, headline, summary, resume_url, skilsJson, experience_years,
          educationJson, linkedin_url, portfolio_url, phone,
          current_salary || null, expected_salary || null, notice_period || null, available_date || null,
          current_location || null, willing_to_relocate || 0, profile_status || 'active'
        ]
      );
    }

    const [updated] = await query('SELECT * FROM candidates WHERE user_id = ?', [req.user.id]);
    if (updated && typeof updated.skills === 'string') updated.skills = JSON.parse(updated.skills);
    if (updated && typeof updated.education === 'string') updated.education = JSON.parse(updated.education);

    res.json({ profile: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

module.exports = router;
