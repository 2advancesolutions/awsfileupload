const AWS = require('aws-sdk');
// const sharp = require('sharp');
const s3 = new AWS.S3();
const size = process.env.THUMBNAIL_SIZE;

// AWS Lambda functions
module.exports.s3_thumbnail_generator = async (event, context) => {
    console.log("Event:::", event);
    
    const bucket = event.Records[0].s3.bucket.name;
    const key = event.Records[0].s3.object.key;
    const img_size = event.Records[0].s3.object.size;

    if(!key.endsWith('_thumbnail.png')){
        const image = await get_s3_image(bucket, key);
        const thumbnail = await image_to_thumbnail(image);
        const thumbnail_key = new_file_name(key);
        const url = await upload_to_s3(bucket, thumbnail_key, thumbnail, img_size);
        return {
            "statusCode": 200,
            "body": JSON.stringify({
                "message": "Thumbnail generated and uploaded successfully!",
                "thumbnail_url": url,
                "input": event
            })
        };
    }
};

module.exports.upload_image = async (event, context) => {
    const data = JSON.parse(event.body);
    if (!data.file || !data.filename) {
        return {
            'statusCode': 400,
            'body': JSON.stringify({'error_message': 'Missing file or filename in request body'})
        };
    }

    const file_content = Buffer.from(data.file, 'base64');
    const file_path = data.filename;
    const bucket = 'aws-nodejs-project-dev-bucket';

    try {
        const s3_response = await s3.putObject({Body: file_content, Bucket: bucket, Key: file_path}).promise();
    } catch (e) {
        return {
            'statusCode': 500,
            'body': JSON.stringify({'error_message': e.message})
        };
    }

    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',  // Or the specific origin you want to allow
            'Access-Control-Allow-Credentials': 'true',
        },
        'body': JSON.stringify({
            'message': 'Image uploaded successfully',
            'file': {'file_path': file_path}
        })
    };
};

// Helper functions
async function get_s3_image(bucket, key) {
    const response = await s3.getObject({Bucket: bucket, Key: key}).promise();
    //return sharp(response.Body);
    return response.Body;
}

async function image_to_thumbnail(image) {
    return await image.resize(size, size).toBuffer();
}

function new_file_name(key) {
    const key_split = key.split('.');
    return key_split[0] + '_thumbnail.png';
}

async function upload_to_s3(bucket, key, image, img_size) {
    const params = {
        Bucket: bucket,
        Key: key,
        Body: image,
        ContentType: 'image/png',
        ACL: 'public-read'
    };
    await s3.putObject(params).promise();
    return `https://${bucket}.s3.amazonaws.com/${key}`;
}