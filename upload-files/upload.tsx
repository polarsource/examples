import fs from 'fs'
import crypto from 'crypto'
import '@dotenvx/dotenvx/config'
import { Polar } from '@polar-sh/sdk'

if (!process.env.POLAR_ORGANIZATION_TOKEN) throw new Error('POLAR_ORGANIZATION_TOKEN is not set')

// Determine MIME type based on file extension
const getMimeType = (filename: string): string => {
  const ext = filename.toLowerCase().split('.').pop()
  const mimeTypes: Record<string, string> = {
    csv: 'text/csv',
    css: 'text/css',
    png: 'image/png',
    gif: 'image/gif',
    mp4: 'video/mp4',
    wav: 'audio/wav',
    txt: 'text/plain',
    jpg: 'image/jpeg',
    html: 'text/html',
    mp3: 'audio/mpeg',
    jpeg: 'image/jpeg',
    svg: 'image/svg+xml',
    xml: 'application/xml',
    zip: 'application/zip',
    avi: 'video/x-msvideo',
    mov: 'video/quicktime',
    pdf: 'application/pdf',
    json: 'application/json',
    doc: 'application/msword',
    ts: 'application/typescript',
    js: 'application/javascript',
    xls: 'application/vnd.ms-excel',
    rar: 'application/x-rar-compressed',
    ppt: 'application/vnd.ms-powerpoint',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  }
  return mimeTypes[ext || ''] || 'application/octet-stream'
}

async function uploadFileAndCreateBenefit(filePath: string) {
  const polar = new Polar({ accessToken: process.env.POLAR_ORGANIZATION_TOKEN, server: 'sandbox' })
  // Step 1: Read and prepare file
  const fileBuffer = fs.readFileSync(filePath) // Read as Buffer (binary data)
  const fileSize = fileBuffer.length
  const fileName = filePath.split('/').pop() || 'file'

  const mimeType = getMimeType(fileName)

  // Calculate checksum
  const hash = crypto.createHash('sha256')
  hash.update(fileBuffer)
  const checksumSha256Base64 = hash.digest('base64')

  // Step 2: Create file record
  const fileRecord = await polar.files.create({
    name: fileName,
    mimeType,
    size: fileSize,
    checksumSha256Base64,
    upload: {
      parts: [
        {
          number: 1,
          chunkStart: 0,
          chunkEnd: fileSize - 1,
          checksumSha256Base64,
        },
      ],
    },
    service: 'downloadable',
  })

  // Step 3: Upload file content
  const uploadUrl = fileRecord.upload.parts[0].url
  const uploadHeaders = fileRecord.upload.parts[0].headers || {}

  // Don't override Content-Type if it's already set by Polar
  if (!uploadHeaders['Content-Type']) uploadHeaders['Content-Type'] = mimeType

  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: uploadHeaders,
    body: fileBuffer, // Send Buffer directly as binary data
  })

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text()
    throw new Error(`Upload failed: ${uploadResponse.statusText} - ${errorText}`)
  }

  // Get ETag from response headers
  const etag = uploadResponse.headers.get('etag') || uploadResponse.headers.get('ETag')

  // Step 4: Complete upload
  await polar.files.uploaded({
    id: fileRecord.id,
    fileUploadCompleted: {
      id: fileRecord.upload.id,
      path: fileRecord.upload.path,
      parts: [
        {
          number: 1,
          checksumEtag: etag || '',
          checksumSha256Base64,
        },
      ],
    },
  })

  return fileRecord.id
}

// Usage
uploadFileAndCreateBenefit('./sample.txt')
