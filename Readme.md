# Isp Mikrotik web panel

## Multer and Cloudinary

Cloudinary is like aws service Which is use for storing files, actually its use aws behind the seen, and also its gives us many modifications of AWS. Just like a wrapper of aws.

Multer is a fileUploading pkg.

# The approuch of our project is,

At 1st we would take files and store them into our local server useing multer,
afterthat , cloudinary will take this file and upload to cloudinary server,

there are 2 steps,
1 .stored in local server, // so that we can reattepmt it.
2 .upload to cloud server
