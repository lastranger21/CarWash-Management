import multer from 'multer'
import path from 'path'

const storage = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null,'public/uploads')
    },
    filename: (req, file,cb) => {
        const uniqueSuffix = Date.now()+'-'+Math.round(Math.random()*1E9)
        cb(null, file.fieldname+ '-'+uniqueSuffix+path.extname(file.originalname))
    }
})
const fileFilter = (req:any, file:any, cb:any) =>{
    console.log('Mimetype:', file.mimetype);
    console.log('Original name:', file.originalname);
    if (file.mimetype.startsWith('image/')) {
        cb(null,true)
    }else{
        cb(new Error('hanya file gambar yang diperbolehkan'),false)
    }
}

export const upload = multer({storage,fileFilter})