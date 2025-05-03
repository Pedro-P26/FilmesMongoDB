const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const router = express.Router();

const MONGODB_URI = process.env.MONGODB_URI;

router.get('/movies', async (req, res) => {
  const client = new MongoClient(MONGODB_URI);
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  try {
    await client.connect();
    const db = client.db('sample_mflix');
    const collection = db.collection('embedded_movies');

    const total = await collection.countDocuments({
      poster: { $exists: true, $ne: '' },
      title: { $exists: true, $ne: '' }
    });

    const movies = await collection
      .find({ poster: { $exists: true, $ne: '' }, title: { $exists: true, $ne: '' } })
      .skip(skip)
      .limit(limit)
      .toArray();

    res.json({ movies, total });
  } catch (err) {
    console.error('Erro ao procurar filmes:', err);
    res.status(500).json({ error: 'Erro ao procurar filmes' });
  } finally {
    await client.close();
  }
});

router.get('/movie/:id', async (req, res) => {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('sample_mflix');
    const movie = await db.collection('embedded_movies')
      .findOne({ _id: new ObjectId(req.params.id) });
    const comments = await db.collection('comments').find({ movie_id: movie._id }).toArray();
    res.json({ movie, comments });
  } catch (err) {
    console.error('Erro ao procurar detalhes:', err);
    res.status(500).json({ error: 'Erro ao procurar detalhes' });
  } finally {
    await client.close();
  }
});

// Criar novo comentário
router.post('/movie/:id/comment', async (req, res) => {
  const client = new MongoClient(MONGODB_URI);
  const { name, text } = req.body;
  try {
    await client.connect();
    const db = client.db('sample_mflix');
    const comment = {
      movie_id: new ObjectId(req.params.id),
      name,
      text,
      date: new Date()
    };
    const result = await db.collection('comments').insertOne(comment);
    res.json({ success: true, commentId: result.insertedId });
  } catch (err) {
    console.error('Erro ao criar comentário:', err);
    res.status(500).json({ error: 'Erro ao criar comentário' });
  } finally {
    await client.close();
  }
});

// Atualizar comentário
router.put('/comment/:commentId', async (req, res) => {
  const client = new MongoClient(MONGODB_URI);
  const { name, text } = req.body;
  try {
    await client.connect();
    const db = client.db('sample_mflix');
    await db.collection('comments').updateOne(
      { _id: new ObjectId(req.params.commentId) },
      { $set: { name, text, date: new Date() } }
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Erro ao atualizar comentário:', err);
    res.status(500).json({ error: 'Erro ao atualizar comentário' });
  } finally {
    await client.close();
  }
});


// Remover comentário
router.delete('/comment/:commentId', async (req, res) => {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('sample_mflix');
    await db.collection('comments').deleteOne({ _id: new ObjectId(req.params.commentId) });
    res.json({ success: true });
  } catch (err) {
    console.error('Erro ao remover comentário:', err);
    res.status(500).json({ error: 'Erro ao remover comentário' });
  } finally {
    await client.close();
  }
});

module.exports = router;
