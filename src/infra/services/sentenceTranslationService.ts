/**
 * Service for managing sentence translation exercises and sessions
 */

import { 
  SentenceExercise, 
  TranslationAttempt, 
  TranslationSession, 
  GeneratedSentencePair,
  TranslationEvaluation 
} from "../../domain/entities";
import { 
  WordRepository,
  SentenceExerciseRepository,
  TranslationAttemptRepository,
  TranslationSessionRepository 
} from "../../domain/repositories";
import { TogetherAdapter } from "../llm/togetherAdapter";

export interface SentenceTranslationServiceConfig {
  wordRepository: WordRepository;
  sentenceExerciseRepository: SentenceExerciseRepository;
  translationAttemptRepository: TranslationAttemptRepository;
  translationSessionRepository: TranslationSessionRepository;
  llmAdapter: TogetherAdapter;
}

export class SentenceTranslationService {
  private wordRepo: WordRepository;
  private exerciseRepo: SentenceExerciseRepository;
  private attemptRepo: TranslationAttemptRepository;
  private sessionRepo: TranslationSessionRepository;
  private llmAdapter: TogetherAdapter;

  constructor(config: SentenceTranslationServiceConfig) {
    this.wordRepo = config.wordRepository;
    this.exerciseRepo = config.sentenceExerciseRepository;
    this.attemptRepo = config.translationAttemptRepository;
    this.sessionRepo = config.translationSessionRepository;
    this.llmAdapter = config.llmAdapter;
  }

  /**
   * Start a new translation session
   */
  async startSession(
    difficulty: 'beginner' | 'intermediate' | 'advanced',
    direction: 'en-to-zh' | 'zh-to-en',
    exerciseCount: number = 5
  ): Promise<TranslationSession> {
    console.log('🔍 Starting new translation session:', { difficulty, direction, exerciseCount });

    // Get user's known words
    const knownWords = await this.wordRepo.getKnownWords();
    console.log('🔍 Found known words:', knownWords.length);

    if (knownWords.length < 3) {
      throw new Error("You need to learn at least 3 words before starting sentence translation exercises. Please review some flashcards first!");
    }

    // Generate exercises for the session
    const exercises: SentenceExercise[] = [];
    
    for (let i = 0; i < exerciseCount; i++) {
      try {
        console.log(`🔍 Generating exercise ${i + 1}/${exerciseCount}`);
        const generatedPair = await this.llmAdapter.generateSentenceExercise(knownWords, difficulty);
        
        const exercise: SentenceExercise = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          chinese: generatedPair.chinese,
          english: generatedPair.english,
          direction,
          difficulty,
          usedWords: generatedPair.usedWords,
          createdAt: Date.now()
        };

        await this.exerciseRepo.save(exercise);
        exercises.push(exercise);
        console.log(`✅ Generated exercise ${i + 1}: ${exercise.chinese.hanzi}`);
      } catch (error) {
        console.error(`Failed to generate exercise ${i + 1}:`, error);
        // Continue with fewer exercises rather than failing completely
      }
    }

    if (exercises.length === 0) {
      throw new Error("Failed to generate any exercises. Please try again.");
    }

    // Create session
    const session: TranslationSession = {
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      exercises,
      currentExerciseIndex: 0,
      attempts: [],
      startedAt: Date.now(),
      settings: {
        difficulty,
        direction,
        exerciseCount: exercises.length
      }
    };

    await this.sessionRepo.save(session);
    console.log('✅ Translation session started with', exercises.length, 'exercises');
    
