// const express = require('express');
// const router = express.Router();
// const History = require('../models/History');

// router.get('/users/:userId/history', async (req, res) => {
//   try {
//     const userId = req.params.userId;

//     const history = await History.find({ userId }).sort({ timestamp: -1 });
//     res.status(200).json(history);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// module.exports = router;
