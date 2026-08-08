import { CompleteLessonDto } from './dto/complete-lesson.dto';

export type LessonScore = {
  stars: number;
  xp: number;
  rating: number;
};

export function calculateLessonScore(dto: CompleteLessonDto): LessonScore {
  const completion = 50;
  const correct = dto.correctAnswers * 10;
  const firstAttempt = dto.firstAttemptCorrect * 5;
  const perfect =
    dto.mistakes === 0 && dto.correctAnswers === dto.totalQuestions ? 25 : 0;
  const noHints = dto.hintsUsed === 0 ? 15 : 0;
  const stars = completion + correct + firstAttempt + perfect + noHints;

  return {
    stars,
    xp: Math.max(25, Math.round(stars * 0.45)),
    rating: calculateRating(dto),
  };
}

function calculateRating(dto: CompleteLessonDto) {
  if (
    dto.mistakes === 0 &&
    dto.hintsUsed === 0 &&
    dto.correctAnswers === dto.totalQuestions
  ) {
    return 3;
  }

  if (dto.correctAnswers >= Math.ceil(dto.totalQuestions * 0.7)) {
    return 2;
  }

  return 1;
}
