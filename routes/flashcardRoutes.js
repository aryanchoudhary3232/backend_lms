const express = require('express');
const router = express.Router();
const verify = require('../middleware/verify');
const flashcard = require('../controller/flashcardController');

// teacher-owned deck APIs
router.get('/teacher/decks', verify.verify, verify.verifyTeacher, flashcard.getTeacherDecks);
router.post('/create', verify.verify, verify.verifyTeacher, flashcard.createFlashcardDeck);
router.get('/:deckId/details', verify.verify, verify.verifyTeacher, flashcard.getDeckDetails);
router.delete('/:deckId', verify.verify, verify.verifyTeacher, flashcard.deleteDeck);

router.post('/:deckId/cards', verify.verify, verify.verifyTeacher, flashcard.addCards);
router.put('/:deckId/cards/:cardId', verify.verify, verify.verifyTeacher, flashcard.editCard);
router.delete('/:deckId/cards/:cardId', verify.verify, verify.verifyTeacher, flashcard.deleteCard);

router.post('/:deckId/publish', verify.verify, verify.verifyTeacher, flashcard.publishDeck);
router.put('/:deckId/publish', verify.verify, verify.verifyTeacher, flashcard.publishDeck);

// Student APIs
router.get('/course/:courseId', verify.verify, flashcard.getCourseDecks);
router.get('/student/deck/:deckId', verify.verify, flashcard.getStudyDeck);

module.exports = router;