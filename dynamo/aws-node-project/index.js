const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

module.exports.create = async (event) => {

    const body = JSON.parse(event.body);
    const item = {
        id: body.id,
        filters: body.filters
    };

    const params = {
        TableName: 'config', // replace with your table name
        Item: item
    };

    try {
        await dynamoDB.put(params).promise();
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',  // Or the specific origin you want to allow
                'Access-Control-Allow-Credentials': 'true',
            },
            body: JSON.stringify(item),
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error' }),
        };
    }
};
