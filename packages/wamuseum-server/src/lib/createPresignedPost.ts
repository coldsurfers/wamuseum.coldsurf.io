import nconf from 'nconf'
import { S3Client } from '@aws-sdk/client-s3'
import {
  PresignedPostOptions,
  createPresignedPost as s3CreatePresignedPost,
} from '@aws-sdk/s3-presigned-post'

const s3Client = new S3Client({
  region: nconf.get('secrets').AWS_S3_REGION,
  credentials: {
    accessKeyId: nconf.get('secrets').AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: nconf.get('secrets').AWS_S3_SECRET_ACCESS_KEY,
  },
})

export default async function createPresignedPost({
  Key,
  Bucket,
  Fields,
  Expires,
  Conditions,
}: PresignedPostOptions) {
  const post = await s3CreatePresignedPost(s3Client, {
    Bucket,
    Key,
    Fields,
    Expires, // seconds
    Conditions,
  })

  return post
}
