# Engineering Law Quiz App - Development Process

## Project Overview
Build an interactive quiz application for Engineering Law past questions (BUL CA 2022) with 52 questions covering topics like COREN Act, customary law, torts, and contracts.

---

## Data Issues Found & Fixed

### 1. **Typos & Spelling Errors**
- Line 31: "soure" → "source"
- Line 50: "Ordinanace" → "Ordinance"
- Line 55: "erra" → "era"
- Line 116: "jurisidiction" → "jurisdiction"
- Line 124: "quesion" → "question", "cours" → "courts"
- Line 260: Missing "question :" prefix (line starts with "answer :")
- Line 266: Missing colon after "false"

### 2. **Inconsistent Formatting**
- Mixed case for "question" vs "Question" (lines 116)
- Mixed case for boolean values: "True", "False", "true", "false"
- Inconsistent spacing around colons
- Line 253: semicolon instead of colon after "answer"

### 3. **Structural Issues**
- Question #49 (line 260): Completely missing "question :" prefix
- Some questions have varying numbers of options (2-5 options)
- Inconsistent capitalization in options

---

## Cleaned Data Structure

The cleaned JSON follows this schema:

```json
{
  "id": 1,                          // Unique identifier
  "question": "Question text",       // Cleaned question
  "options": [                       // Array of all options
    "Correct answer (always first)",
    "Wrong option 1",
    "Wrong option 2",
    "Wrong option 3"
  ],
  "correctAnswer": 0                 // Index of correct answer (always 0)
}
```

**Key decisions made:**
- Correct answer is always at index 0 in the options array
- Your app will need to **shuffle options** during display to avoid patterns
- Boolean questions kept as "True"/"False" for consistency
- All 52 questions preserved with unique IDs

---

## Recommended App Features

### Core Features
1. **Question Display**
   - Show one question at a time
   - Shuffle options to prevent answer pattern recognition
   - Clear visual feedback for selected answer

2. **Answer Validation**
   - Immediate feedback (correct/incorrect)
   - Show correct answer if user gets it wrong
   - Optional: Explanation field (can be added later)

3. **Progress Tracking**
   - Question counter (e.g., "Question 5 of 52")
   - Progress bar
   - Score tracking

4. **Session Management**
   - Option to restart quiz
   - Resume capability (save progress to localStorage)
   - Review wrong answers at the end

### Nice-to-Have Features
1. **Study Modes**
   - Practice mode (random questions)
   - Exam mode (all questions, timed)
   - Topic-based filtering (contracts, torts, etc.)

2. **Performance Analytics**
   - Track accuracy per topic
   - Identify weak areas
   - Historical performance graph

3. **UI Enhancements**
   - Dark mode toggle
   - Mobile-responsive design
   - Keyboard shortcuts (1-4 for options, Enter to submit)

---

## Tech Stack Recommendations

### For Next.js (Your preferred stack)
```
Frontend: Next.js 14+ with App Router
Styling: Tailwind CSS
State: React Context or Zustand
Storage: localStorage (for progress) + Neon/PostgreSQL (optional for analytics)
```

### Alternative Stack (Simpler)
```
Frontend: React with Vite
Styling: Tailwind CSS
State: useState/useReducer
Storage: localStorage only
```

---

## Data Loading Strategy

### Option 1: Static Import (Recommended)
```javascript
// app/data/questions.json
import questions from './data/questions.json';
```
**Pros:** Fast, no API needed, works offline  
**Cons:** Client-side visible (not an issue for study app)

### Option 2: API Route
```javascript
// app/api/questions/route.ts
export async function GET() {
  return Response.json(questions);
}
```
**Pros:** Hides data source, enables future features like question randomization server-side  
**Cons:** Extra complexity for basic MVP

---

## Implementation Phases

### Phase 1: MVP (1-2 hours)
- [ ] Load questions from JSON
- [ ] Display single question with shuffled options
- [ ] Handle answer selection & validation
- [ ] Show score at the end
- [ ] Basic styling

### Phase 2: Enhanced UX (2-3 hours)
- [ ] Add progress tracking
- [ ] Implement navigation (Next/Previous)
- [ ] Store progress in localStorage
- [ ] Review wrong answers summary
- [ ] Responsive design

### Phase 3: Advanced Features (Optional)
- [ ] Topic-based filtering
- [ ] Timed exam mode
- [ ] Performance analytics
- [ ] Export results as PDF

---

## Coding Agent Prompt Template

```
Build an interactive quiz app using Next.js 14, React, and Tailwind CSS.

**Data Source:** Use the attached quiz_data_cleaned.json file containing 52 Engineering Law questions.

**Core Requirements:**
1. Display one question at a time
2. Shuffle the options array for each question (correctAnswer is always at index 0 in the JSON)
3. Track user's score and progress
4. Show immediate feedback on answer selection
5. Display final score with option to restart
6. Responsive design for mobile and desktop

**Technical Specs:**
- Use App Router (not Pages Router)
- Implement dark mode toggle
- Store progress in localStorage
- Use TypeScript for type safety
- Follow modern React patterns (hooks, functional components)

**Optional Enhancements:**
- Add "Review Wrong Answers" section
- Implement keyboard shortcuts
- Add progress bar
- Create topic-based filtering

Start with the MVP and make it functional before adding enhancements.
```

---

## Testing Checklist

- [ ] All 52 questions load correctly
- [ ] Options are properly shuffled
- [ ] Correct answer validation works
- [ ] Score calculation is accurate
- [ ] localStorage persists progress
- [ ] Restart functionality works
- [ ] Responsive on mobile (< 768px)
- [ ] Works on tablets and desktop
- [ ] Dark mode toggle functions
- [ ] No console errors

---

## Next Steps

1. **Copy the cleaned JSON** (`quiz_data_cleaned.json`) to your project
2. **Share the coding agent prompt** above with your AI coding assistant (Cursor, GitHub Copilot, etc.)
3. **Review the generated code** and test functionality
4. **Iterate** on design and features

---

## Notes

- The original data had the correct answer always listed first, which creates a predictable pattern
- Your app MUST shuffle options during runtime to avoid users learning the pattern
- Consider adding categories later: questions 1-25 cover legal sources, 26-36 cover torts, 37-52 cover contracts
- Boolean questions (True/False) are intentionally kept simple with 2 options
