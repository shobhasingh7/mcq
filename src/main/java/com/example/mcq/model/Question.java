package com.example.mcq.model;

import java.util.List;

public class Question {
    private int id;
    private String text;
    private List<String> choices;
    private int correctIndex;

    public Question() {
    }

    public Question(int id, String text, List<String> choices, int correctIndex) {
        this.id = id;
        this.text = text;
        this.choices = choices;
        this.correctIndex = correctIndex;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public List<String> getChoices() {
        return choices;
    }

    public void setChoices(List<String> choices) {
        this.choices = choices;
    }

    public int getCorrectIndex() {
        return correctIndex;
    }

    public void setCorrectIndex(int correctIndex) {
        this.correctIndex = correctIndex;
    }
}
