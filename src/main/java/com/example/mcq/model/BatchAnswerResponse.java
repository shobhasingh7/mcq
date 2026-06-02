package com.example.mcq.model;

public class BatchAnswerResponse {
    private int totalQuestions;
    private int correctAnswers;
    private double percentage;
    private String message;

    public BatchAnswerResponse(int totalQuestions, int correctAnswers, double percentage, String message) {
        this.totalQuestions = totalQuestions;
        this.correctAnswers = correctAnswers;
        this.percentage = percentage;
        this.message = message;
    }

    public int getTotalQuestions() {
        return totalQuestions;
    }

    public int getCorrectAnswers() {
        return correctAnswers;
    }

    public double getPercentage() {
        return percentage;
    }

    public String getMessage() {
        return message;
    }
}
