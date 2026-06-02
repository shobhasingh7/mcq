package com.example.mcq.controller;

import com.example.mcq.model.AnswerRequest;
import com.example.mcq.model.AnswerResponse;
import com.example.mcq.model.BatchAnswerRequest;
import com.example.mcq.model.BatchAnswerResponse;
import com.example.mcq.model.Question;
import com.example.mcq.service.QuestionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class QuestionController {
    private final QuestionService questionService;

    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    @GetMapping("/questions")
    public List<Question> getQuestions() {
        return questionService.findAll();
    }

    @PostMapping("/submit")
    public ResponseEntity<AnswerResponse> submitAnswer(@RequestBody AnswerRequest request) {
        return questionService.findById(request.getQuestionId())
                .map(question -> {
                    boolean correct = question.getCorrectIndex() == request.getSelectedIndex();
                    String feedback = correct ? "Correct!" : "Incorrect. Try again.";
                    return ResponseEntity.ok(new AnswerResponse(correct, feedback));
                })
                .orElse(ResponseEntity.badRequest().body(new AnswerResponse(false, "Question not found.")));
    }

    @PostMapping("/submit-all")
    public ResponseEntity<BatchAnswerResponse> submitAllAnswers(@RequestBody BatchAnswerRequest request) {
        int correctCount = 0;
        List<AnswerRequest> answers = request.getAnswers();

        for (AnswerRequest answer : answers) {
            var question = questionService.findById(answer.getQuestionId());
            if (question.isPresent() && question.get().getCorrectIndex() == answer.getSelectedIndex()) {
                correctCount++;
            }
        }

        int total = answers.size();
        double percentage = total > 0 ? (correctCount * 100.0) / total : 0;
        String message = "You scored " + correctCount + " out of " + total + " (" + String.format("%.1f", percentage) + "%)";

        return ResponseEntity.ok(new BatchAnswerResponse(total, correctCount, percentage, message));
    }
}
