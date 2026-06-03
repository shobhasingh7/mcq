package com.example.mcq.model;

public class AnswerResponse {
    private boolean correct;
    private String feedback;
    private String explanation;

    public AnswerResponse(boolean correct, String feedback) {
        this(correct, feedback, null);
    }

    public AnswerResponse(boolean correct, String feedback, String explanation) {
        this.correct = correct;
        this.feedback = feedback;
        this.explanation = explanation;
    }

    public boolean isCorrect() {
        return correct;
    }

    public String getFeedback() {
        return feedback;
    }

    public String getExplanation() {
        return explanation;
    }
}
