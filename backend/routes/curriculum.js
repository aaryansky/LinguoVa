const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getCurriculum,
  addVocab,
  deleteVocab,
  addGrammar,
  deleteGrammar
} = require('../controllers/curriculumController');

// Users must be authenticated to view curriculum
router.get('/', protect, getCurriculum);

// Admin-only operations
router.post('/vocab', protect, adminOnly, addVocab);
router.delete('/vocab/:id', protect, adminOnly, deleteVocab);
router.post('/grammar', protect, adminOnly, addGrammar);
router.delete('/grammar/:id', protect, adminOnly, deleteGrammar);

module.exports = router;
