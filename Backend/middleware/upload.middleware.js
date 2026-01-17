import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ensureUploadDir = (subDir) => {
    const fullPath = path.join(__dirname, '../uploads', subDir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }
    return fullPath;
};

const createStorage = (subDir) => multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, ensureUploadDir(subDir));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const createFileFilter = (allowedTypes) => (req, file, cb) => {
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    }
    cb(new Error('Invalid file type'));
};

const fiveMbLimit = { fileSize: 5 * 1024 * 1024 };

// Agent KYC docs (images + PDF)
export const uploadAgentDocs = multer({
    storage: createStorage('agent_docs'),
    limits: fiveMbLimit,
    fileFilter: createFileFilter(/jpeg|jpg|png|pdf/)
});

// Policy photos (images only)
export const uploadPolicyPhotos = multer({
    storage: createStorage('policy_photos'),
    limits: fiveMbLimit,
    fileFilter: createFileFilter(/jpeg|jpg|png/)
});

// Claim documents (images + PDF)
export const uploadClaimDocs = multer({
    storage: createStorage('claim_docs'),
    limits: fiveMbLimit,
    fileFilter: createFileFilter(/jpeg|jpg|png|pdf/)
});
