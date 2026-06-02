const quizContainer = document.getElementById('quiz-container');
const finalSubmitSection = document.getElementById('final-submit-section');
const resultContainer = document.getElementById('result');
const answers = {};

fetch('/api/questions')
  .then(response => response.json())
  .then(questions => {
    questions.forEach(question => renderQuestion(question));
    renderFinalSubmitButton();
  })
  .catch(() => {
    quizContainer.innerHTML = '<p>Unable to load questions. Please try again later.</p>';
  });

function renderQuestion(question) {
  const section = document.createElement('section');
  section.className = 'question-card';
  section.setAttribute('data-question-id', question.id);
  section.innerHTML = `
    <div class="question-text">${question.text}</div>
    <div class="choices"></div>
    <div class="button-group">
      <button class="clear-button">Clear</button>
    </div>
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

  const clearButton = section.querySelector('.clear-button');
  clearButton.addEventListener('click', () => clearAnswer(question.id, section));

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
  resultContainer.textContent = '';
  resultContainer.className = '';
}

function renderFinalSubmitButton() {
  const button = document.createElement('button');
  button.className = 'final-submit-button';
  button.textContent = 'Submit All Answers';
  button.addEventListener('click', submitAllAnswers);
  finalSubmitSection.appendChild(button);
}

function submitAllAnswers() {
  const questionElements = document.querySelectorAll('[data-question-id]');
  const allAnswered = Array.from(questionElements).every(el => {
    const questionId = Number(el.getAttribute('data-question-id'));
    return answers[questionId] !== undefined;
  });

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
