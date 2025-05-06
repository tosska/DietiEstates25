import express from "express";
import { QuizController } from "../controllers/QuizController.js";
import { enforceAuthentication, ensureUsersModifyOnlyOwnQuizzes } from "../middleware/authorization.js";


export const quizRouter = new express.Router();

quizRouter.get("/my-quizzes", enforceAuthentication, (req, res, next) => {
    QuizController.getQuizzesForCurrentUser(req).then(quizItems => {
      res.json(quizItems)
    }).catch(err => {
      next(err);
    });
});

quizRouter.get("/all-quizzes", (req, res, next) => {
  QuizController.getAllQuizzes(req).then(quizItems => {
    res.json(quizItems)
  }).catch(err => {
    next(err);
  });
});
  
quizRouter.post("/my-quizzes", enforceAuthentication, (req, res, next) => {
    QuizController.saveQuiz(req).then( result => {
      res.json(result);
    }).catch(err => {
      next(err);
    });
});

quizRouter.get("/all-quizzes/:quizId", (req, res, next) => {
  QuizController.findById(req).then( (item) => {
      if (item)
          res.json(item);
      else
          next({status: 404, message: "Quiz not found"});
  }).catch( err => {
      next(err);
  })
});

quizRouter.delete("/my-quizzes/:quizId", enforceAuthentication, ensureUsersModifyOnlyOwnQuizzes, (req, res, next) => {
  QuizController.delete(req).then( (item) => {
      if (item)
          res.json(item);
      else
          next({status: 404, message: "Quiz not found"});
  }).catch( err => {
      next(err);
  })
});

quizRouter.get("/all-quizzes/:quizId/qrcode", async (req, res, next) => {
  try {
    const qrCodeUrl = await QuizController.generateQrCode(req); 
    res.json({ qrCodeUrl }); 
  } catch (err) {
    next(err); 
  }
});


