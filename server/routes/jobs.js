const express = require('express');
const { query } = require('../db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

// GET /api/jobs - List all jobs
router.get('/', async (req, res) => {
  try {
    const jobs = await query(
      `SELECT job_orders.*, 
              users.first_name, users.last_name,
              companies.company_name,
              companies.logo_url AS company_logo
       FROM job_orders
       LEFT JOIN users ON job_orders.recruiter_id = users.user_id
       LEFT JOIN companies ON job_orders.company_id = companies.company_id
       ORDER BY job_orders.created_at DESC`
    );
    // Format response if needed, e.g. combine recruiter name
    const processed = jobs.map(job => ({
        ...job,
        recruiter_name: `${job.first_name || ''} ${job.last_name || ''}`.trim()
    }));
    return res.json({ jobs: processed });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to load job orders' });
  }
});

// GET /api/jobs/mine - List my jobs
router.get('/mine', authRequired, async (req, res) => {
  try {
    const jobs = await query(
      `SELECT job_orders.*,
              companies.company_name,
              companies.logo_url AS company_logo
       FROM job_orders
       LEFT JOIN companies ON job_orders.company_id = companies.company_id
       WHERE job_orders.recruiter_id = ?
       ORDER BY created_at DESC`,
       [req.user.id]
    );
    return res.json({ jobs });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to load your job orders' });
  }
});

// GET /api/jobs/:id - Get specific job
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const jobs = await query(
      `SELECT job_orders.*, 
              users.first_name, users.last_name, users.email as recruiter_email,
              companies.company_name,
              companies.logo_url AS company_logo
       FROM job_orders
       LEFT JOIN users ON job_orders.recruiter_id = users.user_id
       LEFT JOIN companies ON job_orders.company_id = companies.company_id
       WHERE job_orders.job_order_id = ?`,
       [id]
    );
    if (!jobs.length) {
      return res.status(404).json({ message: 'Job not found' });
    }
    const job = jobs[0];
    job.recruiter_name = `${job.first_name || ''} ${job.last_name || ''}`.trim();

    return res.json({ job });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to load job order' });
  }
});

// POST /api/jobs - Create job
router.post('/', authRequired, async (req, res) => {
  const { 
      job_title, company_id, job_description, requirements, responsibilities,
      location, min_salary, max_salary, 
      employment_type, experience_level, education_required,
      number_of_positions, priority, status,
      published_to_boards, job_board_urls,
      start_date, closed_date
  } = req.body;

  if (!job_title) {
    return res.status(400).json({ message: 'Job Title is required' });
  }
  
  const recruiterId = req.user.id; 

  try {
    const result = await query(
      `INSERT INTO job_orders 
       (recruiter_id, job_title, company_id, job_description, requirements, responsibilities,
        location, min_salary, max_salary,
        employment_type, experience_level, education_required,
        number_of_positions, priority, status,
        published_to_boards, job_board_urls,
        start_date, closed_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        recruiterId,
        job_title,
        company_id || null, // Assuming company_id is strictly required by logic but SQL allows null if not set. UI should enforce.
        job_description || '',
        requirements || '',
        responsibilities || '',
        location || '',
        min_salary ?? null,
        max_salary ?? null,
        employment_type || null,
        experience_level || null,
        education_required || null,
        number_of_positions || 1,
        priority || 'Medium',
        status || 'draft',
        published_to_boards || 0,
        job_board_urls || null,
        start_date || null,
        closed_date || null
      ]
    );
    const [job] = await query('SELECT * FROM job_orders WHERE job_order_id = ?', [result.insertId]);
    return res.status(201).json({ job });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to create job order' });
  }
});

// PUT /api/jobs/:id - Update job
router.put('/:id', authRequired, async (req, res) => {
  const { id } = req.params;
  const { 
      job_title, company_id, job_description, requirements, responsibilities,
      location, min_salary, max_salary, 
      employment_type, experience_level, education_required,
      number_of_positions, priority, status,
      published_to_boards, job_board_urls,
      start_date, closed_date
  } = req.body;
  
  try {
    const [existing] = await query('SELECT * FROM job_orders WHERE job_order_id = ?', [id]);
    if (!existing) {
        return res.status(404).json({ message: 'Job not found' });
    }

    // Permission check: only recruiter who created or admin
    // if (req.user.role !== 'admin' && req.user.id !== existing.recruiter_id) ...

    await query(
        `UPDATE job_orders SET
         job_title = ?, company_id = ?, job_description = ?, requirements = ?, responsibilities = ?,
         location = ?, min_salary = ?, max_salary = ?,
         employment_type = ?, experience_level = ?, education_required = ?,
         number_of_positions = ?, priority = ?, status = ?,
         published_to_boards = ?, job_board_urls = ?,
         start_date = ?, closed_date = ?
         WHERE job_order_id = ?`,
        [
            job_title || existing.job_title,
            company_id ?? existing.company_id,
            job_description ?? existing.job_description,
            requirements ?? existing.requirements,
            responsibilities ?? existing.responsibilities,
            location ?? existing.location,
            min_salary ?? existing.min_salary,
            max_salary ?? existing.max_salary,
            employment_type ?? existing.employment_type,
            experience_level ?? existing.experience_level,
            education_required ?? existing.education_required,
            number_of_positions ?? existing.number_of_positions,
            priority ?? existing.priority,
            status ?? existing.status,
            published_to_boards ?? existing.published_to_boards,
            job_board_urls ?? existing.job_board_urls,
            start_date ?? existing.start_date,
            closed_date ?? existing.closed_date,
            id
        ]
    );

    const [updated] = await query('SELECT * FROM job_orders WHERE job_order_id = ?', [id]);
    return res.json({ job: updated });

  } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Failed to update job order' });
  }
});

// DELETE /api/jobs/:id - Delete job
router.delete('/:id', authRequired, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await query('DELETE FROM job_orders WHERE job_order_id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Job not found' });
        }
        return res.json({ message: 'Job deleted successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to delete job order' });
    }
});

module.exports = router;
