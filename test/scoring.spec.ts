import { calculateLessonScore } from '../src/modules/progress/scoring';

describe('calculateLessonScore', () => {
  it('awards correct answer, first attempt, completion, perfect, and no-hint bonuses', () => {
    const score = calculateLessonScore({
      lessonId: 'letters-alef-001',
      totalQuestions: 20,
      correctAnswers: 20,
      firstAttemptCorrect: 20,
      mistakes: 0,
      hintsUsed: 0,
      timeSpentSeconds: 300,
    });

    expect(score).toEqual({
      stars: 390,
      xp: 176,
      rating: 3,
    });
  });

  it('rates completed lessons with mistakes as two stars when accuracy is high enough', () => {
    const score = calculateLessonScore({
      lessonId: 'letters-ba-001',
      totalQuestions: 10,
      correctAnswers: 8,
      firstAttemptCorrect: 6,
      mistakes: 2,
      hintsUsed: 1,
      timeSpentSeconds: 240,
    });

    expect(score.rating).toBe(2);
    expect(score.stars).toBe(160);
  });
});
