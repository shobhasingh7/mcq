package com.example.mcq.service;

import com.example.mcq.model.Question;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
public class QuestionService {
    private final List<Question> questions = new ArrayList<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public QuestionService() {
        loadQuestionsFromJson("questions.json");
    }

    public List<Question> findAll() {
        return questions;
    }

    public Optional<Question> findById(int id) {
        return questions.stream()
                .filter(question -> question.getId() == id)
                .findFirst();
    }

    private void loadQuestionsFromJson(String resourceName) {
        try (InputStream inputStream = getClass().getClassLoader().getResourceAsStream(resourceName)) {
            if (inputStream == null) {
                throw new IllegalStateException("Resource not found: " + resourceName);
            }
            List<Question> loadedQuestions = objectMapper.readValue(inputStream, new TypeReference<List<Question>>() {});
            for (Question loadedQuestion : loadedQuestions) {
                List<String> choices = new ArrayList<>(loadedQuestion.getChoices());
                int correctIndex = shuffleChoices(choices, loadedQuestion.getCorrectIndex());
                questions.add(new Question(
                        loadedQuestion.getId(),
                        loadedQuestion.getText(),
                        choices,
                        correctIndex,
                        loadedQuestion.getTopic(),
                        loadedQuestion.getExplanation()
                ));
            }
        } catch (IOException e) {
            throw new IllegalStateException("Unable to load questions from JSON", e);
        }
    }

    private int shuffleChoices(List<String> choices, int correctIndex) {
        String correctChoice = choices.get(correctIndex);
        Collections.shuffle(choices);
        return choices.indexOf(correctChoice);
    }
}
