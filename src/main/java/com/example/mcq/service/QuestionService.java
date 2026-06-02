package com.example.mcq.service;

import com.example.mcq.model.Question;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class QuestionService {
    private final List<Question> questions = new ArrayList<>();

    public QuestionService() {
        loadQuestionsFromCsv("questions.csv");
    }

    public List<Question> findAll() {
        return questions;
    }

    public Optional<Question> findById(int id) {
        return questions.stream()
                .filter(question -> question.getId() == id)
                .findFirst();
    }

    private void loadQuestionsFromCsv(String resourceName) {
        try (InputStream inputStream = getClass().getClassLoader().getResourceAsStream(resourceName)) {
            if (inputStream == null) {
                throw new IllegalStateException("Resource not found: " + resourceName);
            }
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {
                String header = reader.readLine();
                if (header == null) {
                    return;
                }
                String line;
                while ((line = reader.readLine()) != null) {
                    List<String> fields = parseCsvLine(line);
                    if (fields.size() < 4) {
                        continue;
                    }
                    int id = Integer.parseInt(fields.get(0).trim());
                    String text = fields.get(1).trim();
                    List<String> choices = List.of(fields.get(2).split("\\|"));
                    int correctIndex = Integer.parseInt(fields.get(3).trim());
                    questions.add(new Question(id, text, choices, correctIndex));
                }
            }
        } catch (IOException e) {
            throw new IllegalStateException("Unable to load questions from CSV", e);
        }
    }

    private List<String> parseCsvLine(String line) {
        List<String> fields = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inQuotes = false;

        for (int i = 0; i < line.length(); i++) {
            char ch = line.charAt(i);
            if (ch == '"') {
                if (inQuotes && i + 1 < line.length() && line.charAt(i + 1) == '"') {
                    current.append('"');
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (ch == ',' && !inQuotes) {
                fields.add(current.toString());
                current.setLength(0);
            } else {
                current.append(ch);
            }
        }
        fields.add(current.toString());
        return fields;
    }
}
