const express = require('express');
const router = express.Router();
const flashcardController = require('../controller/flashcardController');
const { verify } = require('../middleware/verify');

// Teacher routes
router.post('/create', verify, flashcardController.createFlashcardDeck);
router.post('/:deckId/cards', verify, flashcardController.addCards);
router.put('/:deckId/cards/:cardId', verify, flashcardController.editCard);
router.delete('/:deckId/cards/:cardId', verify, flashcardController.deleteCard);
router.put('/:deckId/publish', verify, flashcardController.publishDeck);
router.get('/teacher/decks', verify, flashcardController.getTeacherDecks);
router.get('/:deckId/details', verify, flashcardController.getDeckDetails);
router.delete('/:deckId', verify, flashcardController.deleteDeck);

// Student routes (public)
router.get('/course/:courseId', flashcardController.getCourseDecks);
router.get('/:deckId/study', flashcardController.getStudyDeck);

module.exports = router;