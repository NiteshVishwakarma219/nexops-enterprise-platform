/**
 * Multer configuration for the 6 document categories the app supports.
 * Files are saved to uploads/<category>/ with a unique filename.
 */
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const ALLOWED_EXTENSIONS = {
  photo: ['.jpg', '.jpeg', '.png', '.webp'],
  resume: ['.pdf', '.doc', '.docx'],
  offer_letter: ['.pdf', '.doc', '.docx'],
  id_proof: ['.pdf', '.jpg', '.jpeg', '.png'],
  certificate: ['.pdf', '.jpg', '.jpeg', '.png'],
  document: ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.xlsx', '.csv'],
};

const CATEGORY_FOLDER = {
  photo: 'photos',
  resume: 'resumes',
  offer_letter: 'offer_letters',
  id_proof: 'id_proofs',
  certificate: 'certificates',
  document: 'documents',
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const category = req.params.docType;
    const folder = CATEGORY_FOLDER[category];
    if (!folder) return cb(new Error('Invalid upload category'));
    const fullDir = path.join(process.env.UPLOAD_DIR || 'uploads', folder);
    fs.mkdirSync(fullDir, { recursive: true });
    cb(null, fullDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  const category = req.params.docType;
  const allowed = ALLOWED_EXTENSIONS[category];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowed || !allowed.includes(ext)) {
    return cb(new Error(`Unsupported file type '${ext}' for ${category}. Allowed: ${allowed ? allowed.join(', ') : 'none'}`));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: (Number(process.env.MAX_UPLOAD_SIZE_MB) || 10) * 1024 * 1024 },
});

module.exports = { upload, CATEGORY_FOLDER };
