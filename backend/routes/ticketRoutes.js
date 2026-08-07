const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/ticketController');

const router = express.Router();

router.get('/', protect, ctrl.listTickets);
router.get('/:id', protect, ctrl.getTicket);
router.post('/', protect, ctrl.createTicket);
router.put('/:id', protect, authorize('admin', 'hr', 'manager'), ctrl.updateTicket);
router.delete('/:id', protect, authorize('admin'), ctrl.deleteTicket);
router.post('/:id/comments', protect, ctrl.addComment);

module.exports = router;