    return session;
  }

  /**
   * Get the current active session
   */
  async getActiveSession(): Promise<TranslationSession | null> {
    return this.sessionRepo.getActiveSession();
  }

  /**
   * Get current exercise from session
   */
  getCurrentExercise(session: TranslationSession): SentenceExercise | null {
    if (session.currentExerciseIndex >= session.exercises.length) {
      return null; // Session complete
    }
    return session.exercises[session.currentExerciseIndex];
  }

  /**
   * Submit a translation attempt and get evaluation
   */
  async submitTranslation(
    sessionId: string,
    exerciseId: string,
    userTranslation: string
  ): Promise<{
    attempt: TranslationAttempt;
    evaluation: TranslationEvaluation;
    isSessionComplete: boolean;
  }> {
    console.log('🔍 Submitting translation:', { sessionId, exerciseId, userTranslation });

    // Get session and exercise
    const session = await this.sessionRepo.get(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    const exercise = session.exercises.find(ex => ex.id === exerciseId);
    if (!exercise) {
      throw new Error("Exercise not found");
    }

    // Evaluate the translation
    const evaluation = await this.llmAdapter.evaluateTranslation(
      exercise.chinese.hanzi,
      exercise.chinese.pinyin,
      exercise.english,
      userTranslation,
      exercise.direction
    );

    // Create attempt record
    const attempt: TranslationAttempt = {
      id: `attempt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      exerciseId,
      userTranslation,
      llmEvaluation: evaluation,
      attemptedAt: Date.now()
    };

    await this.attemptRepo.save(attempt);

    // Update session
    session.attempts.push(attempt);
    session.currentExerciseIndex++;
    
    // Check if session is complete
    const isSessionComplete = session.currentExerciseIndex >= session.exercises.length;
    if (isSessionComplete) {
      session.completedAt = Date.now();
    }

    await this.sessionRepo.update(session);

    console.log('✅ Translation evaluated. Score:', evaluation.overallScore);

    return {
      attempt,
      evaluation,
      isSessionComplete
    };
  }

  /**
   * Get session statistics
   */
  async getSessionStats(sessionId: string): Promise<{
    totalExercises: number;
    completedExercises: number;
    averageScore: number;
    timeSpent: number;
    accuracyByCategory: {
      accuracy: number;
      fluency: number;
      vocabulary: number;
      grammar: number;
    };
  }> {
    const session = await this.sessionRepo.get(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    const totalExercises = session.exercises.length;
    const completedExercises = session.attempts.length;
    
    if (completedExercises === 0) {
      return {
        totalExercises,
        completedExercises: 0,
        averageScore: 0,
        timeSpent: 0,
        accuracyByCategory: {
          accuracy: 0,
          fluency: 0,
          vocabulary: 0,
          grammar: 0
        }
      };
    }

    // Calculate average scores
    const totalScore = session.attempts.reduce((sum, attempt) => sum + attempt.llmEvaluation.overallScore, 0);
    const averageScore = totalScore / completedExercises;

    // Calculate category averages
    const categoryTotals = session.attempts.reduce((totals, attempt) => {
      const feedback = attempt.llmEvaluation.detailedFeedback;
      return {
        accuracy: totals.accuracy + feedback.accuracy.score,
        fluency: totals.fluency + feedback.fluency.score,
        vocabulary: totals.vocabulary + feedback.vocabulary.score,
        grammar: totals.grammar + feedback.grammar.score
      };
    }, { accuracy: 0, fluency: 0, vocabulary: 0, grammar: 0 });

    const accuracyByCategory = {
      accuracy: categoryTotals.accuracy / completedExercises,
      fluency: categoryTotals.fluency / completedExercises,
      vocabulary: categoryTotals.vocabulary / completedExercises,
      grammar: categoryTotals.grammar / completedExercises
    };

    // Calculate time spent
    const timeSpent = session.completedAt 
      ? session.completedAt - session.startedAt
      : Date.now() - session.startedAt;

    return {
      totalExercises,
      completedExercises,
      averageScore,
      timeSpent,
      accuracyByCategory
    };
  }

  /**
   * Get recent sessions for progress tracking
   */
  async getRecentSessions(limit: number = 10): Promise<TranslationSession[]> {
    return this.sessionRepo.listRecent(limit);
  }

  /**
   * Generate a new exercise on demand
   */
  async generateExercise(
    difficulty: 'beginner' | 'intermediate' | 'advanced',
    direction: 'en-to-zh' | 'zh-to-en'
  ): Promise<SentenceExercise> {
    const knownWords = await this.wordRepo.getKnownWords();
    
    if (knownWords.length < 3) {
      throw new Error("You need to learn at least 3 words before generating exercises.");
    }

    const generatedPair = await this.llmAdapter.generateSentenceExercise(knownWords, difficulty);
    
    const exercise: SentenceExercise = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      chinese: generatedPair.chinese,
      english: generatedPair.english,
      direction,
      difficulty,
      usedWords: generatedPair.usedWords,
      createdAt: Date.now()
    };

    await this.exerciseRepo.save(exercise);
    return exercise;
  }
} 