package com.example.mcq.model;

public class AnswerResponse {
    private boolean correct;
    private String feedback;

    public AnswerResponse(boolean correct, String feedback) {
        this.correct = correct;
        this.feedback = feedback;
    }

    public boolean isCorrect() {
        return correct;
    }

    public String getFeedback() {
        return feedback;
    }
}
