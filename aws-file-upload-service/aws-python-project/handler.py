from io import BytesIO
from PIL import Image, ImageOps
import boto3 
import json
import os
import base64
from botocore.exceptions import NoCredentialsError

s3 = boto3.client('s3')
size = int(os.environ['THUMBNAIL_SIZE'])

# aws lambda functions
def s3_thumbnail_generator(event, context):

    #parse event
    print("Event:::", event)
    
    bucket = event['Records'][0]['s3']['bucket']['name']
    key = event['Records'][0]['s3']['object']['key']
    img_size = event['Records'][0]['s3']['object']['size']

    if(not key.endswith('_thumbnail.png')):
        image = get_s3_image(bucket, key)
        thumbnail = image_to_thumbnail(image)
        thumbnail_key = new_file_name(key)
        url = upload_to_s3(bucket, thumbnail_key, thumbnail, img_size) 
        return {
            "statusCode": 200,
            "body": json.dumps({
                "message": "Thumbnail generated and uploaded successfully!",
                "thumbnail_url": url,
                "input": event
            })
        }
      
def upload_image(event, context):
    if 'body' in event and event['body'].strip():
        try:
            data = json.loads(event['body'])
        except json.JSONDecodeError:
            return {
                'statusCode': 400,
                'body': json.dumps({'error_message': 'Invalid JSON format'})
            }
    else:
        return {
            'statusCode': 400,
            'body': json.dumps({'error_message': 'Missing request body'})
        }

    if 'file' not in data or 'filename' not in data:
        return {
            'statusCode': 400,
            'body': json.dumps({'error_message': 'Missing file or filename in request body'})
        }

    file_content = base64.b64decode(data['file'])
    file_path = data['filename']
    bucket = 'aws-python-project-dev-bucket'

    try:
        s3_response = s3.put_object(Body=file_content, Bucket=bucket, Key=file_path)
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error_message': str(e)})
        }

    return {
    'statusCode': 200,
    'headers': {
        'Access-Control-Allow-Origin': '*',  # Or the specific origin you want to allow
        'Access-Control-Allow-Credentials': 'true',
    },
    'body': json.dumps({
        'message': 'Image uploaded successfully',
        'file': {'file_path': file_path}
    })
}

# helper functions 
def get_s3_image(bucket, key):
    response = s3.get_object(Bucket=bucket, Key=key)
    imageContent = response['Body'].read()
    file = BytesIO(imageContent)
    img = Image.open(file)
    return img

def image_to_thumbnail(image):
    return ImageOps.fit(image, (size, size), Image.ANTIALIAS)

def new_file_name(key):
     key_split = key.rsplit('.', 1)
     return key_split[0] + '_thumbnail.png'

def upload_to_s3(bucket, key, image, img_size):
    
    out_thumbnail = BytesIO()
    image.save(out_thumbnail, 'PNG')
    out_thumbnail.seek(0)
    s3.put_object(Bucket=bucket, Key=key, Body=out_thumbnail)
    
    response = s3.put_object_acl(
        ACL='public-read', 
        Body=out_thumbnail,
        ContentType='image/png',
        Bucket=bucket, 
        Key=key
        )
    
    print(response)

    url = '{}/{}/{}'.format(s3.meta.endpoint_url, bucket, key)
    return url
