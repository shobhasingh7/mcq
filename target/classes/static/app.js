const quizContainer = document.getElementById('quiz-container');
const paginationSection = document.getElementById('pagination-section');
const finalSubmitSection = document.getElementById('final-submit-section');
const resultContainer = document.getElementById('result');
const answers = {};

const QUESTIONS_PER_PAGE = 10;
let allQuestions = [];
let currentPage = 1;

fetch('/api/questions')
  .then(response => response.json())
  .then(questions => {
    allQuestions = shuffleArray(questions);
    renderPage(1);
    renderPaginationControls();
    renderFinalSubmitButton();
  })
  .catch(() => {
    quizContainer.innerHTML = '<p>Unable to load questions. Please try again later.</p>';
  });

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function renderPage(pageNumber) {
  quizContainer.innerHTML = '';
  currentPage = pageNumber;
  
  const startIndex = (pageNumber - 1) * QUESTIONS_PER_PAGE;
  const endIndex = Math.min(startIndex + QUESTIONS_PER_PAGE, allQuestions.length);
  const questionsToShow = allQuestions.slice(startIndex, endIndex);
  
  questionsToShow.forEach(question => renderQuestion(question));
  updatePaginationControls();
}

function renderQuestion(question) {
  const section = document.createElement('section');
  section.className = 'question-card';
  section.setAttribute('data-question-id', question.id);
  section.innerHTML = `
    <div class="question-topic">${question.topic}</div>
    <div class="question-text">${question.text}</div>
    <div class="choices"></div>
    <div class="button-group">
      <button class="clear-button">Clear</button>
      <button class="submit-button">Submit</button>
    </div>
    <div class="question-result" aria-live="polite"></div>
  `;

  const choicesElement = section.querySelector('.choices');
  question.choices.forEach((choice, index) => {
    const label = document.createElement('label');
    label.className = 'choice-label';
    label.innerHTML = `
      <input type="radio" name="question-${question.id}" value="${index}" />
      ${choice}
    `;
    choicesElement.appendChild(label);
  });

  // Restore previous answer if it exists
  if (answers[question.id] !== undefined) {
    const radio = section.querySelector(`input[value="${answers[question.id]}"]`);
    if (radio) {
      radio.checked = true;
    }
  }

  const clearButton = section.querySelector('.clear-button');
  clearButton.addEventListener('click', () => clearAnswer(question.id, section));

  const submitBtn = section.querySelector('.submit-button');
  submitBtn.addEventListener('click', () => submitSingleAnswer(question.id, section));

  const radios = section.querySelectorAll('input[type="radio"]');
  radios.forEach(radio => {
    radio.addEventListener('change', () => {
      answers[question.id] = Number(radio.value);
    });
  });

  quizContainer.appendChild(section);
}

function clearAnswer(questionId, section) {
  const radios = section.querySelectorAll('input[type="radio"]');
  radios.forEach(radio => radio.checked = false);
  delete answers[questionId];
  const qres = section.querySelector('.question-result');
  if (qres) {
    qres.textContent = '';
    qres.className = 'question-result';
  }
}

function submitSingleAnswer(questionId, section) {
  const selected = section.querySelector('input[type="radio"]:checked');
  const qres = section.querySelector('.question-result');
  if (!selected) {
    if (qres) {
      qres.textContent = 'Please select an answer before submitting.';
      qres.className = 'question-result error';
    }
    return;
  }

  const payload = {
    questionId,
    selectedIndex: Number(selected.value)
  };

  fetch('/api/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
    .then(response => response.json())
    .then(data => {
      if (qres) {
        qres.className = data.correct ? 'question-result success' : 'question-result error';
        qres.innerHTML = data.correct && data.explanation
          ? `
            <div class="question-feedback">${data.feedback}</div>
            <div class="question-explanation">${data.explanation}</div>
          `
          : data.feedback;
      }
      answers[questionId] = Number(selected.value);
    })
    .catch(() => {
      if (qres) {
        qres.textContent = 'Error submitting answer. Please try again.';
        qres.className = 'question-result error';
      }
    });
}

function renderPaginationControls() {
  const totalPages = Math.ceil(allQuestions.length / QUESTIONS_PER_PAGE);
  
  if (totalPages <= 1) {
    paginationSection.innerHTML = '';
    return;
  }

  const nav = document.createElement('nav');
  nav.className = 'pagination-nav';
  
  const prevBtn = document.createElement('button');
  prevBtn.className = 'pagination-button prev-button';
  prevBtn.textContent = '← Previous';
  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      renderPage(currentPage - 1);
    }
  });
  
  const pageInfo = document.createElement('span');
  pageInfo.className = 'page-info';
  
  const nextBtn = document.createElement('button');
  nextBtn.className = 'pagination-button next-button';
  nextBtn.textContent = 'Next →';
  nextBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
      renderPage(currentPage + 1);
    }
  });
  
  nav.appendChild(prevBtn);
  nav.appendChild(pageInfo);
  nav.appendChild(nextBtn);
  paginationSection.appendChild(nav);
  
  updatePaginationControls();
}

function updatePaginationControls() {
  const totalPages = Math.ceil(allQuestions.length / QUESTIONS_PER_PAGE);
  const pageInfo = document.querySelector('.page-info');
  if (pageInfo) {
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  }
  
  const prevBtn = document.querySelector('.prev-button');
  const nextBtn = document.querySelector('.next-button');
  
  if (prevBtn) {
    prevBtn.disabled = currentPage === 1;
  }
  if (nextBtn) {
    nextBtn.disabled = currentPage === totalPages;
  }
}

function renderFinalSubmitButton() {
  const button = document.createElement('button');
  button.className = 'final-submit-button';
  button.textContent = 'Submit All Answers';
  button.addEventListener('click', submitAllAnswers);
  finalSubmitSection.appendChild(button);
}

function submitAllAnswers() {
  if (allQuestions.length === 0) {
    return;
  }

  const allAnswered = allQuestions.every(q => answers[q.id] !== undefined);
  
  if (!allAnswered) {
    resultContainer.textContent = 'Please answer all questions before submitting.';
    resultContainer.className = 'error';
    return;
  }

  const answerList = [];
  for (const [questionId, selectedIndex] of Object.entries(answers)) {
    answerList.push({
      questionId: Number(questionId),
      selectedIndex: Number(selectedIndex)
    });
  }

  const payload = {
    answers: answerList
  };

  fetch('/api/submit-all', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
    .then(response => response.json())
    .then(data => {
      resultContainer.innerHTML = `
        <div class="score-card">
          <div class="score-message">${data.message}</div>
          <div class="score-details">
            <span>Correct: ${data.correctAnswers}/${data.totalQuestions}</span>
            <span>Percentage: ${data.percentage.toFixed(1)}%</span>
          </div>
        </div>
      `;
      resultContainer.className = data.percentage >= 50 ? 'success' : 'warning';
    })
    .catch(() => {
      resultContainer.textContent = 'Error submitting answers. Please try again.';
      resultContainer.className = 'error';
    });
}
