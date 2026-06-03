# MCQ Angular + Vercel App

A multiple-choice quiz application built as an Angular frontend with Vercel serverless API functions.

## Features

- Angular single-page frontend
- Vercel API functions for question retrieval and answer submission
- Questions loaded from `src/main/resources/questions.json`
- Clear button for each question to reset answers
- Final submit button to submit all answers at once
- Automatic score calculation and display with percentage
- Explanation rendering with multiline HTML support for code snippets

## Run locally

1. Install Node.js 18+.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Angular development server:
   ```bash
   npm start
   ```
4. In a separate terminal, run Vercel locally if you want the `/api/*` functions:
   ```bash
   npx vercel dev
   ```
5. Open the local URL shown by Vercel.

## Deploy to Vercel

1. Import this repository into Vercel.
2. Keep the default install command `npm install`.
3. Use the provided build command from `vercel.json`.
4. Deploy.
