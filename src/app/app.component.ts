import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { timeout } from 'rxjs';

interface Question {
  id: number;
  text: string;
  choices: string[];
  correctIndex: number;
  topic: string;
  explanation: string;
}

interface AnswerPayload {
  questionId: number;
  selectedIndex: number;
}

interface AnswerResult {
  correct: boolean;
  feedback: string;
  explanation?: string | null;
}

interface BatchAnswerResponse {
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  message: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private readonly http = inject(HttpClient);
  private readonly apiTimeoutMs = 5000;

  readonly questionsPerPage = 10;

  allQuestions: Question[] = [];
  answers: Record<number, number> = {};
  results: Record<number, AnswerResult> = {};

  currentPage = 1;
  loading = true;
  errorMessage = '';
  finalResult: BatchAnswerResponse | null = null;

  constructor() {
    this.loadQuestions();
  }

  get pagedQuestions(): Question[] {
    const startIndex = (this.currentPage - 1) * this.questionsPerPage;
    return this.allQuestions.slice(startIndex, startIndex + this.questionsPerPage);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.allQuestions.length / this.questionsPerPage));
  }

  get allAnswered(): boolean {
    return this.allQuestions.length > 0
      && this.allQuestions.every((question) => this.answers[question.id] !== undefined);
  }

  loadQuestions(): void {
    this.loading = true;
    this.errorMessage = '';

    this.http.get<Question[]>('/api/questions')
      .pipe(timeout(this.apiTimeoutMs))
      .subscribe({
      next: (questions) => {
        this.allQuestions = questions;
        this.loading = false;
        this.currentPage = 1;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Unable to load questions. If you are running locally, start the API with `npm run serve:api`.';
      }
    });
  }

  trackQuestion(_index: number, question: Question): number {
    return question.id;
  }

  trackChoice(index: number): number {
    return index;
  }

  setAnswer(questionId: number, selectedIndex: number): void {
    this.answers[questionId] = selectedIndex;
  }

  clearAnswer(questionId: number): void {
    delete this.answers[questionId];
    delete this.results[questionId];
  }

  submitSingleAnswer(questionId: number): void {
    const selectedIndex = this.answers[questionId];

    if (selectedIndex === undefined) {
      this.results[questionId] = {
        correct: false,
        feedback: 'Please select an answer before submitting.'
      };
      return;
    }

    const payload: AnswerPayload = { questionId, selectedIndex };
    this.http.post<AnswerResult>('/api/submit', payload)
      .pipe(timeout(this.apiTimeoutMs))
      .subscribe({
      next: (result) => {
        this.results[questionId] = result;
      },
      error: () => {
        this.results[questionId] = {
          correct: false,
          feedback: 'Error submitting answer. Please try again.'
        };
      }
    });
  }

  submitAllAnswers(): void {
    if (!this.allAnswered) {
      this.finalResult = {
        totalQuestions: this.allQuestions.length,
        correctAnswers: 0,
        percentage: 0,
        message: 'Please answer all questions before submitting.'
      };
      return;
    }

    const payload = {
      answers: Object.entries(this.answers).map(([questionId, selectedIndex]) => ({
        questionId: Number(questionId),
        selectedIndex
      }))
    };

    this.http.post<BatchAnswerResponse>('/api/submit-all', payload)
      .pipe(timeout(this.apiTimeoutMs))
      .subscribe({
      next: (result) => {
        this.finalResult = result;
      },
      error: () => {
        this.finalResult = {
          totalQuestions: this.allQuestions.length,
          correctAnswers: 0,
          percentage: 0,
          message: 'Error submitting answers. Please try again.'
        };
      }
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
  }

  formatExplanation(explanation: string | null | undefined): string {
    if (!explanation) {
      return '';
    }

    return explanation.replace(
      /<pre>\s*<code class="language-java">([\s\S]*?)<\/code>\s*<\/pre>/g,
      '<div class="java-snippet"><div class="java-snippet-label">Java</div><pre><code class="language-java">$1</code></pre></div>'
    );
  }
}
