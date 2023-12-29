from io import BytesIO
from PIL import Image
import boto3 
import json
import os

s3 = boto3.client('s3')
size = int(os.environ['THUMBNAIL_SIZE'])

def s3_thumbnail_generator(event):

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
        return url

    body = {
        "message": "Go Serverless v3.0! Your function executed successfully!",
        "input": event,
    }

    return {"statusCode": 200, "body": json.dumps(body)}

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