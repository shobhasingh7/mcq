# MCQ Spring Boot Web App

A simple Spring Boot multiple-choice quiz application with a static frontend.

## Features

- REST API for question list and batch answer submission
- Static frontend served by Spring Boot
- Questions loaded from `src/main/resources/questions.csv`
- Clear button for each question to reset answers
- Final submit button to submit all answers at once
- Automatic score calculation and display with percentage

## Run locally

1. Install Java 17 or newer.
2. Build the project:
   ```bash
   mvn clean package
   ```
3. Run the app:
   ```bash
   mvn spring-boot:run
   ```
4. Open `http://localhost:8080` in your browser.
