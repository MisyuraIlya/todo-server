import { createClient } from 'redis';


const redis_client  = createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);
redis_client.connect();
redis_client.on('error', (err) => console.log('Redis Client Error', err));
redis_client.on('connect', function () {
    console.log('redis client connected');
});

export default redis_client;