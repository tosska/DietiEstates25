import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({ // NOSONAR: i limiti sono impostati nell'istanza multer sotto
  destination: (req, file, cb) => {
    // per ora salviamo in una cartella temporanea
    const uploadPath = path.join(process.cwd(), "images/active", "temp");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true }); 
    }
    cb(null, uploadPath); // <--- null = nessun errore, uploadPath = destinazione
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // <--- null = nessun errore, newName = nome del file finale
  }
});

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limite di 5MB (in bytes)
  }
});


