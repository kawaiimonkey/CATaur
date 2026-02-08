const express = require('express');
const { query } = require('../db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

// GET /api/companies - List all companies
router.get('/', async (req, res) => {
  try {
    const companies = await query('SELECT * FROM companies ORDER BY created_at DESC');
    res.json({ companies });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch companies' });
  }
});

// GET /api/companies/:id - Get company details
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const companies = await query('SELECT * FROM companies WHERE company_id = ?', [id]);
    if (!companies.length) {
      return res.status(404).json({ message: 'Company not found' });
    }
    res.json({ company: companies[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch company details' });
  }
});

// POST /api/companies - Create a new company
router.post('/', authRequired, async (req, res) => {
  const {
    company_name, email, phone, website, logo_url, cover_url, description,
    address, city, state, country, postal_code,
    industry, company_size, tax_id, company_type, client_since,
    credit_rating, preferred_payment_terms, notes
  } = req.body;

  if (!company_name) {
    return res.status(400).json({ message: 'Company name is required' });
  }

  try {
    const result = await query(
      `INSERT INTO companies 
      (company_name, email, phone, website, logo_url, cover_url, description, 
       address, city, state, country, postal_code,
       industry, company_size, tax_id, company_type, client_since,
       credit_rating, preferred_payment_terms, notes, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        company_name,
        email || null,
        phone || null,
        website || null,
        logo_url || null,
        cover_url || null,
        description || null,
        address || null,
        city || null,
        state || null,
        country || null,
        postal_code || null,
        industry || null,
        company_size || null,
        tax_id || null,
        company_type || null,
        client_since || null, // Expects 'YYYY-MM-DD' or null
        credit_rating || null,
        preferred_payment_terms || null,
        notes || null
      ]
    );
    
    const [company] = await query('SELECT * FROM companies WHERE company_id = ?', [result.insertId]);
    res.status(201).json({ company });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create company' });
  }
});

// PUT /api/companies/:id - Update company details
router.put('/:id', authRequired, async (req, res) => {
  const { id } = req.params;
  const {
    company_name, email, phone, website, logo_url, cover_url, description,
    address, city, state, country, postal_code,
    industry, company_size, tax_id, company_type, client_since,
    credit_rating, preferred_payment_terms, notes, is_active
  } = req.body;

  try {
    const [existing] = await query('SELECT * FROM companies WHERE company_id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ message: 'Company not found' });
    }

    await query(
      `UPDATE companies SET
        company_name = ?, email = ?, phone = ?, website = ?, logo_url = ?, cover_url = ?, description = ?,
        address = ?, city = ?, state = ?, country = ?, postal_code = ?,
        industry = ?, company_size = ?, tax_id = ?, company_type = ?, client_since = ?,
        credit_rating = ?, preferred_payment_terms = ?, notes = ?, is_active = ?
       WHERE company_id = ?`,
      [
        company_name || existing.company_name,
        email ?? existing.email,
        phone ?? existing.phone,
        website ?? existing.website,
        logo_url ?? existing.logo_url,
        cover_url ?? existing.cover_url,
        description ?? existing.description,
        address ?? existing.address,
        city ?? existing.city,
        state ?? existing.state,
        country ?? existing.country,
        postal_code ?? existing.postal_code,
        industry ?? existing.industry,
        company_size ?? existing.company_size,
        tax_id ?? existing.tax_id,
        company_type ?? existing.company_type,
        client_since ?? existing.client_since,
        credit_rating ?? existing.credit_rating,
        preferred_payment_terms ?? existing.preferred_payment_terms,
        notes ?? existing.notes,
        is_active ?? existing.is_active,
        id
      ]
    );

    const [updated] = await query('SELECT * FROM companies WHERE company_id = ?', [id]);
    res.json({ company: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update company' });
  }
});

// DELETE /api/companies/:id - Delete a company
router.delete('/:id', authRequired, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query('DELETE FROM companies WHERE company_id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Company not found' });
    }
    res.json({ message: 'Company deleted successfully' });
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
       return res.status(400).json({ message: 'Cannot delete company with active job postings' });
    }
    res.status(500).json({ message: 'Failed to delete company' });
  }
});

module.exports = router;
