import express from 'express';
import cors from 'cors';

const app = express();

// app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get('/', (request, response) => {
  return response.json({msg: 'Welcome to Travel Buddy API'});
});

app.listen(PORT, () => {
  console.log(`App is listening to port: ${PORT}`);
});