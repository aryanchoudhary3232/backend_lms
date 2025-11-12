const Flashcard = require('../models/Flashcard');
const Course = require('../models/Course');
const { respond } = require('../utils/respond');

// Create flashcard deck
exports.createFlashcardDeck = async (req, res) => {
  try {
    const { courseId, title, description, cards, visibility } = req.body;
    const teacherId = req.user.id;

    // Verify teacher owns the course
    const course = await Course.findById(courseId);
    if (!course || course.instructor.toString() !== teacherId) {
      return respond(res, 403, false, 'Not authorized to create flashcards for this course');
    }

    const flashcard = new Flashcard({
      courseId,
      createdBy: teacherId,
      title,
      description,
      cards: cards || [],
      visibility: visibility || 'private'
    });

    await flashcard.save();
    respond(res, 201, true, 'Flashcard deck created', flashcard);
  } catch (error) {
    respond(res, 500, false, error.message);
  }
};

// Add cards to deck
exports.addCards = async (req, res) => {
  try {
    const { deckId } = req.params;
    const { cards } = req.body;
    const teacherId = req.user.id;

    const flashcard = await Flashcard.findById(deckId);
    if (!flashcard || flashcard.createdBy.toString() !== teacherId) {
      return respond(res, 403, false, 'Not authorized');
    }

    if (flashcard.isPublished) {
      return respond(res, 400, false, 'Cannot edit published decks. Create a new version.');
    }

    flashcard.cards.push(...cards);
    flashcard.updatedAt = new Date();
    await flashcard.save();

    respond(res, 200, true, 'Cards added', flashcard);
  } catch (error) {
    respond(res, 500, false, error.message);
  }
};

// Edit a single card
exports.editCard = async (req, res) => {
  try {
    const { deckId, cardId } = req.params;
    const { question, answer, clozeText, hints, difficulty, tags, lectureTimestamp } = req.body;
    const teacherId = req.user.id;

    const flashcard = await Flashcard.findById(deckId);
    if (!flashcard || flashcard.createdBy.toString() !== teacherId) {
      return respond(res, 403, false, 'Not authorized');
    }

    if (flashcard.isPublished) {
      return respond(res, 400, false, 'Cannot edit published decks');
    }

    const card = flashcard.cards.id(cardId);
    if (!card) {
      return respond(res, 404, false, 'Card not found');
    }

    Object.assign(card, {
      question: question || card.question,
      answer: answer || card.answer,
      clozeText: clozeText || card.clozeText,
      hints: hints || card.hints,
      difficulty: difficulty || card.difficulty,
      tags: tags || card.tags,
      lectureTimestamp: lectureTimestamp || card.lectureTimestamp
    });

    flashcard.updatedAt = new Date();
    await flashcard.save();

    respond(res, 200, true, 'Card updated', card);
  } catch (error) {
    respond(res, 500, false, error.message);
  }
};

// Delete a card
exports.deleteCard = async (req, res) => {
  try {
    const { deckId, cardId } = req.params;
    const teacherId = req.user.id;

    const flashcard = await Flashcard.findById(deckId);
    if (!flashcard || flashcard.createdBy.toString() !== teacherId) {
      return respond(res, 403, false, 'Not authorized');
    }

    if (flashcard.isPublished) {
      return respond(res, 400, false, 'Cannot edit published decks');
    }

    flashcard.cards.id(cardId).deleteOne();
    flashcard.updatedAt = new Date();
    await flashcard.save();

    respond(res, 200, true, 'Card deleted');
  } catch (error) {
    respond(res, 500, false, error.message);
  }
};

// Publish deck
exports.publishDeck = async (req, res) => {
  try {
    const { deckId } = req.params;
    const teacherId = req.user.id;

    const flashcard = await Flashcard.findById(deckId);
    if (!flashcard || flashcard.createdBy.toString() !== teacherId) {
      return respond(res, 403, false, 'Not authorized');
    }

    if (flashcard.cards.length === 0) {
      return respond(res, 400, false, 'Deck must have at least one card');
    }

    flashcard.isPublished = true;
    flashcard.visibility = 'course';
    await flashcard.save();

    respond(res, 200, true, 'Deck published', flashcard);
  } catch (error) {
    respond(res, 500, false, error.message);
  }
};

// Get teacher's decks
exports.getTeacherDecks = async (req, res) => {
  try {
    const teacherId = req.user.id;

    const decks = await Flashcard.find({ createdBy: teacherId })
      .populate('courseId', 'name')
      .select('-cards');

    respond(res, 200, true, 'Decks retrieved', decks);
  } catch (error) {
    respond(res, 500, false, error.message);
  }
};

// Get deck details (for editing)
exports.getDeckDetails = async (req, res) => {
  try {
    const { deckId } = req.params;
    const teacherId = req.user.id;

    const flashcard = await Flashcard.findById(deckId).populate('courseId');
    if (!flashcard || flashcard.createdBy.toString() !== teacherId) {
      return respond(res, 403, false, 'Not authorized');
    }

    respond(res, 200, true, 'Deck retrieved', flashcard);
  } catch (error) {
    respond(res, 500, false, error.message);
  }
};

// Get published decks for a course (students view)
exports.getCourseDecks = async (req, res) => {
  try {
    const { courseId } = req.params;

    const decks = await Flashcard.find({
      courseId,
      isPublished: true
    })
    .populate('createdBy', 'name')
    .select('-cards.hints');

    respond(res, 200, true, 'Decks retrieved', decks);
  } catch (error) {
    respond(res, 500, false, error.message);
  }
};

// Get deck for studying (student view)
exports.getStudyDeck = async (req, res) => {
  try {
    const { deckId } = req.params;

    const flashcard = await Flashcard.findById(deckId);
    if (!flashcard || !flashcard.isPublished) {
      return respond(res, 404, false, 'Deck not found');
    }

    respond(res, 200, true, 'Study deck retrieved', flashcard);
  } catch (error) {
    respond(res, 500, false, error.message);
  }
};

// Delete deck
exports.deleteDeck = async (req, res) => {
  try {
    const { deckId } = req.params;
    const teacherId = req.user.id;

    const flashcard = await Flashcard.findById(deckId);
    if (!flashcard || flashcard.createdBy.toString() !== teacherId) {
      return respond(res, 403, false, 'Not authorized');
    }

    await Flashcard.findByIdAndDelete(deckId);
    respond(res, 200, true, 'Deck deleted');
  } catch (error) {
    respond(res, 500, false, error.message);
  }
};